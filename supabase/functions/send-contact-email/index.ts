import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://e2836cce-2bbf-4c42-8c46-419545d375c8.lovableproject.com',
  Deno.env.get('PRODUCTION_DOMAIN'), // e.g., https://yourdomain.com
  'http://localhost:5173', // Local development
].filter(Boolean); // Remove undefined values

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) 
    ? origin 
    : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

interface ContactRequest {
  senderName: string;
  senderEmail: string;
  recipientUserId: string;
  message: string;
}

// Input validation
function validateContactInput(data: any): { valid: boolean; errors?: string[]; data?: ContactRequest } {
  const errors: string[] = [];
  
  if (!data.senderName || typeof data.senderName !== 'string') {
    errors.push('Name is required');
  } else if (data.senderName.length > 100) {
    errors.push('Name must be less than 100 characters');
  }
  
  if (!data.senderEmail || typeof data.senderEmail !== 'string') {
    errors.push('Email is required');
  } else if (data.senderEmail.length > 255) {
    errors.push('Email must be less than 255 characters');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.senderEmail)) {
    errors.push('Invalid email format');
  }
  
  if (!data.message || typeof data.message !== 'string') {
    errors.push('Message is required');
  } else if (data.message.length > 2000) {
    errors.push('Message must be less than 2000 characters');
  }
  
  if (!data.recipientUserId || typeof data.recipientUserId !== 'string') {
    errors.push('Invalid recipient ID');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { 
    valid: true, 
    data: {
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      recipientUserId: data.recipientUserId,
      message: data.message
    }
  };
}

// HTML encode to prevent XSS
function htmlEncode(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: 5 contact emails per minute per IP
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const rl = checkRateLimit(`contact-email:${clientIp}`, 5, 60_000);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const requestData = await req.json();
    
    // Validate input
    const validation = validateContactInput(requestData);
    if (!validation.valid) {
      console.error('Validation failed:', validation.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid input data' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const { senderName, senderEmail, recipientUserId, message } = validation.data!;

    // Create Supabase client with service role to fetch user email
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch recipient profile securely
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, public_display_name, first_name, last_name')
      .eq('id', recipientUserId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching recipient profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Recipient not found' }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const recipientName = profile.public_display_name || `${profile.first_name} ${profile.last_name}`;
    const recipientEmail = profile.email;

    console.log(`Sending contact email from ${senderName} to ${recipientName}`);

    // Store message in database
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        sender_name: senderName,
        sender_email: senderEmail,
        recipient_user_id: recipientUserId,
        message: message,
        message_type: 'partner_contact',
        status: 'unread'
      });

    if (messageError) {
      console.error('Error storing message:', messageError);
      // Continue with email sending even if DB storage fails
    }

    // HTML encode all user inputs to prevent XSS
    const safeName = htmlEncode(senderName);
    const safeEmail = htmlEncode(senderEmail);
    const safeRecipientName = htmlEncode(recipientName);
    const safeMessage = htmlEncode(message);

    const emailResponse = await resend.emails.send({
      from: "Platform <onboarding@resend.dev>",
      to: [recipientEmail],
      replyTo: senderEmail,
      subject: `Kapcsolatfelvétel: ${senderName}`,
      html: `
        <h2>Új üzenet érkezett</h2>
        <p><strong>Feladó:</strong> ${safeName} (${safeEmail})</p>
        <p><strong>Címzett:</strong> ${safeRecipientName}</p>
        <hr>
        <p><strong>Üzenet:</strong></p>
        <p>${safeMessage.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Ez az üzenet a fenntarthatósági platform regionális központján keresztül érkezett.</small></p>
      `,
    });

    console.log("Email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending contact email:", error);
    return new Response(
      JSON.stringify({ error: 'Failed to send message. Please try again.' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

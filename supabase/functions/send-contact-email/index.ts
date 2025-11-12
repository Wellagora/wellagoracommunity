import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  senderName: string;
  senderEmail: string;
  recipientUserId: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { senderName, senderEmail, recipientUserId, message }: ContactRequest = await req.json();

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
      throw new Error('Címzett nem található');
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

    const emailResponse = await resend.emails.send({
      from: "Platform <onboarding@resend.dev>",
      to: [recipientEmail],
      replyTo: senderEmail,
      subject: `Kapcsolatfelvétel: ${senderName}`,
      html: `
        <h2>Új üzenet érkezett</h2>
        <p><strong>Feladó:</strong> ${senderName} (${senderEmail})</p>
        <p><strong>Címzett:</strong> ${recipientName}</p>
        <hr>
        <p><strong>Üzenet:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
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
      JSON.stringify({ error: error.message || 'Hiba történt az üzenet küldésekor' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeneralContactRequest {
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { senderName, senderEmail, subject, message }: GeneralContactRequest = await req.json();

    // Admin email - ezt módosítsd a valódi admin email címre
    const adminEmail = "info@kalimedence.hu";

    console.log(`Sending general contact email from ${senderName} to admin`);

    // Store message in database
    const { error: messageError } = await supabaseClient
      .from('messages')
      .insert({
        sender_name: senderName,
        sender_email: senderEmail,
        recipient_user_id: null,
        subject: subject,
        message: message,
        message_type: 'general',
        status: 'unread'
      });

    if (messageError) {
      console.error('Error storing message:', messageError);
      // Continue with email sending even if DB storage fails
    }

    const emailResponse = await resend.emails.send({
      from: "Platform <onboarding@resend.dev>",
      to: [adminEmail],
      replyTo: senderEmail,
      subject: `[Kapcsolatfelvétel] ${subject}`,
      html: `
        <h2>Új kapcsolatfelvételi üzenet</h2>
        <p><strong>Feladó:</strong> ${senderName} (${senderEmail})</p>
        <p><strong>Tárgy:</strong> ${subject}</p>
        <hr>
        <p><strong>Üzenet:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Ez az üzenet a Káli medence fenntarthatósági platform kapcsolatfelvételi űrlapján keresztül érkezett.</small></p>
      `,
    });

    console.log("General contact email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending general contact email:", error);
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

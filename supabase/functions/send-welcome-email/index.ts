import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  user_id: string;
  email: string;
  name?: string;
  role?: string;
  language?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { user_id, email, name, role, language = "hu" }: WelcomeEmailRequest = await req.json();
    
    console.log(`Sending welcome email to ${email} (user: ${user_id}, role: ${role})`);

    const displayName = name || "Új Tag";

    // Hungarian email template (default)
    const emailContent = {
      subject: "Üdvözlünk a WellAgora Tagjai között! 🌱",
      html: `
        <!DOCTYPE html>
        <html lang="hu">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7f6;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 40px 30px;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        🌱 Üdvözlünk a WellAgora-n!
                      </h1>
                      <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                        Csatlakoztál 1,200+ Tagunkhoz!
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                        Kedves <strong>${displayName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Örömmel köszöntünk a WellAgora közösségében! Mostantól Te is Tagja vagy annak a közösségnek, 
                        amely a fenntartható életmódot és a kézműves tudást népszerűsíti.
                      </p>
                      
                      <p style="margin: 0 0 25px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        <strong>Mit tehetsz most?</strong>
                      </p>
                      
                      <ul style="margin: 0 0 30px; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                        <li>Fedezd fel a <strong>Piactér</strong> programjait</li>
                        <li>Csatlakozz <strong>szponzorált kurzusokhoz</strong> kedvezményes áron</li>
                        <li>Építsd a <strong>pozitív kézlenyomatodat</strong> a közösséggel</li>
                        <li>Kövesd a <strong>helyi szakértők</strong> tudását</li>
                      </ul>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="margin: 0 auto;">
                        <tr>
                          <td style="border-radius: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                            <a href="https://wellagoracommunity.lovable.app/piacter" 
                               style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                              🛒 Fedezd fel a Piacteret
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-align: center;">
                        Kérdésed van? Írj nekünk: <a href="mailto:hello@wellagora.hu" style="color: #10b981;">hello@wellagora.hu</a>
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                        WellAgora - Fenntartható Közösségek Platformja
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "WellAgora <onboarding@resend.dev>",
      to: [email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      throw emailError;
    }

    console.log("Welcome email sent successfully:", emailData);

    // Create in-app notification
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id,
        title: "Üdvözlünk a WellAgora-n! 🌱",
        message: `Kedves ${displayName}, örömmel köszöntünk a közösségünkben! Fedezd fel a Piacteret és csatlakozz a programjainkhoz.`,
        type: "milestone",
        action_url: "/piacter",
        metadata: { event: "user_registration", role }
      });

    if (notificationError) {
      console.error("Notification insert error:", notificationError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: emailData?.id,
        message: "Welcome email sent and notification created" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-welcome-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

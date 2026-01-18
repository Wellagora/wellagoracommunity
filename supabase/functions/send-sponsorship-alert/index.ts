import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SponsorshipAlertRequest {
  expert_id: string;
  expert_email: string;
  expert_name?: string;
  program_title: string;
  program_id: string;
  sponsor_name: string;
  total_licenses: number;
  used_licenses: number;
  usage_percentage: number;
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

    const {
      expert_id,
      expert_email,
      expert_name,
      program_title,
      program_id,
      sponsor_name,
      total_licenses,
      used_licenses,
      usage_percentage,
      language = "hu"
    }: SponsorshipAlertRequest = await req.json();

    console.log(`Sending sponsorship alert to expert ${expert_email} for program: ${program_title}`);

    const displayName = expert_name || "Kedves Szakértőnk";
    const remaining = total_licenses - used_licenses;
    const isUrgent = usage_percentage >= 90;

    const emailContent = {
      subject: isUrgent 
        ? `⚠️ Sürgős: A szponzorált kereted hamarosan elfogy! - ${program_title}`
        : `📊 Szponzorálási státusz frissítés - ${program_title}`,
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
                    <td style="background: ${isUrgent ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'}; padding: 40px 40px 30px;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                        ${isUrgent ? '⚠️ Sürgős figyelmeztetés' : '📊 Státusz frissítés'}
                      </h1>
                      <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                        Szponzorált helyek státusza
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                        Kedves <strong>${displayName}</strong>,
                      </p>
                      
                      ${isUrgent ? `
                      <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; padding: 20px; margin: 0 0 25px; border-left: 4px solid #ef4444;">
                        <p style="margin: 0; color: #991b1b; font-size: 15px; font-weight: 600;">
                          🚨 A szponzorált kereted ${usage_percentage}%-ban kihasználva!
                        </p>
                        <p style="margin: 10px 0 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                          Már csak <strong>${remaining} hely</strong> maradt a "${program_title}" programodhoz.
                        </p>
                      </div>
                      ` : ''}
                      
                      <p style="margin: 0 0 25px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        A <strong>${sponsor_name}</strong> által szponzorált program helyzete:
                      </p>
                      
                      <!-- Stats Card -->
                      <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 25px; border: 1px solid #e5e7eb;">
                        <h3 style="margin: 0 0 16px; color: #1f2937; font-size: 16px; font-weight: 600;">
                          📚 ${program_title}
                        </h3>
                        
                        <!-- Progress Bar -->
                        <div style="background-color: #e5e7eb; border-radius: 999px; height: 12px; margin-bottom: 16px; overflow: hidden;">
                          <div style="background: ${usage_percentage >= 90 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #10b981, #059669)'}; height: 100%; width: ${usage_percentage}%; border-radius: 999px;"></div>
                        </div>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Szponzor:</td>
                            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right; font-weight: 600;">${sponsor_name}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Összes hely:</td>
                            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${total_licenses}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Felhasznált:</td>
                            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${used_licenses}</td>
                          </tr>
                          <tr style="border-top: 1px solid #e5e7eb;">
                            <td style="padding: 12px 0 0; color: ${isUrgent ? '#ef4444' : '#10b981'}; font-size: 15px; font-weight: 600;">Maradt:</td>
                            <td style="padding: 12px 0 0; color: ${isUrgent ? '#ef4444' : '#10b981'}; font-size: 16px; text-align: right; font-weight: 700;">${remaining} hely</td>
                          </tr>
                        </table>
                      </div>
                      
                      <p style="margin: 0 0 25px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                        Tekintsd meg a Hatásjelentést az Expert Studio-ban a részletes statisztikákért és 
                        a további teendőkért.
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="margin: 0 auto;">
                        <tr>
                          <td style="border-radius: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                            <a href="https://wellagoracommunity.lovable.app/expert-studio?tab=impact" 
                               style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                              📊 Hatásjelentés megtekintése
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
      to: [expert_email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      throw emailError;
    }

    console.log("Sponsorship alert email sent:", emailData);

    // Create in-app notification
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: expert_id,
        title: isUrgent 
          ? "⚠️ Szponzorált keret hamarosan elfogy!" 
          : "📊 Szponzorálási státusz frissítés",
        message: `A "${program_title}" program szponzorált helyeinek ${usage_percentage}%-a felhasználva. Maradt: ${remaining} hely.`,
        type: isUrgent ? "reminder" : "community",
        action_url: "/expert-studio?tab=impact",
        metadata: { 
          event: "sponsorship_quota_alert", 
          program_id,
          sponsor_name,
          usage_percentage,
          remaining_seats: remaining
        }
      });

    if (notificationError) {
      console.error("Notification insert error:", notificationError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: emailData?.id,
        is_urgent: isUrgent,
        message: "Sponsorship alert sent and notification created" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-sponsorship-alert:", error);
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

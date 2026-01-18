import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurchaseConfirmationRequest {
  user_id: string;
  user_email: string;
  user_name?: string;
  program_title: string;
  program_id: string;
  original_price: number;
  final_price: number;
  sponsor_name?: string;
  sponsor_contribution?: number;
  is_sponsored: boolean;
  language?: string;
}

const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat("hu-HU").format(amount) + " Ft";
};

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
      user_id,
      user_email,
      user_name,
      program_title,
      program_id,
      original_price,
      final_price,
      sponsor_name,
      sponsor_contribution,
      is_sponsored,
      language = "hu"
    }: PurchaseConfirmationRequest = await req.json();

    console.log(`Sending purchase confirmation to ${user_email} for program: ${program_title}`);

    const displayName = user_name || "Kedves Tagunk";
    const savings = original_price - final_price;

    // Build sponsor message
    let sponsorMessage = "";
    let sponsorBadge = "";
    
    if (is_sponsored && sponsor_name && sponsor_contribution) {
      sponsorMessage = `
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 15px; font-weight: 600;">
            🎁 Szponzorált részvétel
          </p>
          <p style="margin: 10px 0 0; color: #78350f; font-size: 14px; line-height: 1.6;">
            A <strong>${sponsor_name}</strong> ${formatPrice(sponsor_contribution)}-os támogatásának köszönhetően 
            a részvételi díjad kiegyenlítve. Te csak ${formatPrice(final_price)}-ot fizettél!
          </p>
        </div>
      `;
      sponsorBadge = `<span style="display: inline-block; background-color: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: 8px;">SZPONZORÁLT</span>`;
    }

    const emailContent = {
      subject: `Sikeres foglalás! 🎉 - ${program_title}`,
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
                        🎉 Sikeres foglalás!
                      </h1>
                      <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                        A jelentkezésed rögzítettük
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                        Kedves <strong>${displayName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 25px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Örömmel értesítünk, hogy sikeresen jelentkeztél az alábbi programra:
                      </p>
                      
                      <!-- Program Card -->
                      <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
                        <h3 style="margin: 0 0 12px; color: #1f2937; font-size: 18px; font-weight: 600;">
                          ${program_title}${sponsorBadge}
                        </h3>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Eredeti ár:</td>
                            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right; ${is_sponsored ? 'text-decoration: line-through;' : ''}">${formatPrice(original_price)}</td>
                          </tr>
                          ${is_sponsored ? `
                          <tr>
                            <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600;">Szponzori támogatás:</td>
                            <td style="padding: 8px 0; color: #059669; font-size: 14px; text-align: right; font-weight: 600;">-${formatPrice(savings)}</td>
                          </tr>
                          ` : ''}
                          <tr style="border-top: 2px solid #e5e7eb;">
                            <td style="padding: 12px 0 0; color: #1f2937; font-size: 16px; font-weight: 700;">Fizetendő:</td>
                            <td style="padding: 12px 0 0; color: #10b981; font-size: 18px; text-align: right; font-weight: 700;">${formatPrice(final_price)}</td>
                          </tr>
                        </table>
                      </div>
                      
                      ${sponsorMessage}
                      
                      <p style="margin: 0 0 25px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                        A program részleteit és a következő lépéseket a "Kurzusaim" menüben találod.
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="margin: 0 auto;">
                        <tr>
                          <td style="border-radius: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                            <a href="https://wellagoracommunity.lovable.app/kurzusaim" 
                               style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                              📚 Kurzusaim megtekintése
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
      to: [user_email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      throw emailError;
    }

    console.log("Purchase confirmation email sent:", emailData);

    // Create in-app notification
    const notificationMessage = is_sponsored && sponsor_name
      ? `Sikeresen jelentkeztél: ${program_title}. A ${sponsor_name} támogatásának köszönhetően ${formatPrice(savings)}-ot spóroltál!`
      : `Sikeresen jelentkeztél: ${program_title}. Részletek a Kurzusaim menüben.`;

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id,
        title: "Sikeres foglalás! 🎉",
        message: notificationMessage,
        type: "milestone",
        action_url: "/kurzusaim",
        metadata: { 
          event: "purchase_confirmation", 
          program_id,
          is_sponsored,
          sponsor_name,
          amount_paid: final_price
        }
      });

    if (notificationError) {
      console.error("Notification insert error:", notificationError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: emailData?.id,
        message: "Purchase confirmation sent and notification created" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-purchase-confirmation:", error);
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

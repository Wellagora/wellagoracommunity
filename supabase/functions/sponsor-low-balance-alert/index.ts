import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LowBalanceRequest {
  sponsor_user_id: string;
  available_credits: number;
  initial_credits: number;
  sponsor_email: string;
  sponsor_name: string;
  language?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      sponsor_user_id, 
      available_credits, 
      initial_credits, 
      sponsor_email, 
      sponsor_name,
      language = 'hu'
    }: LowBalanceRequest = await req.json();

    const percentRemaining = ((available_credits / initial_credits) * 100).toFixed(1);
    const isCritical = parseFloat(percentRemaining) < 10;

    // Check if we already sent an alert recently
    const { data: existingAlert } = await supabase
      .from('sponsor_alerts')
      .select('id')
      .eq('sponsor_user_id', sponsor_user_id)
      .eq('alert_type', isCritical ? 'critical_balance' : 'low_balance')
      .gte('sent_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (existingAlert) {
      return new Response(
        JSON.stringify({ success: false, message: 'Alert already sent recently' }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Email content based on language
    const emailContent = language === 'hu' ? {
      subject: isCritical 
        ? `⚠️ Kritikusan alacsony kredit egyenleg - WellAgora` 
        : `💡 Alacsony kredit egyenleg - WellAgora`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">
              ${isCritical ? '⚠️ Kritikusan alacsony kredit' : '💡 Kredit értesítés'}
            </h1>
          </div>
          <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #374151;">Kedves ${sponsor_name},</p>
            <p style="font-size: 16px; color: #374151;">
              ${isCritical 
                ? 'A WellAgora kredit egyenlege kritikusan alacsony szintre csökkent.'
                : 'A WellAgora kredit egyenlege alacsony szintre (20% alatt) csökkent.'}
            </p>
            <div style="background: white; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid ${isCritical ? '#ef4444' : '#f59e0b'};">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Elérhető kredit:</p>
              <p style="margin: 4px 0 0 0; font-size: 28px; font-weight: bold; color: ${isCritical ? '#ef4444' : '#f59e0b'};">
                ${available_credits.toLocaleString()} Ft
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
                (${percentRemaining}% az eredeti ${initial_credits.toLocaleString()} Ft csomagból)
              </p>
            </div>
            <p style="font-size: 14px; color: #6b7280;">
              Töltse fel kreditjét, hogy továbbra is támogathassa a közösséget és fenntartsa a folyamatos hatást.
            </p>
            <a href="https://wellagoracommunity.lovable.app/sponsor-dashboard" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; font-weight: 600;">
              Kredit Feltöltés →
            </a>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              Ez egy automatikus értesítés a WellAgora rendszerétől. Ha nem szeretne értesítéseket kapni, keresse fel a beállításait.
            </p>
          </div>
        </div>
      `
    } : {
      subject: isCritical 
        ? `⚠️ Critically Low Credit Balance - WellAgora` 
        : `💡 Low Credit Balance Alert - WellAgora`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">
              ${isCritical ? '⚠️ Critically Low Credits' : '💡 Credit Alert'}
            </h1>
          </div>
          <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #374151;">Dear ${sponsor_name},</p>
            <p style="font-size: 16px; color: #374151;">
              ${isCritical 
                ? 'Your WellAgora credit balance has dropped to a critically low level.'
                : 'Your WellAgora credit balance has dropped below 20%.'}
            </p>
            <div style="background: white; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid ${isCritical ? '#ef4444' : '#f59e0b'};">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Available Credits:</p>
              <p style="margin: 4px 0 0 0; font-size: 28px; font-weight: bold; color: ${isCritical ? '#ef4444' : '#f59e0b'};">
                ${available_credits.toLocaleString()} Ft
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
                (${percentRemaining}% of original ${initial_credits.toLocaleString()} Ft package)
              </p>
            </div>
            <p style="font-size: 14px; color: #6b7280;">
              Top up your credits to continue supporting the community and maintaining your impact.
            </p>
            <a href="https://wellagoracommunity.lovable.app/sponsor-dashboard" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; font-weight: 600;">
              Top Up Credits →
            </a>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              This is an automated notification from the WellAgora system. Visit your settings to manage notification preferences.
            </p>
          </div>
        </div>
      `
    };

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "WellAgora <notifications@resend.dev>",
      to: [sponsor_email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Low balance alert sent:", emailResponse);

    // Log the alert in database
    await supabase
      .from('sponsor_alerts')
      .insert({
        sponsor_user_id,
        alert_type: isCritical ? 'critical_balance' : 'low_balance',
        email_sent_to: sponsor_email,
        metadata: {
          available_credits,
          initial_credits,
          percent_remaining: percentRemaining
        }
      });

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in sponsor-low-balance-alert:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

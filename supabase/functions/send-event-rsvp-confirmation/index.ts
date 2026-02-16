import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@2.0.0";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventRsvpConfirmationRequest {
  user_id: string;
  user_email: string;
  user_name?: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_time: string;
  event_location?: string;
  meeting_link?: string;
  is_online: boolean;
  language?: "hu" | "en" | "de";
}

const templates = {
  hu: {
    subject: (title: string) => `Visszaigazolás: ${title} 🎉`,
    greeting: (name: string) => `Kedves ${name},`,
    confirmText: "Sikeresen jelentkeztél az alábbi eseményre:",
    dateLabel: "Időpont:",
    locationLabel: "Helyszín:",
    meetingLinkLabel: "Online csatlakozás:",
    joinButton: "Csatlakozás",
    calendarHint: "Add hozzá a naptáradhoz, hogy ne maradj le!",
    addToCalendar: "Hozzáadás a naptárhoz",
    viewEvent: "Esemény megtekintése",
    footer: "Kérdésed van? Írj nekünk:",
    brand: "WellAgora - Fenntartható Közösségek Platformja",
    onlineEvent: "Online esemény",
  },
  en: {
    subject: (title: string) => `Confirmed: ${title} 🎉`,
    greeting: (name: string) => `Dear ${name},`,
    confirmText: "You have successfully registered for the following event:",
    dateLabel: "Date & Time:",
    locationLabel: "Location:",
    meetingLinkLabel: "Join Online:",
    joinButton: "Join Meeting",
    calendarHint: "Add it to your calendar so you don't miss it!",
    addToCalendar: "Add to Calendar",
    viewEvent: "View Event",
    footer: "Questions? Contact us:",
    brand: "WellAgora - Sustainable Communities Platform",
    onlineEvent: "Online Event",
  },
  de: {
    subject: (title: string) => `Bestätigt: ${title} 🎉`,
    greeting: (name: string) => `Liebe/r ${name},`,
    confirmText: "Sie haben sich erfolgreich für folgende Veranstaltung angemeldet:",
    dateLabel: "Datum & Uhrzeit:",
    locationLabel: "Ort:",
    meetingLinkLabel: "Online teilnehmen:",
    joinButton: "Teilnehmen",
    calendarHint: "Fügen Sie es Ihrem Kalender hinzu!",
    addToCalendar: "Zum Kalender hinzufügen",
    viewEvent: "Veranstaltung anzeigen",
    footer: "Fragen? Kontaktieren Sie uns:",
    brand: "WellAgora - Plattform für nachhaltige Gemeinschaften",
    onlineEvent: "Online-Veranstaltung",
  },
};

const formatEventDate = (dateStr: string, lang: "hu" | "en" | "de"): string => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const locale = lang === "hu" ? "hu-HU" : lang === "de" ? "de-DE" : "en-US";
  return date.toLocaleDateString(locale, options);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: 10 RSVP confirmation requests per minute per user
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const rl = checkRateLimit(`rsvp-confirm:${clientIp}`, 10, 60_000);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const {
      user_id,
      user_email,
      user_name,
      event_id,
      event_title,
      event_date,
      event_time,
      event_location,
      meeting_link,
      is_online,
      language = "hu",
    }: EventRsvpConfirmationRequest = await req.json();

    console.log(`Sending RSVP confirmation to ${user_email} for event: ${event_title}`);

    const t = templates[language];
    const displayName = user_name || (language === "hu" ? "Tagunk" : language === "de" ? "Mitglied" : "Member");
    const formattedDate = formatEventDate(event_date, language);
    const eventUrl = `https://wellagoracommunity.lovable.app/esemenyek/${event_id}`;

    // Build location/meeting section
    let locationSection = "";
    if (is_online && meeting_link) {
      locationSection = `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280; font-size: 14px;">${t.meetingLinkLabel}</span>
            <div style="margin-top: 8px;">
              <a href="${meeting_link}" 
                 style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">
                🎥 ${t.joinButton}
              </a>
            </div>
          </td>
        </tr>
      `;
    } else if (event_location) {
      locationSection = `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280; font-size: 14px;">${t.locationLabel}</span>
            <div style="color: #1f2937; font-size: 15px; font-weight: 500; margin-top: 4px;">
              📍 ${event_location}
            </div>
          </td>
        </tr>
      `;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="${language}">
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
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 40px 30px;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">
                      📅 ${event_title}
                    </h1>
                    ${is_online ? `<span style="display: inline-block; background-color: rgba(255,255,255,0.2); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-top: 12px;">🎥 ${t.onlineEvent}</span>` : ""}
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                      ${t.greeting(displayName)}
                    </p>
                    
                    <p style="margin: 0 0 25px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      ${t.confirmText}
                    </p>
                    
                    <!-- Event Details Card -->
                    <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                            <span style="color: #6b7280; font-size: 14px;">${t.dateLabel}</span>
                            <div style="color: #1f2937; font-size: 15px; font-weight: 500; margin-top: 4px;">
                              ${formattedDate}, ${event_time}
                            </div>
                          </td>
                        </tr>
                        ${locationSection}
                      </table>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; text-align: center;">
                      ${t.calendarHint}
                    </p>
                    
                    <!-- CTA Buttons -->
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="text-align: center; padding-bottom: 12px;">
                          <a href="${eventUrl}" 
                             style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 8px;">
                            ${t.viewEvent}
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
                      ${t.footer} <a href="mailto:info@wellagora.org" style="color: #3b82f6;">info@wellagora.org</a>
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                      ${t.brand}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "WellAgora <onboarding@resend.dev>",
      to: [user_email],
      subject: t.subject(event_title),
      html: emailHtml,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      throw emailError;
    }

    console.log("RSVP confirmation email sent:", emailData);

    // Create in-app notification
    const notificationMessage = language === "hu"
      ? `Sikeresen jelentkeztél: ${event_title} (${formattedDate}, ${event_time})`
      : language === "de"
      ? `Erfolgreich angemeldet: ${event_title} (${formattedDate}, ${event_time})`
      : `Successfully registered: ${event_title} (${formattedDate}, ${event_time})`;

    await supabase.from("notifications").insert({
      user_id,
      title: language === "hu" ? "Esemény visszaigazolás 📅" : language === "de" ? "Veranstaltungsbestätigung 📅" : "Event Confirmation 📅",
      message: notificationMessage,
      type: "reminder",
      action_url: `/esemenyek/${event_id}`,
      metadata: { event: "event_rsvp_confirmation", event_id },
    });

    return new Response(
      JSON.stringify({ success: true, email_id: emailData?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-event-rsvp-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

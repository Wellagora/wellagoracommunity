import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const templates = {
  hu: {
    subject: (title: string) => `Emlékeztető: ${title} holnap! ⏰`,
    greeting: (name: string) => `Kedves ${name},`,
    reminderText: "Ne felejtsd, holnap kezdődik az esemény, amire jelentkeztél:",
    dateLabel: "Időpont:",
    locationLabel: "Helyszín:",
    meetingLinkLabel: "Online csatlakozás:",
    joinButton: "Csatlakozás",
    seeYouThere: "Várunk szeretettel!",
    viewEvent: "Esemény megtekintése",
    footer: "Kérdésed van? Írj nekünk:",
    brand: "WellAgora - Fenntartható Közösségek Platformja",
    onlineEvent: "Online esemény",
  },
  en: {
    subject: (title: string) => `Reminder: ${title} is tomorrow! ⏰`,
    greeting: (name: string) => `Dear ${name},`,
    reminderText: "Don't forget, the event you registered for starts tomorrow:",
    dateLabel: "Date & Time:",
    locationLabel: "Location:",
    meetingLinkLabel: "Join Online:",
    joinButton: "Join Meeting",
    seeYouThere: "See you there!",
    viewEvent: "View Event",
    footer: "Questions? Contact us:",
    brand: "WellAgora - Sustainable Communities Platform",
    onlineEvent: "Online Event",
  },
  de: {
    subject: (title: string) => `Erinnerung: ${title} ist morgen! ⏰`,
    greeting: (name: string) => `Liebe/r ${name},`,
    reminderText: "Vergessen Sie nicht, die Veranstaltung beginnt morgen:",
    dateLabel: "Datum & Uhrzeit:",
    locationLabel: "Ort:",
    meetingLinkLabel: "Online teilnehmen:",
    joinButton: "Teilnehmen",
    seeYouThere: "Wir freuen uns auf Sie!",
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

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" });
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

    console.log("Starting event reminder job...");

    // Find events happening in approximately 24 hours (between 23-25 hours from now)
    const now = new Date();
    const tomorrow23h = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const tomorrow25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // Get events in the 24-hour window
    const { data: upcomingEvents, error: eventsError } = await supabase
      .from("events")
      .select("id, title, start_date, location_name, location_address")
      .gte("start_date", tomorrow23h.toISOString())
      .lte("start_date", tomorrow25h.toISOString())
      .eq("status", "published");

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      throw eventsError;
    }

    if (!upcomingEvents || upcomingEvents.length === 0) {
      console.log("No events found in the 24-hour reminder window");
      return new Response(
        JSON.stringify({ success: true, message: "No events to remind", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${upcomingEvents.length} events to send reminders for`);

    let totalSent = 0;
    const errors: string[] = [];

    for (const event of upcomingEvents) {
      // Get all RSVPs for this event with user details
      const { data: rsvps, error: rsvpError } = await supabase
        .from("event_rsvps")
        .select(`
          id,
          user_id,
          status,
          profiles:user_id (
            id,
            email,
            first_name,
            last_name,
            preferred_language
          )
        `)
        .eq("event_id", event.id)
        .in("status", ["going", "maybe"]);

      if (rsvpError) {
        console.error(`Error fetching RSVPs for event ${event.id}:`, rsvpError);
        errors.push(`Event ${event.id}: ${rsvpError.message}`);
        continue;
      }

      if (!rsvps || rsvps.length === 0) {
        console.log(`No RSVPs for event: ${event.title}`);
        continue;
      }

      console.log(`Sending reminders to ${rsvps.length} participants for: ${event.title}`);

      for (const rsvp of rsvps) {
        const profile = rsvp.profiles as any;
        if (!profile?.email) continue;

        const lang = (profile.preferred_language as "hu" | "en" | "de") || "hu";
        const t = templates[lang];
        const displayName = profile.first_name || (lang === "hu" ? "Tagunk" : lang === "de" ? "Mitglied" : "Member");
        const formattedDate = formatEventDate(event.start_date, lang);
        const eventTime = formatTime(event.start_date);
        const eventUrl = `https://wellagoracommunity.lovable.app/esemenyek/${event.id}`;
        const isOnline = !event.location_name && !event.location_address;

        const locationSection = event.location_name
          ? `
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #6b7280; font-size: 14px;">${t.locationLabel}</span>
                <div style="color: #1f2937; font-size: 15px; font-weight: 500; margin-top: 4px;">
                  📍 ${event.location_name}${event.location_address ? `, ${event.location_address}` : ""}
                </div>
              </td>
            </tr>
          `
          : "";

        const emailHtml = `
          <!DOCTYPE html>
          <html lang="${lang}">
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
                      <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 40px 30px;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                          ⏰ ${t.subject(event.title).replace("⏰", "").trim()}
                        </h1>
                        ${isOnline ? `<span style="display: inline-block; background-color: rgba(255,255,255,0.2); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-top: 12px;">🎥 ${t.onlineEvent}</span>` : ""}
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                          ${t.greeting(displayName)}
                        </p>
                        
                        <p style="margin: 0 0 25px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                          ${t.reminderText}
                        </p>
                        
                        <!-- Event Details Card -->
                        <div style="background-color: #fffbeb; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #fde68a;">
                          <h2 style="margin: 0 0 16px; color: #92400e; font-size: 18px; font-weight: 600;">
                            ${event.title}
                          </h2>
                          <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #fde68a;">
                                <span style="color: #6b7280; font-size: 14px;">${t.dateLabel}</span>
                                <div style="color: #1f2937; font-size: 15px; font-weight: 500; margin-top: 4px;">
                                  ${formattedDate}, ${eventTime}
                                </div>
                              </td>
                            </tr>
                            ${locationSection}
                          </table>
                        </div>
                        
                        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; text-align: center; font-weight: 500;">
                          ${t.seeYouThere}
                        </p>
                        
                        <!-- CTA Button -->
                        <table role="presentation" style="width: 100%;">
                          <tr>
                            <td style="text-align: center;">
                              <a href="${eventUrl}" 
                                 style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 8px;">
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
                          ${t.footer} <a href="mailto:info@wellagora.org" style="color: #f59e0b;">info@wellagora.org</a>
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

        try {
          const { error: emailError } = await resend.emails.send({
            from: "WellAgora <onboarding@resend.dev>",
            to: [profile.email],
            subject: t.subject(event.title),
            html: emailHtml,
          });

          if (emailError) {
            console.error(`Failed to send reminder to ${profile.email}:`, emailError);
            errors.push(`${profile.email}: ${emailError.message}`);
          } else {
            totalSent++;
            console.log(`Reminder sent to ${profile.email} for ${event.title}`);
          }

          // Also create in-app notification
          await supabase.from("notifications").insert({
            user_id: profile.id,
            title: lang === "hu" ? "Esemény holnap! ⏰" : lang === "de" ? "Veranstaltung morgen! ⏰" : "Event tomorrow! ⏰",
            message: `${event.title} - ${formattedDate}, ${eventTime}`,
            type: "reminder",
            action_url: `/esemenyek/${event.id}`,
            metadata: { event: "event_reminder_24h", event_id: event.id },
          });
        } catch (sendError: any) {
          console.error(`Error sending to ${profile.email}:`, sendError);
          errors.push(`${profile.email}: ${sendError.message}`);
        }
      }
    }

    console.log(`Reminder job complete. Sent ${totalSent} emails.`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: totalSent,
        events_processed: upcomingEvents.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-event-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

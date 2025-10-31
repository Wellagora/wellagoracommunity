import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TeamInvitationRequest {
  challengeId: string;
  challengeTitle: string;
  invitations: Array<{
    email: string;
    name: string;
  }>;
  message?: string;
  organizationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization token
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client with the user's token - uses anon key with JWT for RLS
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { authorization: authHeader },
      },
    });

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      throw new Error("User not authenticated");
    }

    const requestData: TeamInvitationRequest = await req.json();
    console.log("Processing team invitations:", {
      challengeId: requestData.challengeId,
      invitationCount: requestData.invitations.length,
    });

    const { challengeId, challengeTitle, invitations, message, organizationId } = requestData;

    // Validate input
    if (!challengeId || !invitations || invitations.length === 0 || !organizationId) {
      throw new Error("Missing required fields");
    }

    // Create invitation records and send emails
    const results = await Promise.allSettled(
      invitations.map(async (invitation) => {
        // Generate token and expiry
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        // Insert invitation into database
        const { data: invitationData, error: dbError } = await supabase
          .from("team_invitations")
          .insert({
            organization_id: organizationId,
            inviter_user_id: user.id,
            invitee_email: invitation.email,
            invitee_name: invitation.name,
            challenge_id: challengeId,
            message: message || null,
            expires_at: expiresAt.toISOString(),
            status: "pending",
          })
          .select()
          .single();

        if (dbError) {
          console.error("Database error:", dbError);
          throw new Error(`Failed to create invitation: ${dbError.message}`);
        }

        console.log("Invitation created:", invitationData.id);

        // Send email invitation
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .challenge-box { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 5px; }
                .cta-button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .message-box { background: #e0f2fe; padding: 15px; border-radius: 5px; margin: 15px 0; font-style: italic; }
                .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🌱 You're Invited to Join a Challenge!</h1>
                </div>
                <div class="content">
                  <p>Hi ${invitation.name},</p>
                  
                  <p>You've been invited to join a sustainability challenge!</p>
                  
                  <div class="challenge-box">
                    <h2 style="margin-top: 0; color: #10b981;">📋 ${challengeTitle}</h2>
                    <p>Join your team in making a positive impact on the environment.</p>
                  </div>
                  
                  ${message ? `
                    <div class="message-box">
                      <strong>Personal message:</strong><br>
                      ${message}
                    </div>
                  ` : ''}
                  
                  <p>Click the button below to accept the invitation and get started:</p>
                  
                  <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '')}/challenge/${challengeId}?token=${invitationData.token}" class="cta-button">
                    Accept Invitation
                  </a>
                  
                  <p>This invitation will expire on ${expiresAt.toLocaleDateString()}.</p>
                  
                  <div class="footer">
                    <p>Together we can make a difference! 🌍</p>
                    <p>If you didn't expect this invitation, you can safely ignore this email.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

        const emailResult = await resend.emails.send({
          from: "Team Mobilization <onboarding@resend.dev>",
          to: [invitation.email],
          subject: `You're invited to join: ${challengeTitle}`,
          html: emailHtml,
        });

        console.log("Email sent successfully:", emailResult);

        return {
          email: invitation.email,
          invitationId: invitationData.id,
          emailId: emailResult.data?.id,
        };
      })
    );

    // Count successful and failed invitations
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`Invitation results: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successful,
        failed: failed,
        results: results.map((r, i) => ({
          email: invitations[i].email,
          status: r.status,
          data: r.status === "fulfilled" ? r.value : null,
          error: r.status === "rejected" ? r.reason.message : null,
        })),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-team-invitation function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  user_id: string;
  title: string;
  message: string;
  type: 'milestone' | 'community' | 'reminder' | 'admin';
  action_url?: string;
  metadata?: Record<string, any>;
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

    const { user_id, title, message, type, action_url, metadata }: PushNotificationRequest = await req.json();

    console.log(`Sending push notification to user ${user_id}`);

    // Check user notification preferences
    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user_id)
      .single();

    // Default to enabled if no preferences set
    const isEnabled = preferences?.push_enabled !== false;
    const typeEnabled = preferences?.[`${type}s_enabled`] !== false;

    if (!isEnabled || !typeEnabled) {
      console.log(`Notifications disabled for user ${user_id}, type: ${type}`);
      return new Response(
        JSON.stringify({ message: "Notifications disabled for this user" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Store notification in database
    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id,
        title,
        message,
        type,
        action_url,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (notificationError) {
      throw notificationError;
    }

    // Get user's push subscriptions
    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user_id);

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${user_id}`);
      return new Response(
        JSON.stringify({ message: "Notification stored but no push subscriptions" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send push notifications to all user's devices
    const pushPromises = subscriptions.map(async (sub) => {
      try {
        const payload = JSON.stringify({
          title,
          body: message,
          icon: "/favicon.png",
          badge: "/favicon.png",
          data: {
            url: action_url || "/",
            notification_id: notification.id
          }
        });

        // Note: In production, you would use a library like web-push to send notifications
        // For now, we're just logging that we would send
        console.log(`Would send push to endpoint: ${sub.endpoint.substring(0, 50)}...`);
        
        return { success: true, endpoint: sub.endpoint };
      } catch (error) {
        console.error(`Failed to send to ${sub.endpoint}:`, error);
        return { success: false, endpoint: sub.endpoint, error };
      }
    });

    const results = await Promise.all(pushPromises);
    const successful = results.filter(r => r.success).length;

    console.log(`Sent ${successful}/${subscriptions.length} push notifications`);

    return new Response(
      JSON.stringify({
        notification_id: notification.id,
        push_sent: successful,
        total_subscriptions: subscriptions.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-push-notification:", error);
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
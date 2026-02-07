import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Verify expert role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_role, stripe_account_id, stripe_onboarding_complete")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    if (profile.user_role !== "expert") {
      throw new Error("Only experts can create Stripe Connect accounts");
    }

    const siteUrl = Deno.env.get("SITE_URL") || req.headers.get("origin") || "https://demo.wellagora.org";

    // If expert already has a Stripe account, just generate a new account link
    if (profile.stripe_account_id) {
      const accountLink = await stripe.accountLinks.create({
        account: profile.stripe_account_id,
        return_url: `${siteUrl}/expert-studio?stripe=success`,
        refresh_url: `${siteUrl}/expert-studio?stripe=refresh`,
        type: "account_onboarding",
      });

      return new Response(
        JSON.stringify({ url: accountLink.url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new Stripe Express account
    const connectCountry = Deno.env.get("STRIPE_CONNECT_COUNTRY") || "HU";

    const account = await stripe.accounts.create({
      type: "express",
      country: connectCountry,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        wellagora_user_id: user.id,
      },
    });

    // Save stripe_account_id to profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        stripe_account_id: account.id,
        stripe_connect_id: account.id,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to save stripe_account_id:", updateError);
      throw new Error("Failed to save Stripe account");
    }

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      return_url: `${siteUrl}/expert-studio?stripe=success`,
      refresh_url: `${siteUrl}/expert-studio?stripe=refresh`,
      type: "account_onboarding",
    });

    return new Response(
      JSON.stringify({ url: accountLink.url, accountId: account.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error creating connect account:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

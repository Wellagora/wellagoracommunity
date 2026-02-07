import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
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

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { contentId, successUrl, cancelUrl } = await req.json();

    if (!contentId) {
      throw new Error("contentId is required");
    }

    // Fetch content details
    const { data: content, error: contentError } = await supabase
      .from("expert_contents")
      .select("id, title, price_huf, creator_id, image_url")
      .eq("id", contentId)
      .single();

    if (contentError || !content) {
      throw new Error("Content not found");
    }

    if (!content.price_huf || content.price_huf <= 0) {
      throw new Error("Content has no price");
    }

    // Check if user already has access
    const { data: existingAccess } = await supabase
      .from("content_access")
      .select("id")
      .eq("content_id", contentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingAccess) {
      throw new Error("Already purchased");
    }

    // Get user profile for Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", user.id)
      .single();

    // Create a pending transaction FIRST
    const creatorRevenue = Math.round(content.price_huf * 0.80);
    const platformFee = Math.round(content.price_huf * 0.20);

    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        content_id: contentId,
        buyer_id: user.id,
        creator_id: content.creator_id,
        amount: content.price_huf,
        gross_amount: content.price_huf,
        member_payment_amount: content.price_huf,
        creator_revenue: creatorRevenue,
        platform_fee: platformFee,
        status: "pending",
      })
      .select("id")
      .single();

    if (txError || !transaction) {
      throw new Error(`Failed to create transaction: ${txError?.message}`);
    }

    // Convert HUF to smallest unit (HUF has no decimal places, so amount = price)
    const amountInSmallestUnit = content.price_huf;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: profile?.email || user.email,
      line_items: [
        {
          price_data: {
            currency: "huf",
            product_data: {
              name: content.title,
              ...(content.image_url ? { images: [content.image_url] } : {}),
            },
            unit_amount: amountInSmallestUnit,
          },
          quantity: 1,
        },
      ],
      metadata: {
        transaction_id: transaction.id,
        content_id: contentId,
        user_id: user.id,
        creator_id: content.creator_id,
      },
      success_url: successUrl || `${req.headers.get("origin")}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/purchase/cancel`,
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
        transactionId: transaction.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

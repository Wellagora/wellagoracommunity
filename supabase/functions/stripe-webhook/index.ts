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
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey || !webhookSecret) {
      throw new Error("Stripe keys not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify webhook signature
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      throw new Error("Missing stripe-signature header");
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Received Stripe event: ${event.type}`);

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { transaction_id, content_id, user_id, creator_id } = session.metadata || {};

      if (!transaction_id || !content_id || !user_id) {
        console.error("Missing metadata in checkout session:", session.metadata);
        return new Response(JSON.stringify({ error: "Missing metadata" }), { status: 400 });
      }

      console.log(`Processing completed checkout for transaction: ${transaction_id}`);

      // 1. Update transaction to completed
      const { error: txError } = await supabase
        .from("transactions")
        .update({
          status: "completed",
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent as string,
        })
        .eq("id", transaction_id);

      if (txError) {
        console.error("Error updating transaction:", txError);
      }

      // 2. Create content_access record
      const { error: accessError } = await supabase
        .from("content_access")
        .insert({
          content_id,
          user_id,
          amount_paid: (session.amount_total || 0),
          payment_reference: `STRIPE-${session.id}`,
        });

      if (accessError) {
        console.error("Error creating content_access:", accessError);
      }

      // 3. Create content_participations record
      const { error: partError } = await supabase
        .from("content_participations")
        .insert({
          content_id,
          user_id,
          status: "active",
          access_granted_at: new Date().toISOString(),
        });

      if (partError) {
        console.error("Error creating participation:", partError);
      }

      // 4. Create voucher for the purchase
      const voucherCode = `WA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const { error: voucherError } = await supabase
        .from("vouchers")
        .insert({
          code: voucherCode,
          content_id,
          user_id,
          status: "active",
        });

      if (voucherError) {
        console.error("Error creating voucher:", voucherError);
      }

      console.log(`Successfully processed checkout for transaction ${transaction_id}`);
    }

    // Handle payment_intent.payment_failed
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`Payment failed for intent: ${paymentIntent.id}`);

      // Find and fail the transaction by stripe payment intent
      const { error } = await supabase
        .from("transactions")
        .update({ status: "failed" })
        .eq("stripe_payment_intent", paymentIntent.id);

      if (error) {
        console.error("Error updating failed transaction:", error);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

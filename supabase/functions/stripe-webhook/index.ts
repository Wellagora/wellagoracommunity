import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "WA-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
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

    // Idempotency check: skip if we already processed this event
    const { data: existingEvent } = await supabase
      .from("stripe_events")
      .select("id")
      .eq("event_id", event.id)
      .maybeSingle();

    if (existingEvent) {
      console.log(`Skipping already-processed event: ${event.id}`);
      return new Response(
        JSON.stringify({ received: true, skipped: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Record the event for idempotency
    await supabase.from("stripe_events").insert({
      event_id: event.id,
      event_type: event.type,
      processed_at: new Date().toISOString(),
    });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Get metadata from payment_intent (Connect) or session
        let meta = session.metadata || {};
        if (session.payment_intent) {
          try {
            const pi = await stripe.paymentIntents.retrieve(session.payment_intent as string);
            if (pi.metadata && pi.metadata.wellagora_user_id) {
              meta = pi.metadata;
            }
          } catch (e) {
            console.error("Failed to retrieve payment intent metadata:", e);
          }
        }

        const userId = meta.wellagora_user_id;
        const contentId = meta.wellagora_content_id;
        const transactionId = meta.wellagora_transaction_id;
        const basePrice = parseInt(meta.wellagora_base_price || "0");
        const sponsorCreditId = meta.wellagora_sponsor_credit_id || null;
        const sponsorContribution = parseInt(meta.wellagora_sponsor_contribution || "0");
        const wellpointsUsed = parseInt(meta.wellagora_wellpoints_used || "0");
        const wellpointsDiscount = parseInt(meta.wellagora_wellpoints_discount || "0");
        const platformCreditUsed = parseInt(meta.wellagora_platform_credit_used || "0");
        const expertPayout = parseInt(meta.wellagora_expert_payout || "0");
        const platformFee = parseInt(meta.wellagora_platform_fee || "0");
        const userPayment = basePrice - sponsorContribution - wellpointsDiscount - platformCreditUsed;

        if (!userId || !contentId) {
          console.error("Missing metadata in checkout session:", meta);
          return new Response(JSON.stringify({ error: "Missing metadata" }), { status: 400 });
        }

        console.log(`Processing completed checkout: user=${userId}, content=${contentId}, tx=${transactionId}`);

        // 1. Update transaction to completed
        if (transactionId) {
          await supabase
            .from("transactions")
            .update({
              status: "completed",
              stripe_session_id: session.id,
              stripe_payment_intent: session.payment_intent as string,
            })
            .eq("id", transactionId);
        }

        // 2. Voucher generation
        const voucherCode = generateVoucherCode();
        const { data: voucher } = await supabase.from("vouchers").insert({
          code: voucherCode,
          content_id: contentId,
          user_id: userId,
          status: "active",
          payout_amount: expertPayout,
          sponsor_credit_deducted: sponsorContribution || null,
          created_at: new Date().toISOString(),
        }).select().single();

        // 3. Get content creator
        const { data: content } = await supabase
          .from("expert_contents")
          .select("creator_id")
          .eq("id", contentId)
          .single();

        // 4. Settlement record
        let sponsorUserId = null;
        if (sponsorCreditId) {
          const { data: sc } = await supabase
            .from("sponsor_credits")
            .select("sponsor_user_id")
            .eq("id", sponsorCreditId)
            .single();
          sponsorUserId = sc?.sponsor_user_id || null;
        }

        await supabase.from("voucher_settlements").insert({
          voucher_id: voucher?.id,
          content_id: contentId,
          user_id: userId,
          expert_id: content?.creator_id,
          original_price: basePrice,
          user_payment: userPayment,
          sponsor_contribution: sponsorContribution,
          expert_payout: expertPayout,
          platform_fee: platformFee,
          wellpoints_discount: wellpointsDiscount,
          wellpoints_used: wellpointsUsed,
          settlement_type: sponsorContribution > 0 ? "sponsored" : wellpointsDiscount > 0 ? "wellpoints" : "standard",
          settlement_status: "completed",
          sponsor_id: sponsorUserId,
        });

        // 5. Content access
        await supabase.from("content_access").insert({
          content_id: contentId,
          user_id: userId,
          amount_paid: userPayment,
          access_type: "purchased",
          purchased_at: new Date().toISOString(),
          payment_reference: session.payment_intent as string,
        });

        // 6. Sponsor credit deduction
        if (sponsorCreditId && sponsorContribution > 0) {
          await supabase.rpc("deduct_sponsor_credit", {
            p_credit_id: sponsorCreditId,
            p_amount: sponsorContribution,
          });
        }

        // 7. WellPoints deduction
        if (wellpointsUsed > 0) {
          // Deduct WellPoints from user profile
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("wellpoints")
            .eq("id", userId)
            .single();

          if (userProfile) {
            await supabase
              .from("profiles")
              .update({ wellpoints: Math.max(0, (userProfile.wellpoints || 0) - wellpointsUsed) })
              .eq("id", userId);
          }

          // Record redemption
          await supabase.from("wellpoints_redemptions").insert({
            user_id: userId,
            points_spent: wellpointsUsed,
            redemption_type: "checkout_discount",
            discount_percent: wellpointsUsed >= 1000 ? 20 : wellpointsUsed >= 500 ? 10 : 5,
            discount_amount_ft: wellpointsDiscount,
            voucher_id: voucher?.id,
          });
        }

        console.log(`Successfully processed checkout: voucher=${voucherCode}, tx=${transactionId}`);
        break;
      }

      case "account.updated": {
        // Stripe Connect onboarding status update
        const account = event.data.object as Stripe.Account;
        if (account.charges_enabled && account.payouts_enabled) {
          const { error } = await supabase
            .from("profiles")
            .update({
              stripe_onboarding_complete: true,
              payout_enabled: true,
            })
            .eq("stripe_account_id", account.id);

          if (error) {
            console.error("Error updating onboarding status:", error);
          } else {
            console.log(`Stripe Connect onboarding completed for account: ${account.id}`);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed for intent: ${paymentIntent.id}`);

        const txId = paymentIntent.metadata?.wellagora_transaction_id;
        if (txId) {
          await supabase
            .from("transactions")
            .update({ status: "failed" })
            .eq("id", txId);
        }
        break;
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

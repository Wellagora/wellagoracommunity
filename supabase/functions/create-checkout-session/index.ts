import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Rate limiting: 10 checkout attempts per minute per user
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const rl = checkRateLimit(`checkout:${clientIp}`, 10, 60_000);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

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

    const {
      contentId,
      use_wellpoints = false,
      wellpoints_amount = 0,
      use_platform_credit = false,
    } = await req.json();

    if (!contentId) {
      throw new Error("contentId is required");
    }

    // 1. Fetch content with expert's Stripe account
    const { data: content, error: contentError } = await supabase
      .from("expert_contents")
      .select("id, title, description, price_huf, creator_id, image_url, is_sponsored, fixed_sponsor_amount")
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

    // Get expert's Stripe account
    const { data: expertProfile } = await supabase
      .from("profiles")
      .select("stripe_account_id, stripe_onboarding_complete, is_founding_expert")
      .eq("id", content.creator_id)
      .single();

    if (!expertProfile?.stripe_account_id || !expertProfile?.stripe_onboarding_complete) {
      throw new Error("Expert has not completed Stripe onboarding");
    }

    // Get buyer profile
    const { data: buyerProfile } = await supabase
      .from("profiles")
      .select("email, first_name, last_name, credit_balance")
      .eq("id", user.id)
      .single();

    const basePrice = content.price_huf;

    // 2. Sponsor check
    let sponsorCreditId: string | null = null;
    let sponsorContribution = 0;

    if (content.is_sponsored) {
      const { data: reservation } = await supabase.rpc("check_and_reserve_sponsored_seat", {
        p_content_id: contentId,
        p_user_id: user.id,
      });
      if (reservation?.success) {
        sponsorCreditId = reservation.sponsor_credit_id;
        sponsorContribution = reservation.amount || 0;
      }
    }

    // 3. WellPoints discount (NOT combinable with sponsor)
    let wellpointsDiscount = 0;
    let wellpointsUsed = 0;

    if (use_wellpoints && wellpoints_amount && sponsorContribution === 0) {
      const discountPercent =
        wellpoints_amount >= 1000 ? 0.20 :
        wellpoints_amount >= 500 ? 0.10 :
        wellpoints_amount >= 200 ? 0.05 : 0;

      wellpointsDiscount = Math.round(basePrice * discountPercent);
      wellpointsUsed = wellpoints_amount;
    }

    // 4. Platform credit (combinable with WellPoints, NOT with sponsor)
    let platformCreditUsed = 0;
    if (use_platform_credit && sponsorContribution === 0) {
      const availableCredit = buyerProfile?.credit_balance || 0;
      const remainingAfterWP = basePrice - wellpointsDiscount;
      platformCreditUsed = Math.min(availableCredit, remainingAfterWP);
    }

    // 5. Final payment amount
    const userPayment = Math.max(0, basePrice - sponsorContribution - wellpointsDiscount - platformCreditUsed);

    // Founding experts get 0% platform fee (100% goes to expert)
    const isFoundingExpert = expertProfile?.is_founding_expert === true;
    const expertSharePercent = isFoundingExpert ? 1.00 : 0.80;
    const expertPayout = Math.round(basePrice * expertSharePercent);
    const applicationFee = isFoundingExpert ? 0 : Math.max(0, userPayment - expertPayout);

    const siteUrl = Deno.env.get("SITE_URL") || req.headers.get("origin") || "https://demo.wellagora.org";

    // 6. If 0 Ft payment (fully sponsored / fully covered) → no Stripe session needed
    if (userPayment === 0) {
      const voucherCode = generateVoucherCode();

      // Create voucher
      const { data: voucher } = await supabase.from("vouchers").insert({
        code: voucherCode,
        content_id: contentId,
        user_id: user.id,
        status: "active",
        payout_amount: expertPayout,
        sponsor_credit_deducted: sponsorContribution || null,
        created_at: new Date().toISOString(),
      }).select().single();

      // Create settlement
      await supabase.from("voucher_settlements").insert({
        voucher_id: voucher?.id,
        content_id: contentId,
        user_id: user.id,
        expert_id: content.creator_id,
        original_price: basePrice,
        user_payment: 0,
        sponsor_contribution: sponsorContribution,
        expert_payout: expertPayout,
        platform_fee: basePrice - expertPayout - sponsorContribution,
        wellpoints_discount: wellpointsDiscount,
        wellpoints_used: wellpointsUsed,
        settlement_type: sponsorContribution > 0 ? "fully_sponsored" : "free",
        settlement_status: "completed",
      });

      // Create content access
      await supabase.from("content_access").insert({
        content_id: contentId,
        user_id: user.id,
        amount_paid: 0,
        access_type: sponsorContribution > 0 ? "sponsored" : "purchased",
        purchased_at: new Date().toISOString(),
        sponsorship_id: sponsorCreditId,
      });

      // Deduct sponsor credit
      if (sponsorCreditId && sponsorContribution > 0) {
        await supabase.rpc("deduct_sponsor_credit", {
          p_credit_id: sponsorCreditId,
          p_amount: sponsorContribution,
        });
      }

      // Deduct platform credit if used
      if (platformCreditUsed > 0) {
        await supabase
          .from("profiles")
          .update({ credit_balance: (buyerProfile?.credit_balance || 0) - platformCreditUsed })
          .eq("id", user.id);
      }

      return new Response(
        JSON.stringify({
          free: true,
          voucher_code: voucherCode,
          redirect_url: `${siteUrl}/purchase/success?voucher=${voucherCode}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Create pending transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        content_id: contentId,
        buyer_id: user.id,
        creator_id: content.creator_id,
        amount: basePrice,
        gross_amount: basePrice,
        member_payment_amount: userPayment,
        creator_revenue: expertPayout,
        platform_fee: applicationFee,
        status: "pending",
      })
      .select("id")
      .single();

    if (txError || !transaction) {
      throw new Error(`Failed to create transaction: ${txError?.message}`);
    }

    // 8. Create Stripe Checkout Session with Connect transfer
    // HUF is a two-decimal currency since 2024: 5000 Ft = 500000
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: buyerProfile?.email || user.email,
      line_items: [
        {
          price_data: {
            currency: "huf",
            product_data: {
              name: content.title,
              description: content.description?.substring(0, 500) || undefined,
              ...(content.image_url ? { images: [content.image_url] } : {}),
            },
            unit_amount: userPayment * 100,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFee * 100,
        transfer_data: {
          destination: expertProfile.stripe_account_id,
        },
        metadata: {
          wellagora_user_id: user.id,
          wellagora_content_id: contentId,
          wellagora_transaction_id: transaction.id,
          wellagora_base_price: basePrice.toString(),
          wellagora_sponsor_credit_id: sponsorCreditId || "",
          wellagora_sponsor_contribution: sponsorContribution.toString(),
          wellagora_wellpoints_used: wellpointsUsed.toString(),
          wellagora_wellpoints_discount: wellpointsDiscount.toString(),
          wellagora_platform_credit_used: platformCreditUsed.toString(),
          wellagora_expert_payout: expertPayout.toString(),
          wellagora_platform_fee: applicationFee.toString(),
          wellagora_founding_expert: isFoundingExpert ? "true" : "false",
          wellagora_expert_share_percent: String(expertSharePercent * 100),
        },
      },
      success_url: `${siteUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/programs/${contentId}`,
      metadata: {
        wellagora_user_id: user.id,
        wellagora_content_id: contentId,
        wellagora_transaction_id: transaction.id,
      },
    });

    // Deduct platform credit upfront if used (non-refundable via Stripe)
    if (platformCreditUsed > 0) {
      await supabase
        .from("profiles")
        .update({ credit_balance: (buyerProfile?.credit_balance || 0) - platformCreditUsed })
        .eq("id", user.id);
    }

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

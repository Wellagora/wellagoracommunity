import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  isBillingoConfigured,
  createSponsorCreditInvoice,
  sendInvoiceEmail,
} from "../_shared/billingo.ts";

/**
 * Create Sponsor Invoice Edge Function
 * =====================================
 * Called after a sponsor purchases a credit package.
 * Generates Platform → Szponzor invoice via Billingo (27% ÁFA).
 *
 * Required body:
 *   - sponsor_user_id: string
 *   - package_name: string
 *   - credit_amount: number (HUF gross amount)
 *   - sponsor_credit_id: string (ID of the sponsor_credits record)
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT — only authenticated sponsors can call this
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
    }

    const body = await req.json();
    const { sponsor_user_id, package_name, credit_amount, sponsor_credit_id } = body;

    // Validate that the caller is the sponsor (or an admin)
    if (user.id !== sponsor_user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_super_admin")
        .eq("id", user.id)
        .single();
      if (!profile?.is_super_admin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
      }
    }

    // Validate required fields
    if (!sponsor_user_id || !package_name || !credit_amount || !sponsor_credit_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: sponsor_user_id, package_name, credit_amount, sponsor_credit_id" }),
        { status: 400 }
      );
    }

    // Fetch sponsor profile
    const { data: sponsorProfile, error: profileErr } = await supabase
      .from("profiles")
      .select("first_name, last_name, email, organization_name, company_tax_id")
      .eq("id", sponsor_user_id)
      .single();

    if (profileErr || !sponsorProfile) {
      return new Response(JSON.stringify({ error: "Sponsor profile not found" }), { status: 404 });
    }

    const sponsorName =
      sponsorProfile.organization_name ||
      [sponsorProfile.first_name, sponsorProfile.last_name].filter(Boolean).join(" ") ||
      sponsorProfile.email;

    // Check if Billingo is configured
    if (!isBillingoConfigured()) {
      console.warn("Billingo not configured — sponsor invoice skipped");
      return new Response(
        JSON.stringify({
          success: true,
          invoice_number: null,
          message: "Billingo not configured — invoice pending manual generation",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate invoice via Billingo
    const result = await createSponsorCreditInvoice({
      sponsorName,
      sponsorEmail: sponsorProfile.email,
      sponsorTaxcode: sponsorProfile.company_tax_id || "",
      packageName: package_name,
      creditAmount: credit_amount,
      sponsorCreditId: sponsor_credit_id,
    });

    // Send invoice email
    try {
      await sendInvoiceEmail(result.id);
    } catch (e) {
      console.warn("Failed to send sponsor invoice email:", e);
    }

    // Record the invoice in credit_transactions
    await supabase.from("credit_transactions").insert({
      sponsor_user_id,
      credits: 0,
      transaction_type: "invoice",
      description: `Szamla kiallitva: ${result.invoice_number} — ${package_name}`,
    });

    console.log(`Sponsor invoice created: ${result.invoice_number} for ${sponsorName}`);

    return new Response(
      JSON.stringify({
        success: true,
        invoice_number: result.invoice_number,
        billingo_document_id: result.id,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Sponsor invoice error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * Billingo API v3 Integration for WellAgora
 * ==========================================
 * Handles all automated invoice generation through Billingo.
 *
 * Base URL: https://api.billingo.hu/v3
 * Auth: X-API-KEY header
 *
 * Required Supabase Edge Function secrets:
 *   - BILLINGO_API_KEY: Your Billingo API key
 *   - BILLINGO_BLOCK_ID: Document block ID for invoices (get from /document-blocks)
 *   - BILLINGO_BANK_ACCOUNT_ID: Bank account ID (optional, get from /bank-accounts)
 *
 * Invoice types this module handles:
 *   1. Platform → Vásárló (Tag) — when expert is magánszemély
 *   2. Platform → Szakértő — 20% jutalék számla
 *   3. Platform → Szponzor — kredit vásárlás (27% ÁFA)
 */

const BILLINGO_BASE = "https://api.billingo.hu/v3";

interface BillingoConfig {
  apiKey: string;
  blockId: number;
  bankAccountId?: number;
}

interface BillingoPartner {
  id?: number;
  name: string;
  email: string;
  address?: {
    country_code: string;
    post_code: string;
    city: string;
    address: string;
  };
  taxcode?: string;
}

interface BillingoItem {
  name: string;
  unit_price: number;
  unit_price_type: "gross" | "net";
  vat: string; // "27%", "0%", "AAM", "TAM", "EU", "EUK", etc.
  quantity: number;
  unit: string;
  comment?: string;
}

interface BillingoDocumentInsert {
  partner_id: number;
  block_id: number;
  bank_account_id?: number;
  type: "invoice" | "advance" | "draft" | "proforma" | "receipt";
  fulfillment_date: string; // YYYY-MM-DD
  due_date: string; // YYYY-MM-DD
  payment_method:
    | "cash"
    | "bankcard"
    | "elore_utalas"
    | "utanvet"
    | "online_bankcard"
    | "barion"
    | "paypal"
    | "szep_card"
    | "utalas"
    | "paylike"
    | "pending";
  language: "hu" | "en" | "de";
  currency: "HUF" | "EUR" | "USD";
  electronic: boolean;
  paid: boolean;
  items: BillingoItem[];
  comment?: string;
  settings?: {
    round?: string; // "five" for HUF rounding
  };
}

interface BillingoInvoiceResult {
  id: number;
  invoice_number: string;
  pdf_url?: string;
}

function getConfig(): BillingoConfig {
  const apiKey = Deno.env.get("BILLINGO_API_KEY");
  const blockId = Deno.env.get("BILLINGO_BLOCK_ID");

  if (!apiKey) throw new Error("BILLINGO_API_KEY not configured");
  if (!blockId) throw new Error("BILLINGO_BLOCK_ID not configured");

  return {
    apiKey,
    blockId: parseInt(blockId),
    bankAccountId: Deno.env.get("BILLINGO_BANK_ACCOUNT_ID")
      ? parseInt(Deno.env.get("BILLINGO_BANK_ACCOUNT_ID")!)
      : undefined,
  };
}

async function billingoFetch(
  path: string,
  config: BillingoConfig,
  options: RequestInit = {},
): Promise<Response> {
  const url = `${BILLINGO_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": config.apiKey,
      ...((options.headers as Record<string, string>) || {}),
    },
  });
  return res;
}

// ─── Partner Management ──────────────────────────────────────

/**
 * Find or create a Billingo partner by email.
 * First searches existing partners, creates if not found.
 */
export async function findOrCreatePartner(
  partner: BillingoPartner,
): Promise<number> {
  const config = getConfig();

  // Search for existing partner by name
  const searchRes = await billingoFetch(
    `/partners?query=${encodeURIComponent(partner.email)}&page=1&per_page=5`,
    config,
  );

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.data && searchData.data.length > 0) {
      // Return first match
      return searchData.data[0].id;
    }
  }

  // Create new partner
  const createBody = {
    name: partner.name,
    emails: [partner.email],
    address: partner.address || {
      country_code: "HU",
      post_code: "0000",
      city: "N/A",
      address: "N/A",
    },
    taxcode: partner.taxcode || "",
  };

  const createRes = await billingoFetch("/partners", config, {
    method: "POST",
    body: JSON.stringify(createBody),
  });

  if (!createRes.ok) {
    const errBody = await createRes.text();
    throw new Error(`Billingo partner creation failed: ${createRes.status} — ${errBody}`);
  }

  const created = await createRes.json();
  return created.id;
}

// ─── Document/Invoice Creation ───────────────────────────────

async function createDocument(
  doc: BillingoDocumentInsert,
): Promise<BillingoInvoiceResult> {
  const config = getConfig();

  const res = await billingoFetch("/documents", config, {
    method: "POST",
    body: JSON.stringify(doc),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Billingo document creation failed: ${res.status} — ${errBody}`);
  }

  const result = await res.json();
  return {
    id: result.id,
    invoice_number: result.invoice_number,
  };
}

/**
 * Download invoice PDF URL.
 * GET /documents/{id}/download returns the PDF.
 */
export async function getInvoicePdfUrl(documentId: number): Promise<string | null> {
  const config = getConfig();
  // The download endpoint returns the PDF directly
  // We construct a URL that can be used to access it
  return `${BILLINGO_BASE}/documents/${documentId}/download`;
}

/**
 * Send invoice via email through Billingo.
 */
export async function sendInvoiceEmail(documentId: number): Promise<void> {
  const config = getConfig();
  const res = await billingoFetch(`/documents/${documentId}/send`, config, {
    method: "POST",
  });
  if (!res.ok) {
    console.warn(`Failed to send invoice email for doc ${documentId}`);
  }
}

// ─── Invoice Type 1: Platform → Vásárló (Tag) ───────────────
// When expert is magánszemély, the Platform issues the invoice to the buyer

export async function createBuyerInvoice(params: {
  buyerName: string;
  buyerEmail: string;
  contentTitle: string;
  grossAmount: number; // Amount the buyer actually paid (HUF, NOT Stripe cents)
  transactionId: string;
  isFoundingExpert: boolean;
}): Promise<BillingoInvoiceResult> {
  const config = getConfig();
  const today = new Date().toISOString().split("T")[0];

  const partnerId = await findOrCreatePartner({
    name: params.buyerName,
    email: params.buyerEmail,
  });

  return createDocument({
    partner_id: partnerId,
    block_id: config.blockId,
    ...(config.bankAccountId ? { bank_account_id: config.bankAccountId } : {}),
    type: getDocumentType(),
    fulfillment_date: today,
    due_date: today, // Already paid via Stripe
    payment_method: "online_bankcard",
    language: "hu",
    currency: "HUF",
    electronic: true,
    paid: true,
    items: [
      {
        name: `WellAgora program: ${params.contentTitle}`,
        unit_price: params.grossAmount,
        unit_price_type: "gross",
        vat: "27%",
        quantity: 1,
        unit: "db",
      },
    ],
    comment: `WellAgora platform vasarlas — Tranzakcio: ${params.transactionId}`,
    settings: { round: "five" },
  });
}

// ─── Invoice Type 2: Platform → Szakértő (jutalék számla) ───
// 20% platform fee invoice (B2B) — or 0% for Founding Expert

export async function createCommissionInvoice(params: {
  expertName: string;
  expertEmail: string;
  expertTaxcode?: string;
  contentTitle: string;
  grossRevenue: number; // Total revenue from the sale
  commissionAmount: number; // Platform fee amount (HUF)
  commissionPercent: number; // e.g. 20 or 0
  transactionId: string;
}): Promise<BillingoInvoiceResult | null> {
  // No commission invoice if amount is 0 (Founding Expert)
  if (params.commissionAmount <= 0) {
    console.log(`Skipping commission invoice for founding expert (tx: ${params.transactionId})`);
    return null;
  }

  const config = getConfig();
  const today = new Date().toISOString().split("T")[0];
  // Commission invoice due in 8 days
  const dueDate = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const partnerId = await findOrCreatePartner({
    name: params.expertName,
    email: params.expertEmail,
    taxcode: params.expertTaxcode,
  });

  return createDocument({
    partner_id: partnerId,
    block_id: config.blockId,
    ...(config.bankAccountId ? { bank_account_id: config.bankAccountId } : {}),
    type: getDocumentType(),
    fulfillment_date: today,
    due_date: dueDate,
    payment_method: "utalas", // Bank transfer offset
    language: "hu",
    currency: "HUF",
    electronic: true,
    paid: false, // Will be offset against payout
    items: [
      {
        name: `WellAgora platform szolgaltatasi dij (${params.commissionPercent}%) — ${params.contentTitle}`,
        unit_price: params.commissionAmount,
        unit_price_type: "gross",
        vat: "27%",
        quantity: 1,
        unit: "db",
        comment: `Brutto bevetel: ${params.grossRevenue} Ft`,
      },
    ],
    comment: `Platform jutalek — Tranzakcio: ${params.transactionId}`,
    settings: { round: "five" },
  });
}

// ─── Invoice Type 3: Platform → Szponzor (kredit vásárlás) ──
// Sponsor buys credits, Platform invoices with 27% ÁFA

export async function createSponsorCreditInvoice(params: {
  sponsorName: string;
  sponsorEmail: string;
  sponsorTaxcode?: string;
  packageName: string;
  creditAmount: number; // HUF amount of credits purchased (gross)
  sponsorCreditId: string;
}): Promise<BillingoInvoiceResult> {
  const config = getConfig();
  const today = new Date().toISOString().split("T")[0];
  // Sponsor credits: 8 day payment term
  const dueDate = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const partnerId = await findOrCreatePartner({
    name: params.sponsorName,
    email: params.sponsorEmail,
    taxcode: params.sponsorTaxcode,
  });

  return createDocument({
    partner_id: partnerId,
    block_id: config.blockId,
    ...(config.bankAccountId ? { bank_account_id: config.bankAccountId } : {}),
    type: getDocumentType(),
    fulfillment_date: today,
    due_date: dueDate,
    payment_method: "utalas",
    language: "hu",
    currency: "HUF",
    electronic: true,
    paid: false,
    items: [
      {
        name: `WellAgora szponzor kredit csomag: ${params.packageName}`,
        unit_price: params.creditAmount,
        unit_price_type: "gross",
        vat: "27%",
        quantity: 1,
        unit: "db",
      },
    ],
    comment: `Szponzor kredit vasarlas — Kredit ID: ${params.sponsorCreditId}`,
    settings: { round: "five" },
  });
}

// ─── Utility: Check if Billingo is configured ────────────────

export function isBillingoConfigured(): boolean {
  return !!(Deno.env.get("BILLINGO_API_KEY") && Deno.env.get("BILLINGO_BLOCK_ID"));
}

/**
 * Returns "draft" in test mode, "invoice" in production.
 * Set BILLINGO_TEST_MODE=true to generate draft invoices that:
 * - Do NOT get a NAV serial number
 * - Do NOT appear in NAV Online Számla
 * - CAN be deleted from Billingo dashboard after testing
 * - DO generate a downloadable PDF for verification
 */
export function getDocumentType(): "invoice" | "draft" {
  return Deno.env.get("BILLINGO_TEST_MODE") === "true" ? "draft" : "invoice";
}

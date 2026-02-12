/**
 * Typed helpers for tables not yet in the auto-generated Supabase types.
 * Remove individual helpers once `npx supabase gen types` is re-run and the
 * table appears in types.ts.
 */
import { supabase } from "./client";

// ---------- share_clicks ----------
export interface ShareClickRow {
  id?: string;
  expert_id: string | null;
  program_id: string | null;
  source: string;
  medium: string | null;
  campaign: string | null;
  clicked_at?: string;
  visitor_id: string | null;
  referrer: string | null;
  page_path: string | null;
}

export const shareClicks = () =>
  (supabase as any).from("share_clicks") as ReturnType<typeof supabase.from>;

// ---------- guest_registrations ----------
export interface GuestRegistrationRow {
  id?: string;
  program_id: string;
  guest_name: string;
  guest_email: string;
  registered_at?: string;
  converted_to_user_id?: string | null;
  confirmation_token?: string;
  confirmed?: boolean;
}

export const guestRegistrations = () =>
  (supabase as any).from("guest_registrations") as ReturnType<typeof supabase.from>;

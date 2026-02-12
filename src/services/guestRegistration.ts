import { supabase } from "@/integrations/supabase/client";

export type GuestRegistrationResult =
  | { success: true; data: any }
  | { success: false; error: "already_registered" | "account_exists" | "unknown" };

/**
 * Register a guest (no account) for a program with just name + email.
 * Returns the guest registration row on success.
 */
export async function registerAsGuest(
  programId: string,
  name: string,
  email: string
): Promise<GuestRegistrationResult> {
  const db = supabase as any; // guest_registrations not in generated types yet

  // 1. Check if already registered for this program
  const { data: existing } = await db
    .from("guest_registrations")
    .select("id")
    .eq("program_id", programId)
    .eq("guest_email", email.toLowerCase().trim())
    .maybeSingle();

  if (existing) {
    return { success: false, error: "already_registered" };
  }

  // 2. Check if an account already exists with this email
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (existingProfile) {
    return { success: false, error: "account_exists" };
  }

  // 3. Insert guest registration
  const { data, error } = await db
    .from("guest_registrations")
    .insert({
      program_id: programId,
      guest_name: name.trim(),
      guest_email: email.toLowerCase().trim(),
    })
    .select()
    .single();

  if (error) {
    console.error("Guest registration error:", error);
    return { success: false, error: "unknown" };
  }

  return { success: true, data };
}

/**
 * Confirm a guest registration by token.
 */
export async function confirmGuestRegistration(
  token: string
): Promise<{ success: boolean; programId?: string; guestName?: string }> {
  const db = supabase as any;

  const { data, error } = await db
    .from("guest_registrations")
    .select("id, program_id, guest_name, confirmed")
    .eq("confirmation_token", token)
    .maybeSingle();

  if (error || !data) {
    return { success: false };
  }

  if (data.confirmed) {
    return { success: true, programId: data.program_id, guestName: data.guest_name };
  }

  // Mark as confirmed
  await db
    .from("guest_registrations")
    .update({ confirmed: true })
    .eq("id", data.id);

  return { success: true, programId: data.program_id, guestName: data.guest_name };
}

/**
 * Link guest registrations to a newly created user account.
 * Called after signup when email matches existing guest registrations.
 */
export async function convertGuestToUser(
  userId: string,
  email: string
): Promise<void> {
  const db = supabase as any;

  await db
    .from("guest_registrations")
    .update({ converted_to_user_id: userId })
    .eq("guest_email", email.toLowerCase().trim());
}

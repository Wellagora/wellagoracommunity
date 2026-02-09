import { supabase } from '@/integrations/supabase/client';
import { notifyExpertOnEnrollment, notifyTagOnEnrollment } from './notificationService';
import { checkAndSendNudges } from './nudgeService';

/**
 * Enrollment Service — handles free and paid program enrollment
 * 
 * Free: direct content_access INSERT + participant increment
 * Paid: Stripe Checkout → webhook handles the rest
 */

export interface EnrollmentResult {
  success: boolean;
  error?: string;
  checkoutUrl?: string;
}

/**
 * Check if a user can enroll in a program
 */
export function canEnroll(content: {
  price_huf: number | null;
  max_capacity: number | null;
  current_participants?: number | null;
  is_published: boolean | null;
  status?: string | null;
}): { allowed: boolean; reason: string } {
  // Check if published
  const isPublished = content.is_published === true;
  const status = content.status || (isPublished ? 'published' : 'draft');
  
  if (!['published', 'sponsored'].includes(status) && !isPublished) {
    return { allowed: false, reason: 'not_published' };
  }

  // Check capacity
  if (status === 'full') {
    return { allowed: false, reason: 'full' };
  }
  
  if (content.max_capacity && (content.current_participants || 0) >= content.max_capacity) {
    return { allowed: false, reason: 'full' };
  }

  return { allowed: true, reason: 'ok' };
}

/**
 * Check if content is free (price_huf = 0 or null)
 */
export function isFreeContent(priceHuf: number | null | undefined): boolean {
  return !priceHuf || priceHuf === 0;
}

/**
 * Enroll in a free program (price_huf = 0)
 */
export async function enrollFree(contentId: string, userId: string): Promise<EnrollmentResult> {
  // 1. Fetch content to validate
  const { data: content, error: fetchError } = await supabase
    .from('expert_contents')
    .select('id, title, price_huf, max_capacity, is_published, creator_id')
    .eq('id', contentId)
    .single();

  if (fetchError || !content) {
    return { success: false, error: 'Program nem található' };
  }

  if (!isFreeContent(content.price_huf)) {
    return { success: false, error: 'Ez nem ingyenes program' };
  }

  if (!content.is_published) {
    return { success: false, error: 'A program nem elérhető' };
  }

  // 2. Check for duplicate enrollment
  const { data: existing } = await supabase
    .from('content_access')
    .select('id')
    .eq('content_id', contentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    return { success: false, error: 'Már regisztráltál erre a programra' };
  }

  // 3. Insert content_access
  const { error: insertError } = await supabase
    .from('content_access')
    .insert({
      content_id: contentId,
      user_id: userId,
      access_type: 'free',
      amount_paid: 0,
      purchased_at: new Date().toISOString(),
    });

  if (insertError) {
    return { success: false, error: 'Regisztráció sikertelen' };
  }

  // 4. Increment participants (via RPC if available, otherwise direct update)
  await supabase.rpc('increment_participants', { p_content_id: contentId }).catch(() => {
    console.warn('increment_participants RPC not available yet');
  });

  // 5. Send notifications (fire-and-forget)
  if (content.creator_id) {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();
    const tagName = userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : 'Valaki';
    notifyExpertOnEnrollment(content.creator_id, tagName, content.title || 'Program').catch(console.error);
    notifyTagOnEnrollment(userId, content.title || 'Program').catch(console.error);
    checkAndSendNudges(content.creator_id).catch(console.error);
  }

  return { success: true };
}

/**
 * Start paid checkout via Stripe (creates checkout session via edge function)
 */
export async function startPaidCheckout(
  contentId: string, 
  userId: string,
  expertId: string,
  title: string,
  priceHuf: number,
  currency: string = 'HUF'
): Promise<EnrollmentResult> {
  // Check for duplicate enrollment first
  const { data: existing } = await supabase
    .from('content_access')
    .select('id')
    .eq('content_id', contentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    return { success: false, error: 'Már megvásároltad ezt a programot' };
  }

  // Call Stripe checkout edge function
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: {
      content_id: contentId,
      user_id: userId,
      expert_id: expertId,
      title,
      price: priceHuf,
      currency: currency.toLowerCase(),
      success_url: `${window.location.origin}/piacer/${contentId}?payment=success`,
      cancel_url: `${window.location.origin}/piacer/${contentId}?payment=cancelled`,
    },
  });

  if (error) {
    return { success: false, error: 'Fizetési rendszer nem elérhető' };
  }

  if (data?.url) {
    return { success: true, checkoutUrl: data.url };
  }

  return { success: false, error: 'Checkout session létrehozása sikertelen' };
}

/**
 * Calculate 80/20 split
 */
export function calculateSplit(totalAmount: number): {
  expertAmount: number;
  platformFee: number;
} {
  const platformFee = Math.round(totalAmount * 0.20);
  const expertAmount = totalAmount - platformFee;
  return { expertAmount, platformFee };
}

/**
 * Determine the enrollment button state for a program
 */
export function getEnrollmentButtonState(content: {
  price_huf: number | null;
  max_capacity: number | null;
  current_participants?: number | null;
  is_published: boolean | null;
  is_sponsored?: boolean | null;
  sponsor_name?: string | null;
  status?: string | null;
}, hasAccess: boolean): {
  type: 'free' | 'paid' | 'full' | 'open' | 'sponsored' | 'unavailable';
  label: string;
  disabled: boolean;
  price?: number;
} {
  // Already has access → "Megnyitás"
  if (hasAccess) {
    return { type: 'open', label: 'Megnyitás', disabled: false };
  }

  const { allowed, reason } = canEnroll(content);

  if (!allowed) {
    if (reason === 'full') {
      return { type: 'full', label: 'Betelt', disabled: true };
    }
    return { type: 'unavailable', label: 'Nem elérhető', disabled: true };
  }

  // Sponsored (Phase 2 prep)
  if (content.is_sponsored && content.sponsor_name) {
    return {
      type: 'sponsored',
      label: `Ingyenes — ${content.sponsor_name} jóvoltából`,
      disabled: false,
    };
  }

  // Free
  if (isFreeContent(content.price_huf)) {
    return { type: 'free', label: 'Regisztrálok', disabled: false };
  }

  // Paid
  return {
    type: 'paid',
    label: `Megveszem — ${(content.price_huf || 0).toLocaleString('hu-HU')} Ft`,
    disabled: false,
    price: content.price_huf || 0,
  };
}

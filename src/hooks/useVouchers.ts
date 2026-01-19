import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export type VoucherStatus = 'active' | 'used' | 'expired';

export interface Voucher {
  id: string;
  code: string;
  user_id: string;
  content_id: string;
  status: VoucherStatus;
  pickup_location: string | null;
  created_at: string;
  redeemed_at: string | null;
  expires_at: string | null;
  // Joined data
  content_title: string;
  content_image: string | null;
  expert_name: string;
  expert_id: string | null;
  sponsor_name: string | null;
  category: string | null;
}

interface UseVouchersReturn {
  vouchers: Voucher[];
  isLoading: boolean;
  error: Error | null;
  claimVoucher: (contentId: string) => Promise<{ success: boolean; voucher?: Voucher }>;
  hasVoucherForContent: (contentId: string) => boolean;
  getVoucherByContentId: (contentId: string) => Voucher | undefined;
  refetch: () => Promise<void>;
  stats: {
    active: number;
    used: number;
    expired: number;
    totalSavings: number;
  };
}

/**
 * Generate a unique voucher code in format WA-XXXX-XXXX
 */
const generateVoucherCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like O, 0, I, 1
  const generateSegment = (length: number) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  return `WA-${generateSegment(4)}-${generateSegment(4)}`;
};

export const useVouchers = (): UseVouchersReturn => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVouchers = useCallback(async () => {
    if (!user) {
      setVouchers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('vouchers')
        .select(`
          id,
          code,
          user_id,
          content_id,
          status,
          pickup_location,
          created_at,
          redeemed_at,
          expires_at,
          expert_contents (
            id,
            title,
            image_url,
            sponsor_name,
            category,
            creator_id,
            profiles:creator_id (
              first_name,
              last_name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform the data
      const transformedVouchers: Voucher[] = (data || []).map((v: any) => {
        const content = v.expert_contents;
        const creator = content?.profiles;
        
        // Check if voucher is expired
        let status = v.status as VoucherStatus;
        if (status === 'active' && v.expires_at && new Date(v.expires_at) < new Date()) {
          status = 'expired';
        }

        return {
          id: v.id,
          code: v.code,
          user_id: v.user_id,
          content_id: v.content_id,
          status,
          pickup_location: v.pickup_location,
          created_at: v.created_at,
          redeemed_at: v.redeemed_at,
          expires_at: v.expires_at,
          content_title: content?.title || 'Unknown Program',
          content_image: content?.image_url || null,
          expert_name: creator ? `${creator.first_name} ${creator.last_name}` : 'Unknown Expert',
          expert_id: content?.creator_id || null,
          sponsor_name: content?.sponsor_name || null,
          category: content?.category || null,
        };
      });

      setVouchers(transformedVouchers);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const claimVoucher = useCallback(async (contentId: string): Promise<{ success: boolean; voucher?: Voucher; error?: string }> => {
    if (!user) {
      toast.error(t('auth.login_required'));
      return { success: false, error: 'login_required' };
    }

    // Check if user already has a voucher for this content
    const existingVoucher = vouchers.find(v => v.content_id === contentId);
    if (existingVoucher) {
      toast.info(t('voucher.already_claimed') || 'Már csatlakoztál ehhez a programhoz!');
      return { success: false, error: 'already_claimed' };
    }

    try {
      // First, check if there's an active sponsorship
      const { data: sponsorship, error: sponsorError } = await supabase
        .from('content_sponsorships')
        .select('id, total_licenses, used_licenses, max_sponsored_seats, sponsored_seats_used, is_active')
        .eq('content_id', contentId)
        .eq('is_active', true)
        .maybeSingle();

      if (sponsorError) {
        console.error('[useVouchers] Error checking sponsorship:', sponsorError);
      }

      console.log('[useVouchers] Sponsorship found:', {
        contentId,
        sponsorship: sponsorship ? {
          id: sponsorship.id,
          maxSeats: sponsorship.max_sponsored_seats || sponsorship.total_licenses,
          usedSeats: sponsorship.sponsored_seats_used || sponsorship.used_licenses
        } : null
      });

      // Use atomic RPC function to check and reserve seat (prevents race conditions)
      if (sponsorship) {
        console.log('[useVouchers] Calling atomic RPC: check_and_reserve_sponsored_seat');
        
        const { data: rpcResult, error: rpcError } = await supabase
          .rpc('check_and_reserve_sponsored_seat', {
            p_sponsorship_id: sponsorship.id,
            p_user_id: user.id
          });

        if (rpcError) {
          console.error('[useVouchers] RPC error:', rpcError);
          // Fall back to manual check if RPC fails - check quota manually
          const maxSeats = sponsorship.max_sponsored_seats || sponsorship.total_licenses || 10;
          const usedSeats = sponsorship.sponsored_seats_used || sponsorship.used_licenses || 0;
          if (usedSeats >= maxSeats) {
            toast.error(t('voucher.quota_exhausted') || 'A támogatott helyek elfogytak');
            return { success: false, error: 'quota_exhausted' };
          }
        } else if (rpcResult && rpcResult.length > 0) {
          const result = rpcResult[0];
          console.log('[useVouchers] RPC result:', result);
          
          if (!result.success) {
            toast.error(t('voucher.quota_exhausted') || 'A támogatott helyek elfogytak');
            return { success: false, error: 'quota_exhausted' };
          }
          
          // Seat was atomically reserved, continue with voucher creation
          console.log('[useVouchers] Seat reserved atomically, remaining:', result.seats_remaining);
        }
      }

      // Generate voucher code and expiry
      const voucherCode = generateVoucherCode();
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year expiry

      // Create the voucher
      const { data, error: insertError } = await supabase
        .from('vouchers')
        .insert({
          code: voucherCode,
          user_id: user.id,
          content_id: contentId,
          status: 'active',
          expires_at: expiresAt.toISOString(),
        })
        .select(`
          id,
          code,
          user_id,
          content_id,
          status,
          pickup_location,
          created_at,
          redeemed_at,
          expires_at,
          expert_contents (
            id,
            title,
            image_url,
            sponsor_name,
            category,
            creator_id,
            profiles:creator_id (
              first_name,
              last_name
            )
          )
        `)
        .single();

      if (insertError) {
        // Handle unique constraint violation
        if (insertError.code === '23505') {
          toast.info(t('voucher.already_claimed') || 'Már csatlakoztál ehhez a programhoz!');
          return { success: false, error: 'already_claimed' };
        }
        throw insertError;
      }

      // Transform the new voucher
      const content = data.expert_contents as any;
      const creator = content?.profiles;
      
      const newVoucher: Voucher = {
        id: data.id,
        code: data.code,
        user_id: data.user_id,
        content_id: data.content_id,
        status: data.status as VoucherStatus,
        pickup_location: data.pickup_location,
        created_at: data.created_at,
        redeemed_at: data.redeemed_at,
        expires_at: data.expires_at,
        content_title: content?.title || 'Unknown Program',
        content_image: content?.image_url || null,
        expert_name: creator ? `${creator.first_name} ${creator.last_name}` : 'Unknown Expert',
        expert_id: content?.creator_id || null,
        sponsor_name: content?.sponsor_name || null,
        category: content?.category || null,
      };

      // Update local state
      setVouchers(prev => [newVoucher, ...prev]);

      toast.success(t('voucher.claimed_success') || 'Sikeresen csatlakoztál! 🎉', {
        description: `${t('voucher.code_label') || 'Kuponkód'}: ${voucherCode}`,
      });

      return { success: true, voucher: newVoucher };
    } catch (err) {
      console.error('Error claiming voucher:', err);
      toast.error(t('voucher.claim_error') || 'Hiba történt a csatlakozás során');
      return { success: false, error: 'unknown' };
    }
  }, [user, vouchers, t]);

  const hasVoucherForContent = useCallback((contentId: string): boolean => {
    return vouchers.some(v => v.content_id === contentId);
  }, [vouchers]);

  const getVoucherByContentId = useCallback((contentId: string): Voucher | undefined => {
    return vouchers.find(v => v.content_id === contentId);
  }, [vouchers]);

  // Calculate stats
  const stats = {
    active: vouchers.filter(v => v.status === 'active').length,
    used: vouchers.filter(v => v.status === 'used').length,
    expired: vouchers.filter(v => v.status === 'expired').length,
    totalSavings: vouchers.reduce((sum, v) => {
      // Assume average value of 5000 Ft per voucher for savings calculation
      if (v.status === 'used' || v.status === 'active') {
        return sum + 5000;
      }
      return sum;
    }, 0),
  };

  return {
    vouchers,
    isLoading,
    error,
    claimVoucher,
    hasVoucherForContent,
    getVoucherByContentId,
    refetch: fetchVouchers,
    stats,
  };
};

export default useVouchers;

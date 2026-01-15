import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export type VoucherStatus = 'active' | 'used' | 'expired';

export interface ExpertVoucher {
  id: string;
  code: string;
  user_id: string;
  content_id: string;
  status: VoucherStatus;
  created_at: string;
  redeemed_at: string | null;
  expires_at: string | null;
  // Joined data
  member_name: string;
  member_email: string;
  program_title: string;
  program_price: number;
}

interface VoucherStats {
  total: number;
  active: number;
  usedThisMonth: number;
  conversionRate: number;
}

interface UseExpertVouchersReturn {
  vouchers: ExpertVoucher[];
  isLoading: boolean;
  error: Error | null;
  stats: VoucherStats;
  redeemVoucher: (voucherId: string) => Promise<boolean>;
  redeemByCode: (code: string) => Promise<{ success: boolean; voucher?: ExpertVoucher; error?: string }>;
  refetch: () => Promise<void>;
}

export const useExpertVouchers = (): UseExpertVouchersReturn => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [vouchers, setVouchers] = useState<ExpertVoucher[]>([]);
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
      // First, get all content IDs created by this expert
      const { data: expertContents, error: contentsError } = await supabase
        .from('expert_contents')
        .select('id, title, price_huf')
        .eq('creator_id', user.id);

      if (contentsError) throw contentsError;

      if (!expertContents || expertContents.length === 0) {
        setVouchers([]);
        setIsLoading(false);
        return;
      }

      const contentIds = expertContents.map(c => c.id);
      const contentMap = new Map(expertContents.map(c => [c.id, { title: c.title, price: c.price_huf || 0 }]));

      // Fetch vouchers for these contents with user profiles
      const { data: vouchersData, error: vouchersError } = await supabase
        .from('vouchers')
        .select(`
          id,
          code,
          user_id,
          content_id,
          status,
          created_at,
          redeemed_at,
          expires_at,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .in('content_id', contentIds)
        .order('created_at', { ascending: false });

      if (vouchersError) throw vouchersError;

      // Transform the data
      const transformedVouchers: ExpertVoucher[] = (vouchersData || []).map((v: any) => {
        const profile = v.profiles;
        const content = contentMap.get(v.content_id);
        
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
          created_at: v.created_at,
          redeemed_at: v.redeemed_at,
          expires_at: v.expires_at,
          member_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown',
          member_email: profile?.email || '',
          program_title: content?.title || 'Unknown Program',
          program_price: content?.price || 0,
        };
      });

      setVouchers(transformedVouchers);
    } catch (err) {
      console.error('Error fetching expert vouchers:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // Redeem voucher by ID
  const redeemVoucher = useCallback(async (voucherId: string): Promise<boolean> => {
    if (!user) return false;

    const voucher = vouchers.find(v => v.id === voucherId);
    if (!voucher) {
      toast.error(t('expert_studio.voucher_not_found') || 'A kupon nem található!');
      return false;
    }

    if (voucher.status !== 'active') {
      toast.error(t('expert_studio.already_redeemed') || 'Ez a kupon már be lett váltva!');
      return false;
    }

    // Optimistic update
    setVouchers(prev => prev.map(v => 
      v.id === voucherId 
        ? { ...v, status: 'used' as VoucherStatus, redeemed_at: new Date().toISOString() }
        : v
    ));

    try {
      const { error: updateError } = await supabase
        .from('vouchers')
        .update({ 
          status: 'used',
          redeemed_at: new Date().toISOString(),
          redeemed_by: user.id
        })
        .eq('id', voucherId);

      if (updateError) throw updateError;

      toast.success(t('expert_studio.voucher_success') || 'Kupon sikeresen beváltva! 🎉');
      return true;
    } catch (err) {
      // Rollback on error
      setVouchers(prev => prev.map(v => 
        v.id === voucherId 
          ? { ...v, status: 'active' as VoucherStatus, redeemed_at: null }
          : v
      ));
      console.error('Error redeeming voucher:', err);
      toast.error(t('expert_studio.validation_error') || 'Beváltási hiba történt');
      return false;
    }
  }, [user, vouchers, t]);

  // Redeem voucher by code (for QR/manual entry)
  const redeemByCode = useCallback(async (code: string): Promise<{ success: boolean; voucher?: ExpertVoucher; error?: string }> => {
    if (!user) {
      return { success: false, error: t('auth.login_required') };
    }

    const normalizedCode = code.toUpperCase().trim();

    // Validate format
    if (!normalizedCode.match(/^WA-[A-Z0-9]{4}-[A-Z0-9]{4}$/)) {
      return { 
        success: false, 
        error: t('expert_studio.invalid_format') || 'Érvénytelen formátum! (WA-XXXX-XXXX)' 
      };
    }

    // Find voucher in local state first
    let voucher = vouchers.find(v => v.code === normalizedCode);

    // If not found locally, search in database (might be from another content)
    if (!voucher) {
      const { data: expertContents } = await supabase
        .from('expert_contents')
        .select('id')
        .eq('creator_id', user.id);

      if (!expertContents || expertContents.length === 0) {
        return { success: false, error: t('expert_studio.voucher_not_found') || 'A kupon nem található!' };
      }

      const contentIds = expertContents.map(c => c.id);

      const { data: voucherData, error: fetchError } = await supabase
        .from('vouchers')
        .select(`
          id,
          code,
          user_id,
          content_id,
          status,
          created_at,
          redeemed_at,
          expires_at,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('code', normalizedCode)
        .in('content_id', contentIds)
        .maybeSingle();

      if (fetchError || !voucherData) {
        return { success: false, error: t('expert_studio.voucher_not_found') || 'A kupon nem található!' };
      }

      // Get content details
      const { data: content } = await supabase
        .from('expert_contents')
        .select('title, price_huf')
        .eq('id', voucherData.content_id)
        .single();

      const profile = voucherData.profiles as any;
      voucher = {
        id: voucherData.id,
        code: voucherData.code,
        user_id: voucherData.user_id,
        content_id: voucherData.content_id,
        status: voucherData.status as VoucherStatus,
        created_at: voucherData.created_at,
        redeemed_at: voucherData.redeemed_at,
        expires_at: voucherData.expires_at,
        member_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown',
        member_email: profile?.email || '',
        program_title: content?.title || 'Unknown Program',
        program_price: content?.price_huf || 0,
      };
    }

    if (voucher.status === 'used') {
      return { success: false, error: t('expert_studio.already_redeemed') || 'Ez a kupon már be lett váltva!' };
    }

    if (voucher.status === 'expired') {
      return { success: false, error: t('expert_studio.voucher_expired') || 'Ez a kupon lejárt!' };
    }

    // Perform redemption
    const success = await redeemVoucher(voucher.id);
    
    if (success) {
      return { success: true, voucher: { ...voucher, status: 'used', redeemed_at: new Date().toISOString() } };
    }
    
    return { success: false, error: t('expert_studio.validation_error') || 'Beváltási hiba történt' };
  }, [user, vouchers, redeemVoucher, t]);

  // Calculate stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const stats: VoucherStats = {
    total: vouchers.length,
    active: vouchers.filter(v => v.status === 'active').length,
    usedThisMonth: vouchers.filter(v => 
      v.status === 'used' && 
      v.redeemed_at && 
      new Date(v.redeemed_at) >= startOfMonth
    ).length,
    conversionRate: vouchers.length > 0 
      ? Math.round((vouchers.filter(v => v.status === 'used').length / vouchers.length) * 100)
      : 0,
  };

  return {
    vouchers,
    isLoading,
    error,
    stats,
    redeemVoucher,
    redeemByCode,
    refetch: fetchVouchers,
  };
};

export default useExpertVouchers;

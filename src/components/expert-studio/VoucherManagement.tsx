import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Ticket, 
  CheckCircle, 
  Users, 
  TrendingUp,
  Clock,
  Search
} from "lucide-react";
import { useExpertVouchers, ExpertVoucher } from "@/hooks/useExpertVouchers";
import { format } from "date-fns";
import { hu, enUS, de } from "date-fns/locale";

const VoucherManagement = () => {
  const { t, language } = useLanguage();
  const { vouchers, isLoading, stats, redeemVoucher } = useExpertVouchers();
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const getDateLocale = () => {
    switch (language) {
      case 'hu': return hu;
      case 'de': return de;
      default: return enUS;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy. MMM d.', { locale: getDateLocale() });
  };

  const handleRedeem = async (voucher: ExpertVoucher) => {
    setRedeemingId(voucher.id);
    await redeemVoucher(voucher.id);
    setRedeemingId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
            {t('voucher.status_active') || 'Aktív'}
          </Badge>
        );
      case 'used':
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100">
            {t('voucher.status_used') || 'Beváltott'}
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
            {t('voucher.status_expired') || 'Lejárt'}
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-black">
            <Ticket className="w-5 h-5 text-black/60" />
            {t('expert_studio.voucher_list') || 'Jelentkezések'}
          </CardTitle>
          <Badge variant="outline" className="border-black/10 text-black/60">
            {vouchers.length} {t('expert_studio.total_claims') || 'jelentkező'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* KPI Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-black/[0.02] border border-black/5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-black/40" />
              <span className="text-xs text-black/50">{t('expert_studio.total_applicants') || 'Összes jelentkező'}</span>
            </div>
            <p className="text-2xl font-bold text-black">{stats.total}</p>
          </div>
          
          <div className="p-4 rounded-xl bg-green-50 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700">{t('expert_studio.pending_redemption') || 'Beváltásra vár'}</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{stats.active}</p>
          </div>
          
          <div className="p-4 rounded-xl bg-black/[0.02] border border-black/5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-black/40" />
              <span className="text-xs text-black/50">{t('expert_studio.redeemed_this_month') || 'E havi beváltások'}</span>
            </div>
            <p className="text-2xl font-bold text-black">{stats.usedThisMonth}</p>
          </div>
          
          <div className="p-4 rounded-xl bg-black/[0.02] border border-black/5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-black/40" />
              <span className="text-xs text-black/50">{t('expert_studio.conversion') || 'Konverzió'}</span>
            </div>
            <p className="text-2xl font-bold text-black">{stats.conversionRate}%</p>
          </div>
        </div>

        {/* Voucher List */}
        {vouchers.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto text-black/20 mb-4" />
            <p className="text-black/50 mb-2">
              {t('expert_studio.no_claims_yet') || 'Még nincs jelentkező'}
            </p>
            <p className="text-sm text-black/40">
              {t('expert_studio.claims_will_appear') || 'A jelentkezések itt fognak megjelenni'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {vouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white border border-black/5 hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium text-black truncate">
                        {voucher.member_name || voucher.member_email.split('@')[0]}
                      </p>
                      {getStatusBadge(voucher.status)}
                    </div>
                    <p className="text-sm text-black/50 truncate mb-1">
                      {voucher.program_title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-black/40">
                      <Badge variant="outline" className="font-mono text-xs border-black/10">
                        {voucher.code}
                      </Badge>
                      <span>{formatDate(voucher.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-4">
                    {voucher.status === 'active' && (
                      <Button
                        size="sm"
                        onClick={() => handleRedeem(voucher)}
                        disabled={redeemingId === voucher.id}
                        className="bg-black hover:bg-black/90 text-white"
                      >
                        {redeemingId === voucher.id ? (
                          <span className="animate-spin mr-2">⏳</span>
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        {t('expert_studio.redeem_btn') || 'Beváltás'}
                      </Button>
                    )}
                    {voucher.status === 'used' && voucher.redeemed_at && (
                      <span className="text-xs text-black/40">
                        {t('expert_studio.redeemed_on') || 'Beváltva'}: {formatDate(voucher.redeemed_at)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default VoucherManagement;

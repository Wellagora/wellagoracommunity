import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, BarChart3, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ExpertStudioSkeleton } from "@/components/ui/loading-skeleton";

// Expert Studio Components
import QuickActionBar from "@/components/expert-studio/QuickActionBar";
import VoucherValidator from "@/components/expert-studio/VoucherValidator";
import VoucherManagement from "@/components/expert-studio/VoucherManagement";
import BalanceCard from "@/components/expert-studio/BalanceCard";
import MyProgramsList from "@/components/expert-studio/MyProgramsList";
import MediaLibrary from "@/components/expert-studio/MediaLibrary";
import ExpertImpactReport from "@/components/expert-studio/ExpertImpactReport";
import ExpertDashboardStats from "@/components/expert-studio/ExpertDashboardStats";
import { useExpertMedia, ExpertMedia } from "@/hooks/useExpertMedia";

const ExpertStudio = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({
    monthlyEarnings: 0,
    totalEarnings: 0,
    pendingAmount: 0,
  });

  // Media library hook
  const { 
    media, 
    loading: mediaLoading, 
    uploading, 
    analyzing,
    uploadMedia, 
    analyzeMedia,
    linkMediaToProgram,
    deleteMedia,
    dismissSuggestion
  } = useExpertMedia();

  useEffect(() => {
    if (user) {
      loadStudioData();
    }
  }, [user]);

  const loadStudioData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load expert contents to calculate earnings
      const { data: contentData } = await supabase
        .from("expert_contents")
        .select("id, used_licenses, price_huf")
        .eq("creator_id", user.id);

      // Calculate total earnings from voucher redemptions
      const totalReach = contentData?.reduce((sum, c) => sum + (c.used_licenses || 0), 0) || 0;
      const totalEarnings = totalReach * 500; // Average 500 Ft per redemption
      
      // Fetch real voucher stats
      const contentIds = contentData?.map(c => c.id) || [];
      
      if (contentIds.length > 0) {
        const { data: vouchersData } = await supabase
          .from('vouchers')
          .select('status, redeemed_at, content_id')
          .in('content_id', contentIds);
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const usedVouchers = vouchersData?.filter(v => v.status === 'used') || [];
        const thisMonthRedemptions = usedVouchers.filter(v => 
          v.redeemed_at && new Date(v.redeemed_at) >= startOfMonth
        );
        
        // Calculate earnings (85% of average 5000 Ft per voucher)
        const avgValue = 5000;
        const monthlyEarnings = thisMonthRedemptions.length * Math.round(avgValue * 0.85);
        const calculatedTotalEarnings = usedVouchers.length * Math.round(avgValue * 0.85);
        
        setBalance(calculatedTotalEarnings);
        setStats({
          monthlyEarnings,
          totalEarnings: calculatedTotalEarnings,
          pendingAmount: (vouchersData?.filter(v => v.status === 'active').length || 0) * Math.round(avgValue * 0.85),
        });
      } else {
        setBalance(0);
        setStats({
          monthlyEarnings: 0,
          totalEarnings: 0,
          pendingAmount: 0,
        });
      }
    } catch (error) {
      console.error("Error loading studio data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoCapture = async (file: File) => {
    await uploadMedia(file, 'video');
  };

  const handlePhotoCapture = async (file: File) => {
    await uploadMedia(file, 'image');
  };

  const handleConvertToProgram = (mediaItem: ExpertMedia) => {
    // Navigate to wizard with media data as URL params
    const params = new URLSearchParams({
      mediaId: mediaItem.id,
      mediaUrl: mediaItem.file_url,
      mediaType: mediaItem.file_type,
    });
    navigate(`/szakertoi-studio/uj?${params.toString()}`);
  };

  const handleBalanceUpdate = (newBalance: number) => {
    setBalance(newBalance);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ExpertStudioSkeleton />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout
      title={t("expert_studio.title")}
      subtitle={t("expert_studio.subtitle")}
      icon={Sparkles}
      iconColor="text-black"
      backUrl="/"
    >
      {/* Tabs for Studio vs Impact Report */}
      <Tabs defaultValue="studio" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="studio" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Műhely
          </TabsTrigger>
          <TabsTrigger value="impact" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Hatásjelentés
          </TabsTrigger>
        </TabsList>

        {/* Studio Tab */}
        <TabsContent value="studio" className="space-y-6">
          {/* Dashboard Stats - Programs, Bookings, Earnings */}
          <ExpertDashboardStats userId={user.id} />

          {/* Quick Action Bar - Mobile First */}
          <QuickActionBar 
            onVideoCapture={handleVideoCapture}
            onPhotoCapture={handlePhotoCapture}
            uploading={uploading}
          />

          {/* Media Library - New Section */}
          <MediaLibrary
            media={media}
            loading={mediaLoading}
            analyzing={analyzing}
            onDelete={deleteMedia}
            onConvertToProgram={handleConvertToProgram}
            onAddToProgram={(mediaItem, programId) => linkMediaToProgram(mediaItem.id, programId)}
            onDismissSuggestion={dismissSuggestion}
            onAnalyze={analyzeMedia}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Voucher Validator - The Business Heart */}
            <DashboardCard>
              <VoucherValidator 
                userId={user.id}
                onBalanceUpdate={handleBalanceUpdate}
                balance={balance}
              />
            </DashboardCard>

            {/* Balance & Earnings Card */}
            <DashboardCard delay={0.1}>
              <BalanceCard 
                balance={balance}
                monthlyEarnings={stats.monthlyEarnings}
                totalEarnings={stats.totalEarnings}
                pendingAmount={stats.pendingAmount}
              />
            </DashboardCard>
          </div>

          {/* Voucher Management - Full Width */}
          <DashboardCard delay={0.15} className="mb-6">
            <VoucherManagement />
          </DashboardCard>

          {/* My Programs List */}
          <DashboardCard delay={0.2}>
            <MyProgramsList userId={user.id} />
          </DashboardCard>
        </TabsContent>

        {/* Impact Report Tab */}
        <TabsContent value="impact">
          <DashboardCard>
            <ExpertImpactReport userId={user.id} />
          </DashboardCard>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ExpertStudio;

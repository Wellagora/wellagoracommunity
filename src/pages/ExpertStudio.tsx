import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Expert Studio Components
import QuickActionBar from "@/components/expert-studio/QuickActionBar";
import VoucherValidator from "@/components/expert-studio/VoucherValidator";
import BalanceCard from "@/components/expert-studio/BalanceCard";
import MyProgramsList from "@/components/expert-studio/MyProgramsList";

const ExpertStudio = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({
    monthlyEarnings: 0,
    totalEarnings: 0,
    pendingAmount: 0,
  });

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
      
      // Mock data for demo - in production, fetch from transactions table
      setBalance(12500);
      setStats({
        monthlyEarnings: 8500,
        totalEarnings: totalEarnings || 25000,
        pendingAmount: 3000,
      });
    } catch (error) {
      console.error("Error loading studio data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoCapture = async (file: File) => {
    // In production, upload to Supabase Storage
    console.log("Video captured:", file.name);
    toast.success(t("expert_studio.video_ready"));
    // Navigate to program creator with the video
  };

  const handlePhotoCapture = async (file: File) => {
    // In production, upload to Supabase Storage
    console.log("Photo captured:", file.name);
    toast.success(t("expert_studio.photo_ready"));
    // Navigate to program creator with the photo
  };

  const handleBalanceUpdate = (newBalance: number) => {
    setBalance(newBalance);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Skeleton className="h-80 w-full rounded-2xl" />
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Creative Workspace Style */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t("expert_studio.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("expert_studio.subtitle")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Action Bar - Mobile First */}
        <QuickActionBar 
          onVideoCapture={handleVideoCapture}
          onPhotoCapture={handlePhotoCapture}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Voucher Validator - The Business Heart */}
          <VoucherValidator 
            userId={user.id}
            onBalanceUpdate={handleBalanceUpdate}
            balance={balance}
          />

          {/* Balance & Earnings Card */}
          <BalanceCard 
            balance={balance}
            monthlyEarnings={stats.monthlyEarnings}
            totalEarnings={stats.totalEarnings}
            pendingAmount={stats.pendingAmount}
          />
        </div>

        {/* My Programs List */}
        <MyProgramsList userId={user.id} />
      </div>
    </div>
  );
};

export default ExpertStudio;

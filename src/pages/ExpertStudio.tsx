import { useState, useEffect, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Sparkles,
  BookOpen,
  Users,
  Ticket,
  Wallet,
  QrCode,
  Check,
  X,
  Camera,
  Plus,
  BarChart3,
  Clock,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ContentItem {
  id: string;
  title: string;
  is_published: boolean;
  used_licenses: number;
  total_licenses: number;
  created_at: string;
}

interface Redemption {
  id: string;
  code: string;
  content_title: string;
  redeemed_at: string;
  user_name: string;
}

const ExpertStudio = () => {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [stats, setStats] = useState({
    publishedContents: 0,
    totalReach: 0,
    redeemedVouchers: 0,
    monthlyRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [voucherCode, setVoucherCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (user) {
      loadStudioData();
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, []);

  const loadStudioData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data: contentData } = await supabase
        .from('expert_contents')
        .select('id, title, is_published, used_licenses, total_licenses, created_at')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      setContents(contentData || []);

      const published = contentData?.filter(c => c.is_published).length || 0;
      const totalReach = contentData?.reduce((sum, c) => sum + (c.used_licenses || 0), 0) || 0;

      setStats({
        publishedContents: published,
        totalReach,
        redeemedVouchers: totalReach,
        monthlyRevenue: totalReach * 500
      });

      setRedemptions([]);
    } catch (error) {
      console.error('Error loading studio data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error(t("expert_studio.enter_code"));
      return;
    }

    setIsValidating(true);
    try {
      const normalizedCode = voucherCode.toUpperCase().trim();
      
      if (normalizedCode.startsWith('WA-')) {
        toast.success(`${t("expert_studio.voucher_success")}: ${normalizedCode}`);
        setVoucherCode("");
        loadStudioData();
      } else {
        toast.error(t("expert_studio.invalid_format"));
      }
    } catch (error) {
      toast.error(t("expert_studio.validation_error"));
    } finally {
      setIsValidating(false);
    }
  };

  const startQRScanner = async () => {
    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      
      setScannerActive(true);
      
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText: string) => {
          setVoucherCode(decodedText);
          scanner.clear();
          setScannerActive(false);
          toast.success(t("expert_studio.qr_scanned"));
        },
        (errorMessage: string) => {
          // Ignore scanning errors
        }
      );

      scannerRef.current = scanner;
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      toast.error(t("expert_studio.camera_error"));
      setScannerActive(false);
    }
  };

  const stopQRScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScannerActive(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl" />
            ))}
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
                {t('expert_studio.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('expert_studio.subtitle')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 3D Action Cards - Creative Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Action Card 1: Új Műhelytitok */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/szakertoi-studio/uj">
              <Card className="group bg-gradient-to-br from-primary/10 via-primary/5 to-emerald-500/10 border-primary/20 hover:border-primary/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Plus className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {t('expert_studio.new_secret')}
                      </h3>
                      <p className="text-muted-foreground">
                        {t('expert_studio.new_secret_desc')}
                      </p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Action Card 2: Voucher Beváltása */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 border-amber-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Ticket className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-1">
                      {t('expert_studio.voucher_validator')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('expert_studio.validator_desc')}
                    </p>
                  </div>
                </div>

                {/* Large Centered Input for Mobile-First */}
                <div className="space-y-4">
                  {scannerActive ? (
                    <div className="space-y-4">
                      <div id="qr-reader" className="rounded-xl overflow-hidden" />
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={stopQRScanner}
                      >
                        <X className="w-4 h-4 mr-2" />
                        {t('common.stop')}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-3">
                        <Input
                          placeholder="WA-2026-XXXX"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                          className="flex-1 h-14 text-xl text-center font-mono bg-white/80 border-amber-500/30 focus:border-amber-500 placeholder:text-muted-foreground/50"
                          onKeyPress={(e) => e.key === 'Enter' && handleValidateVoucher()}
                        />
                        <Button 
                          onClick={handleValidateVoucher}
                          disabled={isValidating || !voucherCode.trim()}
                          className="h-14 w-14 bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg"
                        >
                          {isValidating ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            <Check className="w-6 h-6" />
                          )}
                        </Button>
                      </div>
                      <Button 
                        variant="outline"
                        className="w-full h-12 border-amber-500/30 hover:bg-amber-500/10"
                        onClick={startQRScanner}
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        {t('expert_studio.scan_qr')}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* KPI Stats Row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.publishedContents}</p>
                  <p className="text-xs text-muted-foreground">{t('expert_studio.workshop_secrets')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalReach}</p>
                  <p className="text-xs text-muted-foreground">{t('expert_studio.users')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10">
                  <Ticket className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.redeemedVouchers}</p>
                  <p className="text-xs text-muted-foreground">{t('expert_studio.total')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/10">
                  <Wallet className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.monthlyRevenue.toLocaleString()} Ft</p>
                  <p className="text-xs text-muted-foreground">{t('expert_studio.honorarium')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="contents" className="space-y-6">
            <TabsList className="bg-white/80 backdrop-blur-md border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] grid w-full grid-cols-4 lg:w-auto lg:inline-grid p-1 rounded-xl">
              <TabsTrigger value="contents" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">{t('expert_studio.my_secrets')}</span>
              </TabsTrigger>
              <TabsTrigger value="redemptions" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">{t('expert_studio.today_redemptions')}</span>
              </TabsTrigger>
              <TabsTrigger value="revenue" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-green-500 data-[state=active]:text-white">
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">{t('expert_studio.honorarium')}</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">{t('expert_studio.statistics')}</span>
              </TabsTrigger>
            </TabsList>

            {/* Műhelytitkaim Tab */}
            <TabsContent value="contents">
              <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    {t('expert_studio.my_secrets')}
                  </CardTitle>
                  <CardDescription>
                    {t('expert_studio.my_secrets_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : contents.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('common.title')}</TableHead>
                          <TableHead>{t('common.status')}</TableHead>
                          <TableHead>{t('expert_studio.licenses')}</TableHead>
                          <TableHead>{t('common.created_at')}</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contents.map((content) => (
                          <TableRow key={content.id}>
                            <TableCell className="font-medium">{content.title}</TableCell>
                            <TableCell>
                              <Badge variant={content.is_published ? "default" : "secondary"}>
                                {content.is_published ? t('common.published') : t('common.draft')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {content.used_licenses || 0} / {content.total_licenses || 0}
                            </TableCell>
                            <TableCell>
                              {new Date(content.created_at).toLocaleDateString('hu-HU')}
                            </TableCell>
                            <TableCell>
                              <Link to={`/szakertoi-studio/${content.id}/szerkesztes`}>
                                <Button variant="ghost" size="sm">
                                  {t('common.edit')}
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-150" />
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-primary" />
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {t('expert_studio.no_content')}
                      </p>
                      <Link to="/szakertoi-studio/uj">
                        <Button className="bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 shadow-lg">
                          <Plus className="w-4 h-4 mr-2" />
                          {t('expert_studio.create_first')}
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Today's Redemptions Tab */}
            <TabsContent value="redemptions">
              <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    {t('expert_studio.today_redemptions')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {redemptions.length > 0 ? (
                    <div className="space-y-3">
                      {redemptions.map((redemption) => (
                        <div 
                          key={redemption.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-muted/30"
                        >
                          <div>
                            <p className="font-medium">{redemption.content_title}</p>
                            <p className="text-sm text-muted-foreground">
                              {redemption.user_name} • {redemption.code}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {new Date(redemption.redeemed_at).toLocaleTimeString('hu-HU', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {t('expert_studio.no_redemptions_today')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tiszteletdíj Tab */}
            <TabsContent value="revenue">
              <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-green-500" />
                    {t('expert_studio.honorarium')}
                  </CardTitle>
                  <CardDescription>
                    {t('expert_studio.payout_settings_hint')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl scale-150" />
                      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                        <Wallet className="w-12 h-12 text-green-500" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-foreground mb-2">
                      {stats.monthlyRevenue.toLocaleString()} Ft
                    </p>
                    <p className="text-muted-foreground mb-6">
                      {t('expert_studio.current_balance')}
                    </p>
                    <Link to="/profile">
                      <Button variant="outline">
                        {t('expert_studio.setup_payout')}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats">
              <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    {t('expert_studio.statistics')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {t('expert_studio.stats_coming_soon')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ExpertStudio;
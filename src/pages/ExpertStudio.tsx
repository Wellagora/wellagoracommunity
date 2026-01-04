import { useState, useEffect, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KPICard } from "@/components/dashboard/KPICard";
import { 
  Sparkles,
  BookOpen,
  Users,
  Ticket,
  Wallet,
  QrCode,
  Search,
  Check,
  X,
  Camera,
  Plus,
  BarChart3,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    // Cleanup scanner on unmount
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
      // Fetch expert's contents
      const { data: contentData } = await supabase
        .from('expert_contents')
        .select('id, title, is_published, used_licenses, total_licenses, created_at')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      setContents(contentData || []);

      // Calculate stats
      const published = contentData?.filter(c => c.is_published).length || 0;
      const totalReach = contentData?.reduce((sum, c) => sum + (c.used_licenses || 0), 0) || 0;

      setStats({
        publishedContents: published,
        totalReach,
        redeemedVouchers: totalReach,
        monthlyRevenue: totalReach * 500 // Mock calculation
      });

      // Fetch today's redemptions (mock data for now)
      setRedemptions([]);
    } catch (error) {
      console.error('Error loading studio data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error("Kérlek add meg a kupon kódot");
      return;
    }

    setIsValidating(true);
    try {
      // Normalize code to uppercase
      const normalizedCode = voucherCode.toUpperCase().trim();
      
      // TODO: Implement actual voucher validation
      // For now, just show success for demo
      if (normalizedCode.startsWith('WA-')) {
        toast.success(`Kupon sikeresen beváltva: ${normalizedCode}`);
        setVoucherCode("");
        // Refresh redemptions
        loadStudioData();
      } else {
        toast.error("Érvénytelen kupon formátum. Helyes: WA-2026-XXXX");
      }
    } catch (error) {
      toast.error("Hiba a kupon validálása során");
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
          toast.success("QR kód beolvasva!");
        },
        (errorMessage: string) => {
          // Ignore scanning errors
        }
      );

      scannerRef.current = scanner;
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      toast.error("Nem sikerült elindítani a kamerát");
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
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
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
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10">
              <Sparkles className="w-8 h-8 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Szakértői Stúdió
              </h1>
              <p className="text-muted-foreground">
                Kezeld a tartalmaidat és kuponjaidat
              </p>
            </div>
          </div>
          <Link to="/muhelytitok/uj">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Új Műhelytitok
            </Button>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Publikált tartalmak"
            value={stats.publishedContents}
            icon={BookOpen}
            subtitle="Műhelytitkok"
            iconColor="text-cyan-500"
          />
          <KPICard
            title="Összes elérés"
            value={stats.totalReach}
            icon={Users}
            subtitle="Felhasználók"
            iconColor="text-primary"
          />
          <KPICard
            title="Beváltott kuponok"
            value={stats.redeemedVouchers}
            icon={Ticket}
            subtitle="Összesen"
            iconColor="text-amber-500"
          />
          <KPICard
            title="Havi bevétel"
            value={`${stats.monthlyRevenue.toLocaleString()} Ft`}
            icon={Wallet}
            subtitle="Tiszteletdíj"
            iconColor="text-green-500"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="contents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="contents" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Műhelytitkaim
            </TabsTrigger>
            <TabsTrigger value="validator" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Kupon Validátor
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Tiszteletdíj
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Statisztikák
            </TabsTrigger>
          </TabsList>

          {/* Műhelytitkaim Tab */}
          <TabsContent value="contents">
            <Card>
              <CardHeader>
                <CardTitle>Műhelytitkaim</CardTitle>
                <CardDescription>
                  A te által készített tartalmak listája
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
                        <TableHead>Cím</TableHead>
                        <TableHead>Státusz</TableHead>
                        <TableHead>Licencek</TableHead>
                        <TableHead>Létrehozva</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contents.map((content) => (
                        <TableRow key={content.id}>
                          <TableCell className="font-medium">{content.title}</TableCell>
                          <TableCell>
                            <Badge variant={content.is_published ? "default" : "secondary"}>
                              {content.is_published ? "Publikált" : "Vázlat"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {content.used_licenses || 0} / {content.total_licenses || 0}
                          </TableCell>
                          <TableCell>
                            {new Date(content.created_at).toLocaleDateString('hu-HU')}
                          </TableCell>
                          <TableCell>
                            <Link to={`/muhelytitok/${content.id}/szerkesztes`}>
                              <Button variant="ghost" size="sm">
                                Szerkesztés
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Még nincs tartalmad
                    </p>
                    <Link to="/muhelytitok/uj">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Első Műhelytitok létrehozása
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kupon Validátor Tab */}
          <TabsContent value="validator">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* QR Scanner & Manual Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-cyan-500" />
                    Kupon Validátor
                  </CardTitle>
                  <CardDescription>
                    Olvasd be a QR kódot vagy add meg a kupon kódot manuálisan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* QR Scanner */}
                  <div className="space-y-4">
                    {scannerActive ? (
                      <div className="space-y-4">
                        <div id="qr-reader" className="rounded-lg overflow-hidden" />
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={stopQRScanner}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Leállítás
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                        onClick={startQRScanner}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        QR Kód Beolvasása
                      </Button>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        vagy
                      </span>
                    </div>
                  </div>

                  {/* Manual Input */}
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="WA-2026-XXXX"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        className="flex-1 font-mono"
                      />
                      <Button 
                        onClick={handleValidateVoucher}
                        disabled={isValidating || !voucherCode.trim()}
                      >
                        {isValidating ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Formátum: WA-ÉÉÉÉ-XXXX (pl. WA-2026-AB12)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Redemptions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Mai beváltások
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {redemptions.length > 0 ? (
                    <div className="space-y-3">
                      {redemptions.map((redemption) => (
                        <div 
                          key={redemption.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
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
                    <div className="text-center py-8">
                      <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Ma még nem volt beváltás
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tiszteletdíj Tab */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-green-500" />
                  Tiszteletdíj
                </CardTitle>
                <CardDescription>
                  A kifizetési beállításokat a Profilban módosíthatod
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-2xl font-bold text-foreground mb-2">
                    {stats.monthlyRevenue.toLocaleString()} Ft
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Kiutalásra váró összeg
                  </p>
                  <Link to="/profil">
                    <Button variant="outline">
                      Kifizetési beállítások
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statisztikák Tab */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Statisztikák
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Részletes statisztikák hamarosan
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ExpertStudio;

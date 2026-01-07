import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_VOUCHERS, MOCK_PROGRAMS, getMockExpertById } from "@/data/mockData";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Ticket,
  Calendar,
  History,
  QrCode,
  Bell,
  MapPin,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";
import { motion } from "framer-motion";

interface Voucher {
  id: string;
  code: string;
  content_id: string;
  content_title: string;
  status: 'active' | 'redeemed';
  pickup_location: string;
  created_at: string;
  expert_name?: string;
  expert_avatar?: string;
  program_image?: string;
}

interface Registration {
  id: string;
  program_title: string;
  program_image?: string;
  event_date?: string;
  location?: string;
  expert_name?: string;
}

interface PastParticipation {
  id: string;
  program_title: string;
  completed_at: string;
  voucher_code?: string;
}

const MyHubPage = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { t, language } = useLanguage();
  const [loadingData, setLoadingData] = useState(true);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [pastParticipations, setPastParticipations] = useState<PastParticipation[]>([]);
  const [activeTab, setActiveTab] = useState("vouchers");

  const dateLocale = language === "hu" ? hu : language === "de" ? de : enUS;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile?.user_role && ["business", "government", "ngo"].includes(profile.user_role)) {
      const savedViewMode = localStorage.getItem("wellagora_view_mode");
      if (savedViewMode !== "citizen") {
        navigate("/organization");
      }
    }
  }, [profile?.user_role, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoadingData(true);

      try {
        // Fetch vouchers
        const { data: userVouchers } = await supabase
          .from("content_access")
          .select(`
            id, 
            content_id, 
            created_at, 
            access_type,
            expert_contents(
              id,
              title,
              thumbnail_url,
              creator:profiles!expert_contents_creator_id_fkey(first_name, last_name, avatar_url)
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (userVouchers && userVouchers.length > 0) {
          setVouchers(userVouchers.map((v: any) => ({
            id: v.id,
            code: `WA-${new Date(v.created_at).getFullYear()}-${v.id.slice(0, 4).toUpperCase()}`,
            content_id: v.content_id,
            content_title: v.expert_contents?.title || 'Program',
            status: v.access_type === 'redeemed' ? 'redeemed' : 'active',
            pickup_location: 'A Mesternél',
            created_at: v.created_at,
            expert_name: v.expert_contents?.creator 
              ? `${v.expert_contents.creator.first_name} ${v.expert_contents.creator.last_name}`
              : undefined,
            expert_avatar: v.expert_contents?.creator?.avatar_url,
            program_image: v.expert_contents?.thumbnail_url
          })));
        } else {
          // Use mock vouchers with enhanced data
          const mockVouchersWithData = MOCK_VOUCHERS.map(v => {
            const program = MOCK_PROGRAMS.find(p => p.id === v.content_id);
            const expert = program ? getMockExpertById(program.creator_id) : undefined;
            return {
              id: v.id,
              code: v.code,
              content_id: v.content_id,
              content_title: v.content_title,
              status: v.status,
              pickup_location: v.pickup_location,
              created_at: v.created_at,
              expert_name: expert ? `${expert.first_name} ${expert.last_name}` : undefined,
              expert_avatar: expert?.avatar_url,
              program_image: program?.thumbnail_url
            };
          });
          setVouchers(mockVouchersWithData);
        }

        // Mock registrations for demo
        setRegistrations([
          {
            id: 'reg-1',
            program_title: 'Kemenceépítés Workshop',
            program_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
            event_date: '2026-01-15T10:00:00Z',
            location: 'Köveskál',
            expert_name: 'Hans Schmidt'
          }
        ]);

        // Mock past participations
        setPastParticipations([
          {
            id: 'past-1',
            program_title: 'Gyógynövénygyűjtés túra',
            completed_at: '2025-12-20T14:00:00Z',
            voucher_code: 'WA-2025-X7KP'
          }
        ]);

      } catch (error) {
        console.error('Error fetching hub data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (user && !loading) {
      fetchData();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-foreground">{t("common.loading")}</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const firstName = profile?.first_name || "User";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />

      <main className="max-w-5xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B]">
            {t("my_hub.title") || "Saját Központ"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("my_hub.subtitle") || "Kuponjaid, regisztrációid és előzményeid"}
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/80 backdrop-blur-sm border border-white/40">
            <TabsTrigger value="vouchers" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">{t("my_hub.active_programs") || "Aktív Programjaim"}</span>
              <span className="sm:hidden">{t("my_hub.vouchers_short") || "Kuponok"}</span>
            </TabsTrigger>
            <TabsTrigger value="registrations" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">{t("my_hub.registrations") || "Regisztrációim"}</span>
              <span className="sm:hidden">{t("my_hub.upcoming") || "Várható"}</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">{t("my_hub.past") || "Múltbéli részvételek"}</span>
              <span className="sm:hidden">{t("my_hub.history_short") || "Előzmény"}</span>
            </TabsTrigger>
          </TabsList>

          {/* Active Vouchers Tab */}
          <TabsContent value="vouchers">
            {loadingData ? (
              <div className="grid gap-4">
                {[1, 2].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
              </div>
            ) : vouchers.filter(v => v.status === 'active').length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-md border-white/40">
                <CardContent className="py-12 text-center">
                  <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t("my_hub.no_vouchers") || "Még nincs aktív kuponod"}</h3>
                  <p className="text-muted-foreground mb-4">{t("my_hub.no_vouchers_hint") || "Fedezd fel a Piacteret!"}</p>
                  <Button onClick={() => navigate("/piacer")}>{t("my_hub.explore") || "Piactér felfedezése"}</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {vouchers.filter(v => v.status === 'active').map((voucher, index) => (
                  <motion.div
                    key={voucher.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white/95 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Program Image */}
                          {voucher.program_image && (
                            <div className="sm:w-32 h-32 sm:h-auto bg-gradient-to-br from-primary/10 to-accent/10 flex-shrink-0">
                              <img 
                                src={voucher.program_image} 
                                alt={voucher.content_title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Content */}
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <Badge className="bg-primary/20 text-primary border-primary/30 mb-2">
                                  <Ticket className="w-3 h-3 mr-1" />
                                  {t("voucher.active") || "Aktív"}
                                </Badge>
                                <h3 className="font-bold text-[#1E293B] text-lg">{voucher.content_title}</h3>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Button variant="outline" size="sm" className="flex items-center gap-1">
                                  <QrCode className="w-4 h-4" />
                                  QR
                                </Button>
                              </div>
                            </div>

                            {/* Expert Info */}
                            {voucher.expert_name && (
                              <div className="flex items-center gap-2 mb-3">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={voucher.expert_avatar} />
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {voucher.expert_name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">{voucher.expert_name}</span>
                              </div>
                            )}

                            {/* Code & Location */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <span className="font-mono font-bold text-primary">{voucher.code}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {voucher.pickup_location}
                              </div>
                            </div>

                            {/* Reminder Button */}
                            <div className="mt-4 flex gap-2">
                              <Button 
                                variant="secondary" 
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <Bell className="w-3 h-3" />
                                {t("my_hub.add_reminder") || "Naptárba teszem"}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => navigate(`/piacer/${voucher.content_id}`)}
                              >
                                {t("common.view") || "Megnézem"}
                                <ChevronRight className="w-3 h-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Registrations Tab */}
          <TabsContent value="registrations">
            {loadingData ? (
              <div className="grid gap-4">
                {[1].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
              </div>
            ) : registrations.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-md border-white/40">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t("my_hub.no_registrations") || "Nincs regisztrációd"}</h3>
                  <p className="text-muted-foreground mb-4">{t("my_hub.no_registrations_hint") || "Iratkozz fel eseményekre!"}</p>
                  <Button onClick={() => navigate("/esemenyek")}>{t("my_hub.browse_events") || "Események böngészése"}</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {registrations.map((reg, index) => (
                  <motion.div
                    key={reg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white/95 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {reg.program_image && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 flex-shrink-0">
                              <img src={reg.program_image} alt={reg.program_title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-[#1E293B]">{reg.program_title}</h3>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                              {reg.event_date && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(new Date(reg.event_date), "PPP", { locale: dateLocale })}
                                </div>
                              )}
                              {reg.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {reg.location}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Bell className="w-3 h-3 mr-1" />
                            {t("my_hub.remind") || "Emlékeztető"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            {loadingData ? (
              <div className="grid gap-4">
                {[1].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
              </div>
            ) : pastParticipations.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-md border-white/40">
                <CardContent className="py-12 text-center">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t("my_hub.no_history") || "Még nincs előzményed"}</h3>
                  <p className="text-muted-foreground">{t("my_hub.no_history_hint") || "A beváltott kuponjaid itt jelennek meg."}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pastParticipations.map((past, index) => (
                  <motion.div
                    key={past.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-md border-white/40">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-[#1E293B]">{past.program_title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(past.completed_at), "PPP", { locale: dateLocale })}
                            {past.voucher_code && (
                              <span className="ml-2 font-mono text-xs">({past.voucher_code})</span>
                            )}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-muted">
                          {t("voucher.redeemed") || "Beváltva"}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Action: WellBot */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1E293B]">WellBot</h3>
                  <p className="text-sm text-muted-foreground">{t("my_hub.wellbot_hint") || "Segítek megtalálni a neked való programot!"}</p>
                </div>
              </div>
              <Button onClick={() => navigate("/ai-assistant")}>
                {t("my_hub.chat") || "Beszélgetés"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default MyHubPage;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Ticket, Star, ArrowRight, Calendar, Heart } from "lucide-react";
import { format } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";

const getDateLocale = (language: Language) => {
  switch (language) {
    case 'hu': return hu;
    case 'de': return de;
    case 'en': return enUS;
    default: return enUS;
  }
};

interface JoinedProgram {
  id: string;
  title: string;
  category: string;
  image_url: string | null;
  purchased_at: string;
}

interface UserVoucher {
  id: string;
  content_id: string;
  content_title: string;
  access_type: string;
  purchased_at: string;
}

const MyAgoraPage = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const dateLocale = getDateLocale(language);
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<JoinedProgram[]>([]);
  const [vouchers, setVouchers] = useState<UserVoucher[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch joined programs via content_access
        const { data: accessData } = await supabase
          .from("content_access")
          .select(`
            id,
            content_id,
            access_type,
            purchased_at,
            expert_contents (
              id,
              title,
              category,
              image_url
            )
          `)
          .eq("user_id", user.id)
          .order("purchased_at", { ascending: false });

        if (accessData) {
          const joinedPrograms: JoinedProgram[] = accessData
            .filter(a => a.expert_contents)
            .map(a => ({
              id: a.content_id,
              title: (a.expert_contents as any)?.title || "Ismeretlen program",
              category: (a.expert_contents as any)?.category || "Általános",
              image_url: (a.expert_contents as any)?.image_url,
              purchased_at: a.purchased_at,
            }));
          setPrograms(joinedPrograms);

          const userVouchers: UserVoucher[] = accessData
            .filter(a => a.access_type === "sponsored" || a.access_type === "voucher")
            .map(a => ({
              id: a.id,
              content_id: a.content_id,
              content_title: (a.expert_contents as any)?.title || "Ismeretlen",
              access_type: a.access_type || "sponsored",
              purchased_at: a.purchased_at,
            }));
          setVouchers(userVouchers);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadUserData();
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <DashboardLayout title={t("my_agora.title")} icon={Star} iconColor="text-emerald-500">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <DashboardLayout
      title={t("my_agora.title")}
      subtitle={t("my_agora.subtitle")}
      icon={Star}
      iconColor="text-emerald-500"
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{programs.length}</p>
                  <p className="text-xs text-muted-foreground">{t("my_agora.my_programs")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Ticket className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{vouchers.length}</p>
                  <p className="text-xs text-muted-foreground">{t("my_agora.my_vouchers")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Heart className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">{t("my_agora.favorites")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">{t("my_agora.events")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Joined Programs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t("my_agora.programs_title")}
            </CardTitle>
            <CardDescription>
              {t("my_agora.programs_description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : programs.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">{t("my_agora.no_programs")}</p>
                <Button onClick={() => navigate("/programs")}>
                  {t("my_agora.browse_programs")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {programs.slice(0, 5).map((program) => (
                  <div
                    key={program.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => navigate(`/programs/${program.id}`)}
                  >
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center overflow-hidden">
                      {program.image_url ? (
                        <img src={program.image_url} alt={program.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{program.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {program.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(program.purchased_at), "PPP", { locale: dateLocale })}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
                {programs.length > 5 && (
                  <Button variant="outline" className="w-full" onClick={() => navigate("/my-learning")}>
                    {t("my_agora.view_all")} ({programs.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vouchers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              {t("my_agora.vouchers_title")}
            </CardTitle>
            <CardDescription>
              {t("my_agora.vouchers_description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : vouchers.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">{t("my_agora.no_vouchers")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
                  >
                    <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
                      <Ticket className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{voucher.content_title}</p>
                      <p className="text-xs text-muted-foreground">
                        {voucher.access_type === "sponsored" ? t("my_agora.sponsored") : t("my_agora.voucher")} • {format(new Date(voucher.purchased_at), "PPP", { locale: dateLocale })}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                      {t("my_agora.active")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MyAgoraPage;

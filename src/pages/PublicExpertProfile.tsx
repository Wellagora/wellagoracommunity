import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FoundingExpertBadge } from "@/components/expert/FoundingExpertBadge";
import SEOHead from "@/components/SEOHead";
import { MapPin, BookOpen, Users, Calendar, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { hu, enUS, de } from "date-fns/locale";

const dateLocales = { hu, en: enUS, de } as const;

const PublicExpertProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [bioLang, setBioLang] = useState<string>(language);

  // Fetch expert by slug OR by id (fallback)
  const { data: expert, isLoading } = useQuery({
    queryKey: ["publicExpert", slug],
    queryFn: async () => {
      // Try slug first
      let { data, error } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, avatar_url, bio, bio_en, bio_de, expert_title, expert_title_en, expert_title_de, expertise_areas, is_verified_expert, created_at, location_city, is_founding_expert, founding_expert_since, expert_slug"
        )
        .eq("expert_slug", slug!)
        .maybeSingle();

      if (!data && !error) {
        // Fallback: try as UUID
        ({ data, error } = await supabase
          .from("profiles")
          .select(
            "id, first_name, last_name, avatar_url, bio, bio_en, bio_de, expert_title, expert_title_en, expert_title_de, expertise_areas, is_verified_expert, created_at, location_city, is_founding_expert, founding_expert_since, expert_slug"
          )
          .eq("id", slug!)
          .maybeSingle());
      }

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch expert's published programs
  const { data: programs } = useQuery({
    queryKey: ["publicExpertPrograms", expert?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_contents")
        .select("id, title, title_en, title_de, description, description_en, description_de, cover_image_url, price, currency, access_level, is_published, created_at")
        .eq("creator_id", expert!.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!expert?.id,
  });

  // Fetch total participants
  const { data: totalParticipants } = useQuery({
    queryKey: ["publicExpertParticipants", expert?.id],
    queryFn: async () => {
      if (!programs || programs.length === 0) return 0;
      const ids = programs.map((p) => p.id);
      const { count } = await supabase
        .from("content_access")
        .select("*", { count: "exact", head: true })
        .in("content_id", ids);
      return count || 0;
    },
    enabled: !!programs && programs.length > 0,
  });

  const getBio = (lang: string) => {
    if (!expert) return "";
    if (lang === "en") return (expert as any).bio_en || expert.bio || "";
    if (lang === "de") return (expert as any).bio_de || expert.bio || "";
    return expert.bio || "";
  };

  const getTitle = () => {
    if (!expert) return "";
    if (language === "en") return (expert as any).expert_title_en || expert.expert_title || "";
    if (language === "de") return (expert as any).expert_title_de || expert.expert_title || "";
    return expert.expert_title || "";
  };

  const getProgramTitle = (p: any) => {
    if (language === "en") return p.title_en || p.title || "";
    if (language === "de") return p.title_de || p.title || "";
    return p.title || "";
  };

  const fullName = expert ? `${expert.first_name || ""} ${expert.last_name || ""}`.trim() : "";
  const bioText = getBio(language);
  const memberSince = expert?.created_at
    ? format(new Date(expert.created_at), language === 'hu' ? "yyyy. MMMM" : "MMMM yyyy", { locale: dateLocales[language] || hu })
    : "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FEFCF7]">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Skeleton className="h-48 w-48 rounded-full mx-auto mb-6" />
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-48 mx-auto mb-8" />
          <Skeleton className="h-32 w-full mb-4" />
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-[#FEFCF7] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">404</h1>
          <p className="text-muted-foreground mb-6">{t("common.not_found") || "Expert not found"}</p>
          <Link to="/">
            <Button>{t("common.back_home") || "Back to Home"}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${fullName} — WellAgora ${t("founding_expert.bio_tabs")}`}
        description={bioText.substring(0, 160)}
        image={expert.avatar_url || undefined}
        url={`/expert/${expert.expert_slug || expert.id}`}
      />

      <div className="min-h-screen bg-[#FEFCF7]">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-emerald-600 to-emerald-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("common.back") || "Back"}
            </Link>

            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src={expert.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"}
              alt={fullName}
              className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-xl"
            />

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold mb-2"
            >
              {fullName}
            </motion.h1>

            {(expert as any).is_founding_expert && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-3"
              >
                <FoundingExpertBadge size="lg" />
              </motion.div>
            )}

            {getTitle() && (
              <p className="text-white/80 text-lg mb-1">{getTitle()}</p>
            )}

            {expert.location_city && (
              <p className="text-white/60 flex items-center justify-center gap-1 text-sm">
                <MapPin className="w-4 h-4" />
                {expert.location_city}
              </p>
            )}
          </div>
        </section>

        {/* Bio with language tabs */}
        <section className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t("founding_expert.bio_tabs")}</h2>
          <Tabs value={bioLang} onValueChange={setBioLang}>
            <TabsList className="mb-4">
              <TabsTrigger value="hu">Magyar</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="de">Deutsch</TabsTrigger>
            </TabsList>
            {["hu", "en", "de"].map((lang) => (
              <TabsContent key={lang} value={lang}>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                  {getBio(lang) || (
                    <span className="italic text-muted-foreground">
                      {t("common.no_content") || "No content available in this language."}
                    </span>
                  )}
                </p>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Programs */}
        <section className="max-w-4xl mx-auto px-4 pb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">{t("founding_expert.my_programs")}</h2>

          {(!programs || programs.length === 0) ? (
            <Card className="bg-white/80">
              <CardContent className="py-10 text-center">
                <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">{t("founding_expert.no_programs_yet")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programs.map((p) => (
                <Link key={p.id} to={`/program/${p.id}`}>
                  <Card className="bg-white hover:shadow-md transition-shadow overflow-hidden h-full">
                    {p.cover_image_url && (
                      <img
                        src={p.cover_image_url}
                        alt={getProgramTitle(p)}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-1">{getProgramTitle(p)}</h3>
                      {p.access_level === "free" ? (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">{t("program.free_access") || "Free"}</Badge>
                      ) : p.price ? (
                        <span className="text-sm text-muted-foreground">{p.price} {p.currency || "HUF"}</span>
                      ) : null}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Stats */}
        <section className="max-w-4xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white text-center">
              <CardContent className="py-6">
                <BookOpen className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{programs?.length || 0}</p>
                <p className="text-xs text-muted-foreground">{t("founding_expert.programs_count")}</p>
              </CardContent>
            </Card>
            <Card className="bg-white text-center">
              <CardContent className="py-6">
                <Users className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{totalParticipants || 0}</p>
                <p className="text-xs text-muted-foreground">{t("founding_expert.participants_count")}</p>
              </CardContent>
            </Card>
            <Card className="bg-white text-center col-span-2">
              <CardContent className="py-6">
                <Calendar className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-lg font-bold text-foreground">{memberSince}</p>
                <p className="text-xs text-muted-foreground">
                  {t("founding_expert.member_since").replace("{{date}}", "")}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <Card className="bg-gradient-to-r from-emerald-50 to-amber-50 border-0">
            <CardContent className="py-10 text-center">
              {user?.id === expert.id ? (
                <>
                  <h3 className="text-xl font-bold text-foreground mb-2">{t("public_profile.edit_cta_title") || "This is your profile"}</h3>
                  <p className="text-muted-foreground mb-6">{t("public_profile.edit_cta_desc") || "Keep your profile up to date to attract participants."}</p>
                  <Link to="/expert-studio">
                    <Button className="bg-[#2C5530] hover:bg-[#234425] text-white px-8 py-3 text-lg">
                      {t("public_profile.edit_profile_button") || "Edit your profile"}
                    </Button>
                  </Link>
                </>
              ) : user ? (
                <>
                  <h3 className="text-xl font-bold text-foreground mb-2">{t("founding_expert.cta_title")}</h3>
                  <p className="text-muted-foreground mb-6">{t("founding_expert.cta_desc")}</p>
                  <Link to="/piacer">
                    <Button className="bg-[#C67B4E] hover:bg-[#b56a3f] text-white px-8 py-3 text-lg">
                      {t("public_profile.browse_programs") || "Browse programs"}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-foreground mb-2">{t("founding_expert.cta_title")}</h3>
                  <p className="text-muted-foreground mb-6">{t("founding_expert.cta_desc")}</p>
                  <Link to="/auth">
                    <Button className="bg-[#C67B4E] hover:bg-[#b56a3f] text-white px-8 py-3 text-lg">
                      {t("founding_expert.cta_button")}
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
};

export default PublicExpertProfile;

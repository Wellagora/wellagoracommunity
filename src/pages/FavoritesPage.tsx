import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Heart, Store, ArrowRight, Sparkles, Gift } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface FavoriteProgram {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  price_huf: number | null;
  creator_name: string;
  is_sponsored: boolean;
  sponsor_name: string | null;
}

const FavoritesPage = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [favorites, setFavorites] = useState<FavoriteProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("favorites")
          .select(`
            id,
            content_id,
            expert_contents (
              id,
              title,
              description,
              image_url,
              category,
              price_huf,
              is_sponsored,
              sponsor_name,
              creator_id,
              profiles:creator_id (
                first_name,
                last_name
              )
            )
          `)
          .eq("user_id", user.id);

        if (error) throw error;

        const mapped = (data || [])
          .filter((f: any) => f.expert_contents)
          .map((f: any) => ({
            id: f.expert_contents.id,
            title: f.expert_contents.title,
            description: f.expert_contents.description,
            image_url: f.expert_contents.image_url,
            category: f.expert_contents.category,
            price_huf: f.expert_contents.price_huf,
            is_sponsored: f.expert_contents.is_sponsored || false,
            sponsor_name: f.expert_contents.sponsor_name,
            creator_name: f.expert_contents.profiles
              ? `${f.expert_contents.profiles.first_name} ${f.expert_contents.profiles.last_name}`
              : "Szakértő",
          }));

        setFavorites(mapped);
      } catch (error) {
        console.error("Error loading favorites:", error);
        toast.error(t("common.error") || "Hiba történt");
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user, t]);

  const removeFavorite = async (programId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("content_id", programId);

      if (error) throw error;

      setFavorites((prev) => prev.filter((f) => f.id !== programId));
      toast.success(t("favorites.removed") || "Eltávolítva a kedvencekből");
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error(t("common.error") || "Hiba történt");
    }
  };

  // Premium price display with sponsorship logic
  const renderPriceDisplay = (program: FavoriteProgram) => {
    if (program.is_sponsored) {
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 shadow-sm">
            <Gift className="w-3 h-3 mr-1" />
            {t("program.sponsored") || "TÁMOGATOTT"}
          </Badge>
          {program.price_huf && program.price_huf > 0 && (
            <span className="text-xs text-muted-foreground line-through">
              {language === "hu" 
                ? `${program.price_huf.toLocaleString("hu-HU")} Ft`
                : `€${Math.round(program.price_huf / 400)}`}
            </span>
          )}
        </div>
      );
    }
    
    if (!program.price_huf || program.price_huf === 0) {
      return (
        <Badge variant="secondary" className="text-xs">
          {t("common.free") || "Ingyenes"}
        </Badge>
      );
    }
    
    return (
      <span className="text-sm font-semibold text-slate-900">
        {language === "hu"
          ? `${program.price_huf.toLocaleString("hu-HU")} Ft`
          : `€${Math.round(program.price_huf / 400)}`}
      </span>
    );
  };

  return (
    <DashboardLayout
      title={t("favorites.title") || "Kedvenceim"}
      subtitle={t("favorites.subtitle") || "Az általad mentett programok"}
      icon={Heart}
      iconColor="text-rose-500"
      backUrl="/programs"
    >
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        /* Premium Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-white to-slate-50 border-[0.5px] border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
            <CardContent className="py-16 px-8 text-center">
              {/* Large Faded Icon */}
              <div className="relative mx-auto w-32 h-32 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-pink-50 rounded-full" />
                <Heart className="absolute inset-0 m-auto h-16 w-16 text-rose-300" />
                <Sparkles className="absolute top-2 right-2 h-6 w-6 text-rose-400 animate-pulse" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                {t("favorites.empty_title") || "Még nincsenek kedvenceid"}
              </h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
                {t("favorites.empty_description") ||
                  "Fedezd fel a Piacteret és mentsd el a számodra érdekes programokat! A kedvenceid itt fognak megjelenni."}
              </p>
              
              <Button 
                asChild 
                size="lg"
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-full px-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link to="/programs">
                  <Store className="w-5 h-5 mr-2" />
                  {t("favorites.browse_programs") || "Böngéssz tovább"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group bg-white/95 backdrop-blur-xl border-[0.5px] border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)] rounded-2xl overflow-hidden transition-all duration-300">
                {program.image_url && (
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={program.image_url}
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    
                    {/* Remove button */}
                    <button
                      onClick={() => removeFavorite(program.id)}
                      className="absolute top-3 right-3 p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
                      title={t("favorites.remove") || "Eltávolítás"}
                    >
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    </button>
                    
                    {/* Category badge */}
                    {program.category && (
                      <Badge 
                        variant="secondary" 
                        className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-xs"
                      >
                        {program.category}
                      </Badge>
                    )}
                  </div>
                )}
                <CardContent className="p-5">
                  <h3 className="font-semibold text-lg text-slate-900 line-clamp-2 mb-2 group-hover:text-emerald-700 transition-colors">
                    {program.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-3">
                    {program.creator_name}
                  </p>
                  {program.description && (
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                      {program.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    {renderPriceDisplay(program)}
                    <Button 
                      asChild 
                      size="sm" 
                      variant="ghost"
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    >
                      <Link to={`/programs/${program.id}`}>
                        {t("common.view") || "Megtekintés"}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default FavoritesPage;

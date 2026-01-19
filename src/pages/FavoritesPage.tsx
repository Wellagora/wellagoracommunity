import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Store, ArrowRight } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { toast } from "sonner";

interface FavoriteProgram {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  price_huf: number | null;
  creator_name: string;
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

  const formatPrice = (price: number | null) => {
    if (!price) return t("common.free") || "Ingyenes";
    if (language === "hu") {
      return `${price.toLocaleString("hu-HU")} Ft`;
    }
    return `€${Math.round(price / 400)}`;
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-md border-white/40">
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("favorites.empty_title") || "Még nincsenek kedvenceid"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("favorites.empty_description") ||
                "Böngészd a programokat és mentsd el a kedvenceid!"}
            </p>
            <Button asChild>
              <Link to="/programs">
                <Store className="w-4 h-4 mr-2" />
                {t("favorites.browse_programs") || "Programok böngészése"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((program) => (
            <Card
              key={program.id}
              className="bg-white/95 backdrop-blur-md border-white/40 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {program.image_url && (
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={program.image_url}
                    alt={program.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFavorite(program.id)}
                    className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    title={t("favorites.remove") || "Eltávolítás"}
                  >
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  </button>
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-[#1E293B] line-clamp-2">
                    {program.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {program.creator_name}
                </p>
                {program.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {program.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-600">
                    {formatPrice(program.price_huf)}
                  </span>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/programs/${program.id}`}>
                      {t("common.view") || "Megtekintés"}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default FavoritesPage;

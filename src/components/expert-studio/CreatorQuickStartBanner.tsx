import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, ArrowRight } from "lucide-react";

/**
 * CreatorQuickStartBanner — új creator-okra szabott "tölts fel első programot" nudge.
 *
 * Care+DNA tanulság aktiváció:
 *   - Zero-state érdemi tartalom: nem üres dashboard, hanem konkrét következő lépés.
 *   - Ténymegállapító tone: "Még nincs programod. Kezdjük el az elsővel."
 *   - Nincs felkiáltó, nincs marketing-szöveg.
 *
 * Megjelenik ha a creator-nek 0 programja van. Egyszer kattintható → új program-űrlap.
 */
const CreatorQuickStartBanner = () => {
  const { t } = useLanguage();

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/30 shadow-sm">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-start gap-4 flex-col md:flex-row">
          <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t("creator_quickstart.title") || "Még nincs programod. Kezdjük el az elsővel."}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-2xl">
              {t("creator_quickstart.description") ||
                "A Wellagora most a közösségépítésről szól. Egy első program — egy téma, amiben otthon vagy — már elég ahhoz, hogy a közösség lássa, mit hozol be. Nem kell ár, nem kell fizetési beállítás, csak a tartalom."}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                <Link to="/expert-studio/programs/new">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("creator_quickstart.cta_primary") || "Új program létrehozása"}
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-orange-700 hover:text-orange-800">
                <Link to="/ai-assistant">
                  {t("creator_quickstart.cta_wellbot") || "Kérdezd a WellBotot, mire kérdez a közösség"}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatorQuickStartBanner;

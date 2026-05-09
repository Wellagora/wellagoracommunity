import AdminInsightsPanel from "@/components/admin/AdminInsightsPanel";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * AdminInsights — admin route a Community Insights for Creators feature backend-jéhez.
 *
 * Az AdminLayout (route-guard) biztosítja, hogy csak admin user érje el.
 * A get_admin_insights() függvény SECURITY DEFINER-rel fut, k≥3 anonimitással.
 *
 * Wiring (Attila / dev review-ja után):
 *   1. Add to App.tsx route list:
 *        const AdminInsights = lazy(() => import("@/pages/admin/AdminInsights"));
 *      és a Route a /admin path-on belül:
 *        <Route path="insights" element={<AdminInsights />} />
 *   2. Add to AdminLayout nav menu (ha van).
 */
const AdminInsights = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {t("admin_insights.page_title") || "Közösségi insights"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          {t("admin_insights.page_subtitle") ||
            "A WellBot-kérdésekből aggregált emerging topics. A content-gap-jelölésű témákra creator-meghívás indítható."}
        </p>
      </div>

      <AdminInsightsPanel defaultWeeksBack={4} />
    </div>
  );
};

export default AdminInsights;

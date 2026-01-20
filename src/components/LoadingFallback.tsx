import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const LoadingFallback = () => {
  const { t } = useLanguage();
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    </div>
  );
};
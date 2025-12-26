import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen } from "lucide-react";

interface ChallengeTipsProps {
  tipsKeys: string[];
}

const ChallengeTips = ({ tipsKeys }: ChallengeTipsProps) => {
  const { t } = useLanguage();
  const [showTips, setShowTips] = useState(false);

  if (!tipsKeys || tipsKeys.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <Button
        onClick={() => setShowTips(!showTips)}
        variant="outline"
        className="w-full justify-between mb-3 hover:bg-primary/10"
      >
        <span className="text-lg font-semibold text-foreground">{t('challenges.useful_tips')}</span>
        <BookOpen className={`w-5 h-5 transition-transform ${showTips ? 'rotate-180' : ''}`} />
      </Button>
      {showTips && (
        <div className="space-y-2 animate-in slide-in-from-top-2">
          {tipsKeys.map((tipKey, index) => (
            <div key={tipKey} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30 border border-border">
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-accent">{index + 1}</span>
              </div>
              <p className="text-foreground text-sm">{t(tipKey)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChallengeTips;

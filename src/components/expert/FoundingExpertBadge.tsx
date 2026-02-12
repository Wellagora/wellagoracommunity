import { Crown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FoundingExpertBadgeProps {
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

const sizeMap = {
  sm: { icon: 16, text: "text-[11px]", px: "px-1.5 py-0.5", gap: "gap-1" },
  md: { icon: 20, text: "text-[13px]", px: "px-2 py-1", gap: "gap-1.5" },
  lg: { icon: 28, text: "text-base", px: "px-3 py-1.5", gap: "gap-2" },
};

export const FoundingExpertBadge = ({
  size = "md",
  showTooltip = true,
}: FoundingExpertBadgeProps) => {
  const { t } = useLanguage();
  const s = sizeMap[size];

  const badge = (
    <span
      className={`inline-flex items-center ${s.gap} ${s.px} rounded-full border border-[#D4A843]/60 bg-[#D4A843]/10 text-[#9A7B2F] font-medium ${s.text} whitespace-nowrap`}
    >
      <Crown style={{ width: s.icon, height: s.icon }} className="flex-shrink-0" />
      {t("founding_expert.badge_label")}
    </span>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-[260px] text-center">
          <p className="text-sm">{t("founding_expert.badge_tooltip")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FoundingExpertBadge;

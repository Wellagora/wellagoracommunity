import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaLink?: string;
  onCtaClick?: () => void;
  className?: string;
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaLink,
  onCtaClick,
  className = "",
}: EmptyStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-5">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-6">{description}</p>
      {ctaLabel && ctaLink && (
        <Link to={ctaLink}>
          <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6">
            {ctaLabel}
          </Button>
        </Link>
      )}
      {ctaLabel && onCtaClick && !ctaLink && (
        <Button
          onClick={onCtaClick}
          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          {ctaLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

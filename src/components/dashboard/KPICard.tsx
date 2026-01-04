import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconColor?: string;
}

export const KPICard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  className,
  iconColor = "text-primary"
}: KPICardProps) => {
  return (
    <Card className={cn("bg-card border-border hover:shadow-lg transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                "flex items-center text-sm font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                <span>{trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
                <span className="ml-1 text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-xl bg-primary/10", iconColor.includes("amber") && "bg-amber-500/10", iconColor.includes("cyan") && "bg-cyan-500/10", iconColor.includes("green") && "bg-green-500/10")}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;

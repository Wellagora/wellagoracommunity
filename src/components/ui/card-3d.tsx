import React from "react";
import { cn } from "@/lib/utils";

interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glassEffect?: boolean;
  premium?: boolean;
}

const Card3D = React.forwardRef<HTMLDivElement, Card3DProps>(
  ({ className, children, hoverEffect = true, glassEffect = true, premium = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative group",
          // Base 3D transform setup
          "transform-gpu perspective-1000",
          // Glass morphism effect
          glassEffect && "bg-background/80 backdrop-blur-xl border border-border/50",
          // Premium shadow
          premium && "shadow-premium",
          // Hover effects
          hoverEffect && [
            "transition-all duration-500 ease-out",
            "hover:-translate-y-2 hover:rotate-1 hover:scale-[1.02]",
            "hover:shadow-glow hover:border-primary/30",
            // Inner glow on hover
            "hover:before:opacity-100 before:opacity-0 before:transition-opacity before:duration-500",
            "before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-r before:from-primary/5 before:to-success/5 before:pointer-events-none"
          ],
          "rounded-2xl overflow-hidden",
          className
        )}
        style={{
          transformStyle: 'preserve-3d',
        }}
        {...props}
      >
        {/* Inner content with subtle 3D offset */}
        <div className="relative z-10 h-full transform translate-z-2">
          {children}
        </div>
        
        {/* Reflection effect */}
        {premium && (
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 pointer-events-none rounded-[inherit]" />
        )}
        
        {/* Animated background particles for premium cards */}
        {premium && (
          <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary/20 rounded-full blur-sm animate-float" />
            <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-success/20 rounded-full blur-sm animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 -left-2 w-4 h-4 bg-secondary/20 rounded-full blur-sm animate-float" style={{ animationDelay: '2s' }} />
          </div>
        )}
      </div>
    );
  }
);

Card3D.displayName = "Card3D";

// Specialized variants
export const FeatureCard3D: React.FC<Card3DProps & { icon?: React.ReactNode; title: string; description: string }> = ({ 
  icon, 
  title, 
  description, 
  className,
  ...props 
}) => (
  <Card3D 
    className={cn("p-8 group cursor-pointer", className)} 
    premium 
    {...props}
  >
    {icon && (
      <div className="w-14 h-14 mb-6 bg-gradient-to-br from-primary/20 to-success/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
    )}
    <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
      {title}
    </h3>
    <p className="text-muted-foreground leading-relaxed">
      {description}
    </p>
  </Card3D>
);

export const DashboardCard3D: React.FC<Card3DProps> = ({ className, children, ...props }) => (
  <Card3D 
    className={cn("p-6 bg-card/90", className)} 
    hoverEffect={false}
    {...props}
  >
    {children}
  </Card3D>
);

export { Card3D };
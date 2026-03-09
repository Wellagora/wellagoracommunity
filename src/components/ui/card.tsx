import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Card Component with Glass Variant
 * Default: Clean solid white | Glass: Frosted glassmorphism effect
 */
const cardVariants = cva(
  // Base styles shared by all variants
  "rounded-[20px] text-card-foreground transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        // Default: Clean solid white card
        default: [
          "bg-white",
          "shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
          "border border-black/[0.05]",
          "hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
          "hover:scale-[1.02]",
          "hover:border-black/[0.1]",
        ].join(" "),
        // Glass: Frosted glassmorphism
        glass: [
          "bg-white/60 backdrop-blur-xl",
          "shadow-[0_4px_24px_rgba(0,0,0,0.04)]",
          "border border-white/40",
          "hover:bg-white/75",
          "hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)]",
          "hover:scale-[1.02]",
          "hover:border-white/60",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-2 p-8", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-tight tracking-tight text-foreground", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground leading-relaxed", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-8 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-8 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, cardVariants, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

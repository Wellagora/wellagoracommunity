import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Salesforce AI-Inspired Glassmorphism Card Component
 * Glass effect with depth, interactive hover, border glow
 */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Clean white with subtle blur
        "bg-white/95 backdrop-blur-sm",
        // Light-leak border effect container
        "light-leak-border",
        // Rounded corners: 20px for editorial look
        "rounded-[20px]",
        // Shadow: Soft editorial shadow
        "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_24px_64px_-16px_rgba(0,0,0,0.08)]",
        // Text color
        "text-card-foreground",
        // Spring physics transition
        "transition-all duration-500",
        "hover:-translate-y-2",
        "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_32px_80px_-16px_rgba(0,0,0,0.12)]",
        // Cursor to indicate interactivity
        "cursor-pointer",
        className
      )}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
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
    <h3 ref={ref} className={cn("font-serif text-2xl font-semibold leading-tight tracking-tight text-foreground", className)} {...props} />
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

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

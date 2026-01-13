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
        // Glassmorphism: More transparent white with blur
        "bg-white/40 backdrop-blur-md",
        // Very thin white border for frosted glass effect
        "border border-white/30",
        // Rounded corners: 24px for modern organic look
        "rounded-[24px]",
        // Shadow: Soft 3D shadow
        "shadow-[0_24px_48px_rgba(0,0,0,0.06)]",
        // Text color
        "text-card-foreground",
        // Interactive hover: Scale + deeper shadow + border glow
        "transition-all duration-500 ease-out",
        "hover:scale-[1.02]",
        "hover:shadow-[0_32px_64px_rgba(0,0,0,0.12)]",
        "hover:border-white/50",
        "hover:bg-white/60",
        "hover:-translate-y-1",
        // Cursor to indicate interactivity
        "cursor-pointer",
        className
      )}
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

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
        // Clean solid white background
        "bg-white",
        // Rounded corners: 20px for editorial look
        "rounded-[20px]",
        // Very light default shadow (grounded)
        "shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        // Border for definition
        "border border-black/[0.05]",
        // Text color
        "text-card-foreground",
        // Smooth transition
        "transition-all duration-300 ease-out",
        // Hover: subtle lift with shadow
        "hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
        "hover:scale-[1.02]",
        "hover:border-black/[0.1]",
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

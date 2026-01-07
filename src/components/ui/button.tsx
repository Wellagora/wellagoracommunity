import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: Apple Green (#34C759) - Fresh Green gradient
        default: "bg-primary text-primary-foreground shadow-[0_4px_15px_rgba(52,199,89,0.25)] hover:shadow-[0_6px_20px_rgba(52,199,89,0.35)] hover:-translate-y-0.5 hover:brightness-105 transition-all",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_4px_15px_rgba(239,68,68,0.2)]",
        outline: "border border-border bg-white/80 backdrop-blur-sm text-foreground hover:bg-white hover:border-primary/40 hover:text-primary shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
        ghost: "text-foreground hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Premium: Gradient from primary to accent
        premium: "bg-gradient-to-r from-primary to-accent text-white font-bold shadow-[0_6px_20px_rgba(52,199,89,0.3)] hover:shadow-[0_8px_25px_rgba(52,199,89,0.4)] hover:-translate-y-1 hover:scale-[1.02] transition-all",
        // Glass: Subtle glassmorphism effect
        glass: "bg-white/60 backdrop-blur-xl border border-white/40 text-foreground hover:bg-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-xl px-4",
        lg: "h-13 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

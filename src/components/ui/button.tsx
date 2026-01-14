import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Salesforce AI-Inspired Button Component
 * Magnetic hover feel with scale and press effects
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: Liquid Black with Spring Physics
        default: "magnetic-button bg-[#111111] text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)] active:scale-[0.96]",
        destructive: "magnetic-button bg-[#333333] text-white hover:bg-[#222222] shadow-[0_4px_16px_rgba(0,0,0,0.08)] active:scale-[0.96]",
        outline: "magnetic-button border border-black/[0.12] bg-transparent text-[#111111] hover:bg-[#111111] hover:text-white hover:border-transparent active:scale-[0.96]",
        secondary: "magnetic-button bg-[#F5F5F7] text-[#111111] hover:bg-[#E8E8EA] shadow-none active:scale-[0.96]",
        ghost: "text-[#111111] hover:bg-black/[0.04] transition-all duration-300",
        link: "text-[#111111] underline-offset-4 hover:underline",
        // Premium: Stronger liquid effect
        premium: "liquid-button font-bold shadow-[0_8px_24px_rgba(0,0,0,0.15)]",
        // Glass: Glassmorphism with light-leak
        glass: "light-leak-border magnetic-button bg-white/90 backdrop-blur-xl border border-black/[0.05] text-[#111111] hover:bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)]",
      },
      size: {
        default: "h-11 px-7 py-2",
        sm: "h-9 rounded-full px-5 text-xs",
        lg: "h-13 rounded-full px-9 text-base",
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

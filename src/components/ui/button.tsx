import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Salesforce AI-Inspired Button Component
 * Magnetic hover feel with scale and press effects
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97] active:shadow-none",
  {
    variants: {
      variant: {
        // Primary: Deep Obsidian Black - Magnetic feel
        default: "bg-[#111111] text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:scale-[1.03] hover:bg-[#000000]",
        destructive: "bg-[#333333] text-white hover:bg-[#222222] hover:scale-[1.02] shadow-[0_4px_16px_rgba(0,0,0,0.08)]",
        outline: "border border-black/[0.15] bg-transparent text-[#111111] hover:bg-[#111111] hover:text-white hover:scale-[1.02] hover:border-transparent",
        secondary: "bg-[#F5F5F7] text-[#111111] hover:bg-[#E8E8EA] hover:scale-[1.02] shadow-none",
        ghost: "text-[#111111] hover:bg-black/[0.04] hover:scale-[1.02]",
        link: "text-[#111111] underline-offset-4 hover:underline",
        // Premium: Obsidian with stronger magnetic effect
        premium: "bg-[#111111] text-white font-bold shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)] hover:scale-[1.04] hover:bg-[#000000]",
        // Glass: Glassmorphism button
        glass: "bg-white/80 backdrop-blur-xl border border-black/[0.05] text-[#111111] hover:bg-white/95 hover:scale-[1.02] hover:border-black/[0.1] shadow-[0_8px_24px_rgba(0,0,0,0.04)]",
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

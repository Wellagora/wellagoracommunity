import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Salesforce AI-Inspired Button Component
 * Magnetic hover feel with scale and press effects
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        // Primary: Pitch Black premium CTA with liquid hover
        default: "bg-[#000000] text-white border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:scale-[1.03] active:scale-[0.97]",
        destructive: "bg-[#333333] text-white hover:bg-[#222222] active:scale-[0.97]",
        outline: "border border-black/[0.15] bg-transparent text-[#111111] hover:bg-[#111111] hover:text-white hover:border-transparent active:scale-[0.97]",
        secondary: "bg-[#F5F5F7] text-[#111111] hover:bg-[#E8E8EA] active:scale-[0.97]",
        ghost: "text-[#111111] hover:bg-black/[0.04]",
        link: "text-[#111111] underline-offset-4 hover:underline",
        // Premium: Extra polish with inner glow
        premium: "bg-[#000000] text-white border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_16px_rgba(0,0,0,0.2)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_40px_rgba(0,0,0,0.35)] hover:scale-[1.04] active:scale-[0.96] font-bold",
        // Glass: Clean glass effect
        glass: "bg-white/90 backdrop-blur-xl border border-black/[0.05] text-[#111111] hover:bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] active:scale-[0.97]",
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

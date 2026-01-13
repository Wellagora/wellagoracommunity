import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: Deep Obsidian Black #111111 - Luxury monochrome
        default: "bg-[#111111] text-white shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)] hover:-translate-y-1 hover:bg-[#000000] transition-all",
        destructive: "bg-[#333333] text-white hover:bg-[#222222] shadow-[0_8px_24px_rgba(0,0,0,0.1)]",
        outline: "border border-[#111111] bg-transparent text-[#111111] hover:bg-[#111111] hover:text-white shadow-none transition-all",
        secondary: "bg-[#F5F5F7] text-[#111111] hover:bg-[#E5E5E7] shadow-none",
        ghost: "text-[#111111] hover:bg-[#F5F5F7] hover:text-[#000000]",
        link: "text-[#111111] underline-offset-4 hover:underline",
        // Premium: Same as default - pure obsidian
        premium: "bg-[#111111] text-white font-bold shadow-[0_12px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1.5 hover:bg-[#000000] transition-all",
        // Glass: Subtle white glass effect
        glass: "bg-white/90 border-0 text-[#111111] hover:bg-white shadow-[0_16px_32px_rgba(0,0,0,0.06)]",
      },
      size: {
        default: "h-12 px-8 py-2",
        sm: "h-10 rounded-full px-6",
        lg: "h-14 rounded-full px-10 text-base",
        icon: "h-12 w-12",
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

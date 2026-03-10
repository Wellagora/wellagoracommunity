import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Modern Community Creator Platform Button
 * Emerald-based design system with subtle hover effects
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        // Primary: Emerald CTA
        default: "bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 hover:scale-[1.02] active:scale-[0.97]",
        destructive: "bg-red-600 text-white hover:bg-red-700 active:scale-[0.97]",
        outline: "border border-blue-200 bg-transparent text-blue-700 hover:bg-blue-50 hover:border-blue-300 active:scale-[0.97]",
        secondary: "bg-gray-100 text-foreground hover:bg-gray-200 active:scale-[0.97]",
        ghost: "text-foreground hover:bg-gray-100",
        link: "text-blue-700 underline-offset-4 hover:underline",
        // Premium: Extra polish
        premium: "bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-[1.03] active:scale-[0.96] font-bold",
        // Glass: Clean glass effect
        glass: "bg-white/90 backdrop-blur-xl border border-blue-100 text-foreground hover:bg-white hover:shadow-md hover:border-blue-200 active:scale-[0.97]",
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

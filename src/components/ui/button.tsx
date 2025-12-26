import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[hsl(216,100%,50%)] to-[hsl(186,100%,50%)] text-white shadow-button hover:shadow-float hover:-translate-y-0.5 hover:scale-[1.02] transition-all",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-card hover:shadow-premium border border-destructive/25",
        outline: "border border-accent/40 bg-card/50 text-accent hover:bg-accent/10 hover:border-accent hover:shadow-glow backdrop-blur-sm hover:text-white",
        secondary: "bg-gradient-to-r from-[hsl(200,100%,45%)] to-[hsl(186,100%,50%)] text-white shadow-button hover:shadow-float hover:-translate-y-0.5 hover:scale-[1.02] transition-all",
        ghost: "text-foreground hover:bg-accent/10 hover:text-accent border border-transparent hover:border-accent/20",
        link: "text-accent underline-offset-4 hover:underline hover:text-accent-light",
        premium: "bg-gradient-to-r from-[hsl(216,100%,50%)] via-[hsl(195,100%,50%)] to-[hsl(186,100%,50%)] text-white font-bold shadow-float hover:shadow-premium hover:-translate-y-1 hover:scale-[1.03] transition-all",
        glass: "bg-card/60 backdrop-blur-xl border border-accent/20 text-foreground hover:bg-card/80 hover:border-accent/40 shadow-card hover:shadow-glow",
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

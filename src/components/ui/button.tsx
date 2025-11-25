import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-info text-white hover:from-info hover:to-primary shadow-glow hover:shadow-premium border border-primary/15 hover:-translate-y-0.5 transition-all",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-card hover:shadow-premium border border-destructive/25",
        outline: "border border-accent/30 bg-transparent text-accent hover:bg-accent/8 hover:border-accent/50 hover:shadow-glow backdrop-blur-sm",
        secondary: "bg-gradient-to-r from-secondary to-accent text-white hover:from-accent hover:to-secondary shadow-glow hover:shadow-premium border border-accent/15 hover:-translate-y-0.5 transition-all",
        ghost: "text-foreground hover:bg-accent/8 hover:text-accent border border-transparent hover:border-accent/15",
        link: "text-accent underline-offset-4 hover:underline hover:text-accent-light",
        premium: "bg-gradient-vibrant text-white font-semibold shadow-premium hover:shadow-float border border-accent/20 hover:-translate-y-1 hover:scale-[1.02] transition-all",
        glass: "bg-glass backdrop-blur-xl border border-primary/12 text-foreground hover:bg-glass-strong hover:border-primary/20 shadow-card hover:shadow-glow",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-13 rounded-lg px-8 text-base",
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

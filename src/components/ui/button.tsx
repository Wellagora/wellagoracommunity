import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-glow border border-primary/30 hover:border-primary/60",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg hover:shadow-[0_0_20px_hsl(var(--destructive)/0.5)] border border-destructive/30",
        outline: "border-2 border-primary/40 bg-transparent text-primary hover:bg-primary/10 hover:border-primary/70 hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg hover:shadow-[0_0_20px_hsl(var(--secondary)/0.4)] border border-secondary/30",
        ghost: "text-foreground hover:bg-accent/20 hover:text-accent border border-transparent hover:border-accent/30",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-glow",
        cyber: "bg-gradient-to-r from-accent to-primary text-white font-semibold shadow-xl hover:shadow-glow border border-accent/50 hover:border-accent transform hover:scale-105",
        neon: "bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground shadow-lg hover:shadow-[0_0_25px_hsl(var(--accent)/0.6)] hover:border-accent-light",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-14 rounded-lg px-10 text-base",
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

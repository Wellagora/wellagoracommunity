import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Black: Obsidian background
        default: "bg-[#111111] text-white border-0",
        // Outline: Black border, transparent bg
        secondary: "bg-[#F5F5F7] text-[#6E6E73] border-0",
        // Muted gray
        destructive: "bg-[#333333] text-white border-0",
        // Outline style
        outline: "text-[#111111] border border-[#111111] bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

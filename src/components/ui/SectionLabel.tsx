import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

const SectionLabel = React.forwardRef<HTMLSpanElement, SectionLabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "uppercase tracking-[0.2em] text-xs text-black/40 font-semibold",
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

SectionLabel.displayName = "SectionLabel";

export { SectionLabel };

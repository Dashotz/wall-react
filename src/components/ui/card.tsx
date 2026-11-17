import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-[#e2e8f0] bg-white text-[#0f172a] shadow-[0_1px_3px_0_rgba(15,23,42,0.04),0_4px_12px_-2px_rgba(15,23,42,0.03)]",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export { Card };


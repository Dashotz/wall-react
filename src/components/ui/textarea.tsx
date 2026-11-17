import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[84px] w-full rounded-md border border-[#d6e2f5] bg-gradient-to-r from-[#eff5ff]/85 via-[#f6f9ff]/65 to-white px-3.5 py-2.5 text-[15px] leading-relaxed text-[#0f172a] placeholder:text-[#64748b] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:border-[#3b82f6] focus-visible:bg-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#3b82f6]/15 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };


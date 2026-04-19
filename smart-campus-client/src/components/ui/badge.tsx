import * as React from "react";

import { cn } from "@/lib/utils";

function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-[#191a1b] px-2 py-0.5 text-[11px] font-[510] text-[#d0d6e0]",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };

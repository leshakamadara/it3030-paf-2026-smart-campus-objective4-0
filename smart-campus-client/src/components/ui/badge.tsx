import * as React from "react";

import { cn } from "@/lib/utils";

function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-white/8 bg-white/3 px-2 py-0.5 text-[11px] font-[510] text-[#d0d6e0]",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };

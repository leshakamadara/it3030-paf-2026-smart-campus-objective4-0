import * as React from "react";

import { cn } from "@/lib/utils";

function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[#d0d6e0] bg-[#f3f4f5] px-2 py-0.5 text-[11px] font-[510] text-[#43464b]",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };

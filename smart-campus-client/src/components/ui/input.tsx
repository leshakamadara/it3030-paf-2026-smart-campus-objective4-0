import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-10 w-full rounded-md border border-white/10 bg-[#08090a] px-3 text-sm text-[#d0d6e0] placeholder:text-[#62666d] focus:border-[#7170ff] focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

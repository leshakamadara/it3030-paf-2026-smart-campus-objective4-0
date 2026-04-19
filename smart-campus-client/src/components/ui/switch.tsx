import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-[#d0d6e0] bg-[#f3f4f5] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-colors data-[state=checked]:border-[#5e6ad2]/70 data-[state=checked]:bg-[#5e6ad2] hover:data-[state=checked]:bg-[#7170ff] focus-visible:ring-2 focus-visible:ring-[#7170ff]/40 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="block size-5 rounded-full bg-[#f7f8f8] shadow-[0_1px_2px_rgba(0,0,0,0.45)] transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }

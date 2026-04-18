import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

interface SheetContentProps {
  children: ReactNode;
  side?: "right" | "left";
  className?: string;
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
      <button
        type="button"
        aria-label="Close panel"
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
}

function SheetContent({ children, side = "right", className }: SheetContentProps) {
  return (
    <aside
      className={cn(
        "absolute top-0 h-full w-full max-w-md border-white/8 bg-[#0f1011]/95 shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl",
        side === "right" ? "right-0 border-l" : "left-0 border-r",
        className,
      )}
    >
      {children}
    </aside>
  );
}

function SheetHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-center justify-between border-b border-white/8 p-4", className)}>{children}</div>;
}

function SheetTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("text-base font-[590] tracking-[-0.01em] text-[#f7f8f8]", className)}>{children}</h2>;
}

function SheetBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("h-[calc(100%-68px)] overflow-y-auto p-4", className)}>{children}</div>;
}

export { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle };

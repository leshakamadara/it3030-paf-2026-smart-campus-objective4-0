import type { BookingStatus } from "@/types/booking";

const STATUS_TAB_VALUES = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const;

export type BookingStatusTab = (typeof STATUS_TAB_VALUES)[number];

interface StatusTabsProps {
  value: BookingStatusTab;
  counts: Record<BookingStatusTab, number>;
  onChange: (next: BookingStatusTab) => void;
}

export function StatusTabs({ value, counts, onChange }: StatusTabsProps) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-xl border border-[#d0d6e0] bg-[#ffffff] p-2">
      {STATUS_TAB_VALUES.map((tab) => {
        const active = value === tab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`rounded-md px-3 py-1.5 text-xs font-[510] transition ${
              active
                ? "bg-[#5e6ad2] text-white"
                : "border border-[#d0d6e0] bg-[#f3f4f5] text-[#43464b] hover:bg-[#e6e6e6]"
            }`}
          >
            {tab} ({counts[tab]})
          </button>
        );
      })}
    </div>
  );
}

export function isMatchingStatus(tab: BookingStatusTab, status: BookingStatus): boolean {
  return tab === "ALL" || tab === status;
}

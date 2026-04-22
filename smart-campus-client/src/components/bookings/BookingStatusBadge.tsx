import type { BookingStatus } from "@/types/booking";

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING:   "border-amber-200   bg-amber-50   text-amber-700",
  APPROVED:  "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED:  "border-red-200     bg-red-50     text-red-700",
  CANCELLED: "border-[#d0d6e0]   bg-[#f3f4f5]  text-[#62666d]",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-[590] tracking-[0.04em] ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

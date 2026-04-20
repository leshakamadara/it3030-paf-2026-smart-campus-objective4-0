import type { BookingStatus } from "@/types/booking";

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: "border-[#3b3f52] bg-[#202433] text-[#c9d2ff]",
  APPROVED: "border-[#1f4d33] bg-[#153124] text-[#8ee8b0]",
  REJECTED: "border-[#5a2031] bg-[#32181f] text-[#ffc2d0]",
  CANCELLED: "border-[#4c4c4c] bg-[#2a2a2a] text-[#d1d1d1]",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-[590] tracking-[0.04em] ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ApproveRejectDialog } from "@/components/bookings/ApproveRejectDialog";
import { BookingDetailSheet } from "@/components/bookings/BookingDetailSheet";
import { BookingFilters, type BookingFilterState } from "@/components/bookings/BookingFilters";
import { BookingTable } from "@/components/bookings/BookingTable";
import { approveBooking, getAllBookings, getResources, rejectBooking } from "@/services/bookings";
import { Button } from "@/components/ui/button";
import type { Booking, ResourceSummary } from "@/types/booking";

function downloadCsv(bookings: Booking[]) {
  const lines = [
    "bookingId,userId,resourceId,status,startTime,endTime,purpose,attendeeCount,reviewedBy,reviewReason,reviewedAt",
    ...bookings.map((item) =>
      [
        item.id,
        item.userId,
        item.resourceId,
        item.status,
        item.startTime,
        item.endTime,
        `"${item.purpose.replace(/"/g, '""')}"`,
        item.attendeeCount ?? "",
        item.reviewedBy ?? "",
        `"${(item.reviewReason ?? "").replace(/"/g, '""')}"`,
        item.reviewedAt ?? "",
      ].join(","),
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "bookings-export.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function AdminBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [filters, setFilters] = useState<BookingFilterState>({
    status: "",
    resourceId: "",
    userId: "",
    fromTime: "",
    toTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<"approve" | "reject" | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [resources, setResources] = useState<ResourceSummary[]>([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllBookings({
        status: filters.status || undefined,
        resourceId: filters.resourceId || undefined,
        userId: filters.userId || undefined,
        fromTime: filters.fromTime ? new Date(filters.fromTime).toISOString() : undefined,
        toTime: filters.toTime ? new Date(filters.toTime).toISOString() : undefined,
        page: 0,
        size: 20,
      });
      setItems(response.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load all bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void getResources()
      .then((result) => {
        setResources(result);
      })
      .catch(() => {
        setResources([]);
      });

    void load();
  }, []);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aPending = a.status === "PENDING" ? 0 : 1;
      const bPending = b.status === "PENDING" ? 0 : 1;
      if (aPending !== bPending) {
        return aPending - bPending;
      }

      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
  }, [items]);

  async function handleApprove(id: string) {
    try {
      await approveBooking(id);
      toast.success("Booking approved");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approve failed");
    }
  }

  async function handleReject(id: string, reason: string) {
    try {
      await rejectBooking(id, { reason });
      toast.success("Booking rejected");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reject failed");
    }
  }

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-[#ffffff14] bg-[#0f1011] p-4">
        <h2 className="text-lg font-[590] tracking-tight text-[#f7f8f8]">Admin Booking Moderation</h2>
        <p className="text-sm text-[#8a8f98]">Filter, inspect, and review campus booking requests.</p>
      </header>

      <BookingFilters value={filters} resources={resources} onChange={setFilters} onApply={() => void load()} />

      <div className="flex justify-end">
        <Button
          onClick={() => downloadCsv(sortedItems)}
          className="border border-[#ffffff14] bg-[#191a1b] text-[#d0d6e0] hover:bg-[#25272a]"
        >
          Export CSV
        </Button>
      </div>

      {error && <p className="rounded-lg border border-[#ff6a8b4d] bg-[#2a1018] p-3 text-sm text-[#ffc2d0]">{error}</p>}
      {loading && <p className="text-sm text-[#8a8f98]">Loading all bookings...</p>}

      <BookingTable
        bookings={sortedItems}
        onApprove={(bookingId) => {
          setSelectedBookingId(bookingId);
          setActiveMode("approve");
        }}
        onReject={(bookingId) => {
          setSelectedBookingId(bookingId);
          setActiveMode("reject");
        }}
        onOpenDetail={(booking) => setDetailBooking(booking)}
      />

      <ApproveRejectDialog
        open={activeMode !== null && selectedBookingId !== null}
        mode={activeMode === "reject" ? "reject" : "approve"}
        bookingId={selectedBookingId ?? ""}
        onClose={() => {
          setActiveMode(null);
          setSelectedBookingId(null);
        }}
        onConfirmApprove={async (bookingId) => {
          await handleApprove(bookingId);
        }}
        onConfirmReject={async (bookingId, reason) => {
          await handleReject(bookingId, reason);
        }}
      />

      <BookingDetailSheet booking={detailBooking} open={detailBooking !== null} onClose={() => setDetailBooking(null)} />
    </section>
  );
}

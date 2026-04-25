import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, AlertCircle } from "lucide-react";

import { ApproveRejectDialog } from "@/components/bookings/ApproveRejectDialog";
import { BookingDetailSheet } from "@/components/bookings/BookingDetailSheet";
import { BookingFilters, type BookingFilterState } from "@/components/bookings/BookingFilters";
import { BookingTable } from "@/components/bookings/BookingTable";
import { approveBooking, getAllBookings, getResources, rejectBooking } from "@/services/bookings";
import { Button } from "@/components/ui/button";
import type { Booking, ResourceSummary } from "@/types/booking";

function downloadCsv(bookings: Booking[]) {
  const lines = [
    "bookingId,userName,userId,resourceName,resourceId,status,startTime,endTime,purpose,attendeeCount,reviewedBy,reviewReason,reviewedAt",
    ...bookings.map((item) =>
      [
        item.id,
        `"${(item.userName ?? "").replace(/"/g, '""')}"`,
        item.userId,
        `"${(item.resourceName ?? "").replace(/"/g, '""')}"`,
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
        size: 50,
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
      .then((result) => setResources(result))
      .catch(() => setResources([]));
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
      toast.success("Booking approved", { description: "The resource reservation has been confirmed." });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approve failed");
    }
  }

  async function handleReject(id: string, reason: string) {
    try {
      await rejectBooking(id, { reason });
      toast.success("Booking rejected", { description: "The reservation request has been denied." });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reject failed");
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f8]">
      {/* Header */}
      <div className="border-b bg-[#ffffff] border-[#e6e6e6]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-[#5e6ad2]" style={{ letterSpacing: "0.6px" }}>
                Moderation Hub
              </p>
              <h1 className="text-2xl font-bold text-[#191a1b]" style={{ letterSpacing: "-0.4px" }}>
                Admin Booking Management
              </h1>
              <p className="text-sm mt-0.5 text-[#8a8f98]">
                Filter, inspect, and review campus booking requests.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#ede9ff] text-[#5e6ad2] border border-[#c4b5fd]">
                ADMIN
              </span>
              <Button
                onClick={() => downloadCsv(sortedItems)}
                size="sm"
                className="font-semibold shadow-none transition-opacity hover:opacity-90 bg-[#ffffff] text-[#43464b] border border-[#d0d6e0] hover:bg-[#f3f4f5]"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <BookingFilters value={filters} resources={resources} onChange={setFilters} onApply={() => void load()} />

        {error && (
          <div className="rounded-lg border px-5 py-4 flex items-center gap-3 bg-[#fff1f1] border-[#fca5a5] text-[#991b1b]">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-[#8a8f98]" />
          </div>
        ) : (
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
        )}
      </div>

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
    </div>
  );
}

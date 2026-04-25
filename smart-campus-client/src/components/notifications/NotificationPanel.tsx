import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BookOpen, CalendarCheck2, CalendarX2, MessageSquare, Ticket, CheckCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notifications";
import type { NotificationItem } from "@/types/notification";

// ── helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string) {
  const diff = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function isToday(iso: string) {
  const d = new Date(iso);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

function targetPath(item: NotificationItem) {
  if (item.entityType && item.entityId) {
    const t = item.entityType.toUpperCase();
    if (t.includes("BOOKING")) return `/dashboard/bookings/${item.entityId}`;
    if (t.includes("TICKET")) return `/dashboard/tickets`;
  }
  return "/dashboard/notifications";
}

function typeIcon(type: string) {
  if (type === "BOOKING_APPROVED") return <CalendarCheck2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />;
  if (type === "BOOKING_REJECTED") return <CalendarX2 className="h-4 w-4 text-red-400 flex-shrink-0" />;
  if (type === "BOOKING_CANCELLED") return <CalendarX2 className="h-4 w-4 text-amber-500 flex-shrink-0" />;
  if (type === "TICKET_COMMENT") return <MessageSquare className="h-4 w-4 text-[#5e6ad2] flex-shrink-0" />;
  if (type === "TICKET_STATUS_CHANGED") return <Ticket className="h-4 w-4 text-amber-500 flex-shrink-0" />;
  if (type === "TICKET_ASSIGNED") return <BookOpen className="h-4 w-4 text-[#5e6ad2] flex-shrink-0" />;
  return <Bell className="h-4 w-4 text-[#62666d] flex-shrink-0" />;
}

// ── Item ─────────────────────────────────────────────────────────────────────

function NotifItem({
  item,
  onOpen,
  onDelete,
}: {
  item: NotificationItem;
  onOpen: (item: NotificationItem) => void;
  onDelete: (item: NotificationItem) => void;
}) {
  return (
    <div
      className={`group relative flex gap-3 rounded-lg border px-3 py-2.5 transition-colors cursor-pointer ${
        item.isRead
          ? "border-[#e8eaed] bg-[#ffffff] hover:bg-[#f7f8f8]"
          : "border-[#5e6ad2]/20 bg-[#eef2ff] hover:bg-[#e6ecff]"
      }`}
      onClick={() => onOpen(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen(item)}
    >
      {!item.isRead && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-[#5e6ad2] -ml-0.5" />
      )}
      <div className="mt-0.5">{typeIcon(item.type)}</div>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-xs font-[590] ${item.isRead ? "text-[#43464b]" : "text-[#191a1b]"}`}>
          {item.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[11px] text-[#62666d]">{item.message}</p>
        <p className="mt-1 text-[10px] text-[#8a8f98]">{relativeTime(item.createdAt)}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(item); }}
        className="opacity-0 group-hover:opacity-100 mt-0.5 h-6 w-6 flex items-center justify-center rounded-md border border-[#f0b8c4] bg-[#fff1f4] text-[#8f3346] hover:bg-[#ffe6ec] transition-opacity flex-shrink-0"
        title="Delete notification"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export function NotificationPanel() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function refresh() {
    try {
      const [notifs, count] = await Promise.all([getNotifications(0, 25), getUnreadCount()]);
      setItems(notifs);
      setUnreadCount(count);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load notifications");
    }
  }

  useEffect(() => {
    void refresh();
    intervalRef.current = setInterval(() => void refresh(), 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const grouped = useMemo(() => ({
    today: items.filter((n) => isToday(n.createdAt)),
    earlier: items.filter((n) => !isToday(n.createdAt)),
  }), [items]);

  async function handleOpen(item: NotificationItem) {
    if (!item.isRead) {
      try { await markNotificationAsRead(item.id); } catch { /* ignore */ }
    }
    setOpen(false);
    navigate(targetPath(item));
    void refresh();
  }

  async function handleDelete(item: NotificationItem) {
    try {
      await deleteNotification(item.id);
      void refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete notification");
    }
  }

  async function handleMarkAll() {
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      void refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  }

  function NotifGroup({ label, notifs }: { label: string; notifs: NotificationItem[] }) {
    if (notifs.length === 0) return null;
    return (
      <div className="space-y-1">
        <p className="px-1 text-[10px] font-[510] uppercase tracking-[0.14em] text-[#8a8f98]">{label}</p>
        {notifs.map((item) => (
          <NotifItem key={item.id} item={item} onOpen={handleOpen} onDelete={handleDelete} />
        ))}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d0d6e0] bg-[#f7f8f8] text-[#43464b] hover:bg-[#f3f4f5] transition-colors"
          aria-label="Open notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5e6ad2] px-1 text-[9px] font-[590] text-white border-0">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        className="w-[360px] p-0 border border-[#d0d6e0] bg-[#ffffff] shadow-xl rounded-xl"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8eaed] px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-[590] text-[#191a1b]">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-[#5e6ad2] text-white text-[10px] border-0 h-5">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                onClick={() => void handleMarkAll()}
                disabled={markingAll}
                className="h-7 px-2 text-[11px] border border-[#d0d6e0] bg-[#f7f8f8] text-[#43464b] hover:bg-[#f3f4f5]"
                title="Mark all as read"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            <button
              onClick={() => { setOpen(false); navigate("/dashboard/notifications"); }}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-[#d0d6e0] bg-[#f7f8f8] text-[#62666d] hover:bg-[#f3f4f5] text-[10px]"
              title="See all notifications"
            >
              <BookOpen className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 pt-2">
            <p className="rounded-md border border-[#f0b8c4] bg-[#fff1f4] px-3 py-2 text-xs text-[#8f3346]">{error}</p>
          </div>
        )}

        {/* List */}
        <ScrollArea className="h-[420px]">
          <div className="space-y-3 p-3">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Bell className="h-8 w-8 text-[#d0d6e0]" />
                <p className="text-sm text-[#8a8f98]">No notifications yet</p>
                <p className="text-xs text-[#b0b5be]">Booking and ticket events will appear here.</p>
              </div>
            ) : (
              <>
                <NotifGroup label="Today" notifs={grouped.today} />
                {grouped.today.length > 0 && grouped.earlier.length > 0 && (
                  <Separator className="bg-[#e8eaed]" />
                )}
                <NotifGroup label="Earlier" notifs={grouped.earlier} />
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#e8eaed] px-4 py-2.5">
            <button
              onClick={() => { setOpen(false); navigate("/dashboard/notifications"); }}
              className="w-full text-center text-xs text-[#5e6ad2] hover:text-[#7170ff] hover:underline"
            >
              View all notifications →
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

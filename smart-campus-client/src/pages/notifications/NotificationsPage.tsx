import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  CalendarCheck2,
  CalendarX2,
  CheckCheck,
  MessageSquare,
  RefreshCw,
  Ticket,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  deleteNotification,
  getNotificationsPage,
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
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const TYPE_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string; accent: string; bg: string }
> = {
  BOOKING_APPROVED: {
    icon: <CalendarCheck2 className="h-4 w-4" />,
    label: "Booking Approved",
    accent: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
  BOOKING_REJECTED: {
    icon: <CalendarX2 className="h-4 w-4" />,
    label: "Booking Rejected",
    accent: "text-red-500",
    bg: "bg-red-50 border-red-200",
  },
  BOOKING_CANCELLED: {
    icon: <CalendarX2 className="h-4 w-4" />,
    label: "Booking Cancelled",
    accent: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  TICKET_STATUS_CHANGED: {
    icon: <Ticket className="h-4 w-4" />,
    label: "Ticket Updated",
    accent: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  TICKET_COMMENT: {
    icon: <MessageSquare className="h-4 w-4" />,
    label: "New Comment",
    accent: "text-[#5e6ad2]",
    bg: "bg-[#eef2ff] border-[#c7d0ff]",
  },
  TICKET_ASSIGNED: {
    icon: <BookOpen className="h-4 w-4" />,
    label: "Ticket Assigned",
    accent: "text-[#5e6ad2]",
    bg: "bg-[#eef2ff] border-[#c7d0ff]",
  },
  SYSTEM: {
    icon: <Bell className="h-4 w-4" />,
    label: "System",
    accent: "text-[#62666d]",
    bg: "bg-[#f7f8f8] border-[#d0d6e0]",
  },
};

function getConfig(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.SYSTEM;
}

function targetPath(item: NotificationItem) {
  if (item.entityType && item.entityId) {
    const t = item.entityType.toUpperCase();
    if (t.includes("BOOKING")) return `/bookings/${item.entityId}`;
    if (t.includes("TICKET")) return `/tickets/${item.entityId}`;
  }
  return null;
}

// ── Row ───────────────────────────────────────────────────────────────────────

function NotifRow({
  item,
  onMarkRead,
  onDelete,
  onNavigate,
}: {
  item: NotificationItem;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (item: NotificationItem) => void;
}) {
  const cfg = getConfig(item.type);
  const path = targetPath(item);

  return (
    <article
      className={`group relative flex gap-4 rounded-xl border px-4 py-3.5 transition-all ${
        item.isRead
          ? "border-[#e8eaed] bg-[#ffffff] hover:bg-[#f7f8f8]"
          : "border-[#5e6ad2]/25 bg-[#eef2ff]"
      }`}
    >
      {/* unread dot */}
      {!item.isRead && (
        <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#5e6ad2]" />
      )}

      {/* icon */}
      <div
        className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border ${cfg.bg} ${cfg.accent}`}
      >
        {cfg.icon}
      </div>

      {/* content */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-[590] ${item.isRead ? "text-[#43464b]" : "text-[#191a1b]"}`}>
            {item.title}
          </p>
          <span className="flex-shrink-0 text-[11px] text-[#8a8f98]">{relativeTime(item.createdAt)}</span>
        </div>
        <p className="text-xs text-[#62666d] leading-relaxed">{item.message}</p>

        <div className="flex items-center gap-2 pt-1.5">
          {path && (
            <Button
              onClick={() => onNavigate(item)}
              className="h-6 px-2 text-[11px] border border-[#d0d6e0] bg-[#f7f8f8] text-[#43464b] hover:bg-[#f3f4f5]"
            >
              View →
            </Button>
          )}
          {!item.isRead && (
            <Button
              onClick={() => onMarkRead(item.id)}
              className="h-6 px-2 text-[11px] border border-[#d0d6e0] bg-[#ffffff] text-[#5e6ad2] hover:bg-[#eef2ff]"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark read
            </Button>
          )}
          <Button
            onClick={() => onDelete(item.id)}
            className="h-6 px-2 text-[11px] border border-[#f0b8c4] bg-[#fff1f4] text-[#8f3346] hover:bg-[#ffe6ec] ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}

// ── Filter tabs ───────────────────────────────────────────────────────────────

const FILTERS = ["All", "Unread", "Bookings", "Tickets"] as const;
type Filter = (typeof FILTERS)[number];

function applyFilter(items: NotificationItem[], f: Filter) {
  switch (f) {
    case "Unread":
      return items.filter((n) => !n.isRead);
    case "Bookings":
      return items.filter((n) => n.type.startsWith("BOOKING_"));
    case "Tickets":
      return items.filter((n) => n.type.startsWith("TICKET_"));
    default:
      return items;
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<Filter>("All");
  const [markingAll, setMarkingAll] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const [resp, count] = await Promise.all([
        getNotificationsPage(p, 20),
        getUnreadCount(),
      ]);
      if (!mountedRef.current) return;
      setItems((prev) => (p === 0 ? resp.content : [...prev, ...resp.content]));
      setTotalPages(resp.totalPages);
      setUnreadCount(count);
    } catch (e) {
      if (mountedRef.current) setError(e instanceof Error ? e.message : "Failed to load notifications");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(0);
    void load(0);
  }, [load]);

  async function handleMarkRead(id: string) {
    try {
      await markNotificationAsRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* silent */
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteNotification(id);
      setItems((prev) => {
        const removed = prev.find((n) => n.id === id);
        if (removed && !removed.isRead) setUnreadCount((c) => Math.max(0, c - 1));
        return prev.filter((n) => n.id !== id);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete notification");
    }
  }

  async function handleNavigate(item: NotificationItem) {
    if (!item.isRead) await handleMarkRead(item.id);
    const p = targetPath(item);
    if (p) navigate(p);
  }

  async function handleMarkAll() {
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      /* silent */
    } finally {
      setMarkingAll(false);
    }
  }

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    void load(next);
  }

  const displayed = applyFilter(items, filter);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8">
      {/* Page header */}
      <section className="rounded-xl border border-[#d0d6e0] bg-[#ffffff] p-6">
        <Breadcrumb className="mb-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Notifications</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="mt-1 text-2xl font-[590] tracking-tight text-[#191a1b]">Notifications</h1>
            <p className="mt-1 text-sm text-[#62666d]">
              Booking updates and ticket activity across all your campus interactions.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {unreadCount > 0 && (
              <Badge className="bg-[#5e6ad2] text-white border-0">
                {unreadCount} unread
              </Badge>
            )}
            <Button
              onClick={() => void load(0)}
              disabled={loading}
              className="h-8 border border-[#d0d6e0] bg-[#f7f8f8] text-[#43464b] hover:bg-[#f3f4f5] text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                onClick={() => void handleMarkAll()}
                disabled={markingAll}
                className="h-8 border border-[#d0d6e0] bg-[#f7f8f8] text-[#43464b] hover:bg-[#f3f4f5] text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mt-4 flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-[510] transition-colors ${
                filter === f
                  ? "border border-[#d0d6e0] bg-[#f3f4f5] text-[#191a1b]"
                  : "text-[#62666d] hover:text-[#43464b]"
              }`}
            >
              {f}
              {f === "Unread" && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5e6ad2] px-1 text-[9px] text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Error */}
      {error && (
        <p className="rounded-xl border border-[#f0b8c4] bg-[#fff1f4] px-4 py-3 text-sm text-[#8f3346]">
          {error}
        </p>
      )}

      {/* List */}
      <section className="space-y-2">
        {loading && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <RefreshCw className="h-6 w-6 animate-spin text-[#d0d6e0]" />
            <p className="text-sm text-[#8a8f98]">Loading notifications…</p>
          </div>
        )}

        {!loading && displayed.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-[#d0d6e0] bg-[#ffffff] py-16 text-center">
            <Bell className="h-10 w-10 text-[#d0d6e0]" />
            <p className="text-sm font-[510] text-[#43464b]">
              {filter === "All" ? "No notifications yet" : `No ${filter.toLowerCase()} notifications`}
            </p>
            <p className="max-w-xs text-xs text-[#8a8f98]">
              Booking approvals, rejections, ticket updates and comments will appear here.
            </p>
          </div>
        )}

        {displayed.map((item, idx) => (
          <div key={item.id}>
            <NotifRow
              item={item}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
              onNavigate={handleNavigate}
            />
            {idx < displayed.length - 1 && <Separator className="my-1 bg-transparent" />}
          </div>
        ))}
      </section>

      {/* Pagination */}
      {page < totalPages - 1 && !loading && (
        <div className="flex justify-center pt-2">
          <Button
            onClick={handleLoadMore}
            className="border border-[#d0d6e0] bg-[#ffffff] text-[#43464b] hover:bg-[#f7f8f8] text-sm"
          >
            Load more notifications
          </Button>
        </div>
      )}
      {loading && items.length > 0 && (
        <div className="flex justify-center py-4">
          <RefreshCw className="h-4 w-4 animate-spin text-[#8a8f98]" />
        </div>
      )}
    </main>
  );
}

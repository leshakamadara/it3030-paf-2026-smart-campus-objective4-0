import { useEffect, useMemo, useState } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notifications";
import type { NotificationItem, NotificationPageResponse } from "@/types/notification";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}

function buildTargetHref(notification: NotificationItem): string | null {
  if (!notification.entityType || !notification.entityId) {
    return null;
  }

  const entityType = notification.entityType.toUpperCase();
  if (entityType === "BOOKING") {
    return `/bookings/${notification.entityId}`;
  }
  if (entityType === "TICKET") {
    return `/tickets/${notification.entityId}`;
  }

  return null;
}

export function NotificationPanel() {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationPage, setNotificationPage] = useState<NotificationPageResponse | null>(null);

  const notifications = useMemo(() => notificationPage?.content ?? [], [notificationPage]);

  async function loadData(currentPage: number): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const [pageData, count] = await Promise.all([
        getNotifications(currentPage, size),
        getUnreadCount(),
      ]);

      setNotificationPage(pageData);
      setUnreadCount(count);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load notifications";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData(page);
  }, [page]);

  async function handleMarkSingleAsRead(id: string): Promise<void> {
    try {
      await markNotificationAsRead(id);
      await loadData(page);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to mark as read";
      setError(message);
    }
  }

  async function handleMarkAllAsRead(): Promise<void> {
    try {
      await markAllNotificationsAsRead();
      await loadData(page);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to mark all as read";
      setError(message);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    try {
      await deleteNotification(id);
      await loadData(page);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete notification";
      setError(message);
    }
  }

  function handleOpen(notification: NotificationItem): void {
    const target = buildTargetHref(notification);
    if (!target) {
      return;
    }

    window.location.assign(target);
  }

  return (
    <section className="w-full max-w-3xl rounded-xl border border-border bg-card p-5 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Notifications</h2>
          <span className="rounded-full bg-foreground px-2 py-0.5 text-xs text-background">
            {unreadCount} unread
          </span>
        </div>
        <Button onClick={() => void handleMarkAllAsRead()} variant="outline" className="gap-2">
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </Button>
      </header>

      {error && (
        <div className="mb-4 rounded-md border border-red-400/50 bg-red-100/60 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Loading notifications...</p>}

        {!loading && notifications.length === 0 && (
          <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            You have no notifications yet.
          </p>
        )}

        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={`cursor-pointer rounded-lg border p-4 transition ${
              notification.isRead
                ? "border-border bg-background"
                : "border-primary/40 bg-primary/5"
            }`}
            onClick={() => handleOpen(notification)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold">{notification.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(notification.createdAt)}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                {!notification.isRead && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleMarkSingleAsRead(notification.id);
                    }}
                    className="gap-1"
                  >
                    <Check className="h-4 w-4" />
                    Read
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleDelete(notification.id);
                  }}
                  className="gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <footer className="mt-5 flex items-center justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Page {(notificationPage?.page ?? 0) + 1} of {Math.max(notificationPage?.totalPages ?? 1, 1)}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page === 0 || loading}
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={loading || (notificationPage?.last ?? true)}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </footer>
    </section>
  );
}

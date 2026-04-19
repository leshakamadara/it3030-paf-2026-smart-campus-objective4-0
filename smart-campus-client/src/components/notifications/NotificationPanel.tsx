import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { NotificationBell } from "@/components/notifications/NotificationBell";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notifications";
import type { NotificationItem as NotificationModel } from "@/types/notification";

function isToday(dateIso: string) {
  const date = new Date(dateIso);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function targetPathFor(notification: NotificationModel) {
  if (notification.entityType && notification.entityId) {
    const type = notification.entityType.toUpperCase();
    if (type.includes("BOOKING")) {
      return `/bookings/${notification.entityId}`;
    }
    if (type.includes("TICKET")) {
      return `/tickets/${notification.entityId}`;
    }
  }

  return "/";
}

export function NotificationPanel() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationModel[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const [pageData, unread] = await Promise.all([getNotifications(0, 50), getUnreadCount()]);
      setItems(pageData.content);
      setUnreadCount(unread);
      setError(null);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Failed to load notifications";
      setError(message);
    }
  }

  useEffect(() => {
    void refresh();

    const timer = setInterval(() => {
      void refresh();
    }, 30_000);

    return () => clearInterval(timer);
  }, []);

  const grouped = useMemo(() => {
    return {
      today: items.filter((item) => isToday(item.createdAt)),
      earlier: items.filter((item) => !isToday(item.createdAt)),
    };
  }, [items]);

  async function handleOpen(item: NotificationModel) {
    if (!item.isRead) {
      try {
        await markNotificationAsRead(item.id);
      } catch {
        // Navigate anyway for better UX.
      }
    }

    setOpen(false);
    navigate(targetPathFor(item));
    void refresh();
  }

  async function handleDelete(item: NotificationModel) {
    try {
      await deleteNotification(item.id);
      await refresh();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Failed to delete notification";
      setError(message);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsAsRead();
      await refresh();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Failed to mark notifications as read";
      setError(message);
    }
  }

  return (
    <>
      <NotificationBell unreadCount={unreadCount} onClick={() => setOpen(true)} />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void handleMarkAllRead()}
              className="text-xs"
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
          </SheetHeader>

          <SheetBody className="space-y-4">
            {error && (
              <div className="rounded-lg border border-[#5a2031]/80 bg-[#32181f]/90 p-3 text-xs text-[#ffc2d0]">
                {error}
              </div>
            )}

            <section className="space-y-2">
              <h3 className="text-xs font-[510] uppercase tracking-[0.12em] text-[#8a8f98]">Today</h3>
              <div className="space-y-2">
                {grouped.today.map((item) => (
                  <NotificationItem key={item.id} item={item} onOpen={handleOpen} onDelete={handleDelete} />
                ))}
                {grouped.today.length === 0 && <p className="text-xs text-[#62666d]">No notifications today.</p>}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-[510] uppercase tracking-[0.12em] text-[#8a8f98]">Earlier</h3>
              <div className="space-y-2">
                {grouped.earlier.map((item) => (
                  <NotificationItem key={item.id} item={item} onOpen={handleOpen} onDelete={handleDelete} />
                ))}
                {grouped.earlier.length === 0 && <p className="text-xs text-[#62666d]">No older notifications.</p>}
              </div>
            </section>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </>
  );
}

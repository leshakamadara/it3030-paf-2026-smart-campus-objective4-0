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
  type NotificationRecord,
} from "@/services/notifications";

function isToday(dateIso: string) {
  const date = new Date(dateIso);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function targetPathFor(notification: NotificationRecord) {
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
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const [notifications, unread] = await Promise.all([getNotifications(), getUnreadCount()]);
      setItems(notifications);
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

  async function handleOpenItem(item: NotificationRecord) {
    if (!item.read) {
      try {
        await markNotificationAsRead(item.id);
      } catch {
        // Ignore read failures and still navigate.
      }
    }

    setOpen(false);
    navigate(targetPathFor(item));
    void refresh();
  }

  async function handleDelete(item: NotificationRecord) {
    try {
      await deleteNotification(item.id);
      void refresh();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Failed to delete notification";
      setError(message);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsAsRead();
      void refresh();
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
          <SheetHeader className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            <Button
              onClick={() => void handleMarkAllRead()}
              className="h-8 rounded-md border border-[#d0d6e0] bg-[#f3f4f5] px-3 text-xs text-[#43464b] hover:bg-[#e9ebee]"
            >
              Mark all as read
            </Button>
          </SheetHeader>

          <SheetBody className="space-y-4">
            {error && (
              <div className="rounded-lg border border-[#f0b8c4] bg-[#fff1f4] p-3 text-xs text-[#8f3346]">
                {error}
              </div>
            )}

            <section className="space-y-2">
              <h3 className="text-xs font-[510] uppercase tracking-[0.12em] text-[#62666d]">Today</h3>
              <div className="space-y-2">
                {grouped.today.map((item) => (
                  <NotificationItem key={item.id} item={item} onOpen={handleOpenItem} onDelete={handleDelete} />
                ))}
                {grouped.today.length === 0 && <p className="text-xs text-[#62666d]">No notifications today.</p>}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-[510] uppercase tracking-[0.12em] text-[#62666d]">Earlier</h3>
              <div className="space-y-2">
                {grouped.earlier.map((item) => (
                  <NotificationItem key={item.id} item={item} onOpen={handleOpenItem} onDelete={handleDelete} />
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

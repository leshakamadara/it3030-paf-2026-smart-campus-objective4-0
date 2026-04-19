import { Bell, CalendarClock, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { NotificationRecord } from "@/services/notifications";

interface NotificationItemProps {
  item: NotificationRecord;
  onOpen: (item: NotificationRecord) => void;
  onDelete: (item: NotificationRecord) => void;
}

function relativeTime(dateIso: string) {
  const now = Date.now();
  const then = new Date(dateIso).getTime();
  const diffMinutes = Math.max(1, Math.floor((now - then) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function notificationIcon(type: string) {
  if (type.includes("BOOKING")) {
    return <CalendarClock className="h-4 w-4" />;
  }

  if (type.includes("TICKET")) {
    return <Ticket className="h-4 w-4" />;
  }

  return <Bell className="h-4 w-4" />;
}

export function NotificationItem({ item, onOpen, onDelete }: NotificationItemProps) {
  return (
    <article
      className={`rounded-lg border border-white/10 bg-[#191a1b] p-3 ${item.read ? "" : "border-l-4 border-l-[#2d3f7f]"}`}
    >
      <div className="flex gap-3">
        <div className="mt-1 text-[#8a8f98]">{notificationIcon(item.type)}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-[510] text-[#f7f8f8]">{item.title}</p>
          <p className="mt-1 text-xs text-[#8a8f98]">{item.message || "No message provided."}</p>
          <p className="mt-2 text-[11px] text-[#62666d]">{relativeTime(item.createdAt)}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          onClick={() => onOpen(item)}
          className="h-8 rounded-md border border-white/10 bg-[#0f1011] px-3 text-xs text-[#d0d6e0] hover:bg-[#28282c]"
        >
          Open
        </Button>
        <Button
          onClick={() => onDelete(item)}
          className="h-8 rounded-md border border-[#5a2031] bg-[#32181f] px-3 text-xs text-[#ffc2d0] hover:bg-[#462030]"
        >
          Delete
        </Button>
      </div>
    </article>
  );
}

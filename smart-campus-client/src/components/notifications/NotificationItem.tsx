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
      className={`rounded-lg border border-[#d0d6e0] bg-[#f3f4f5] p-3 ${item.read ? "" : "border-l-4 border-l-[#2d3f7f]"}`}
    >
      <div className="flex gap-3">
        <div className="mt-1 text-[#62666d]">{notificationIcon(item.type)}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-[510] text-[#191a1b]">{item.title}</p>
          <p className="mt-1 text-xs text-[#62666d]">{item.message || "No message provided."}</p>
          <p className="mt-2 text-[11px] text-[#62666d]">{relativeTime(item.createdAt)}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          onClick={() => onOpen(item)}
          className="h-8 rounded-md border border-[#d0d6e0] bg-[#ffffff] px-3 text-xs text-[#43464b] hover:bg-[#e9ebee]"
        >
          Open
        </Button>
        <Button
          onClick={() => onDelete(item)}
          className="h-8 rounded-md border border-[#f0b8c4] bg-[#fff1f4] px-3 text-xs text-[#8f3346] hover:bg-[#ffe6ec]"
        >
          Delete
        </Button>
      </div>
    </article>
  );
}

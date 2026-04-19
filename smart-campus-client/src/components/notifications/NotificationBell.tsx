import { Bell } from "lucide-react";

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
}

export function NotificationBell({ unreadCount, onClick }: NotificationBellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/8 bg-white/3 text-[#d0d6e0] transition-colors hover:bg-white/6"
      aria-label="Open notifications"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#5e6ad2] px-1 text-[10px] font-[590] text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}

import type { TicketStatus, User } from "../types/ticketTypes";



export const STATUS_FLOW: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
  REJECTED: [],
};

export const PRIORITY_CONFIG = {
  LOW: { label: "Low", dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600", text: "text-slate-600" },
  MEDIUM: { label: "Medium", dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700", text: "text-amber-700" },
  HIGH: { label: "High", dot: "bg-orange-500", badge: "bg-orange-50 text-orange-700", text: "text-orange-700" },
};

export const STATUS_CONFIG = {
  OPEN: { label: "Open", badge: "bg-blue-50 text-blue-700 border-blue-200", icon: "○" },
  IN_PROGRESS: { label: "In Progress", badge: "bg-violet-50 text-violet-700 border-violet-200", icon: "◑" },
  RESOLVED: { label: "Resolved", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "●" },
  CLOSED: { label: "Closed", badge: "bg-slate-100 text-slate-500 border-slate-200", icon: "✕" },
  REJECTED: { label: "Rejected", badge: "bg-red-50 text-red-700 border-red-200", icon: "✗" },
};

export const CURRENT_USER: User = {
  id: "u1",
  name: "Amal Perera",
  role: "ADMIN",
  email: "admin@example.com",
  avatar: "AP",
};




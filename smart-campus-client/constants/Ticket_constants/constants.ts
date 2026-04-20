import type { Priority, TicketStatus } from "../../src/types/ticketTypes";

export const CURRENT_USER = { id: 2, name: "Jane Smith", email: "jane.smith@example.com", avatar: "KM", role: "USER" };

export const CATEGORIES = [
  { value: "Hardware Failure", icon: "🖥️" },
  { value: "Software / System Error", icon: "💾" },
  { value: "Network / Connectivity", icon: "📡" },
  { value: "AV Equipment", icon: "📽️" },
  { value: "Electrical / Power", icon: "⚡" },
  { value: "Plumbing / Facility", icon: "🔧" },
  { value: "Security / Access", icon: "🔐" },
  { value: "Other", icon: "📋" },
];

export const PRIORITY_META: Record<Priority, any> = {
  LOW: { label: "Low", desc: "Can wait a few days", color: "text-slate-500", ring: "ring-slate-200 bg-slate-50", dot: "bg-slate-400" },
  MEDIUM: { label: "Medium", desc: "Needs attention soon", color: "text-amber-600", ring: "ring-amber-200 bg-amber-50", dot: "bg-amber-400" },
  HIGH: { label: "High", desc: "Disrupting operations", color: "text-orange-600", ring: "ring-orange-200 bg-orange-50", dot: "bg-orange-500" }
};

export const STATUS_META: Record<TicketStatus, any> = {
  OPEN: { label: "Open", badge: "bg-blue-50 text-blue-700 border-blue-200", icon: "○" },
  IN_PROGRESS: { label: "In Progress", badge: "bg-violet-50 text-violet-700 border-violet-200", icon: "◑" },
  RESOLVED: { label: "Resolved", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "●" },
  CLOSED: { label: "Closed", badge: "bg-slate-100 text-slate-500 border-slate-200", icon: "✕" },
  REJECTED: { label: "Rejected", badge: "bg-red-50 text-red-700 border-red-200", icon: "✗" },
};


export const STATUS_FLOW: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
  REJECTED: [],
};


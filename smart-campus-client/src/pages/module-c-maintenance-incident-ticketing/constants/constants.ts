import type { Ticket, Priority, TicketStatus } from "../types/ticket";

export const CURRENT_USER = { id: "u1", name: "Kasun Madhawa", email: "k.madhawa@university.edu", avatar: "KM" };

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
  OPEN: { label: "Open", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200", step: 1, icon: "○" },
  IN_PROGRESS: { label: "In Progress", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200", step: 2, icon: "◑" },
  RESOLVED: { label: "Resolved", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", step: 3, icon: "●" },
  CLOSED: { label: "Closed", color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200", step: 4, icon: "✕" },
  REJECTED: { label: "Rejected", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", step: 0, icon: "✗" },
};

export const MOCK_TICKETS: Ticket[] = [
  
  {
    id: "TKT-001",
    title: "Projector not displaying in Lecture Hall B",
    category: "AV Equipment",
    description: "The ceiling-mounted projector fails to display any image. The power LED blinks amber. Tried multiple HDMI cables.",
    priority: "HIGH",
    status: "IN_PROGRESS",
    resourceLocation: "Lecture Hall B, Block 3, Floor 2",
    images: [],
    assignedToName: "Rajith Fernando",
    comments: [
      {
        id: "c1",
        authorId: "u1",
        authorName: "Kasun Madhawa",
        authorRole: "USER",
        content: "Issue is urgent — morning lecture at 8 AM tomorrow.",
        createdAt: "2025-04-10T07:30:00Z",
      },
      {
        id: "c2",
        authorId: "t1",
        authorName: "Rajith Fernando",
        authorRole: "TECHNICIAN",
        content: "On-site inspection scheduled for this afternoon. Likely lamp failure — will bring a replacement unit.",
        createdAt: "2025-04-10T09:15:00Z",
      },
    ],
    createdAt: "2025-04-10T07:00:00Z",
    updatedAt: "2025-04-10T09:15:00Z",
  },
  {
    id: "TKT-002",
    title: "Library WiFi dead spots near east reading area",
    category: "Network / Connectivity",
    description: "Complete WiFi loss in the east reading area. Affects roughly 40 seats.",
    priority: "MEDIUM",
    status: "RESOLVED",
    resourceLocation: "Main Library, East Wing, Floor 1",
    images: [],
    assignedToName: "Nimal Bandara",
    resolutionNote: "Replaced faulty access point AP-LIB-E04. Coverage restored across all affected seats. Tested and confirmed.",
    comments: [],
    createdAt: "2025-04-08T11:00:00Z",
    updatedAt: "2025-04-09T14:30:00Z",
  },
  {
    id: "TKT-003",
    title: "Air conditioning making grinding noise in Lab 4",
    category: "Electrical / Power",
    description: "The AC unit in Computer Lab 4 is producing a loud grinding noise since this morning.",
    priority: "LOW",
    status: "OPEN",
    resourceLocation: "Computer Lab 4, Engineering Block, Floor 1",
    images: [],
    comments: [],
    createdAt: "2025-04-11T06:00:00Z",
    updatedAt: "2025-04-11T06:00:00Z",
  },
];

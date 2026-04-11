export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";
export type UserRole = "USER" | "TECHNICIAN" | "ADMIN";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Ticket {
  id: string;
  title: string;
  category: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  resourceLocation: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  images: string[];
  createdBy: string;
  createdByName: string;
  assignedTo?: string;
  assignedToName?: string;
  resolutionNote?: string;
  rejectionReason?: string;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}
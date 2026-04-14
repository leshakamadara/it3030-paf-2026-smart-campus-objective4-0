export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "USER" | "TECHNICIAN" | "ADMIN";
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Ticket {
  id: string;
  backendId?: number;
  title: string;
  category: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  resourceLocation: string;
  images: string[];
  assignedToName?: string;
  resolutionNote?: string;
  rejectionReason?: string;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}
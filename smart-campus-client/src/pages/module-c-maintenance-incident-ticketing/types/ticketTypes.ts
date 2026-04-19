export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";
export type UserRole = "USER" | "TECHNICIAN" | "ADMIN";

// Backend-compatible types
export interface AttachmentDTO {
  id: number;
  linkUrl?: string;
  cloudinaryPublicId?: string;
  cloudinaryUrl?: string;
  cloudinarySecureUrl?: string;
  cloudinarySize?: number;
  cloudinaryResourceType?: string;
  cloudinaryVersion?: number;
  createdAt: string;
}

export interface CommentDTO {
  id: number;
  createdBy: string; // email
  createdByName?: string;
  createdByRole?: string;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TicketRequestDTO {
  title: string;
  category?: string;
  description: string;
  priority: Priority;
  resourceLocation?: string;
  imageFile?: File;
  imageFiles?: File[];
}

export interface TicketResponseDTO {
  id: number;
  title: string;
  category?: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  createdBy: string; // email

  resourceLocation?: string;
  technician?: string; // email
  attachments: AttachmentDTO[];
  comments: CommentDTO[];
  createdAt: string;
  updatedAt: string;
  resolutionNote?: string;
  rejectionReason?: string;
  assignedToName?: string;
}

// Frontend types (for backward compatibility)
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "USER" | "TECHNICIAN" | "ADMIN";
  content: string;
  createdAt: string;
  updatedAt?: string;
  initials?: string;
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
  attachments?: Array<{ id: number; cloudinaryUrl?: string; cloudinarySecureUrl?: string; createdAt: string }>;
  assignedToName?: string;
  resolutionNote?: string;
  rejectionReason?: string;
  comments: CommentDTO[];
  createdAt: string;
  updatedAt: string;
}
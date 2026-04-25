/**
 * Ticket Service — all requests authenticated via the global axios interceptor
 * (see lib/axiosConfig.ts). No hardcoded emails or manual auth headers needed here.
 */
import axios from "axios";
import type {
  TicketResponseDTO,
  TicketRequestDTO,
  CommentDTO,
  AttachmentDTO,
} from "../types/ticketTypes";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"}/api/tickets`;

export const ticketService = {
  /** Get all tickets (admin: all; user: filtered client-side by createdBy) */
  getAll: async (): Promise<TicketResponseDTO[]> => {
    const response = await axios.get<TicketResponseDTO[]>(BASE_URL);
    return response.data;
  },

  /** Create a new ticket with optional image attachments (up to 3) */
  create: async (data: TicketRequestDTO): Promise<TicketResponseDTO> => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("priority", data.priority);
    if (data.category) formData.append("category", data.category);
    if (data.resourceLocation) formData.append("resourceLocation", data.resourceLocation);

    const files = (data as any).imageFiles as File[] | undefined;
    if (files && Array.isArray(files)) {
      files.slice(0, 3).forEach((f) => formData.append("imageFiles", f));
    } else if ((data as any).imageFile) {
      formData.append("imageFile", (data as any).imageFile);
    }

    const response = await axios.post<TicketResponseDTO>(`${BASE_URL}/create`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /** Get a single ticket by ID */
  getById: async (id: number): Promise<TicketResponseDTO> => {
    const response = await axios.get<TicketResponseDTO>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /** Get ticket with all attachments */
  getWithAttachments: async (id: number): Promise<TicketResponseDTO> => {
    const response = await axios.get<TicketResponseDTO>(`${BASE_URL}/${id}/with-attachments`);
    return response.data;
  },

  /** Update ticket status — used by ADMIN/TECHNICIAN */
  updateStatus: async (
    id: number,
    status: string,
    notes?: string,
  ): Promise<TicketResponseDTO> => {
    const params: Record<string, string> = { status };
    if (notes !== undefined) params.notes = notes;
    const response = await axios.put<TicketResponseDTO>(`${BASE_URL}/${id}/status`, null, {
      params,
    });
    return response.data;
  },

  /** Assign a technician to a ticket — used by ADMIN/SUPER_ADMIN */
  assignTechnician: async (
    id: number,
    technicianEmail: string,
  ): Promise<TicketResponseDTO> => {
    const response = await axios.put<TicketResponseDTO>(`${BASE_URL}/${id}/assign`, null, {
      params: { technicianEmail },
    });
    return response.data;
  },

  /** Update ticket fields — only allowed when ticket is OPEN */
  update: async (
    id: number,
    data: TicketRequestDTO | FormData,
  ): Promise<TicketResponseDTO> => {
    let formData: FormData;
    if (data instanceof FormData) {
      formData = data;
    } else {
      formData = new FormData();
      if (data.title) formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);
      if (data.priority) formData.append("priority", data.priority);
      if (data.category) formData.append("category", data.category);
      if (data.resourceLocation) formData.append("resourceLocation", data.resourceLocation);
      const files = (data as any).imageFiles as File[] | undefined;
      if (files && Array.isArray(files)) {
        files.slice(0, 3).forEach((f) => formData.append("imageFiles", f));
      } else if ((data as any).imageFile) {
        formData.append("imageFile", (data as any).imageFile);
      }
    }
    const response = await axios.put<TicketResponseDTO>(`${BASE_URL}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /** Add a comment to a ticket */
  addComment: async (ticketId: number, comment: string): Promise<CommentDTO> => {
    const response = await axios.post<CommentDTO>(
      `${BASE_URL}/${ticketId}/comments`,
      comment,
      { headers: { "Content-Type": "text/plain" } },
    );
    return response.data;
  },

  /** Edit an existing comment */
  editComment: async (
    ticketId: number,
    commentId: number,
    newText: string,
  ): Promise<CommentDTO> => {
    const response = await axios.put<CommentDTO>(
      `${BASE_URL}/${ticketId}/comments/${commentId}`,
      newText,
      { headers: { "Content-Type": "text/plain" } },
    );
    return response.data;
  },

  /** Delete a comment */
  deleteComment: async (
    ticketId: number,
    commentId: number,
  ): Promise<{ success: boolean }> => {
    const response = await axios.delete<{ success: boolean }>(
      `${BASE_URL}/${ticketId}/comments/${commentId}`,
    );
    return response.data;
  },

  /** Upload an attachment to an existing ticket */
  uploadAttachment: async (
    ticketId: number,
    file: File,
  ): Promise<AttachmentDTO> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post<AttachmentDTO>(
      `${BASE_URL}/${ticketId}/attachments/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  /** Delete an attachment by ID */
  deleteAttachment: async (
    attachmentId: number,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete<{ success: boolean; message: string }>(
      `${BASE_URL}/attachments/${attachmentId}`,
    );
    return response.data;
  },

  /** Delete a ticket (only OPEN tickets) */
  delete: async (ticketId: number): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete<{ success: boolean; message: string }>(
      `${BASE_URL}/${ticketId}`,
    );
    return response.data;
  },
};
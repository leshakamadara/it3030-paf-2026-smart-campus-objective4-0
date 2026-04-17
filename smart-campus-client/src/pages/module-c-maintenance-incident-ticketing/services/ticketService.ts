import axios from "axios";
import type { TicketResponseDTO, TicketRequestDTO, CommentDTO, AttachmentDTO } from "../types/ticketTypes";

const BASE_URL = "http://localhost:8080/api/tickets";

export const ticketService = {
  // Get all tickets
  getAll: async (): Promise<TicketResponseDTO[]> => {
    try {
      const response = await axios.get<TicketResponseDTO[]>(BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw error;
    }
  },



  // Create ticket 
  create: async (data: TicketRequestDTO): Promise<TicketResponseDTO> => {
    try {
      const formData = new FormData();

      // Add basic ticket data
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("priority", data.priority);

      if (data.category) {
        formData.append("category", data.category);
      }
      if (data.resourceLocation) {
        formData.append("resourceLocation", data.resourceLocation);
      }


      // support multiple files (imageFiles[]) or single imageFile for backward compatibility
      if ((data as any).imageFiles && Array.isArray((data as any).imageFiles)) {
        (data as any).imageFiles.slice(0, 3).forEach((f: File) => formData.append("imageFiles", f));
        console.log("ticketService.create: attaching files:", (data as any).imageFiles.slice(0,3).map((f: File) => f.name));
      } else if ((data as any).imageFile) {
        formData.append("imageFile", data.imageFile as any);
      }

      const response = await axios.post<TicketResponseDTO>(`${BASE_URL}/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error creating ticket:", error);
      throw error;
    }
  },



  // Get ticket by ID
  getById: async (id: number): Promise<TicketResponseDTO> => {
    try {
      const response = await axios.get<TicketResponseDTO>(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching ticket:", error);
      throw error;
    }
  },



  // Get ticket with attachments
  getWithAttachments: async (id: number): Promise<TicketResponseDTO> => {
    try {
      const response = await axios.get<TicketResponseDTO>(`${BASE_URL}/${id}/with-attachments`);
      return response.data;
    } catch (error) {
      console.error("Error fetching ticket with attachments:", error);
      throw error;
    }
  },





  // Update ticket status (optional notes/reason)
  updateStatus: async (id: number, status: string, notes?: string): Promise<TicketResponseDTO> => {
    try {
      const params: any = { status };
      if (notes !== undefined) params.notes = notes;

      const response = await axios.put<TicketResponseDTO>(`${BASE_URL}/${id}/status`, null, {
        params,
        headers: {
          // Add any authentication headers if needed
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating ticket status:", error);
      throw error;
    }
  },


  
  // Update ticket editable fields (only when ticket is OPEN)
  update: async (id: number, data: TicketRequestDTO | FormData): Promise<TicketResponseDTO> => {
    try {
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
        if ((data as any).imageFiles && Array.isArray((data as any).imageFiles)) {
          (data as any).imageFiles.slice(0, 3).forEach((f: File) => formData.append("imageFiles", f));
        } else if ((data as any).imageFile) formData.append("imageFile", (data as any).imageFile);
      }

      const response = await axios.put<TicketResponseDTO>(`${BASE_URL}/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error updating ticket:", error);
      throw error;
    }
  },

  // Add comment to ticket
  addComment: async (ticketId: number, comment: string): Promise<CommentDTO> => {
    try {
      const response = await axios.post<CommentDTO>(`${BASE_URL}/${ticketId}/comments`, comment, {
        headers: {
          "Content-Type": "text/plain",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },
  
  // Edit a comment
  editComment: async (ticketId: number, commentId: number, newText: string): Promise<CommentDTO> => {
    try {
      const response = await axios.put<CommentDTO>(`${BASE_URL}/${ticketId}/comments/${commentId}`, newText, {
        headers: { "Content-Type": "text/plain" },
      });
      return response.data;
    } catch (error) {
      console.error("Error editing comment:", error);
      throw error;
    }
  },

  // Delete a comment
  deleteComment: async (ticketId: number, commentId: number): Promise<{ success: boolean }> => {
    try {
      const response = await axios.delete<{ success: boolean }>(`${BASE_URL}/${ticketId}/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },

  // Fetch current authenticated user info (role, id, name)
  getCurrentUser: async (): Promise<{ id: number; name: string; role: string; avatar?: string }> => {
    try {
      const response = await axios.get(`/api/auth/me`);
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw error;
    }
  },

  // Upload attachment to existing ticket
  uploadAttachment: async (ticketId: number, file: File, userEmail: string = "guest@example.com"): Promise<AttachmentDTO> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post<AttachmentDTO>(`${BASE_URL}/${ticketId}/attachments/upload`, formData, {
        params: { userEmail },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error uploading attachment:", error);
      throw error;
    }
  },

  // Delete attachment
  deleteAttachment: async (attachmentId: number, userEmail: string = "guest@example.com"): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.delete<{ success: boolean; message: string }>(`${BASE_URL}/attachments/${attachmentId}`, {
        params: { userEmail },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting attachment:", error);
      throw error;
    }
  },
  // Delete ticket
  delete: async (ticketId: number, userEmail: string = "jane.smith@example.com") : Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.delete<{ success: boolean; message: string }>(`${BASE_URL}/${ticketId}`, {
        params: { userEmail },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting ticket:", error);
      throw error;
    }
  },
};
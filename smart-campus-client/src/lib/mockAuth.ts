import type { UserRole } from "../types/resource";

export interface MockUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

let currentMockUser: MockUser = {
  id: 1,
  name: "Teena",
  email: "teena@example.com",
  role: "ADMIN",
};

export const getMockUser = (): MockUser => currentMockUser;

export const setMockRole = (role: UserRole): void => {
  currentMockUser = {
    ...currentMockUser,
    role,
  };
};

export const isAdmin = (): boolean => currentMockUser.role === "ADMIN";

export const isUser = (): boolean => currentMockUser.role === "USER";
export type UserRole = "ADMIN" | "USER";

export interface MockUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export const mockUser: MockUser = {
  id: 1,
  name: "Teena",
  email: "teena@example.com",
  role: "ADMIN",
};

export const isAdmin = (): boolean => mockUser.role === "ADMIN";
export const isUser = (): boolean => mockUser.role === "USER";
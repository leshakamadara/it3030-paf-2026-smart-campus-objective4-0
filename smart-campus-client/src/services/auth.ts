const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const AUTH_TOKEN_STORAGE_KEY = "authToken";

export interface AuthUser {
  id?: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string | null;
  role?: "USER" | "TECHNICIAN" | "ADMIN" | "SUPER_ADMIN";
  active?: boolean;
  lastLoginAt?: string | null;
  notificationPrefs?: Record<string, boolean>;
  [key: string]: unknown;
}

export interface MeResponse {
  token: string | null;
  user: AuthUser | null;
}

export interface DummyLoginRequest {
  email: string;
  fullName?: string;
}

export interface CampusSignInRequest {
  email: string;
  password: string;
}

export interface CampusRegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface DummyLoginResponse {
  token: string | null;
  user: AuthUser;
}

function getBackendBaseUrl() {
  return API_BASE_URL.replace(/\/api\/?$/, "");
}

export function getGoogleOAuthUrl() {
  return `${getBackendBaseUrl()}/oauth2/authorization/google`;
}

export function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export async function fetchCurrentUser(token: string): Promise<MeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: "GET",
    headers: {
      Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to fetch current user");
  }

  return (await response.json()) as MeResponse;
}

export async function dummyLogin(data: DummyLoginRequest): Promise<DummyLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/dummy-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Login failed");
  }

  const token = response.headers.get("Authorization");
  const payload = (await response.json()) as { token: string | null; user: AuthUser };

  return { token: token ?? payload.token, user: payload.user };
}

export async function campusSignIn(data: CampusSignInRequest): Promise<DummyLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Invalid email or password");
  }

  const token = response.headers.get("Authorization");
  const payload = (await response.json()) as { token: string | null; user: AuthUser };
  return { token: token ?? payload.token, user: payload.user };
}

export async function campusRegister(data: CampusRegisterRequest): Promise<DummyLoginResponse> {
  if (data.password !== data.confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Registration failed");
  }

  const token = response.headers.get("Authorization");
  const payload = (await response.json()) as { token: string | null; user: AuthUser };
  return { token: token ?? payload.token, user: payload.user };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export interface DummyLoginRequest {
  email: string;
  fullName?: string;
}

export interface DummyLoginResponse {
  token: string | null;
  user: any;
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
  const user = await response.json();

  return { token, user };
}

import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  name: string;
  email: string;
  organizationId: number | null;
  isAdmin: boolean;
  canAddMembers: boolean;
  isSuperAdmin: boolean;
  isActive: boolean;
  joinDate: Date;
  organization?: {
    id: number;
    name: string;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/login", { email, password });
  return response.json();
}

export function logout() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  window.location.href = "/login";
}

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem("auth_user");
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setAuthData(user: User, token: string) {
  localStorage.setItem("auth_user", JSON.stringify(user));
  localStorage.setItem("auth_token", token);
}

export function isAuthenticated(): boolean {
  return !!getAuthToken() && !!getCurrentUser();
}

import { apiFetch } from "./api";
import type { CurrentUser } from "@/types/user";

export async function getCurrentUser(): Promise<CurrentUser> {
  return apiFetch("/api/accounts/me/");
}

export function logout(): void {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.href = "/login";
}

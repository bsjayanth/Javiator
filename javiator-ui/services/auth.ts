import { apiFetch } from "./api";
import type { CurrentUser } from "@/types/user";

// ======================================================
// 👤 GET CURRENT USER
// ======================================================

export async function getCurrentUser(): Promise<CurrentUser> {
return apiFetch("/api/accounts/me/") as Promise<CurrentUser>;
}

// ======================================================
// 🚪 LOGOUT
// ======================================================

export function logout(): void {
localStorage.removeItem("access");
localStorage.removeItem("refresh");

window.location.href = "/login";
}

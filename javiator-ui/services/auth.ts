import { API_BASE, apiFetch } from "./api";
import type { CurrentUser } from "@/types/user";

// ======================================================
// CURRENT USER
// ======================================================

export async function getCurrentUser(): Promise<CurrentUser> {
  return apiFetch("/api/accounts/me/") as Promise<CurrentUser>;
}

// ======================================================
// LOGOUT (BEST-EFFORT SERVER REFRESH TOKEN BLACKLIST)
// ======================================================

export async function logout(): Promise<void> {
  const access =
    typeof window !== "undefined" ? localStorage.getItem("access") : null;
  const refresh =
    typeof window !== "undefined" ? localStorage.getItem("refresh") : null;

  if (access && refresh) {
    try {
      await fetch(`${API_BASE}/api/users/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ refresh }),
      });
    } catch {
      // Proceed with local session teardown even if the backend is unreachable.
    }
  }

  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("username");
  window.location.href = "/login";
}

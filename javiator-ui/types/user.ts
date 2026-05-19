export type CurrentUser = {
  id?: number;
  username: string;
  email?: string;
  role: string;
  phone_number?: string;
  is_online: boolean;
};

export type UserRole = "admin" | "manager" | "driver" | "client";

export function normalizeRole(role?: string): UserRole {
  const r = (role || "").toLowerCase();
  if (r === "admin" || r === "manager" || r === "driver" || r === "client") {
    return r;
  }
  return "manager";
}

export function getInitials(username?: string): string {
  if (!username?.trim()) return "JV";
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

export function formatRoleLabel(role?: string): string {
  const r = normalizeRole(role);
  return r.charAt(0).toUpperCase() + r.slice(1);
}

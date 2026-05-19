"use client";

import {
  Truck,
  Package,
  Activity,
  BarChart3,
  LogOut,
  MapPinned,
  BrainCircuit,
} from "lucide-react";

import { logout } from "@/services/auth";
import {
  formatRoleLabel,
  getInitials,
  type CurrentUser,
  type UserRole,
} from "@/types/user";

type SidebarProps = {
  darkMode: boolean;
  currentUser: CurrentUser | null;
  role: UserRole;
};

type NavItem = {
  icon: typeof Truck;
  label: string;
  active: boolean;
  roles: UserRole[];
};

export default function Sidebar({
  darkMode,
  currentUser,
  role,
}: SidebarProps) {
  const navItems: NavItem[] = [
    {
      icon: Truck,
      active: true,
      label: "Fleet",
      roles: ["admin", "manager", "driver"],
    },
    {
      icon: Package,
      active: false,
      label: "Orders",
      roles: ["admin", "manager", "driver", "client"],
    },
    {
      icon: MapPinned,
      active: false,
      label: "Tracking",
      roles: ["admin", "manager", "client"],
    },
    {
      icon: BarChart3,
      active: false,
      label: "Analytics",
      roles: ["admin", "manager"],
    },
    {
      icon: BrainCircuit,
      active: false,
      label: "AI Ops",
      roles: ["admin"],
    },
    {
      icon: Activity,
      active: false,
      label: "Live",
      roles: ["admin", "manager", "driver"],
    },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(role));
  const initials = getInitials(currentUser?.username);
  const roleLabel = formatRoleLabel(currentUser?.role);

  return (
    <aside
      className={`w-[92px] shrink-0 border-r flex flex-col items-center py-6 transition-colors duration-300 ${
        darkMode
          ? "bg-[#0D0D0D] border-white/[0.05]"
          : "bg-white border-[#E5E7EB]"
      }`}
    >
      <div className="mb-8 text-center">
        <div
          className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center border transition-all duration-200 hover:-translate-y-0.5 ${
            darkMode
              ? "bg-[#151515] border-white/[0.06] shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
              : "bg-[#111111] border-black/5 shadow-sm"
          }`}
        >
          <span className="text-white text-lg font-bold tracking-tight">J</span>
        </div>
        <p
          className={`mt-2 text-[9px] font-semibold uppercase tracking-[0.18em] ${
            darkMode ? "text-[#52525B]" : "text-[#9CA3AF]"
          }`}
        >
          OS
        </p>
      </div>

      <nav className="flex flex-col gap-2 flex-1 w-full px-3">
        {visibleNav.map((item, index) => {
          const Icon = item.icon;

          return (
            <button
              key={index}
              type="button"
              title={item.label}
              className={`group relative w-full h-[52px] rounded-2xl flex items-center justify-center transition-all duration-200 ${
                item.active
                  ? darkMode
                    ? "bg-[#151515] text-[#FAFAFA] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    : "bg-[#111111] text-white border border-black/5 shadow-sm"
                  : darkMode
                    ? "text-[#71717A] border border-transparent hover:bg-white/[0.04] hover:text-[#E4E4E7]"
                    : "text-[#6B7280] border border-transparent hover:bg-[#F3F4F6] hover:text-[#111827]"
              }`}
            >
              {item.active && (
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full ${
                    darkMode ? "bg-[#FAFAFA]" : "bg-[#111827]"
                  }`}
                />
              )}
              <Icon className="w-[20px] h-[20px] stroke-[1.6] transition-transform duration-200 group-hover:scale-105" />
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 flex flex-col items-center gap-1 w-full px-3">
        <div className="relative">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center text-[11px] font-semibold tracking-wide border transition-colors ${
              darkMode
                ? "bg-[#151515] border-white/[0.06] text-[#E5E5E5]"
                : "bg-[#F3F4F6] border-[#E5E7EB] text-[#374151]"
            }`}
            title={currentUser?.username}
          >
            {initials}
          </div>
          <span
            className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 ${
              currentUser?.is_online
                ? darkMode
                  ? "bg-emerald-500 border-[#0D0D0D]"
                  : "bg-emerald-500 border-white"
                : darkMode
                  ? "bg-[#52525B] border-[#0D0D0D]"
                  : "bg-[#9CA3AF] border-white"
            }`}
            title={currentUser?.is_online ? "Online" : "Offline"}
          />
        </div>

        <p
          className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-center ${
            darkMode ? "text-[#71717A]" : "text-[#9CA3AF]"
          }`}
        >
          {roleLabel}
        </p>

        <p
          className={`text-[11px] font-medium text-center max-w-[72px] truncate ${
            darkMode ? "text-[#D4D4D8]" : "text-[#4B5563]"
          }`}
        >
          {currentUser?.username ?? "—"}
        </p>

        <button
          type="button"
          onClick={logout}
          title="Sign out"
          className={`mt-4 w-full h-[42px] rounded-xl border flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 ${
            darkMode
              ? "bg-[#151515] border-white/[0.06] text-[#71717A] hover:bg-[#1A1A1A] hover:text-[#FAFAFA]"
              : "bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
          }`}
        >
          <LogOut className="w-[16px] h-[16px]" />
        </button>
      </div>
    </aside>
  );
}

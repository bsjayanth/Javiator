"use client";

import NotificationCenter from "../NotificationCenter";
import { Search, Moon, Sun, ShieldCheck, Truck, UserCircle } from "lucide-react";

import { logout } from "@/services/auth";
import {
  formatRoleLabel,
  getInitials,
  type CurrentUser,
  type UserRole,
} from "@/types/user";

type TopbarProps = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  currentUser: CurrentUser | null;
  role: UserRole;
};

export default function Topbar({
  darkMode,
  setDarkMode,
  currentUser,
  role,
}: TopbarProps) {
  const RoleIcon =
    role === "admin"
      ? ShieldCheck
      : role === "driver"
        ? Truck
        : UserCircle;

  const initials = getInitials(currentUser?.username);
  const roleLabel = formatRoleLabel(currentUser?.role);

  const subtitleByRole: Record<UserRole, string> = {
    admin: "Operational command · fleet · analytics · AI dispatch",
    manager: "Dispatch control · analytics · live tracking",
    driver: "Assigned routes · vehicle status · fuel intelligence",
    client: "Shipment tracking · ETA · delivery intelligence",
  };

  return (
    <header className="relative z-50 shrink-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 lg:px-8 py-4 border-b transition-colors duration-300 border-transparent">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
              darkMode
                ? "bg-[#151515] border-white/[0.06]"
                : "bg-[#111111] border-black/5"
            }`}
          >
            <span className="text-white text-sm font-bold tracking-tight">J</span>
          </div>
          <div>
            <h1
              className={`text-[26px] sm:text-[30px] font-bold tracking-[-0.04em] leading-none truncate ${
                darkMode ? "text-[#FAFAFA]" : "text-[#111827]"
              }`}
            >
              Javiator
            </h1>
            <p
              className={`text-[12px] mt-1.5 tracking-wide ${
                darkMode ? "text-[#A1A1AA]" : "text-[#6B7280]"
              }`}
            >
              {subtitleByRole[role]}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <div
          className={`flex flex-1 sm:flex-initial sm:w-[min(400px,38vw)] h-[46px] rounded-full px-4 items-center gap-3 border transition-all duration-200 focus-within:ring-1 ${
            darkMode
              ? "bg-[#111111] border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4)] focus-within:ring-white/10"
              : "bg-white border-[#E5E7EB] shadow-[0_4px_20px_rgba(15,23,42,0.05)] focus-within:ring-[#111827]/10"
          }`}
        >
          <Search
            className={`w-4 h-4 shrink-0 ${
              darkMode ? "text-[#71717A]" : "text-[#9CA3AF]"
            }`}
          />
          <input
            type="search"
            placeholder="Search fleet, routes, orders…"
            className={`bg-transparent outline-none text-sm w-full ${
              darkMode
                ? "text-[#FAFAFA] placeholder:text-[#52525B]"
                : "text-[#111827] placeholder:text-[#9CA3AF]"
            }`}
          />
          <kbd
            className={`hidden md:inline text-[10px] font-medium px-1.5 py-0.5 rounded border ${
              darkMode
                ? "border-white/[0.08] text-[#52525B]"
                : "border-[#E5E7EB] text-[#9CA3AF]"
            }`}
          >
            ⌘K
          </kbd>
        </div>

        {currentUser && (
          <button
            type="button"
            onClick={logout}
            className={`hidden xl:flex items-center gap-3 h-[46px] pl-1.5 pr-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
              darkMode
                ? "bg-[#111111] border-white/[0.05] hover:border-white/[0.08]"
                : "bg-white border-[#E5E7EB] hover:border-[#D1D5DB]"
            }`}
          >
            <div className="relative">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold border ${
                  darkMode
                    ? "bg-[#151515] border-white/[0.06] text-[#E4E4E7]"
                    : "bg-[#F3F4F6] border-[#E5E7EB] text-[#374151]"
                }`}
              >
                {initials}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 ${
                  currentUser.is_online
                    ? "bg-emerald-500 border-[#111111]"
                    : darkMode
                      ? "bg-[#52525B] border-[#111111]"
                      : "bg-[#9CA3AF] border-white"
                }`}
              />
            </div>
            <div className="text-left leading-tight">
              <p
                className={`text-[13px] font-semibold ${
                  darkMode ? "text-[#FAFAFA]" : "text-[#111827]"
                }`}
              >
                {currentUser.username}
              </p>
              <p
                className={`text-[10px] uppercase tracking-[0.12em] flex items-center gap-1 ${
                  darkMode ? "text-[#71717A]" : "text-[#9CA3AF]"
                }`}
              >
                <RoleIcon className="w-3 h-3" />
                {roleLabel}
              </p>
            </div>
          </button>
        )}

        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center border transition-all duration-200 hover:-translate-y-0.5 ${
            darkMode
              ? "bg-[#111111] border-white/[0.05] text-[#E5E5E5] hover:bg-[#151515]"
              : "bg-white border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAFC]"
          }`}
        >
          {darkMode ? (
            <Sun className="w-[18px] h-[18px]" />
          ) : (
            <Moon className="w-[18px] h-[18px]" />
          )}
        </button>

        <NotificationCenter darkMode={darkMode} />
      </div>
    </header>
  );
}

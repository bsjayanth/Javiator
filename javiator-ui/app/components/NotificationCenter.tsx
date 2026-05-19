"use client";

import {

  Bell,
  AlertTriangle,
  Truck,
  Activity,
  CheckCircle2,
  Fuel,

} from "lucide-react";

import {

  useEffect,
  useRef,
  useState,

} from "react";

import { apiFetch }
from "@/services/api";

// =====================================================
// 🚀 TYPES
// =====================================================

type Notification = {

  id: number;

  title: string;

  message: string;

  alert_type: string;

  severity: string;

  is_read: boolean;

  created_at: string;
};

type Props = {

  darkMode: boolean;
};

export default function NotificationCenter({

  darkMode,

}: Props) {

  // =====================================================
  // 🚀 STATES
  // =====================================================

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  // =====================================================
  // 🚀 FETCH NOTIFICATIONS
  // =====================================================

  const fetchNotifications =
    async () => {

      try {

        const data =
          await apiFetch(
            "/api/notifications/"
          );

        setNotifications(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.error(
          "Notification fetch error:",
          err
        );

      } finally {

        setLoading(false);
      }
    };

  // =====================================================
  // 🚀 FETCH UNREAD COUNT
  // =====================================================

  const fetchUnreadCount =
    async () => {

      try {

        const data =
          await apiFetch(
            "/api/notifications/unread-count/"
          );

        setUnreadCount(
          data?.unread_count || 0
        );

      } catch (err) {

        console.error(
          "Unread count error:",
          err
        );
      }
    };

  // =====================================================
  // 🚀 MARK ALL READ
  // =====================================================

  const markAllRead =
    async () => {

      try {

        await apiFetch(

          "/api/notifications/mark-all-read/",

          {
            method: "POST",
          }
        );

        setNotifications(
          (prev) =>

            prev.map(
              (notification) => ({

                ...notification,

                is_read: true,
              })
            )
        );

        setUnreadCount(0);

      } catch (err) {

        console.error(
          "Mark read error:",
          err
        );
      }
    };

  // =====================================================
  // 🚀 INITIAL LOAD
  // =====================================================

  useEffect(() => {

    fetchNotifications();

    fetchUnreadCount();

    const interval =
      setInterval(() => {

        fetchNotifications();

        fetchUnreadCount();

      }, 5000);

    return () =>
      clearInterval(interval);

  }, []);

  // =====================================================
  // 🚀 CLICK OUTSIDE
  // =====================================================

  useEffect(() => {

    function handleClickOutside(
      event: MouseEvent
    ) {

      if (

        dropdownRef.current

        &&

        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {

        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);

  // =====================================================
  // 🚀 ICONS
  // =====================================================

  const getIcon = (
    type: string
  ) => {

    const cls =
      darkMode
        ? "text-[#A1A1AA]"
        : "text-[#6B7280]";

    switch (type) {

      case "fuel":

        return (
          <Fuel
            className={cls}
            size={16}
          />
        );

      case "dispatch":

        return (
          <Truck
            className={cls}
            size={16}
          />
        );

      case "analytics":

        return (
          <Activity
            className={cls}
            size={16}
          />
        );

      case "delivery":

        return (
          <CheckCircle2
            className={cls}
            size={16}
          />
        );

      default:

        return (
          <AlertTriangle
            className={cls}
            size={16}
          />
        );
    }
  };

  // =====================================================
  // 🚀 SEVERITY STYLES
  // =====================================================

  const getSeverityStyle = (
    severity: string
  ) => {

    if (darkMode) {

      switch (severity) {

        case "critical":

          return "border-white/[0.12] bg-white/[0.04]";

        case "warning":

          return "border-white/[0.08] bg-white/[0.03]";

        default:

          return "border-white/[0.06] bg-[#111111]";
      }
    }

    switch (severity) {

      case "critical":

        return "border-[#D1D5DB] bg-[#F3F4F6]";

      case "warning":

        return "border-[#E5E7EB] bg-[#F9FAFB]";

      default:

        return "border-[#E5E7EB] bg-white";
    }
  };

  // =====================================================
  // 🚀 THEME
  // =====================================================

  const panelShell =
    darkMode
      ? "border-white/[0.06] bg-[#111111]/98 backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
      : "border-[#E5E7EB] bg-white/98 backdrop-blur-xl shadow-[0_24px_64px_rgba(15,23,42,0.08)]";

  const headerBorder =
    darkMode
      ? "border-white/[0.06]"
      : "border-[#E5E7EB]";

  // =====================================================
  // 🚀 UI
  // =====================================================

  return (

    <div
      className="relative z-50"
      ref={dropdownRef}
    >

      {/* ================================================= */}
      {/* 🚀 BELL BUTTON */}
      {/* ================================================= */}

      <button
        type="button"
        onClick={() =>
          setOpen(!open)
        }
        aria-expanded={open}
        aria-haspopup="true"
        className={`relative w-12 h-12 rounded-2xl border flex items-center justify-center transition-colors duration-200 shadow-sm ${
          darkMode
            ? "bg-[#111111] border-white/[0.06] text-[#E4E4E7] hover:bg-[#171717]"
            : "bg-white border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAFC]"
        }`}
      >

        <Bell size={18} />

        {unreadCount > 0 && (

          <div
            className={`absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full flex items-center justify-center text-[10px] font-semibold px-1 ${
              darkMode
                ? "bg-[#F5F5F5] text-[#111111]"
                : "bg-[#111111] text-white"
            }`}
          >

            {unreadCount}

          </div>
        )}

      </button>

      {/* ================================================= */}
      {/* 🚀 DROPDOWN */}
      {/* ================================================= */}

      {open && (

        <div
          className={`absolute right-0 top-[58px] w-[min(360px,calc(100vw-2rem))] rounded-3xl border overflow-hidden z-50 ${panelShell}`}
        >

          {/* HEADER */}

          <div
            className={`px-5 py-4 border-b flex items-center justify-between ${headerBorder}`}
          >

            <div>

              <h2
                className={`text-base font-semibold ${
                  darkMode
                    ? "text-[#F5F5F5]"
                    : "text-[#111827]"
                }`}
              >

                Notifications

              </h2>

              <p
                className={`text-xs mt-1 ${
                  darkMode
                    ? "text-[#A1A1AA]"
                    : "text-[#6B7280]"
                }`}
              >

                Operational intelligence feed

              </p>

            </div>

            <button
              type="button"
              onClick={markAllRead}
              className={`text-[11px] font-medium transition-colors ${
                darkMode
                  ? "text-[#D4D4D8] hover:text-white"
                  : "text-[#4B5563] hover:text-[#111827]"
              }`}
            >

              Mark all read

            </button>

          </div>

          {/* CONTENT */}

          <div className="max-h-[420px] overflow-y-auto py-2">

            {loading ? (

              <div
                className={`p-8 text-center text-sm ${
                  darkMode
                    ? "text-[#A1A1AA]"
                    : "text-[#6B7280]"
                }`}
              >

                Loading notifications...

              </div>

            ) : notifications.length === 0 ? (

              <div
                className={`p-8 text-center text-sm ${
                  darkMode
                    ? "text-[#A1A1AA]"
                    : "text-[#6B7280]"
                }`}
              >

                All systems operational — no alerts in queue

              </div>

            ) : (

              notifications.map(
                (notification) => (

                  <div
                    key={notification.id}
                    className={`mx-3 my-2 rounded-2xl border p-3.5 transition-colors ${
                      getSeverityStyle(
                        notification.severity
                      )
                    } ${
                      darkMode
                        ? "hover:bg-white/[0.03]"
                        : "hover:bg-[#F8FAFC]"
                    }`}
                  >

                    <div className="flex gap-3">

                      <div className="mt-0.5 shrink-0">

                        {getIcon(
                          notification.alert_type
                        )}

                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="flex items-center justify-between gap-2">

                          <h3
                            className={`text-[13px] font-semibold truncate ${
                              darkMode
                                ? "text-[#F5F5F5]"
                                : "text-[#111827]"
                            }`}
                          >

                            {notification.title}

                          </h3>

                          {!notification.is_read && (

                            <div
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                darkMode
                                  ? "bg-[#D4D4D8]"
                                  : "bg-[#111827]"
                              }`}
                            />

                          )}

                        </div>

                        <p
                          className={`text-[12px] mt-1.5 leading-relaxed ${
                            darkMode
                              ? "text-[#A1A1AA]"
                              : "text-[#6B7280]"
                          }`}
                        >

                          {notification.message}

                        </p>

                        <p
                          className={`text-[10px] mt-2 ${
                            darkMode
                              ? "text-[#71717A]"
                              : "text-[#9CA3AF]"
                          }`}
                        >

                          {new Date(
                            notification.created_at
                          ).toLocaleString()}

                        </p>

                      </div>

                    </div>

                  </div>
                )
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}
"use client";

import {

  Truck,
  Fuel,
  Activity,
  CheckCircle2,
  AlertTriangle,

} from "lucide-react";

import {

  useEffect,
  useState,

} from "react";

type Notification = {

  id: number;

  title: string;

  message: string;

  alert_type: string;

  severity: string;

  created_at: string;
};

type Props = {

  darkMode: boolean;
};

const iconClass = (
  dark: boolean
) =>
  dark
    ? "w-4 h-4 text-[#71717A]"
    : "w-4 h-4 text-[#9CA3AF]";

export default function ActivityFeed({

  darkMode,

}: Props) {

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const fetchNotifications = async () => {

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/api/notifications/"
      );

      const data = await res.json();

      setNotifications(
        data.slice(0, 8)
      );

    } catch (err) {

      console.error(
        "Activity feed error:",
        err
      );
    }
  };

  useEffect(() => {

    fetchNotifications();

    const interval = setInterval(
      fetchNotifications,
      3000
    );

    return () =>
      clearInterval(interval);

  }, []);

  const getIcon = (
    type: string
  ) => {

    const cls =
      iconClass(darkMode);

    switch (type) {

      case "dispatch":

        return (
          <Truck
            className={cls}
          />
        );

      case "fuel":

        return (
          <Fuel
            className={cls}
          />
        );

      case "analytics":

        return (
          <Activity
            className={cls}
          />
        );

      case "delivery":

        return (
          <CheckCircle2
            className={cls}
          />
        );

      default:

        return (
          <AlertTriangle
            className={cls}
          />
        );
    }
  };

  return (

    <div
      className={`rounded-3xl border p-5 transition-colors ${
        darkMode
          ? "bg-[#171717] border-white/[0.06]"
          : "bg-[#F8FAFC] border-[#E5E7EB]"
      }`}
    >

      <div className="mb-5 flex items-start justify-between gap-3">

        <div>

          <h3
            className={`text-lg font-semibold tracking-tight ${
              darkMode
                ? "text-[#F5F5F5]"
                : "text-[#111827]"
            }`}
          >

            Live activity

          </h3>

          <p
            className={`text-sm mt-1 ${
              darkMode
                ? "text-[#A1A1AA]"
                : "text-[#6B7280]"
            }`}
          >

            Realtime operational events

          </p>

        </div>

        <button
          type="button"
          className={`shrink-0 text-xs font-medium transition-colors ${
            darkMode
              ? "text-[#A3A3A3] hover:text-[#E5E5E5]"
              : "text-[#6B7280] hover:text-[#111827]"
          }`}
        >

          View all

        </button>

      </div>

      <div className="space-y-2.5">

        {notifications.map(
          (notification) => (

            <div
              key={notification.id}
              className={`rounded-2xl border p-4 transition-all duration-200 hover:translate-x-0.5 ${
                darkMode
                  ? "bg-[#111111] border-white/[0.06] hover:border-white/[0.09]"
                  : "bg-white border-[#E5E7EB] hover:border-[#D1D5DB]"
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

                    <h4
                      className={`text-sm font-semibold truncate ${
                        darkMode
                          ? "text-[#F5F5F5]"
                          : "text-[#111827]"
                      }`}
                    >

                      {notification.title}

                    </h4>

                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        darkMode
                          ? "bg-[#52525B]"
                          : "bg-[#D1D5DB]"
                      }`}
                    />

                  </div>

                  <p
                    className={`text-[12px] mt-1 leading-relaxed ${
                      darkMode
                        ? "text-[#A1A1AA]"
                        : "text-[#6B7280]"
                    }`}
                  >

                    {notification.message}

                  </p>

                  <p
                    className={`text-[10px] mt-2 tracking-wide ${
                      darkMode
                        ? "text-[#71717A]"
                        : "text-[#9CA3AF]"
                    }`}
                  >

                    {new Date(
                      notification.created_at
                    ).toLocaleTimeString()}

                  </p>

                </div>

              </div>

            </div>
          )
        )}

      </div>

    </div>
  );
}

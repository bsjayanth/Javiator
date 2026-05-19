"use client";

import {
  Clock,
  MapPin,
  Package,
  Radio,
  Truck,
} from "lucide-react";

import { useEffect, useState } from "react";

import { apiFetch } from "@/services/api";

type Order = {
  id: number;
  customer_name?: string;
  status?: string;
  eta_minutes?: number;
  delivery_completed?: boolean;
};

type Props = {
  darkMode: boolean;
};

export default function ClientTrackingPanel({ darkMode }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/api/orders/");
        setOrders(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`col-span-3 rounded-3xl border overflow-y-auto min-h-0 shadow-sm transition-colors duration-300 ${
        darkMode
          ? "bg-[#111111] border-white/[0.05]"
          : "bg-white border-[#E5E7EB]"
      }`}
    >
      <div className="p-5 lg:p-6 space-y-5">
        <header>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 rounded-full bg-emerald-500/90">
              <span className="absolute inset-0 rounded-full bg-emerald-500/50 animate-ping opacity-40" />
            </span>
            <span
              className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                darkMode ? "text-[#A1A1AA]" : "text-[#6B7280]"
              }`}
            >
              Live tracking
            </span>
          </div>
          <h2
            className={`mt-3 text-[28px] font-bold tracking-[-0.03em] leading-none ${
              darkMode ? "text-[#FAFAFA]" : "text-[#111827]"
            }`}
          >
            Shipment intelligence
          </h2>
          <p
            className={`text-sm mt-2 ${
              darkMode ? "text-[#A1A1AA]" : "text-[#6B7280]"
            }`}
          >
            Realtime ETA and delivery status across your network
          </p>
        </header>

        {loading ? (
          <p
            className={`text-sm ${
              darkMode ? "text-[#71717A]" : "text-[#9CA3AF]"
            }`}
          >
            Synchronizing shipment telemetry...
          </p>
        ) : orders.length === 0 ? (
          <div
            className={`rounded-2xl border p-8 text-center ${
              darkMode
                ? "bg-[#151515] border-white/[0.05]"
                : "bg-[#F8FAFC] border-[#E5E7EB]"
            }`}
          >
            <Package
              className={`w-8 h-8 mx-auto mb-3 ${
                darkMode ? "text-[#52525B]" : "text-[#9CA3AF]"
              }`}
            />
            <p
              className={`text-sm font-medium ${
                darkMode ? "text-[#E4E4E7]" : "text-[#374151]"
              }`}
            >
              No active shipments in transit
            </p>
            <p
              className={`text-xs mt-2 ${
                darkMode ? "text-[#71717A]" : "text-[#9CA3AF]"
              }`}
            >
              Your delivery network is standing by for the next dispatch window
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li
                key={order.id}
                className={`rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 ${
                  darkMode
                    ? "bg-[#151515] border-white/[0.05] hover:border-white/[0.08]"
                    : "bg-[#F8FAFC] border-[#E5E7EB] hover:border-[#D1D5DB]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center ${
                        darkMode
                          ? "bg-[#111111] border-white/[0.06] text-[#A1A1AA]"
                          : "bg-white border-[#E5E7EB] text-[#6B7280]"
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          darkMode ? "text-[#FAFAFA]" : "text-[#111827]"
                        }`}
                      >
                        Order #{order.id}
                      </p>
                      <p
                        className={`text-xs mt-0.5 truncate ${
                          darkMode ? "text-[#71717A]" : "text-[#9CA3AF]"
                        }`}
                      >
                        {order.customer_name || "Shipment in network"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-full border ${
                      order.delivery_completed
                        ? darkMode
                          ? "border-white/[0.08] text-[#A1A1AA]"
                          : "border-[#E5E7EB] text-[#6B7280]"
                        : darkMode
                          ? "border-emerald-500/20 text-emerald-400/90"
                          : "border-emerald-200 text-emerald-700"
                    }`}
                  >
                    {order.delivery_completed
                      ? "Delivered"
                      : order.status || "In transit"}
                  </span>
                </div>
                <div
                  className={`mt-3 flex items-center gap-4 text-xs ${
                    darkMode ? "text-[#A1A1AA]" : "text-[#6B7280]"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    ETA{" "}
                    {order.eta_minutes != null
                      ? `${Math.round(order.eta_minutes)} min`
                      : "calculating"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Route active
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div
          className={`rounded-2xl border p-4 flex items-center gap-3 ${
            darkMode
              ? "bg-[#151515] border-white/[0.05]"
              : "bg-[#F8FAFC] border-[#E5E7EB]"
          }`}
        >
          <Radio
            className={`w-4 h-4 shrink-0 ${
              darkMode ? "text-[#A1A1AA]" : "text-[#6B7280]"
            }`}
          />
          <p
            className={`text-xs leading-relaxed ${
              darkMode ? "text-[#A1A1AA]" : "text-[#6B7280]"
            }`}
          >
            Predictive ETA engine active — congestion and route optimization
            applied in realtime.
          </p>
        </div>
      </div>
    </div>
  );
}

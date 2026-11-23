"use client";

import {
  Truck,
  Activity,
  Package,
  Fuel,
  Target,
} from "lucide-react";

type FleetKpis = {
  total_vehicles: number;
  active_vehicles: number;
  moving_vehicles: number;
  low_fuel_vehicles: number;
  total_orders?: number;
  order_fulfillment?: number | null;
};

type Props = {
  darkMode: boolean;
  kpis: FleetKpis;
  compact?: boolean;
};

export default function KpiGrid({
  darkMode,
  kpis,
  compact = false,
}: Props) {
  const fulfillmentPct =
    kpis.order_fulfillment !== undefined ? kpis.order_fulfillment : null;

  const cards = [
    {
      title: "Total vehicles",
      value: kpis.total_vehicles,
      icon: Package,
      format: "int" as const,
    },
    {
      title: "Active vehicles",
      value: kpis.active_vehicles,
      icon: Truck,
      format: "int" as const,
    },
    {
      title: "Moving now",
      value: kpis.moving_vehicles,
      icon: Activity,
      format: "int" as const,
    },
    {
      title: "Low fuel",
      value: kpis.low_fuel_vehicles,
      icon: Fuel,
      format: "int" as const,
    },
    {
      title: "Order fulfillment",
      value: fulfillmentPct,
      icon: Target,
      format: "pct" as const,
    },
  ];

  const visibleCards = compact
    ? cards.filter((c) =>
        ["Moving now", "Low fuel", "Order fulfillment"].includes(c.title)
      )
    : cards;

  return (
    <div
      className={`grid gap-3 sm:gap-4 ${
        compact
          ? "grid-cols-1 sm:grid-cols-3"
          : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"
      }`}
    >
      {visibleCards.map((item, index) => {
        const Icon = item.icon;
        const display =
          item.format === "pct"
            ? item.value === null
              ? "—"
              : `${item.value}%`
            : item.value;

        return (
          <div
            key={index}
            className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 ${
              darkMode
                ? "bg-[#111111] border-white/[0.05] hover:border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
                : "bg-white border-[#E5E7EB] shadow-[0_1px_0_rgba(0,0,0,0.04)] hover:border-[#D1D5DB] hover:shadow-md"
            }`}
          >
            <div
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${
                darkMode
                  ? "border-white/[0.06] bg-[#161616] text-[#A3A3A3]"
                  : "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
            </div>

            <p
              className={`mt-4 text-[28px] sm:text-[32px] leading-none font-bold tracking-[-0.03em] tabular-nums ${
                darkMode ? "text-[#FAFAFA]" : "text-[#111827]"
              }`}
            >
              {display}
            </p>

            <p
              className={`mt-2 text-[12px] font-medium leading-snug ${
                darkMode ? "text-[#737373]" : "text-[#6B7280]"
              }`}
            >
              {item.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import {

  Truck,
  Activity,
  Package,
  Fuel,
  Target,

} from "lucide-react";

import {

  useEffect,
  useState,

} from "react";

type FleetKpis = {

  total_vehicles: number;

  active_vehicles: number;

  moving_vehicles: number;

  low_fuel_vehicles: number;
};

type Props = {

  darkMode: boolean;

  kpis: FleetKpis;
};

export default function KpiGrid({

  darkMode,

  kpis,

}: Props) {

  const [fulfillmentPct, setFulfillmentPct] =
    useState<number | null>(null);

  useEffect(() => {

    const load = async () => {

      try {

        const res = await fetch(

          "http://127.0.0.1:8000/api/analytics/dashboard/"
        );

        const data = await res.json();

        const total =
          Number(data.total_orders) || 0;

        const done =
          Number(data.completed_orders) || 0;

        if (total <= 0) {

          setFulfillmentPct(null);

          return;
        }

        setFulfillmentPct(

          Math.round(
            (done / total) * 100
          )
        );

      } catch {

        setFulfillmentPct(null);

      }
    };

    load();

    const t = setInterval(
      load,
      5000
    );

    return () =>
      clearInterval(t);

  }, []);

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

  return (

    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">

      {cards.map((item, index) => {

        const Icon =
          item.icon;

        const display =
          item.format === "pct"

            ? item.value === null
              ? "—"
              : `${item.value}%`

            : item.value;

        return (

          <div
            key={index}
            className={`rounded-2xl border p-4 sm:p-5 transition-colors duration-200 ${
              darkMode
                ? "bg-[#111111] border-white/[0.05] hover:border-white/[0.08]"
                : "bg-white border-[#E5E7EB] shadow-[0_1px_0_rgba(0,0,0,0.04)] hover:border-[#D1D5DB]"
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
                darkMode
                  ? "text-[#FAFAFA]"
                  : "text-[#111827]"
              }`}
            >

              {display}

            </p>

            <p
              className={`mt-2 text-[12px] font-medium leading-snug ${
                darkMode
                  ? "text-[#737373]"
                  : "text-[#6B7280]"
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

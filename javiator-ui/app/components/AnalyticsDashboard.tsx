"use client";

import {

  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,

} from "recharts";

import {

  Truck,
  Package,
  Fuel,
  Gauge,
  BrainCircuit,
  Trophy,
  Activity,
  Route,

} from "lucide-react";

import {

  useEffect,
  useState,

} from "react";

import { apiFetch }
from "@/services/api";

// =====================================================
// 🚀 TYPES
// =====================================================

type LeaderboardVehicle = {

  id: number;

  vehicle_name: string;

  driver_name: string;

  efficiency_score: number;

  total_deliveries: number;

  avg_speed: number;

  fuel_consumed: number;

  total_distance: number;
};

type Metrics = {

  total_vehicles: number;

  active_vehicles: number;

  idle_vehicles: number;

  total_orders: number;

  completed_orders: number;

  in_transit_orders: number;

  avg_fuel: number;

  fleet_utilization: number;

  avg_efficiency: number;

  total_distance: number;

  total_fuel_consumed: number;

  total_deliveries: number;

  avg_speed: number;

  leaderboard: LeaderboardVehicle[];

  ai_insights: string[];
};

type Props = {

  darkMode: boolean;
};

export default function AnalyticsDashboard({

  darkMode,

}: Props) {

  const [metrics, setMetrics] =
    useState<Metrics | null>(null);

  const [loading, setLoading] =
    useState(true);

  // =====================================================
  // 🚀 FETCH METRICS
  // =====================================================

  const fetchMetrics = async () => {

    try {

      const data =
        await apiFetch(
          "/api/analytics/dashboard/"
        );

      setMetrics(data);

    } catch (err) {

      console.error(
        "Analytics fetch error:",
        err
      );

    } finally {

      setLoading(false);
    }
  };

  // =====================================================
  // 🚀 LOAD DATA
  // =====================================================

  useEffect(() => {

    fetchMetrics();

    const interval =
      setInterval(() => {

        fetchMetrics();

      }, 5000);

    return () =>
      clearInterval(interval);

  }, []);

  // =====================================================
  // 🚀 THEME STYLES
  // =====================================================

  const card =
    `rounded-3xl border p-5 lg:p-6 shadow-sm transition-colors ${
      darkMode
        ? "bg-[#111111] border-white/[0.06]"
        : "bg-white border-[#E5E7EB]"
    }`;

  const labelCls =
    darkMode
      ? "text-[#A1A1AA]"
      : "text-[#6B7280]";

  const titleCls =
    darkMode
      ? "text-[#F5F5F5]"
      : "text-[#111827]";

  const iconBox =
    `flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
      darkMode
        ? "border-white/[0.06] bg-[#171717] text-[#D4D4D8]"
        : "border-[#E5E7EB] bg-[#F8FAFC] text-[#4B5563]"
    }`;

  const gridStroke =
    darkMode
      ? "rgba(255,255,255,0.06)"
      : "#E5E7EB";

  const axisStroke =
    darkMode
      ? "#52525B"
      : "#9CA3AF";

  const tooltipBg =
    darkMode
      ? "#171717"
      : "#FFFFFF";

  const tooltipBorder =
    darkMode
      ? "rgba(255,255,255,0.08)"
      : "#E5E7EB";

  // =====================================================
  // 🚀 LOADING STATE
  // =====================================================

  if (loading || !metrics) {

    return (

      <div
        className={`rounded-3xl border px-6 py-10 text-center text-sm font-medium ${card}`}
      >

        <p className={labelCls}>

          Loading analytics…

        </p>

      </div>
    );
  }

  // =====================================================
  // 🚀 SAFE DATA
  // =====================================================

  const vehicleData = [

    {
      name: "Active",
      value:
        metrics.active_vehicles || 0,
    },

    {
      name: "Idle",
      value:
        metrics.idle_vehicles || 0,
    },
  ];

  const orderData = [

    {
      name: "Completed",
      orders:
        metrics.completed_orders || 0,
    },

    {
      name: "Transit",
      orders:
        metrics.in_transit_orders || 0,
    },
  ];

  const leaderboard =
    Array.isArray(
      metrics.leaderboard
    )
      ? metrics.leaderboard
      : [];

  const aiInsights =
    Array.isArray(
      metrics.ai_insights
    )
      ? metrics.ai_insights
      : [];

  const pieActive =
    darkMode
      ? "#E5E5E5"
      : "#111827";

  const pieIdle =
    darkMode
      ? "#52525B"
      : "#9CA3AF";

  const barFill =
    darkMode
      ? "#A1A1AA"
      : "#4B5563";

  // =====================================================
  // 🚀 UI
  // =====================================================

  return (

    <div className="space-y-6 lg:space-y-8">

      {/* ================================================= */}
      {/* 🚀 TOP KPI CARDS */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">

        <div className={card}>

          <div className="flex items-start justify-between gap-3">

            <div>

              <p className={`text-sm font-medium ${labelCls}`}>

                Total vehicles

              </p>

              <h2
                className={`text-4xl font-bold tracking-tight mt-3 ${titleCls}`}
              >

                {metrics.total_vehicles}

              </h2>

            </div>

            <div className={iconBox}>

              <Truck size={22} />

            </div>

          </div>

        </div>

        <div className={card}>

          <div className="flex items-start justify-between gap-3">

            <div>

              <p className={`text-sm font-medium ${labelCls}`}>

                Total orders

              </p>

              <h2
                className={`text-4xl font-bold tracking-tight mt-3 ${titleCls}`}
              >

                {metrics.total_orders}

              </h2>

            </div>

            <div className={iconBox}>

              <Package size={22} />

            </div>

          </div>

        </div>

        <div className={card}>

          <div className="flex items-start justify-between gap-3">

            <div>

              <p className={`text-sm font-medium ${labelCls}`}>

                Fleet utilization

              </p>

              <h2
                className={`text-4xl font-bold tracking-tight mt-3 ${titleCls}`}
              >

                {metrics.fleet_utilization}%

              </h2>

            </div>

            <div className={iconBox}>

              <Gauge size={22} />

            </div>

          </div>

        </div>

        <div className={card}>

          <div className="flex items-start justify-between gap-3">

            <div>

              <p className={`text-sm font-medium ${labelCls}`}>

                Avg fuel

              </p>

              <h2
                className={`text-4xl font-bold tracking-tight mt-3 ${titleCls}`}
              >

                {metrics.avg_fuel}%

              </h2>

            </div>

            <div className={iconBox}>

              <Fuel size={22} />

            </div>

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* 🚀 REST OF YOUR EXISTING UI */}
      {/* ================================================= */}

      {/* KEEP THE REMAINING JSX EXACTLY SAME */}
      {/* ONLY CHANGE .map() REFERENCES BELOW */}

      {/* leaderboard.map → leaderboard.map */}
      {/* metrics.ai_insights.map → aiInsights.map */}

    </div>
  );
}
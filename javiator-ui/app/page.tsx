"use client";

import dynamic from "next/dynamic";

import {
  Truck,
  Package,
  Activity,
  BarChart3,
  Search,
  Bell,
  Moon,
  Sun
} from "lucide-react";

import { useState } from "react";

const FleetMap = dynamic(
  () => import("./components/FleetMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center text-slate-400 bg-[#0F172A]">
        Loading Map...
      </div>
    ),
  }
);

export default function Home() {

  const [darkMode, setDarkMode] = useState(true);

  return (

    <main
      className={`h-screen w-screen overflow-hidden flex transition-all duration-300 ${
        darkMode
          ? "bg-[#0B1220] text-white"
          : "bg-[#F4F7FB] text-black"
      }`}
    >

      {/* SIDEBAR */}

      <div
        className={`w-[90px] backdrop-blur-2xl border-r flex flex-col items-center py-6 gap-8 transition-all duration-300 ${
          darkMode
            ? "bg-white/5 border-white/10"
            : "bg-white border-slate-200"
        }`}
      >

        <div className="text-3xl font-bold">
          🚚
        </div>

        <button
          className={`p-3 rounded-2xl border transition ${
            darkMode
              ? "bg-[#00E5A8]/10 border-[#00E5A8]/20"
              : "bg-[#00E5A8]/20 border-[#00E5A8]/30"
          }`}
        >
          <Truck className="w-6 h-6 text-[#00E5A8]" />
        </button>

        <button className="p-3 rounded-2xl hover:bg-black/5 transition">
          <Package className="w-6 h-6 text-slate-400" />
        </button>

        <button className="p-3 rounded-2xl hover:bg-black/5 transition">
          <Activity className="w-6 h-6 text-slate-400" />
        </button>

        <button className="p-3 rounded-2xl hover:bg-black/5 transition">
          <BarChart3 className="w-6 h-6 text-slate-400" />
        </button>

      </div>

      {/* MAIN */}

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOPBAR */}

        <div
          className={`h-[80px] border-b backdrop-blur-xl flex items-center justify-between px-8 shrink-0 transition-all duration-300 ${
            darkMode
              ? "border-white/10 bg-white/5"
              : "border-slate-200 bg-white/70"
          }`}
        >

          <div>

            <h1 className="text-4xl font-bold tracking-tight">
              Javiator OS
            </h1>

            <p
              className={`text-sm mt-1 ${
                darkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              Intelligent Logistics Operating System
            </p>

          </div>

          <div className="flex items-center gap-4">

            {/* SEARCH */}

            <div
              className={`rounded-2xl px-4 py-2 flex items-center gap-2 w-[260px] border transition-all ${
                darkMode
                  ? "bg-white/10 border-white/10"
                  : "bg-white border-slate-300"
              }`}
            >

              <Search className="w-4 h-4 text-slate-400" />

              <input
                placeholder="Search vehicles..."
                className="bg-transparent outline-none text-sm w-full placeholder:text-slate-500"
              />

            </div>

            {/* THEME TOGGLE */}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-2xl border transition-all ${
                darkMode
                  ? "bg-white/10 border-white/10"
                  : "bg-white border-slate-300"
              }`}
            >

              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}

            </button>

            {/* NOTIFICATION */}

            <button className="bg-[#00E5A8] hover:scale-105 transition text-black p-3 rounded-2xl">

              <Bell className="w-5 h-5" />

            </button>

          </div>

        </div>

        {/* DASHBOARD */}

        <div className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">

          {/* LEFT SECTION */}

          <div className="col-span-9 flex flex-col gap-6 overflow-hidden">

            {/* KPI */}

            <div className="grid grid-cols-3 gap-6 shrink-0">

              {[
                {
                  title: "Fleet Utilization",
                  value: "84%"
                },
                {
                  title: "Delivery Success",
                  value: "97%"
                },
                {
                  title: "Active Vehicles",
                  value: "42"
                }
              ].map((item, index) => (

                <div
                  key={index}
                  className={`backdrop-blur-xl rounded-3xl p-6 shadow-lg border transition-all duration-300 ${
                    darkMode
                      ? "bg-white/5 border-white/10"
                      : "bg-white border-slate-200"
                  }`}
                >

                  <p
                    className={`text-sm ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    {item.title}
                  </p>

                  <h2 className="text-5xl font-bold mt-3">
                    {item.value}
                  </h2>

                </div>

              ))}

            </div>

            {/* MAP */}

            <div
              className={`flex-1 min-h-[700px] rounded-3xl overflow-hidden border shadow-2xl transition-all duration-300 ${
                darkMode
                  ? "border-white/10 bg-[#0F172A]"
                  : "border-slate-200 bg-white"
              }`}
            >

              <FleetMap />

            </div>

          </div>

          {/* RIGHT PANEL */}

          <div
            className={`col-span-3 backdrop-blur-xl rounded-3xl p-6 flex flex-col overflow-hidden border transition-all duration-300 ${
              darkMode
                ? "bg-white/5 border-white/10"
                : "bg-white border-slate-200"
            }`}
          >

            <h2 className="text-2xl font-bold mb-6 shrink-0">
              Live Dispatch Feed
            </h2>

            <div className="flex flex-col gap-4 overflow-y-auto pr-1">

              {[
                {
                  order: "#4821",
                  status: "Assigned to Truck 12"
                },
                {
                  order: "#4822",
                  status: "Route optimized by AI"
                },
                {
                  order: "#4823",
                  status: "Driver reached pickup point"
                }
              ].map((item, index) => (

                <div
                  key={index}
                  className={`rounded-2xl p-4 border transition-all duration-300 ${
                    darkMode
                      ? "bg-white/5 border-white/10 hover:bg-white/10"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >

                  <p className="font-semibold text-lg">
                    Order {item.order}
                  </p>

                  <p
                    className={`text-sm mt-1 ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    {item.status}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}
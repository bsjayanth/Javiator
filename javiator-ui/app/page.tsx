"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
  useState,
} from "react";

import AnalyticsDashboard from "./components/AnalyticsDashboard";

import Sidebar from "./components/layout/Sidebar";

import Topbar from "./components/layout/Topbar";

import KpiGrid from "./components/layout/KPIGrid";

import DispatchPanel from "./components/layout/DispatchPanel";

type FleetKpis = {

  total_vehicles: number;

  active_vehicles: number;

  moving_vehicles: number;

  low_fuel_vehicles: number;
};

type Vehicle = {

  id: number;

  name: string;

  vehicle_type: string;

  speed: number;

  fuel_level: number;

  driver_name: string;

  remaining_distance: number;

  eta_minutes: number;

  current_lat: number;

  current_lng: number;

  is_moving: boolean;

  route_data: [number, number][];

  route_index: number;
};

const FleetMap = dynamic(
  () => import("./components/FleetMap"),
  {
    ssr: false,

    loading: () => (

      <div className="h-full w-full flex items-center justify-center bg-[#0a0a0a] text-[#71717A]">

        <span className="text-sm font-medium tracking-wide">

          Loading fleet map…

        </span>

      </div>
    ),
  }
);

export default function Home() {

  const [darkMode, setDarkMode] =
    useState(true);

  const [selectedVehicle, setSelectedVehicle] =
    useState<Vehicle | null>(null);

  const [kpis, setKpis] =
    useState<FleetKpis>({

      total_vehicles: 0,

      active_vehicles: 0,

      moving_vehicles: 0,

      low_fuel_vehicles: 0,
    });

  // =====================================================
  // 🚀 FETCH KPIs
  // =====================================================

  const fetchKpis = async () => {

    try {

      const response = await fetch(

        "http://127.0.0.1:8000/api/fleet/kpis/"
      );

      const data = await response.json();

      setKpis(data);

    } catch (error) {

      console.error(
        "KPI fetch error:",
        error
      );
    }
  };

  // =====================================================
  // 🚀 LOAD DATA
  // =====================================================

  useEffect(() => {

    fetchKpis();

    const interval = setInterval(() => {

      fetchKpis();

    }, 5000);

    return () =>
      clearInterval(interval);

  }, []);

  return (

    <main
      className={`h-screen w-screen overflow-hidden flex transition-colors duration-300 ease-out ${
        darkMode
          ? "dark-shell bg-[#050505] text-[#FAFAFA]"
          : "bg-[#F9FAFB] text-[#111827]"
      }`}
    >

      {/* ================================================= */}
      {/* 🚀 SIDEBAR */}
      {/* ================================================= */}

      <Sidebar darkMode={darkMode} />

      {/* ================================================= */}
      {/* 🚀 MAIN CONTENT */}
      {/* ================================================= */}

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ================================================= */}
        {/* 🚀 TOPBAR */}
        {/* ================================================= */}

        <Topbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* ================================================= */}
        {/* 🚀 DASHBOARD GRID */}
        {/* ================================================= */}

        <div className="flex-1 grid grid-cols-12 gap-5 p-5 lg:gap-6 lg:p-6 overflow-hidden">

          {/* ================================================= */}
          {/* 🚀 LEFT SECTION */}
          {/* ================================================= */}

          <div className="col-span-9 flex flex-col gap-5 lg:gap-6 overflow-y-auto pr-1 min-h-0">

            {/* KPI GRID */}

            <KpiGrid
              darkMode={darkMode}
              kpis={kpis}
            />

            {/* ANALYTICS */}

            <AnalyticsDashboard
              darkMode={darkMode}
            />

            {/* ================================================= */}
            {/* 🚀 MAP CONTAINER */}
            {/* ================================================= */}

            <div
              className={`rounded-3xl overflow-hidden border min-h-[720px] lg:min-h-[780px] shadow-sm transition-colors duration-300 ${
                darkMode
                  ? "border-white/[0.05] bg-[#050505]"
                  : "border-[#E5E7EB] bg-white"
              }`}
            >

              <FleetMap
                darkMode={darkMode}
                selectedVehicle={
                  selectedVehicle
                }

                setSelectedVehicle={
                  setSelectedVehicle
                }
              />

            </div>

          </div>

          {/* ================================================= */}
          {/* 🚀 RIGHT SECTION */}
          {/* ================================================= */}

          <DispatchPanel
            darkMode={darkMode}
            selectedVehicle={
              selectedVehicle
            }
          />

        </div>

      </div>

    </main>
  );
}
"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/services/api";
import { getCurrentUser } from "@/services/auth";
import { getRoleCapabilities } from "@/lib/roles";
import type { CurrentUser } from "@/types/user";
import { normalizeRole } from "@/types/user";

import AnalyticsDashboard from "./components/AnalyticsDashboard";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import KpiGrid from "./components/layout/KPIGrid";
import DispatchPanel from "./components/layout/DispatchPanel";
import ClientTrackingPanel from "./components/layout/ClientTrackingPanel";

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

const FleetMap = dynamic(() => import("./components/FleetMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#050505] text-[#71717A]">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[#FAFAFA]">
          Loading fleet intelligence
        </h2>
        <p className="mt-2 text-sm">
          Connecting to realtime logistics network...
        </p>
      </div>
    </div>
  ),
});

export default function Home() {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [kpis, setKpis] = useState<FleetKpis>({
    total_vehicles: 0,
    active_vehicles: 0,
    moving_vehicles: 0,
    low_fuel_vehicles: 0,
  });

  const role = normalizeRole(currentUser?.role);
  const caps = useMemo(() => getRoleCapabilities(role), [role]);

  const loadUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchKpis = async () => {
    try {
      const data = await apiFetch("/api/fleet/kpis/");
      if (data) {
        setKpis({
          total_vehicles: Number(data.total_vehicles) || 0,
          active_vehicles: Number(data.active_vehicles) || 0,
          moving_vehicles: Number(data.moving_vehicles) || 0,
          low_fuel_vehicles: Number(data.low_fuel_vehicles) || 0,
        });
      }
    } catch (error) {
      console.error("KPI fetch error:", error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) {
          router.push("/login");
          return;
        }

        await Promise.all([loadUser(), fetchKpis()]);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [router]);

  useEffect(() => {
    if (loading || !caps.showKpis) return;

    const interval = setInterval(fetchKpis, 5000);
    return () => clearInterval(interval);
  }, [loading, caps.showKpis]);

  const mainColSpan = caps.showDispatch || role === "client" ? 9 : 12;

  if (loading) {
    return (
      <div className="w-screen h-screen bg-[#050505] flex items-center justify-center text-[#FAFAFA]">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight">Javiator</h1>
          <p className="mt-4 text-sm text-[#71717A] tracking-wide">
            Initializing AI-powered logistics intelligence...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main
      className={`h-screen w-screen overflow-hidden flex transition-colors duration-300 ease-out ${
        darkMode ? "dark-shell bg-[#050505] text-[#FAFAFA]" : "bg-[#F9FAFB] text-[#111827]"
      }`}
    >
      <Sidebar darkMode={darkMode} currentUser={currentUser} role={role} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          currentUser={currentUser}
          role={role}
        />

        <div className="flex-1 grid grid-cols-12 gap-5 p-5 lg:gap-6 lg:p-6 overflow-hidden">
          <div
            className={`col-span-${mainColSpan} flex flex-col gap-5 lg:gap-6 overflow-y-auto pr-1 min-h-0`}
            style={{ gridColumn: `span ${mainColSpan} / span ${mainColSpan}` }}
          >
            {caps.showKpis && (
              <KpiGrid darkMode={darkMode} kpis={kpis} compact={role === "driver"} />
            )}

            {role === "driver" && (
              <div
                className={`rounded-2xl border px-4 py-3 flex flex-wrap items-center gap-4 text-sm ${
                  darkMode
                    ? "bg-[#111111] border-white/[0.05]"
                    : "bg-white border-[#E5E7EB]"
                }`}
              >
                <span className={darkMode ? "text-[#A1A1AA]" : "text-[#6B7280]"}>
                  Route optimization active
                </span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span className={darkMode ? "text-[#FAFAFA]" : "text-[#111827]"}>
                  {kpis.low_fuel_vehicles > 0
                    ? `${kpis.low_fuel_vehicles} vehicle(s) below fuel threshold`
                    : "Fuel levels within operational range"}
                </span>
              </div>
            )}

            {caps.showAnalytics && (
              <AnalyticsDashboard darkMode={darkMode} />
            )}

            {caps.showFleetMap && (
              <div
                className={`rounded-3xl overflow-hidden border min-h-[520px] lg:min-h-[640px] transition-all duration-300 ${
                  darkMode
                    ? "border-white/[0.05] bg-[#0D0D0D] shadow-[0_24px_64px_rgba(0,0,0,0.45)]"
                    : "border-[#E5E7EB] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
                }`}
              >
                <FleetMap
                  darkMode={darkMode}
                  selectedVehicle={selectedVehicle}
                  setSelectedVehicle={setSelectedVehicle}
                />
              </div>
            )}
          </div>

          {role === "client" ? (
            <ClientTrackingPanel darkMode={darkMode} />
          ) : caps.showDispatch ? (
            <DispatchPanel
              darkMode={darkMode}
              selectedVehicle={selectedVehicle}
              showAiInsights={caps.showAiInsights}
              showActivityFeed={caps.showActivityFeed}
              variant={role === "driver" ? "driver" : "operations"}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}

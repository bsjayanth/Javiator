"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/services/api";
import { getCurrentUser } from "@/services/auth";
import { getRoleCapabilities } from "@/lib/roles";
import type { CurrentUser } from "@/types/user";
import { normalizeRole } from "@/types/user";

import AnalyticsDashboard from "./components/AnalyticsDashboard";
import VehicleTable from "./components/VehicleTable";
import OrderTable from "./components/OrderTable";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import KpiGrid from "./components/layout/KPIGrid";
import DispatchPanel from "./components/layout/DispatchPanel";
import ClientTrackingPanel from "./components/layout/ClientTrackingPanel";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Lazy-load FleetMap (Leaflet requires browser APIs — no SSR)
// ─────────────────────────────────────────────────────────────────────────────

const FleetMap = dynamic(() => import("./components/FleetMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#050505] text-[#71717A]">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[#FAFAFA]">Loading fleet intelligence</h2>
        <p className="mt-2 text-sm">Connecting to realtime logistics network...</p>
      </div>
    </div>
  ),
});

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────────

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

  // ── RBAC ───────────────────────────────────────────────────────────────────

  const role = normalizeRole(currentUser?.role);
  const caps = useMemo(() => getRoleCapabilities(role || ""), [role]);

  // ── Stable async callbacks ─────────────────────────────────────────────────
  // useCallback ensures intervals never hold a stale closure reference.

  const fetchKpis = useCallback(async () => {
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
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error("User load error:", err);
    }
  }, []);

  // ── Initialization — runs exactly once on mount ────────────────────────────
  // useRef guard prevents React 18 StrictMode double-invoke from hitting the
  // router redirect twice, and avoids adding `router` as a re-run trigger.

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

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
  }, [router, loadUser, fetchKpis]);

  // ── Auto-refresh KPIs every 5 s ───────────────────────────────────────────

  useEffect(() => {
    if (loading || !caps.showKpis) return;
    const interval = setInterval(fetchKpis, 5_000);
    return () => clearInterval(interval);
  }, [loading, caps.showKpis, fetchKpis]);

  // ── Derived layout flag ────────────────────────────────────────────────────
  // NOTE: Never use `col-span-${n}` — Tailwind purges dynamic class names at
  // build time. Drive column spans via inline style instead.

  const hasRightPanel = caps.showDispatch || role === "client";

  // ── Loading screen ─────────────────────────────────────────────────────────

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

  // ── Main UI ────────────────────────────────────────────────────────────────
  //
  // Scroll architecture:
  //   <main>              h-screen overflow-hidden  → locks shell to viewport
  //     <Sidebar>                                   → never scrolls
  //     <div>             flex-1 overflow-hidden    → content column
  //       <Topbar>                                  → pinned, never scrolls
  //       <div>           flex-1 overflow-y-auto    → ONLY this region scrolls
  //         <grid>
  //           <main-col>
  //           <right-panel>
  //         </grid>
  //       </div>
  //     </div>
  //   </main>

  return (
    <main
      className={`h-screen w-screen flex overflow-hidden transition-colors duration-300 ease-out ${
        darkMode
          ? "dark-shell bg-[#050505] text-[#FAFAFA]"
          : "bg-[#F9FAFB] text-[#111827]"
      }`}
    >
      {/* Sidebar */}
      <Sidebar darkMode={darkMode} currentUser={currentUser} role={role} />

      {/* Content column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar — stays pinned while body scrolls */}
        <Topbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          currentUser={currentUser}
          role={role}
        />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div
            className="grid gap-5 p-5 lg:gap-6 lg:p-6"
            style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}
          >

            {/* ── Main section ─────────────────────────────────────────── */}
            <div
              className="flex flex-col gap-5 lg:gap-6"
              style={{
                gridColumn: hasRightPanel ? "span 9 / span 9" : "span 12 / span 12",
              }}
            >
              {/* KPI Grid */}
              {caps.showKpis && (
                <KpiGrid darkMode={darkMode} kpis={kpis} compact={role === "driver"} />
              )}

              {/* Driver status banner */}
              {role === "driver" && (
                <div
                  className={`rounded-2xl border px-4 py-3 flex flex-wrap items-center gap-4 text-sm ${
                    darkMode ? "bg-[#111111] border-white/[0.05]" : "bg-white border-[#E5E7EB]"
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

              {/* Analytics dashboard */}
              {caps.showAnalytics && <AnalyticsDashboard darkMode={darkMode} />}

              {/* Vehicle table — admin / manager only */}
              {(role === "admin" || role === "manager") && (
                <VehicleTable darkMode={darkMode} />
              )}

              {/* Order table — admin / manager only */}
              {(role === "admin" || role === "manager") && (
                <OrderTable darkMode={darkMode} />
              )}

              {/* Fleet map */}
              {caps.showFleetMap && (
                <div
                  className={`rounded-3xl overflow-hidden border h-[500px] transition-all duration-300 ${
                    darkMode
                      ? "border-white/[0.05] bg-[#0D0D0D]"
                      : "border-[#E5E7EB] bg-white"
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

            {/* ── Right panel (3 cols) ──────────────────────────────────── */}
            {role === "client" ? (
              <div style={{ gridColumn: "span 3 / span 3" }}>
                <ClientTrackingPanel darkMode={darkMode} />
              </div>
            ) : caps.showDispatch ? (
              <div style={{ gridColumn: "span 3 / span 3" }}>
                <DispatchPanel
                  darkMode={darkMode}
                  selectedVehicle={selectedVehicle}
                  showAiInsights={caps.showAiInsights}
                  showActivityFeed={caps.showActivityFeed}
                  variant={role === "driver" ? "driver" : "operations"}
                />
              </div>
            ) : null}

          </div>
        </div>
      </div>
    </main>
  );
}
"use client";

import {

  useEffect,
  useMemo,
  useState,

} from "react";

import {

  Search,
  Truck,
  Fuel,
  Gauge,
  Clock3,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  ShieldAlert,

} from "lucide-react";

import AddVehicleModal from "./AddVehicleModal";


type Vehicle = {

  id: number;

  name: string;

  vehicle_type: string;

  driver_name: string;

  speed: number;

  fuel_level: number;

  current_lat: number;

  current_lng: number;

  is_available: boolean;

  is_moving: boolean;

  eta_minutes: number;

  efficiency_score: number;
};


type Props = {

  darkMode: boolean;

  role?: string | null;
};


export default function VehicleTable({

  darkMode,

  role,

}: Props) {

  const [vehicles, setVehicles] =
    useState<Vehicle[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  const [openAddModal, setOpenAddModal] =
    useState(false);


  // =====================================================
  // 🚀 RBAC
  // =====================================================

  const canManageFleet =

    role === "admin"
    ||
    role === "manager";

  const canViewFleet =

    role !== "client";


  // =====================================================
  // 🚀 FETCH VEHICLES
  // =====================================================

  const fetchVehicles =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "access"
          );

        const response =
          await fetch(

            "http://127.0.0.1:8000/api/fleet/vehicles/",

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {

          throw new Error(
            "Failed to fetch vehicles"
          );
        }

        const data =
          await response.json();

        setVehicles(data);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };


  // =====================================================
  // 🚀 AUTO REFRESH
  // =====================================================

  useEffect(() => {

    if (!canViewFleet)
      return;

    fetchVehicles();

    const interval =
      setInterval(() => {

        fetchVehicles();

      }, 5000);

    return () =>
      clearInterval(interval);

  }, [canViewFleet]);


  // =====================================================
  // 🚀 REFRESH BUTTON
  // =====================================================

  const handleRefresh =
    async () => {

      setRefreshing(true);

      await fetchVehicles();

      setTimeout(() => {

        setRefreshing(false);

      }, 600);
    };


  // =====================================================
  // 🚀 DELETE VEHICLE
  // =====================================================

  const handleDelete =
    async (id: number) => {

      if (!canManageFleet)
        return;

      const confirmDelete =
        confirm(
          "Delete this vehicle?"
        );

      if (!confirmDelete)
        return;

      try {

        const token =
          localStorage.getItem(
            "access"
          );

        const response =
          await fetch(

            `http://127.0.0.1:8000/api/fleet/vehicles/${id}/`,

            {

              method: "DELETE",

              headers: {

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {

          throw new Error(
            "Delete failed"
          );
        }

        fetchVehicles();

      } catch (error) {

        console.error(error);
      }
    };


  // =====================================================
  // 🚀 SEARCH FILTER
  // =====================================================

  const filteredVehicles =
    useMemo(() => {

      return vehicles.filter(
        (vehicle) => {

          const q =
            search.toLowerCase();

          return (

            vehicle.name
              .toLowerCase()
              .includes(q)

            ||

            vehicle.driver_name
              .toLowerCase()
              .includes(q)

            ||

            vehicle.vehicle_type
              .toLowerCase()
              .includes(q)
          );
        }
      );

    }, [vehicles, search]);


  // =====================================================
  // 🚀 STATUS BADGE
  // =====================================================

  const getStatus =
    (vehicle: Vehicle) => {

      if (
        vehicle.fuel_level < 10
      ) {

        return {

          label: "Low Fuel",

          color: darkMode

            ? "bg-red-500/15 text-red-400 border-red-500/20"

            : "bg-red-50 text-red-600 border-red-200",
        };
      }

      if (
        vehicle.is_moving
      ) {

        return {

          label: "Moving",

          color: darkMode

            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"

            : "bg-emerald-50 text-emerald-600 border-emerald-200",
        };
      }

      return {

        label: "Idle",

        color: darkMode

          ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/20"

          : "bg-yellow-50 text-yellow-700 border-yellow-200",
      };
    };


  // =====================================================
  // 🚀 CLIENT BLOCKED
  // =====================================================

  if (!canViewFleet) {

    return (

      <section
        className={`rounded-3xl border p-10 flex flex-col items-center justify-center text-center ${
          darkMode

            ? "bg-[#0F0F10] border-white/[0.05]"

            : "bg-white border-[#E5E7EB]"
        }`}
      >

        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${
            darkMode

              ? "bg-red-500/10"

              : "bg-red-50"
          }`}
        >

          <ShieldAlert
            className={`w-8 h-8 ${
              darkMode

                ? "text-red-400"

                : "text-red-600"
            }`}
          />

        </div>

        <h2
          className={`text-2xl font-semibold tracking-[-0.03em] ${
            darkMode

              ? "text-white"

              : "text-[#111827]"
          }`}
        >

          Fleet Access Restricted

        </h2>

        <p
          className={`mt-3 max-w-md text-sm leading-relaxed ${
            darkMode

              ? "text-[#737373]"

              : "text-[#6B7280]"
          }`}
        >

          Your current role does not have permission to access operational fleet controls.

        </p>

      </section>
    );
  }


  return (

    <>

      {/* ================================================= */}
      {/* 🚀 ADD VEHICLE MODAL */}
      {/* ================================================= */}

      {canManageFleet && (

        <AddVehicleModal
          darkMode={darkMode}
          open={openAddModal}
          onClose={() =>
            setOpenAddModal(false)
          }
          onVehicleAdded={
            fetchVehicles
          }
        />
      )}

      {/* ================================================= */}
      {/* 🚀 MAIN TABLE */}
      {/* ================================================= */}

      <section
        className={`rounded-3xl border overflow-hidden ${
          darkMode

            ? "bg-[#0F0F10] border-white/[0.05]"

            : "bg-white border-[#E5E7EB]"
        }`}
      >

        {/* ================================================= */}
        {/* 🚀 HEADER */}
        {/* ================================================= */}

        <div
          className={`px-6 py-5 border-b flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${
            darkMode

              ? "border-white/[0.05]"

              : "border-[#E5E7EB]"
          }`}
        >

          <div>

            <h2
              className={`text-[24px] font-semibold tracking-[-0.03em] ${
                darkMode

                  ? "text-white"

                  : "text-[#111827]"
              }`}
            >

              Fleet Operations

            </h2>

            <p
              className={`text-sm mt-1 ${
                darkMode

                  ? "text-[#737373]"

                  : "text-[#6B7280]"
              }`}
            >

              Live fleet visibility and operational intelligence

            </p>

          </div>

          <div className="flex flex-col sm:flex-row gap-3">

            {/* SEARCH */}

            <div
              className={`flex items-center gap-3 h-[46px] rounded-2xl px-4 border ${
                darkMode

                  ? "bg-[#151515] border-white/[0.05]"

                  : "bg-[#F9FAFB] border-[#E5E7EB]"
              }`}
            >

              <Search
                className={`w-4 h-4 ${
                  darkMode

                    ? "text-[#737373]"

                    : "text-[#9CA3AF]"
                }`}
              />

              <input
                type="text"
                placeholder="Search fleet..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className={`bg-transparent outline-none text-sm w-[220px] ${
                  darkMode

                    ? "text-white placeholder:text-[#737373]"

                    : "text-[#111827] placeholder:text-[#9CA3AF]"
                }`}
              />

            </div>

            {/* REFRESH */}

            <button
              onClick={handleRefresh}
              className={`h-[46px] px-5 rounded-2xl border flex items-center gap-2 text-sm font-medium ${
                darkMode

                  ? "bg-[#151515] border-white/[0.05] text-white hover:bg-[#1A1A1A]"

                  : "bg-white border-[#E5E7EB] text-[#111827] hover:bg-[#F9FAFB]"
              }`}
            >

              <RefreshCw
                className={`w-4 h-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh

            </button>

            {/* ADD VEHICLE */}

            {canManageFleet && (

              <button
                onClick={() =>
                  setOpenAddModal(true)
                }
                className="h-[46px] px-5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium flex items-center gap-2"
              >

                <Plus className="w-4 h-4" />

                Add Vehicle

              </button>
            )}

          </div>

        </div>

        {/* ================================================= */}
        {/* 🚀 TABLE */}
        {/* ================================================= */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            <thead>

              <tr
                className={`border-b ${
                  darkMode

                    ? "border-white/[0.05]"

                    : "border-[#E5E7EB]"
                }`}
              >

                {[
                  "Vehicle",
                  "Driver",
                  "Speed",
                  "Fuel",
                  "ETA",
                  "Efficiency",
                  "Status",
                  "Actions",
                ].map((item) => (

                  <th
                    key={item}
                    className={`px-6 py-4 text-left text-xs uppercase tracking-[0.08em] font-semibold ${
                      darkMode

                        ? "text-[#737373]"

                        : "text-[#6B7280]"
                    }`}
                  >

                    {item}

                  </th>
                ))}

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={8}
                    className="py-16 text-center"
                  >

                    Loading fleet intelligence...

                  </td>

                </tr>

              ) : filteredVehicles.length === 0 ? (

                <tr>

                  <td
                    colSpan={8}
                    className="py-16 text-center"
                  >

                    Fleet network awaiting deployment

                  </td>

                </tr>

              ) : (

                filteredVehicles.map(
                  (vehicle) => {

                    const status =
                      getStatus(vehicle);

                    return (

                      <tr
                        key={vehicle.id}
                        className={`border-b ${
                          darkMode

                            ? "border-white/[0.03] hover:bg-white/[0.02]"

                            : "border-[#F3F4F6] hover:bg-[#FAFAFA]"
                        }`}
                      >

                        {/* VEHICLE */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-4">

                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                                darkMode

                                  ? "bg-[#161616] border-white/[0.05]"

                                  : "bg-[#F9FAFB] border-[#E5E7EB]"
                              }`}
                            >

                              <Truck
                                className={`w-5 h-5 ${
                                  darkMode

                                    ? "text-white"

                                    : "text-[#111827]"
                                }`}
                              />

                            </div>

                            <div>

                              <p
                                className={`font-medium ${
                                  darkMode

                                    ? "text-white"

                                    : "text-[#111827]"
                                }`}
                              >

                                {vehicle.name}

                              </p>

                              <p
                                className={`text-xs mt-1 capitalize ${
                                  darkMode

                                    ? "text-[#737373]"

                                    : "text-[#6B7280]"
                                }`}
                              >

                                {vehicle.vehicle_type.replace(
                                  "_",
                                  " "
                                )}

                              </p>

                            </div>

                          </div>

                        </td>

                        {/* DRIVER */}

                        <td className="px-6 py-5">

                          {vehicle.driver_name}

                        </td>

                        {/* SPEED */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2">

                            <Gauge className="w-4 h-4" />

                            {Math.round(
                              vehicle.speed
                            )} km/h

                          </div>

                        </td>

                        {/* FUEL */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2">

                            <Fuel
                              className={`w-4 h-4 ${
                                vehicle.fuel_level < 20

                                  ? "text-red-500"

                                  : ""
                              }`}
                            />

                            {Math.round(
                              vehicle.fuel_level
                            )}%

                          </div>

                        </td>

                        {/* ETA */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2">

                            <Clock3 className="w-4 h-4" />

                            {Math.round(
                              vehicle.eta_minutes
                            )} min

                          </div>

                        </td>

                        {/* EFFICIENCY */}

                        <td className="px-6 py-5">

                          <div
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${
                              darkMode

                                ? "bg-blue-500/10 text-blue-300 border-blue-500/20"

                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >

                            {Math.round(
                              vehicle.efficiency_score
                            )}%

                          </div>

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-5">

                          <div
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}
                          >

                            {status.label}

                          </div>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-5">

                          {canManageFleet ? (

                            <div className="flex items-center gap-2">

                              <button
                                className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                                  darkMode

                                    ? "bg-[#151515] border-white/[0.05] text-white"

                                    : "bg-white border-[#E5E7EB] text-[#111827]"
                                }`}
                              >

                                <Pencil className="w-4 h-4" />

                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    vehicle.id
                                  )
                                }
                                className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                                  darkMode

                                    ? "bg-red-500/10 border-red-500/10 text-red-400"

                                    : "bg-red-50 border-red-200 text-red-600"
                                }`}
                              >

                                <Trash2 className="w-4 h-4" />

                              </button>

                            </div>

                          ) : (

                            <span
                              className={`text-xs ${
                                darkMode

                                  ? "text-[#737373]"

                                  : "text-[#9CA3AF]"
                              }`}
                            >

                              Read only

                            </span>
                          )}

                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

      </section>

    </>
  );
}
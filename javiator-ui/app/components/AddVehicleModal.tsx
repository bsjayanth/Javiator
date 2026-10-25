"use client";

import { useState } from "react";

import {

  X,
  Truck,

} from "lucide-react";


type Props = {

  darkMode: boolean;

  open: boolean;

  onClose: () => void;

  onVehicleAdded: () => void;
};


export default function AddVehicleModal({

  darkMode,

  open,

  onClose,

  onVehicleAdded,

}: Props) {

  const [loading, setLoading] =
    useState(false);

  const [name, setName] =
    useState("");

  const [driverName, setDriverName] =
    useState("");

  const [vehicleType, setVehicleType] =
    useState("truck");

  const [fuelLevel, setFuelLevel] =
    useState(100);

  const [capacity, setCapacity] =
    useState(1000);


  if (!open) return null;


  // =====================================================
  // 🚀 SUBMIT
  // =====================================================

  const handleSubmit =
    async () => {

      try {

        setLoading(true);

        const response =
          await fetch(

            "http://127.0.0.1:8000/api/fleet/vehicles/",

            {

              method: "POST",

              headers: {

                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({

                name,

                driver_name:
                  driverName,

                vehicle_type:
                  vehicleType,

                fuel_level:
                  fuelLevel,

                capacity,

                speed: 0,

                is_available: true,

                is_moving: false,
              }),
            }
          );

        if (!response.ok) {

          throw new Error(
            "Failed to create vehicle"
          );
        }

        onVehicleAdded();

        onClose();

        // reset form

        setName("");

        setDriverName("");

        setVehicleType("truck");

        setFuelLevel(100);

        setCapacity(1000);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };


  return (

    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">

      <div
        className={`w-full max-w-2xl rounded-[32px] border overflow-hidden transition-all duration-300 ${
          darkMode

            ? "bg-[#111111] border-white/[0.05]"

            : "bg-white border-[#E5E7EB]"
        }`}
      >

        {/* ================================================= */}
        {/* 🚀 HEADER */}
        {/* ================================================= */}

        <div
          className={`px-8 py-6 border-b flex items-center justify-between ${
            darkMode

              ? "border-white/[0.05]"

              : "border-[#E5E7EB]"
          }`}
        >

          <div className="flex items-center gap-4">

            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
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

              <h2
                className={`text-[24px] font-semibold tracking-[-0.03em] ${
                  darkMode

                    ? "text-white"

                    : "text-[#111827]"
                }`}
              >

                Add New Vehicle

              </h2>

              <p
                className={`text-sm mt-1 ${
                  darkMode

                    ? "text-[#737373]"

                    : "text-[#6B7280]"
                }`}
              >

                Register a new fleet vehicle into Javiator

              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              darkMode

                ? "bg-[#161616] hover:bg-[#1A1A1A] text-white"

                : "bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111827]"
            }`}
          >

            <X className="w-5 h-5" />

          </button>

        </div>

        {/* ================================================= */}
        {/* 🚀 FORM */}
        {/* ================================================= */}

        <div className="p-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* VEHICLE NAME */}

            <div>

              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode

                    ? "text-[#E5E5E5]"

                    : "text-[#374151]"
                }`}
              >

                Vehicle Name

              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="KA01AB4582"
                className={`w-full h-[52px] rounded-2xl px-4 border outline-none transition-all duration-200 ${
                  darkMode

                    ? "bg-[#151515] border-white/[0.05] text-white placeholder:text-[#737373]"

                    : "bg-white border-[#E5E7EB] text-[#111827] placeholder:text-[#9CA3AF]"
                }`}
              />

            </div>

            {/* DRIVER */}

            <div>

              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode

                    ? "text-[#E5E5E5]"

                    : "text-[#374151]"
                }`}
              >

                Driver Name

              </label>

              <input
                type="text"
                value={driverName}
                onChange={(e) =>
                  setDriverName(
                    e.target.value
                  )
                }
                placeholder="Rahul"
                className={`w-full h-[52px] rounded-2xl px-4 border outline-none transition-all duration-200 ${
                  darkMode

                    ? "bg-[#151515] border-white/[0.05] text-white placeholder:text-[#737373]"

                    : "bg-white border-[#E5E7EB] text-[#111827] placeholder:text-[#9CA3AF]"
                }`}
              />

            </div>

            {/* VEHICLE TYPE */}

            <div>

              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode

                    ? "text-[#E5E5E5]"

                    : "text-[#374151]"
                }`}
              >

                Vehicle Type

              </label>

              <select
                value={vehicleType}
                onChange={(e) =>
                  setVehicleType(
                    e.target.value
                  )
                }
                className={`w-full h-[52px] rounded-2xl px-4 border outline-none transition-all duration-200 ${
                  darkMode

                    ? "bg-[#151515] border-white/[0.05] text-white"

                    : "bg-white border-[#E5E7EB] text-[#111827]"
                }`}
              >

                <option value="truck">
                  Truck
                </option>

                <option value="mini_truck">
                  Mini Truck
                </option>

                <option value="van">
                  Van
                </option>

              </select>

            </div>

            {/* FUEL */}

            <div>

              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode

                    ? "text-[#E5E5E5]"

                    : "text-[#374151]"
                }`}
              >

                Fuel Level (%)

              </label>

              <input
                type="number"
                value={fuelLevel}
                onChange={(e) =>
                  setFuelLevel(
                    Number(
                      e.target.value
                    )
                  )
                }
                className={`w-full h-[52px] rounded-2xl px-4 border outline-none transition-all duration-200 ${
                  darkMode

                    ? "bg-[#151515] border-white/[0.05] text-white"

                    : "bg-white border-[#E5E7EB] text-[#111827]"
                }`}
              />

            </div>

            {/* CAPACITY */}

            <div className="md:col-span-2">

              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode

                    ? "text-[#E5E5E5]"

                    : "text-[#374151]"
                }`}
              >

                Capacity (kg)

              </label>

              <input
                type="number"
                value={capacity}
                onChange={(e) =>
                  setCapacity(
                    Number(
                      e.target.value
                    )
                  )
                }
                className={`w-full h-[52px] rounded-2xl px-4 border outline-none transition-all duration-200 ${
                  darkMode

                    ? "bg-[#151515] border-white/[0.05] text-white"

                    : "bg-white border-[#E5E7EB] text-[#111827]"
                }`}
              />

            </div>

          </div>

          {/* ================================================= */}
          {/* 🚀 FOOTER */}
          {/* ================================================= */}

          <div className="flex items-center justify-end gap-3 mt-8">

            <button
              onClick={onClose}
              className={`h-[48px] px-5 rounded-2xl text-sm font-medium transition-all duration-200 ${
                darkMode

                  ? "bg-[#161616] hover:bg-[#1A1A1A] text-white"

                  : "bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111827]"
              }`}
            >

              Cancel

            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="h-[48px] px-6 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium transition-all duration-200 disabled:opacity-50"
            >

              {loading

                ? "Creating..."

                : "Create Vehicle"}

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
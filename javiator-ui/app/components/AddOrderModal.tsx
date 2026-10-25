"use client";

import {
  useState,
} from "react";

import {
  X,
  PackagePlus,
} from "lucide-react";


type Props = {

  darkMode: boolean;

  open: boolean;

  onClose: () => void;

  onOrderAdded: () => void;
};


export default function AddOrderModal({

  darkMode,

  open,

  onClose,

  onOrderAdded,

}: Props) {

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({

      customer_name: "",

      pickup_lat: "",

      pickup_lng: "",

      drop_lat: "",

      drop_lng: "",

      weight: "",
    });

  if (!open)
    return null;

  // =====================================================
  // 🚀 HANDLE INPUT
  // =====================================================

  const handleChange =
    (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {

      setForm({

        ...form,

        [e.target.name]:
          e.target.value,
      });
    };

  // =====================================================
  // 🚀 SUBMIT
  // =====================================================

  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault();

      setLoading(true);

      try {

        const token =
          localStorage.getItem(
            "access"
          );

        if (!token) {

          throw new Error(
            "No access token found"
          );
        }

        // ============================================
        // 🚀 REQUEST PAYLOAD
        // ============================================

        const payload = {

          customer_name:
            form.customer_name,

          pickup_lat:
            parseFloat(
              form.pickup_lat
            ),

          pickup_lng:
            parseFloat(
              form.pickup_lng
            ),

          drop_lat:
            parseFloat(
              form.drop_lat
            ),

          drop_lng:
            parseFloat(
              form.drop_lng
            ),

          weight:
            parseFloat(
              form.weight
            ),

          priority:
            "medium",

          status:
            "created",
        };

        console.log(
          "ORDER PAYLOAD:",
          payload
        );

        // ============================================
        // 🚀 API REQUEST
        // ============================================

        const response =
          await fetch(

            "http://127.0.0.1:8000/api/orders/",

            {

              method: "POST",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify(
                payload
              ),
            }
          );

        const data =
          await response.json();

        console.log(
          "ORDER RESPONSE:",
          data
        );

        if (!response.ok) {

          throw new Error(

            data.detail ||

            JSON.stringify(data) ||

            "Failed to create order"
          );
        }

        // ============================================
        // 🚀 SUCCESS
        // ============================================

        alert(
          "✅ Order created successfully"
        );

        onOrderAdded();

        onClose();

        setForm({

          customer_name: "",

          pickup_lat: "",

          pickup_lng: "",

          drop_lat: "",

          drop_lng: "",

          weight: "",
        });

      } catch (error) {

        console.error(
          "ORDER CREATE ERROR:",
          error
        );

        alert(

          error instanceof Error

            ? error.message

            : "Failed to create order"
        );

      } finally {

        setLoading(false);
      }
    };

  // =====================================================
  // 🚀 UI
  // =====================================================

  return (

    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5">

      <div
        className={`w-full max-w-2xl rounded-3xl border overflow-hidden ${
          darkMode

            ? "bg-[#0F0F10] border-white/[0.06]"

            : "bg-white border-[#E5E7EB]"
        }`}
      >

        {/* ================================================= */}
        {/* 🚀 HEADER */}
        {/* ================================================= */}

        <div
          className={`px-6 py-5 border-b flex items-center justify-between ${
            darkMode

              ? "border-white/[0.06]"

              : "border-[#E5E7EB]"
          }`}
        >

          <div>

            <h2 className="text-2xl font-semibold">

              Create Order

            </h2>

            <p
              className={`text-sm mt-1 ${
                darkMode

                  ? "text-[#737373]"

                  : "text-[#6B7280]"
              }`}
            >

              Add a logistics delivery request

            </p>

          </div>

          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              darkMode

                ? "hover:bg-white/[0.05]"

                : "hover:bg-[#F3F4F6]"
            }`}
          >

            <X className="w-5 h-5" />

          </button>

        </div>

        {/* ================================================= */}
        {/* 🚀 FORM */}
        {/* ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="p-6 grid grid-cols-2 gap-5"
        >

          {[
            {
              name: "customer_name",
              label: "Customer Name",
            },

            {
              name: "weight",
              label: "Weight (kg)",
            },

            {
              name: "pickup_lat",
              label: "Pickup Latitude",
            },

            {
              name: "pickup_lng",
              label: "Pickup Longitude",
            },

            {
              name: "drop_lat",
              label: "Drop Latitude",
            },

            {
              name: "drop_lng",
              label: "Drop Longitude",
            },
          ].map((field) => (

            <div
              key={field.name}
              className="flex flex-col gap-2"
            >

              <label
                className={`text-sm ${
                  darkMode

                    ? "text-[#A1A1AA]"

                    : "text-[#6B7280]"
                }`}
              >

                {field.label}

              </label>

              <input
                type="text"
                required
                name={field.name}
                value={
                  form[
                    field.name as keyof typeof form
                  ]
                }
                onChange={handleChange}
                className={`h-[50px] rounded-2xl border px-4 outline-none ${
                  darkMode

                    ? "bg-[#151515] border-white/[0.05] text-white"

                    : "bg-white border-[#E5E7EB] text-[#111827]"
                }`}
              />

            </div>
          ))}

          {/* ================================================= */}
          {/* 🚀 BUTTON */}
          {/* ================================================= */}

          <div className="col-span-2 pt-2">

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[54px] rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium flex items-center justify-center gap-2"
            >

              <PackagePlus className="w-5 h-5" />

              {loading

                ? "Creating Order..."

                : "Create Order"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}
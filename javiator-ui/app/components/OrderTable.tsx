"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Package,
  MapPin,
  Truck,
  Clock3,
} from "lucide-react";

import AddOrderModal from "./AddOrderModal";

import {

  connectOrderSocket,

  disconnectOrderSocket,

} from "@/services/orderSocket";


type Order = {

  id: number;

  customer_name: string;

  pickup_lat: number;

  pickup_lng: number;

  drop_lat: number;

  drop_lng: number;

  weight: number;

  status: string;

  assigned_vehicle: number | null;

  estimated_delivery_time: number;

  delivery_progress: number;

  priority?: string;
};


type Props = {

  darkMode: boolean;
};


export default function OrderTable({

  darkMode,

}: Props) {

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  const [openAddModal, setOpenAddModal] =
    useState(false);

  // =====================================================
  // FETCH ORDERS
  // =====================================================

  const fetchOrders =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "access"
          );

        const response =
          await fetch(

            "http://127.0.0.1:8000/api/orders/",

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        setOrders(

          Array.isArray(data)

            ? data

            : data.results || []
        );

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

  // =====================================================
  // LIVE WEBSOCKET
  // =====================================================

  useEffect(() => {

    fetchOrders();

    connectOrderSocket(

      (message) => {

        if (
          message.type ===
          "order_update"
        ) {

          const updatedOrder =
            message.data;

          setOrders((prev) => {

            const exists =
              prev.some(

                (o) =>
                  o.id ===
                  updatedOrder.id
              );

            // UPDATE EXISTING ORDER

            if (exists) {

              return prev.map(

                (order) =>

                  order.id ===
                  updatedOrder.id

                    ? updatedOrder

                    : order
              );
            }

            // ADD NEW ORDER

            return [

              updatedOrder,

              ...prev,
            ];
          });
        }
      }
    );

    return () => {

      disconnectOrderSocket();
    };

  }, []);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh =
    async () => {

      setRefreshing(true);

      await fetchOrders();

      setTimeout(() => {

        setRefreshing(false);

      }, 600);
    };

  // =====================================================
  // DELETE ORDER
  // =====================================================

  const handleDelete =
    async (id: number) => {

      const confirmDelete =
        confirm(
          "Delete this order?"
        );

      if (!confirmDelete)
        return;

      try {

        const token =
          localStorage.getItem(
            "access"
          );

        await fetch(

          `http://127.0.0.1:8000/api/orders/${id}/`,

          {

            method: "DELETE",

            headers: {

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setOrders((prev) =>
          prev.filter(
            (o) => o.id !== id
          )
        );

      } catch (error) {

        console.error(error);
      }
    };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredOrders =
    useMemo(() => {

      return orders.filter(
        (order) => {

          const q =
            search.toLowerCase();

          return (

            order.customer_name
              .toLowerCase()
              .includes(q)

            ||

            order.status
              .toLowerCase()
              .includes(q)
          );
        }
      );

    }, [orders, search]);

  // =====================================================
  // STATUS COLORS
  // =====================================================

  const getStatusColor =
    (status: string) => {

      switch (status) {

        case "delivered":

          return darkMode

            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"

            : "bg-emerald-50 text-emerald-700 border-emerald-200";

        case "in_transit":

          return darkMode

            ? "bg-blue-500/15 text-blue-400 border-blue-500/20"

            : "bg-blue-50 text-blue-700 border-blue-200";

        case "pickup_started":

          return darkMode

            ? "bg-orange-500/15 text-orange-300 border-orange-500/20"

            : "bg-orange-50 text-orange-700 border-orange-200";

        case "assigned":

          return darkMode

            ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/20"

            : "bg-yellow-50 text-yellow-700 border-yellow-200";

        default:

          return darkMode

            ? "bg-zinc-500/15 text-zinc-300 border-zinc-500/20"

            : "bg-zinc-50 text-zinc-700 border-zinc-200";
      }
    };

  return (

    <>

      <AddOrderModal
        darkMode={darkMode}
        open={openAddModal}
        onClose={() =>
          setOpenAddModal(false)
        }
        onOrderAdded={
          fetchOrders
        }
      />

      <section
        className={`rounded-3xl border overflow-hidden ${
          darkMode

            ? "bg-[#0F0F10] border-white/[0.05]"

            : "bg-white border-[#E5E7EB]"
        }`}
      >

        {/* HEADER */}

        <div
          className={`px-6 py-5 border-b flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${
            darkMode

              ? "border-white/[0.05]"

              : "border-[#E5E7EB]"
          }`}
        >

          <div>

            <h2 className="text-2xl font-semibold">

              Order Management

            </h2>

            <p
              className={`text-sm mt-1 ${
                darkMode

                  ? "text-[#737373]"

                  : "text-[#6B7280]"
              }`}
            >

              Realtime AI-powered logistics control center

            </p>

          </div>

          <div className="flex items-center gap-3 flex-wrap">

            {/* SEARCH */}

            <div
              className={`flex items-center gap-3 h-[46px] rounded-2xl px-4 border ${
                darkMode

                  ? "bg-[#151515] border-white/[0.05]"

                  : "bg-[#F9FAFB] border-[#E5E7EB]"
              }`}
            >

              <Search className="w-4 h-4" />

              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="bg-transparent outline-none text-sm w-[220px]"
              />

            </div>

            {/* REFRESH */}

            <button
              onClick={handleRefresh}
              className={`h-[46px] px-5 rounded-2xl border flex items-center gap-2 ${
                darkMode

                  ? "bg-[#151515] border-white/[0.05]"

                  : "bg-white border-[#E5E7EB]"
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

            {/* ADD */}

            <button
              onClick={() =>
                setOpenAddModal(true)
              }
              className="h-[46px] px-5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center gap-2"
            >

              <Plus className="w-4 h-4" />

              Add Order

            </button>

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1300px]">

            <thead>

              <tr
                className={`border-b ${
                  darkMode

                    ? "border-white/[0.05]"

                    : "border-[#E5E7EB]"
                }`}
              >

                {[
                  "Customer",
                  "Pickup",
                  "Drop",
                  "Weight",
                  "Status",
                  "Progress",
                  "Vehicle",
                  "ETA",
                  "Actions",
                ].map((item) => (

                  <th
                    key={item}
                    className={`px-6 py-4 text-left text-xs uppercase tracking-[0.08em] ${
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
                    colSpan={9}
                    className="py-16 text-center"
                  >

                    Loading realtime orders...

                  </td>

                </tr>

              ) : filteredOrders.length === 0 ? (

                <tr>

                  <td
                    colSpan={9}
                    className="py-16 text-center"
                  >

                    No active orders found

                  </td>

                </tr>

              ) : (

                filteredOrders.map(
                  (order) => (

                    <tr
                      key={order.id}
                      className={`border-b transition-all ${
                        darkMode

                          ? "border-white/[0.03] hover:bg-white/[0.02]"

                          : "border-[#F3F4F6] hover:bg-[#FAFAFA]"
                      }`}
                    >

                      {/* CUSTOMER */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              darkMode

                                ? "bg-[#151515]"

                                : "bg-[#F3F4F6]"
                            }`}
                          >

                            <Package className="w-5 h-5" />

                          </div>

                          <div>

                            <p className="font-medium">

                              {order.customer_name}

                            </p>

                            <p className="text-xs opacity-60">

                              Order #{order.id}

                            </p>

                          </div>

                        </div>

                      </td>

                      {/* PICKUP */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2 text-sm">

                          <MapPin className="w-4 h-4" />

                          {order.pickup_lat.toFixed(2)},
                          {" "}
                          {order.pickup_lng.toFixed(2)}

                        </div>

                      </td>

                      {/* DROP */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2 text-sm">

                          <MapPin className="w-4 h-4" />

                          {order.drop_lat.toFixed(2)},
                          {" "}
                          {order.drop_lng.toFixed(2)}

                        </div>

                      </td>

                      {/* WEIGHT */}

                      <td className="px-6 py-5">

                        {order.weight} kg

                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-5">

                        <div
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}
                        >

                          {order.status.replace(
                            "_",
                            " "
                          )}

                        </div>

                      </td>

                      {/* PROGRESS */}

                      <td className="px-6 py-5 min-w-[220px]">

                        <div>

                          <div
                            className={`w-full h-2 rounded-full overflow-hidden ${
                              darkMode

                                ? "bg-white/10"

                                : "bg-gray-200"
                            }`}
                          >

                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-500"
                              style={{
                                width: `${order.delivery_progress || 0}%`
                              }}
                            />

                          </div>

                          <div className="flex items-center justify-between mt-1">

                            <p
                              className={`text-xs ${
                                darkMode

                                  ? "text-zinc-400"

                                  : "text-zinc-500"
                              }`}
                            >

                              Delivery Progress

                            </p>

                            <p
                              className={`text-xs font-medium ${
                                darkMode

                                  ? "text-white"

                                  : "text-black"
                              }`}
                            >

                              {Math.round(
                                order.delivery_progress || 0
                              )}%

                            </p>

                          </div>

                        </div>

                      </td>

                      {/* VEHICLE */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2">

                          <Truck className="w-4 h-4" />

                          {order.assigned_vehicle

                            ? `Vehicle ${order.assigned_vehicle}`

                            : "Unassigned"}

                        </div>

                      </td>

                      {/* ETA */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2">

                          <Clock3 className="w-4 h-4" />

                          {order.estimated_delivery_time} min

                        </div>

                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-5">

                        <button
                          onClick={() =>
                            handleDelete(
                              order.id
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

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </section>

    </>
  );
}
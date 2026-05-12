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

export default function AnalyticsDashboard() {

  const [metrics, setMetrics] =
    useState<Metrics | null>(null);

  useEffect(() => {

    const fetchMetrics = async () => {

      try {

        const res = await fetch(

          "http://127.0.0.1:8000/api/analytics/dashboard/"
        );

        const data = await res.json();

        setMetrics(data);

      } catch (err) {

        console.error(
          "Analytics fetch error:",
          err
        );
      }
    };

    fetchMetrics();

    const interval = setInterval(
      fetchMetrics,
      3000
    );

    return () => clearInterval(interval);

  }, []);

  if (!metrics) {

    return (

      <div className="text-white text-lg">

        Loading analytics...
      </div>
    );
  }

  // =====================================================
  // CHART DATA
  // =====================================================

  const vehicleData = [

    {
      name: "Active",
      value: metrics.active_vehicles,
    },

    {
      name: "Idle",
      value: metrics.idle_vehicles,
    },
  ];

  const orderData = [

    {
      name: "Completed",
      orders: metrics.completed_orders,
    },

    {
      name: "Transit",
      orders: metrics.in_transit_orders,
    },
  ];

  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="space-y-8">

      {/* ================================================= */}
      {/* 🚀 KPI CARDS */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <div className="bg-gradient-to-br from-[#111827] to-[#0f172a] border border-white/5 p-5 rounded-3xl">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-400 text-sm">

                Total Vehicles

              </p>

              <h2 className="text-4xl font-bold text-white mt-2">

                {metrics.total_vehicles}

              </h2>
            </div>

            <Truck className="text-cyan-400" size={34} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#111827] to-[#0f172a] border border-white/5 p-5 rounded-3xl">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-400 text-sm">

                Total Orders

              </p>

              <h2 className="text-4xl font-bold text-white mt-2">

                {metrics.total_orders}

              </h2>
            </div>

            <Package className="text-yellow-400" size={34} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#111827] to-[#0f172a] border border-white/5 p-5 rounded-3xl">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-400 text-sm">

                Fleet Utilization

              </p>

              <h2 className="text-4xl font-bold text-green-400 mt-2">

                {metrics.fleet_utilization}%

              </h2>
            </div>

            <Gauge className="text-green-400" size={34} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#111827] to-[#0f172a] border border-white/5 p-5 rounded-3xl">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-400 text-sm">

                Avg Fuel

              </p>

              <h2 className="text-4xl font-bold text-orange-400 mt-2">

                {metrics.avg_fuel}%

              </h2>
            </div>

            <Fuel className="text-orange-400" size={34} />
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* 🚀 ADVANCED ANALYTICS */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <div className="bg-[#111827] p-5 rounded-3xl border border-white/5">

          <div className="flex items-center gap-3 mb-3">

            <BrainCircuit className="text-cyan-400" />

            <h2 className="text-white font-semibold">

              Avg Efficiency

            </h2>
          </div>

          <p className="text-4xl font-bold text-cyan-400">

            {metrics.avg_efficiency}
          </p>
        </div>

        <div className="bg-[#111827] p-5 rounded-3xl border border-white/5">

          <div className="flex items-center gap-3 mb-3">

            <Route className="text-green-400" />

            <h2 className="text-white font-semibold">

              Distance

            </h2>
          </div>

          <p className="text-4xl font-bold text-green-400">

            {metrics.total_distance} km
          </p>
        </div>

        <div className="bg-[#111827] p-5 rounded-3xl border border-white/5">

          <div className="flex items-center gap-3 mb-3">

            <Fuel className="text-orange-400" />

            <h2 className="text-white font-semibold">

              Fuel Used

            </h2>
          </div>

          <p className="text-4xl font-bold text-orange-400">

            {metrics.total_fuel_consumed}
          </p>
        </div>

        <div className="bg-[#111827] p-5 rounded-3xl border border-white/5">

          <div className="flex items-center gap-3 mb-3">

            <Activity className="text-purple-400" />

            <h2 className="text-white font-semibold">

              Avg Speed

            </h2>
          </div>

          <p className="text-4xl font-bold text-purple-400">

            {metrics.avg_speed}
          </p>
        </div>
      </div>

      {/* ================================================= */}
      {/* 🚀 CHARTS */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* PIE CHART */}

        <div className="bg-[#111827] p-6 rounded-3xl border border-white/5">

          <h2 className="text-white text-2xl font-bold mb-5">

            Vehicle Status
          </h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <PieChart>

              <Pie
                data={vehicleData}
                dataKey="value"
                outerRadius={110}
              >

                <Cell fill="#22c55e" />

                <Cell fill="#ef4444" />

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>
        </div>

        {/* BAR CHART */}

        <div className="bg-[#111827] p-6 rounded-3xl border border-white/5">

          <h2 className="text-white text-2xl font-bold mb-5">

            Order Analytics
          </h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <BarChart data={orderData}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1f2937"
              />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="orders"
                fill="#3b82f6"
                radius={[10, 10, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>
        </div>
      </div>

      {/* ================================================= */}
      {/* 🚀 DRIVER LEADERBOARD */}
      {/* ================================================= */}

      <div className="bg-[#111827] p-6 rounded-3xl border border-white/5">

        <div className="flex items-center gap-3 mb-6">

          <Trophy className="text-yellow-400" />

          <h2 className="text-white text-2xl font-bold">

            Driver Leaderboard

          </h2>
        </div>

        <div className="space-y-4">

          {metrics.leaderboard.map(

            (vehicle, index) => (

              <div
                key={vehicle.id}
                className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 flex items-center justify-between"
              >

                <div>

                  <h3 className="text-white text-xl font-bold">

                    #{index + 1} {" "}
                    {vehicle.driver_name}

                  </h3>

                  <p className="text-gray-400">

                    {vehicle.vehicle_name}

                  </p>
                </div>

                <div className="flex gap-10">

                  <div>

                    <p className="text-gray-500 text-sm">

                      Efficiency

                    </p>

                    <p className="text-cyan-400 font-bold text-lg">

                      {vehicle.efficiency_score}

                    </p>
                  </div>

                  <div>

                    <p className="text-gray-500 text-sm">

                      Deliveries

                    </p>

                    <p className="text-green-400 font-bold text-lg">

                      {vehicle.total_deliveries}

                    </p>
                  </div>

                  <div>

                    <p className="text-gray-500 text-sm">

                      Distance

                    </p>

                    <p className="text-orange-400 font-bold text-lg">

                      {vehicle.total_distance} km

                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* ================================================= */}
      {/* 🚀 AI INSIGHTS */}
      {/* ================================================= */}

      <div className="bg-[#111827] p-6 rounded-3xl border border-white/5">

        <div className="flex items-center gap-3 mb-5">

          <BrainCircuit className="text-cyan-400" />

          <h2 className="text-white text-2xl font-bold">

            AI Fleet Insights

          </h2>
        </div>

        <div className="space-y-3">

          {metrics.ai_insights.map(

            (insight, index) => (

              <div
                key={index}
                className="bg-[#0f172a] border border-cyan-500/20 rounded-2xl px-5 py-4 text-cyan-300"
              >

                {insight}

              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
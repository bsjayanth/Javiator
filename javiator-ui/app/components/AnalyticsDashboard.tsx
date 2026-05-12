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

} from "recharts";

import { useEffect, useState } from "react";

type Metrics = {

  total_vehicles: number;

  active_vehicles: number;

  idle_vehicles: number;

  total_orders: number;

  completed_orders: number;

  in_transit_orders: number;

  avg_fuel: number;

  fleet_utilization: number;
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

        console.error(err);
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
      <div className="text-white">
        Loading analytics...
      </div>
    );
  }

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

  return (

    <div className="space-y-6">

      {/* KPI CARDS */}

      <div className="grid grid-cols-4 gap-4">

        <div className="bg-[#111827] p-4 rounded-2xl">

          <h2 className="text-gray-400">
            Total Vehicles
          </h2>

          <p className="text-3xl font-bold text-white">

            {metrics.total_vehicles}

          </p>
        </div>

        <div className="bg-[#111827] p-4 rounded-2xl">

          <h2 className="text-gray-400">
            Total Orders
          </h2>

          <p className="text-3xl font-bold text-white">

            {metrics.total_orders}

          </p>
        </div>

        <div className="bg-[#111827] p-4 rounded-2xl">

          <h2 className="text-gray-400">
            Fleet Utilization
          </h2>

          <p className="text-3xl font-bold text-green-400">

            {metrics.fleet_utilization}%

          </p>
        </div>

        <div className="bg-[#111827] p-4 rounded-2xl">

          <h2 className="text-gray-400">
            Avg Fuel
          </h2>

          <p className="text-3xl font-bold text-yellow-400">

            {metrics.avg_fuel}%

          </p>
        </div>
      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-2 gap-6">

        {/* PIE CHART */}

        <div className="bg-[#111827] p-6 rounded-2xl">

          <h2 className="text-white text-xl mb-4">

            Vehicle Status

          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <PieChart>

              <Pie
                data={vehicleData}
                dataKey="value"
                outerRadius={100}
              >

                <Cell fill="#22c55e" />

                <Cell fill="#ef4444" />

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>
        </div>

        {/* BAR CHART */}

        <div className="bg-[#111827] p-6 rounded-2xl">

          <h2 className="text-white text-xl mb-4">

            Order Analytics

          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart data={orderData}>

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="orders"
                fill="#3b82f6"
              />

            </BarChart>

          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
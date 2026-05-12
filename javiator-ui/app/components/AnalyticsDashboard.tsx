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

type Props = {

  darkMode: boolean;
};

export default function AnalyticsDashboard({

  darkMode,

}: Props) {

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

  const card =
    `rounded-3xl border p-5 lg:p-6 shadow-sm transition-colors ${
      darkMode
        ? "bg-[#111111] border-white/[0.06]"
        : "bg-white border-[#E5E7EB]"
    }`;

  const labelCls =
    darkMode
      ? "text-[#A1A1AA]"
      : "text-[#6B7280]";

  const titleCls =
    darkMode
      ? "text-[#F5F5F5]"
      : "text-[#111827]";

  const iconBox =
    `flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
      darkMode
        ? "border-white/[0.06] bg-[#171717] text-[#D4D4D8]"
        : "border-[#E5E7EB] bg-[#F8FAFC] text-[#4B5563]"
    }`;

  const gridStroke =
    darkMode
      ? "rgba(255,255,255,0.06)"
      : "#E5E7EB";

  const axisStroke =
    darkMode
      ? "#52525B"
      : "#9CA3AF";

  const tooltipBg =
    darkMode
      ? "#171717"
      : "#FFFFFF";

  const tooltipBorder =
    darkMode
      ? "rgba(255,255,255,0.08)"
      : "#E5E7EB";

  if (!metrics) {

    return (

      <div
        className={`rounded-3xl border px-6 py-10 text-center text-sm font-medium ${card}`}
      >

        <p className={labelCls}>

          Loading analytics…

        </p>

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

  const pieActive =
    darkMode
      ? "#E5E5E5"
      : "#111827";

  const pieIdle =
    darkMode
      ? "#52525B"
      : "#9CA3AF";

  const barFill =
    darkMode
      ? "#A1A1AA"
      : "#4B5563";

  return (

    <div className="space-y-6 lg:space-y-8">

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">

        <div className={card}>

          <div className="flex items-start justify-between gap-3">

            <div>

              <p className={`text-sm font-medium ${labelCls}`}>

                Total vehicles

              </p>

              <h2
                className={`text-4xl font-bold tracking-tight mt-3 ${titleCls}`}
              >

                {metrics.total_vehicles}

              </h2>

            </div>

            <div className={iconBox}>

              <Truck size={22} />

            </div>

          </div>

        </div>

        <div className={card}>

          <div className="flex items-start justify-between gap-3">

            <div>

              <p className={`text-sm font-medium ${labelCls}`}>

                Total orders

              </p>

              <h2
                className={`text-4xl font-bold tracking-tight mt-3 ${titleCls}`}
              >

                {metrics.total_orders}

              </h2>

            </div>

            <div className={iconBox}>

              <Package size={22} />

            </div>

          </div>

        </div>

        <div className={card}>

          <div className="flex items-start justify-between gap-3">

            <div>

              <p className={`text-sm font-medium ${labelCls}`}>

                Fleet utilization

              </p>

              <h2
                className={`text-4xl font-bold tracking-tight mt-3 ${titleCls}`}
              >

                {metrics.fleet_utilization}%

              </h2>

            </div>

            <div className={iconBox}>

              <Gauge size={22} />

            </div>

          </div>

        </div>

        <div className={card}>

          <div className="flex items-start justify-between gap-3">

            <div>

              <p className={`text-sm font-medium ${labelCls}`}>

                Avg fuel

              </p>

              <h2
                className={`text-4xl font-bold tracking-tight mt-3 ${titleCls}`}
              >

                {metrics.avg_fuel}%

              </h2>

            </div>

            <div className={iconBox}>

              <Fuel size={22} />

            </div>

          </div>

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">

        <div className={card}>

          <div className="flex items-center gap-3 mb-2">

            <BrainCircuit
              className={labelCls}
              size={20}
            />

            <h2 className={`text-sm font-semibold ${titleCls}`}>

              Avg efficiency

            </h2>

          </div>

          <p className={`text-3xl font-bold tracking-tight ${titleCls}`}>

            {metrics.avg_efficiency}

          </p>

        </div>

        <div className={card}>

          <div className="flex items-center gap-3 mb-2">

            <Route
              className={labelCls}
              size={20}
            />

            <h2 className={`text-sm font-semibold ${titleCls}`}>

              Distance

            </h2>

          </div>

          <p className={`text-3xl font-bold tracking-tight ${titleCls}`}>

            {metrics.total_distance}{" "}
            <span className={`text-lg font-medium ${labelCls}`}>
              km
            </span>

          </p>

        </div>

        <div className={card}>

          <div className="flex items-center gap-3 mb-2">

            <Fuel
              className={labelCls}
              size={20}
            />

            <h2 className={`text-sm font-semibold ${titleCls}`}>

              Fuel used

            </h2>

          </div>

          <p className={`text-3xl font-bold tracking-tight ${titleCls}`}>

            {metrics.total_fuel_consumed}

          </p>

        </div>

        <div className={card}>

          <div className="flex items-center gap-3 mb-2">

            <Activity
              className={labelCls}
              size={20}
            />

            <h2 className={`text-sm font-semibold ${titleCls}`}>

              Avg speed

            </h2>

          </div>

          <p className={`text-3xl font-bold tracking-tight ${titleCls}`}>

            {metrics.avg_speed}

          </p>

        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6">

        <div className={card}>

          <h2 className={`text-lg font-semibold mb-4 ${titleCls}`}>

            Vehicle status

          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <PieChart>

              <Pie
                data={vehicleData}
                dataKey="value"
                innerRadius={58}
                outerRadius={96}
                paddingAngle={2}
                stroke="none"
              >

                <Cell fill={pieActive} />

                <Cell fill={pieIdle} />

              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: 12,
                  fontSize: 13,
                  color: darkMode
                    ? "#F5F5F5"
                    : "#111827",
                }}
              />

            </PieChart>

          </ResponsiveContainer>

        </div>

        <div className={card}>

          <h2 className={`text-lg font-semibold mb-4 ${titleCls}`}>

            Order flow

          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart data={orderData}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridStroke}
                vertical={false}
              />

              <XAxis
                dataKey="name"
                tick={{
                  fill: axisStroke,
                  fontSize: 12,
                }}
                axisLine={{
                  stroke: gridStroke,
                }}
                tickLine={false}
              />

              <YAxis
                tick={{
                  fill: axisStroke,
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: 12,
                  fontSize: 13,
                  color: darkMode
                    ? "#F5F5F5"
                    : "#111827",
                }}
              />

              <Bar
                dataKey="orders"
                fill={barFill}
                radius={[8, 8, 0, 0]}
                maxBarSize={48}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      <div className={card}>

        <div className="flex items-center gap-3 mb-6">

          <Trophy
            className={labelCls}
            size={22}
          />

          <h2 className={`text-lg font-semibold ${titleCls}`}>

            Driver leaderboard

          </h2>

        </div>

        <div className="space-y-3">

          {metrics.leaderboard.map(

            (vehicle, index) => (

              <div
                key={vehicle.id}
                className={`rounded-2xl border p-4 lg:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${
                  darkMode
                    ? "bg-[#171717] border-white/[0.06]"
                    : "bg-[#F8FAFC] border-[#E5E7EB]"
                }`}
              >

                <div className="min-w-0">

                  <h3 className={`text-base font-semibold truncate ${titleCls}`}>

                    #{index + 1}{" "}
                    {vehicle.driver_name}

                  </h3>

                  <p className={`text-sm mt-1 truncate ${labelCls}`}>

                    {vehicle.vehicle_name}

                  </p>

                </div>

                <div className="flex flex-wrap gap-6 lg:gap-10 text-sm">

                  <div>

                    <p className={labelCls}>

                      Efficiency

                    </p>

                    <p className={`font-semibold mt-1 ${titleCls}`}>

                      {vehicle.efficiency_score}

                    </p>

                  </div>

                  <div>

                    <p className={labelCls}>

                      Deliveries

                    </p>

                    <p className={`font-semibold mt-1 ${titleCls}`}>

                      {vehicle.total_deliveries}

                    </p>

                  </div>

                  <div>

                    <p className={labelCls}>

                      Distance

                    </p>

                    <p className={`font-semibold mt-1 ${titleCls}`}>

                      {vehicle.total_distance}{" "}
                      km

                    </p>

                  </div>

                </div>

              </div>
            )
          )}

        </div>

      </div>

      <div className={card}>

        <div className="flex items-center gap-3 mb-5">

          <BrainCircuit
            className={labelCls}
            size={22}
          />

          <h2 className={`text-lg font-semibold ${titleCls}`}>

            AI fleet insights

          </h2>

        </div>

        <div className="space-y-2.5">

          {metrics.ai_insights.map(

            (insight, index) => (

              <div
                key={index}
                className={`rounded-2xl border px-4 py-3.5 text-sm leading-relaxed ${
                  darkMode
                    ? "bg-[#171717] border-white/[0.06] text-[#D4D4D8]"
                    : "bg-[#F8FAFC] border-[#E5E7EB] text-[#374151]"
                }`}
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

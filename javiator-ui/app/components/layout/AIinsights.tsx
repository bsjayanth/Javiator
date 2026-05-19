"use client";

import {

  Brain,
  TrendingUp,
  Fuel,
  Route,
  AlertTriangle,

} from "lucide-react";

type Props = {

  darkMode: boolean;
};

export default function AIinsights({

  darkMode,

}: Props) {

  const insights = [

    {
      icon: Brain,
      title: "Dispatch optimization",
      message:
        "AI recommends rerouting Vehicle 4 to reduce ETA by 12%.",
    },

    {
      icon: Fuel,
      title: "Fuel efficiency",
      message:
        "Vehicle 2 is consuming fuel 8% faster than fleet average.",
    },

    {
      icon: TrendingUp,
      title: "Demand forecast",
      message:
        "High delivery demand predicted near Electronic City.",
    },

    {
      icon: Route,
      title: "Route intelligence",
      message:
        "Traffic congestion detected on Outer Ring Road corridor.",
    },

    {
      icon: AlertTriangle,
      title: "Operational alert",
      message:
        "Fleet utilization exceeds optimal threshold during peak hours.",
    },
  ];

  return (

    <div
      className={`rounded-3xl border p-5 transition-colors ${
        darkMode
          ? "bg-[#111111] border-white/[0.06]"
          : "bg-white border-[#E5E7EB]"
      }`}
    >

      <div className="mb-5">

        <div className="flex items-center gap-3">

          <div
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${
              darkMode
                ? "bg-[#171717] border-white/[0.06] text-[#D4D4D8]"
                : "bg-[#F8FAFC] border-[#E5E7EB] text-[#4B5563]"
            }`}
          >

            <Brain className="w-5 h-5" />

          </div>

          <div>

            <h3
              className={`text-lg font-semibold tracking-tight ${
                darkMode
                  ? "text-[#F5F5F5]"
                  : "text-[#111827]"
              }`}
            >

              AI insights

            </h3>

            <p
              className={`text-sm mt-1 ${
                darkMode
                  ? "text-[#A1A1AA]"
                  : "text-[#6B7280]"
              }`}
            >

              Predictive operational intelligence

            </p>

          </div>

        </div>

      </div>

      <div className="space-y-2.5">

        {insights.map(
          (insight, index) => {

            const Icon =
              insight.icon;

            return (

              <div
                key={index}
                className={`rounded-2xl border p-4 transition-all duration-200 hover:translate-x-0.5 ${
                  darkMode
                    ? "bg-[#171717] border-white/[0.06] hover:border-white/[0.09]"
                    : "bg-[#F8FAFC] border-[#E5E7EB] hover:border-[#D1D5DB]"
                }`}
              >

                <div className="flex gap-3">

                  <div className="mt-0.5 shrink-0">

                    <Icon
                      className={`w-5 h-5 ${
                        darkMode
                          ? "text-[#A1A1AA]"
                          : "text-[#6B7280]"
                      }`}
                    />

                  </div>

                  <div className="min-w-0">

                    <h4
                      className={`text-sm font-semibold ${
                        darkMode
                          ? "text-[#F5F5F5]"
                          : "text-[#111827]"
                      }`}
                    >

                      {insight.title}

                    </h4>

                    <p
                      className={`text-[12px] mt-1 leading-relaxed ${
                        darkMode
                          ? "text-[#A1A1AA]"
                          : "text-[#6B7280]"
                      }`}
                    >

                      {insight.message}

                    </p>

                  </div>

                </div>

              </div>
            );
          }
        )}

      </div>

    </div>
  );
}

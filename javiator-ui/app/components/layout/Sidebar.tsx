"use client";

import {

  Truck,
  Package,
  Activity,
  BarChart3,

} from "lucide-react";

type SidebarProps = {

  darkMode: boolean;
};

export default function Sidebar({

  darkMode,

}: SidebarProps) {

  const navItems = [

    {
      icon: Truck,
      active: true,
    },

    {
      icon: Package,
      active: false,
    },

    {
      icon: Activity,
      active: false,
    },

    {
      icon: BarChart3,
      active: false,
    },
  ];

  return (

    <aside
      className={`w-[84px] shrink-0 border-r flex flex-col items-center py-6 transition-colors duration-300 ${
        darkMode
          ? "bg-[#0C0C0C] border-white/[0.05]"
          : "bg-white border-[#E5E7EB]"
      }`}
    >

      <div className="mb-9">

        <div
          className={`w-[48px] h-[48px] rounded-xl flex items-center justify-center border ${
            darkMode
              ? "bg-[#141414] border-white/[0.06]"
              : "bg-[#111111] border-black/5"
          }`}
        >

          <span className="text-white text-base font-semibold tracking-tight">

            J

          </span>

        </div>

      </div>

      <nav className="flex flex-col gap-2 flex-1">

        {navItems.map(
          (item, index) => {

            const Icon =
              item.icon;

            const activeDark =
              item.active &&
              "bg-white/[0.07] text-white border border-white/[0.08] shadow-none";

            const activeLight =
              item.active &&
              "bg-[#111111] text-white border border-black/5 shadow-sm";

            const idleDark =
              !item.active &&
              "text-[#737373] border border-transparent hover:bg-white/[0.04] hover:text-[#E5E5E5]";

            const idleLight =
              !item.active &&
              "text-[#6B7280] border border-transparent hover:bg-[#F3F4F6] hover:text-[#111827]";

            return (

              <button
                key={index}
                type="button"
                className={`relative w-[50px] h-[50px] rounded-xl flex items-center justify-center transition-all duration-200 ${
                  item.active

                    ? darkMode
                      ? activeDark
                      : activeLight

                    : darkMode
                      ? idleDark
                      : idleLight
                }`}
              >

                {item.active && !darkMode && (

                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full bg-white" />

                )}

                <Icon className="w-[20px] h-[20px] stroke-[1.5]" />

              </button>
            );
          }
        )}

      </nav>

      <div className="mt-auto pt-5">

        <div className="relative">

          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-medium tracking-wide border transition-colors ${
              darkMode
                ? "bg-[#141414] border-white/[0.06] text-[#A3A3A3]"
                : "bg-[#F3F4F6] border-[#E5E7EB] text-[#4B5563]"
            }`}
          >

            JB

          </div>

          <span
            className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 ${
              darkMode
                ? "bg-[#4ADE80] border-[#0C0C0C]"
                : "bg-[#22C55E] border-white"
            }`}
            title="Online"
          />

        </div>

      </div>

    </aside>
  );
}

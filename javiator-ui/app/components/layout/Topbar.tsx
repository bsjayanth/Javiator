"use client";

import NotificationCenter from "../NotificationCenter";

import {

  Search,
  Moon,
  Sun,

} from "lucide-react";

type TopbarProps = {

  darkMode: boolean;

  setDarkMode: (
    value: boolean
  ) => void;
};

export default function Topbar({

  darkMode,

  setDarkMode,

}: TopbarProps) {

  return (

    <header className="relative z-50 shrink-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-8 lg:px-10 py-5 transition-colors duration-300">

      <div className="min-w-0">

        <h1
          className={`text-[30px] sm:text-[34px] lg:text-[36px] font-bold tracking-[-0.04em] leading-none truncate ${
            darkMode
              ? "text-[#FAFAFA]"
              : "text-[#111827]"
          }`}
        >

          Javiator OS

        </h1>

        <p
          className={`text-[13px] mt-2 tracking-wide font-normal ${
            darkMode
              ? "text-[#9CA3AF]"
              : "text-[#6B7280]"
          }`}
        >

          Intelligent Logistics Control Tower

        </p>

      </div>

      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">

        <div
          className={`flex flex-1 sm:flex-initial sm:w-[min(420px,36vw)] h-[46px] rounded-full px-4 items-center gap-3 border transition-colors ${
            darkMode
              ? "bg-[#141414] border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
              : "bg-white border-[#E5E7EB] shadow-[0_6px_24px_rgba(15,23,42,0.06)]"
          }`}
        >

          <Search
            className={`w-4 h-4 shrink-0 ${
              darkMode
                ? "text-[#737373]"
                : "text-[#9CA3AF]"
            }`}
          />

          <input
            type="search"
            placeholder="Search vehicles, drivers, orders…"
            className={`bg-transparent outline-none text-sm w-full placeholder:font-normal ${
              darkMode
                ? "text-[#FAFAFA] placeholder:text-[#737373]"
                : "text-[#111827] placeholder:text-[#9CA3AF]"
            }`}
          />

        </div>

        <button
          type="button"
          onClick={() =>
            setDarkMode(!darkMode)
          }
          aria-label={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          className={`shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border transition-all duration-200 ${
            darkMode
              ? "bg-[#141414] border-white/[0.06] text-[#E5E5E5] hover:bg-[#1a1a1a]"
              : "bg-white border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]"
          }`}
        >

          {darkMode ? (

            <Sun className="w-[19px] h-[19px]" />

          ) : (

            <Moon className="w-[19px] h-[19px]" />

          )}

        </button>

        <NotificationCenter
          darkMode={darkMode}
        />

      </div>

    </header>
  );
}

"use client";

import React from "react";
import { useTheme } from "@/lib/theme-context";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  variant?: "icon" | "button";
  className?: string;
}

export default function ThemeToggle({
  variant = "button",
  className = "",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (variant === "icon") {
    return (
      <button
        onClick={toggleTheme}
        className={`min-h-[40px] min-w-[40px] p-2.5 rounded-2xl backdrop-blur-md border transition-all shadow-lg flex items-center justify-center ${
          isDark
            ? "bg-slate-900/80 text-amber-300 border-slate-700 hover:bg-slate-800 hover:text-amber-200"
            : "bg-white/90 text-amber-600 border-slate-200 hover:bg-slate-100 shadow-slate-200/50"
        } ${className}`}
        title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
      >
        {isDark ? <Sun size={17} className="animate-spin-slow" /> : <Moon size={17} />}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`min-h-[40px] flex items-center gap-1.5 px-3 py-2 rounded-2xl border backdrop-blur-md text-xs font-bold transition-all shadow-lg hover:scale-105 active:scale-95 ${
        isDark
          ? "bg-slate-900/90 text-amber-300 border-slate-700 hover:bg-slate-800"
          : "bg-white/95 text-amber-600 border-slate-200 hover:bg-slate-100 shadow-slate-200/50"
      } ${className}`}
      title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
    >
      {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-600" />}
      <span className="hidden sm:inline">{isDark ? "Giao diện Sáng" : "Giao diện Tối"}</span>
    </button>
  );
}

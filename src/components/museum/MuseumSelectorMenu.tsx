"use client";

import React, { useState, useMemo } from "react";
import { MuseumSite } from "@/data/museums-directory";
import { spaceAudio } from "@/lib/audio-synth";
import {
  Landmark,
  Search,
  MapPin,
  X,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface MuseumSelectorMenuProps {
  isOpen: boolean;
  onClose: () => void;
  museums: Record<string, MuseumSite>;
  currentMuseumId: string;
  onSelectMuseum: (museumId: string, roomId?: string) => void;
}

export default function MuseumSelectorMenu({
  isOpen,
  onClose,
  museums,
  currentMuseumId,
  onSelectMuseum,
}: MuseumSelectorMenuProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");

  const museumsList = useMemo(() => Object.values(museums), [museums]);

  // Extract unique cities
  const cities = useMemo(() => {
    const set = new Set<string>();
    museumsList.forEach((m) => set.add(m.city));
    return ["all", ...Array.from(set)];
  }, [museumsList]);

  // Filter museums by search and city
  const filteredMuseums = useMemo(() => {
    return museumsList.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCity = selectedCity === "all" || m.city === selectedCity;
      return matchSearch && matchCity;
    });
  }, [museumsList, searchTerm, selectedCity]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-stone-900 border border-amber-500/40 rounded-3xl shadow-2xl text-white flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo THCS Lê Anh Xuân"
              className="w-11 h-11 object-contain rounded-full shrink-0 border border-amber-400/40 shadow-md bg-white/10"
            />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-100 flex items-center gap-2">
                Chọn Không Gian Sky Lab 360°
              </h2>
              <p className="text-xs text-stone-400">
                Trường THCS Lê Anh Xuân • Khám phá tri thức & không gian 360°
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & City Filter Bar */}
        <div className="p-4 border-b border-stone-800 bg-stone-900/60 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm bảo tàng theo tên, thành phố, cổ vật..."
              className="w-full bg-stone-950 border border-stone-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none"
            />
          </div>

          {/* City Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
              <MapPin size={12} /> Khu vực:
            </span>
            {cities.map((city) => (
              <button
                key={`city-${city}`}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCity === city
                    ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                    : "bg-stone-800 text-stone-300 hover:bg-stone-700"
                }`}
              >
                {city === "all" ? "Tất cả tỉnh thành" : city}
              </button>
            ))}
          </div>
        </div>

        {/* Museum Cards Grid List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredMuseums.map((museum) => {
            const isSelected = museum.id === currentMuseumId;
            const roomCount = Object.keys(museum.rooms || {}).length;

            return (
              <div
                key={`mus-card-${museum.id}`}
                className={`flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-amber-950/40 border-amber-400/80 shadow-lg shadow-amber-500/10"
                    : "bg-stone-950/60 border-stone-800 hover:border-amber-500/40 hover:bg-stone-950"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{museum.thumbnailEmoji}</span>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-amber-100 leading-snug">
                          {museum.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] flex items-center gap-1 text-amber-300 font-medium">
                            <MapPin size={11} /> {museum.city}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            • {roomCount} gian phòng
                          </span>
                        </div>
                      </div>
                    </div>

                    {museum.badge && (
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap shrink-0">
                        {museum.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-300 line-clamp-2 my-2 leading-relaxed">
                    {museum.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">Google Map Tour 360°</span>
                  <button
                    onClick={() => {
                      spaceAudio.playWarpSound();
                      onSelectMuseum(museum.id, museum.defaultRoomId);
                      onClose();
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md ${
                      isSelected
                        ? "bg-amber-500 text-stone-950 shadow-amber-500/30"
                        : "bg-stone-800 text-amber-200 hover:bg-amber-500 hover:text-stone-950"
                    }`}
                  >
                    <span>{isSelected ? "Đang tham quan" : "Vào tham quan"}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

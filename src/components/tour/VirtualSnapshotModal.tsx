"use client";

import React, { useRef, useEffect, useState } from "react";
import { Camera, Download, X, Sparkles, Check, Share2 } from "lucide-react";

interface VirtualSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  coords: { pitch: number; yaw: number };
  isSpaceMode?: boolean;
}

export default function VirtualSnapshotModal({
  isOpen,
  onClose,
  title,
  subtitle,
  coords,
  isSpaceMode = false,
}: VirtualSnapshotModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSnapshotUrl(null);
      return;
    }

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 1200;
      canvas.height = 750;

      // Find current Three.js WebGL canvas on the page
      const webglCanvas = document.querySelector("canvas") as HTMLCanvasElement | null;

      if (webglCanvas) {
        try {
          ctx.drawImage(webglCanvas, 0, 0, 1200, 750);
        } catch {
          drawPlaceholder(ctx);
        }
      } else {
        drawPlaceholder(ctx);
      }

      // Draw Postcard Vignette & Frame
      const grad = ctx.createLinearGradient(0, 500, 0, 750);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.85)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 450, 1200, 300);

      // Outer Frame
      ctx.strokeStyle = isSpaceMode ? "#38bdf8" : "#f59e0b";
      ctx.lineWidth = 12;
      ctx.strokeRect(10, 10, 1180, 730);

      // Watermark & Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px sans-serif";
      ctx.fillText(`📸 CHECK-IN: ${title.toUpperCase()}`, 40, 640);

      ctx.fillStyle = isSpaceMode ? "#38bdf8" : "#fbbf24";
      ctx.font = "20px sans-serif";
      ctx.fillText(
        `${subtitle || "Tour Tham Quan Thực Tế Ảo 360°"} • Tọa độ 3D: (${coords.pitch}°, ${coords.yaw}°)`,
        40,
        680
      );

      // Date Stamp
      const now = new Date().toLocaleDateString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      ctx.textAlign = "right";
      ctx.fillStyle = "#94a3b8";
      ctx.font = "18px sans-serif";
      ctx.fillText(`Thời gian: ${now}`, 1150, 680);
      ctx.fillText("Solar & Museum 360° EduTech VR", 1150, 640);

      setSnapshotUrl(canvas.toDataURL("image/jpeg", 0.9));
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, title, subtitle, coords, isSpaceMode]);

  function drawPlaceholder(ctx: CanvasRenderingContext2D) {
    const bg = ctx.createLinearGradient(0, 0, 1200, 750);
    bg.addColorStop(0, "#090d16");
    bg.addColorStop(1, "#1e293b");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1200, 750);
  }

  const handleDownload = () => {
    if (!snapshotUrl) return;
    const a = document.createElement("a");
    a.href = snapshotUrl;
    a.download = `Checkin-${title.replace(/\s+/g, "_")}.jpg`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/30">
            <Camera size={22} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <Sparkles size={12} /> Bưu Thiếp Kỷ Niệm Ảo
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
              Ảnh Chụp Lưu Niệm: {title}
            </h2>
          </div>
        </div>

        {/* Snapshot Image Preview */}
        <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-slate-700 bg-black shadow-2xl my-3">
          {snapshotUrl ? (
            <img src={snapshotUrl} alt="Snapshot preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
              <Camera size={32} className="animate-pulse mb-2 text-cyan-400" />
              <span>Đang kết xuất ảnh bưu thiếp chất lượng cao...</span>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono">
            Tọa độ góc nhìn: {coords.pitch}°, {coords.yaw}°
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Đóng
            </button>
            <button
              onClick={handleDownload}
              disabled={!snapshotUrl}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition disabled:opacity-40"
            >
              <Download size={14} />
              <span>Tải Bưu Thiếp Về Máy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

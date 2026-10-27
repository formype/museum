"use client";

import React, { useState, useRef } from "react";
import { compressImageFile } from "@/lib/image-compressor";
import { Upload, Image as ImageIcon, Trash2, Link as LinkIcon, CheckCircle2, Sparkles, HelpCircle, Eye } from "lucide-react";

interface ImageUploaderProps {
  label: string;
  value?: string;
  onChange: (dataUrlOrUrl: string) => void;
  accentColor?: "cyan" | "amber";
  sampleCategory?: "solar" | "museum";
  isPanorama?: boolean;
}

const SAMPLE_IMAGES = {
  solar: [
    { name: "Mặt Trời Lóa", url: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=800&auto=format&fit=crop&q=80" },
    { name: "Bề Mặt Sao Hỏa", url: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop&q=80" },
    { name: "Vành Đai Sao Thổ", url: "https://images.unsplash.com/photo-1614314107768-6018061b5b72?w=800&auto=format&fit=crop&q=80" },
    { name: "Trái Đất Xanh", url: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&auto=format&fit=crop&q=80" },
  ],
  museum: [
    { name: "Trống Đồng Cổ", url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80" },
    { name: "Gốm Sứ Hoa Lam", url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80" },
    { name: "Tượng Điêu Khắc", url: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&auto=format&fit=crop&q=80" },
    { name: "Bản Đồ Cổ", url: "https://images.unsplash.com/photo-1524654458049-e36be0721fa2?w=800&auto=format&fit=crop&q=80" },
  ],
};

export default function ImageUploader({
  label,
  value,
  onChange,
  accentColor = "cyan",
  sampleCategory = "solar",
  isPanorama = false,
}: ImageUploaderProps) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAmber = accentColor === "amber";

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn một file hình ảnh (PNG, JPG, JPEG, WEBP)!");
      return;
    }

    try {
      setIsCompressing(true);
      // For 360 panorama, use 2:1 ratio (2048x1024) with quality 0.82; for standard thumbnails use 1280x800
      const maxWidth = isPanorama ? 2048 : 1280;
      const maxHeight = isPanorama ? 1024 : 800;
      const quality = isPanorama ? 0.82 : 0.78;
      const res = await compressImageFile(file, maxWidth, maxHeight, quality);
      onChange(res.dataUrl);
      setCompressionInfo(`Đã tự động nén tối ưu: ${res.originalSizeKb} KB ➔ ${res.compressedSizeKb} KB (${res.width}x${res.height})`);
    } catch (err) {
      console.error(err);
      alert("Không thể nén ảnh, vui lòng thử lại ảnh khác!");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  return (
    <div className={`p-3.5 rounded-2xl border transition-all ${
      isAmber ? "bg-amber-950/20 border-amber-500/30" : "bg-slate-900/80 border-slate-800"
    }`}>
      {/* Header & Toggle Guide */}
      <div className="flex items-center justify-between mb-2">
        <label className={`text-xs font-bold flex items-center gap-1.5 ${
          isAmber ? "text-amber-300" : "text-cyan-300"
        }`}>
          <ImageIcon size={14} />
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsHelpOpen(!isHelpOpen)}
          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
        >
          <HelpCircle size={13} />
          <span>{isHelpOpen ? "Ẩn hướng dẫn" : "Xem cách tải ảnh (3 bước)"}</span>
        </button>
      </div>

      {/* 3-Step Non-coder Guide Banner */}
      {isHelpOpen && (
        <div className="mb-3 p-3 rounded-xl bg-slate-950/90 border border-slate-700 text-xs text-slate-300 space-y-1.5 animate-slide-up">
          <div className="font-bold text-amber-300 flex items-center gap-1 text-[11px] uppercase tracking-wider">
            <span>📖 Hướng Dẫn Tải Ảnh Cho Người Không Rành Kỹ Thuật:</span>
          </div>
          <p>
            <strong className="text-white">Bước 1:</strong> Bấm nút <strong>&ldquo;Chọn ảnh từ máy&rdquo;</strong> (hoặc kéo thả ảnh vào khung) hoặc dán link ảnh vào ô bên dưới.
          </p>
          <p>
            <strong className="text-white">Bước 2:</strong> Hệ thống sẽ tự động nén ảnh chất lượng cao để tải siêu nhanh. Bạn sẽ thấy ảnh hiển thị ngay tại khung <strong>&ldquo;Xem trước&rdquo;</strong>.
          </p>
          <p>
            <strong className="text-white">Bước 3:</strong> Nhấn nút <strong>&ldquo;Lưu Thay Đổi&rdquo;</strong> màu xanh ở góc trên cùng để hoàn tất!
          </p>
        </div>
      )}

      {/* Main Upload Zone */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Drop & Picker Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`md:col-span-8 p-3.5 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
            isDragOver
              ? isAmber
                ? "border-amber-400 bg-amber-500/10"
                : "border-cyan-400 bg-cyan-500/10"
              : "border-slate-700 bg-slate-950/60 hover:border-slate-600"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/jpg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileProcess(file);
            }}
          />

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Upload size={16} className={isAmber ? "text-amber-400" : "text-cyan-400"} />
            <span>{isCompressing ? "Đang xử lý & nén ảnh..." : "Bấm vào đây để chọn ảnh từ máy hoặc kéo thả ảnh vào"}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">
            Hỗ trợ PNG, JPG, JPEG, WEBP (Tự động nén tối ưu dung lượng)
          </span>
        </div>

        {/* Preview Area */}
        <div className="md:col-span-4 flex flex-col items-center justify-center">
          {value ? (
            <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition"
                  title="Xóa ảnh"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full h-24 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center text-slate-500 text-[11px]">
              <ImageIcon size={20} className="mb-1 opacity-50" />
              <span>Chưa có ảnh</span>
            </div>
          )}
        </div>
      </div>

      {/* Direct URL Input & Quick Presets */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Hoặc dán đường link ảnh trực tiếp (https://...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && urlInput.trim()) {
                e.preventDefault();
                onChange(urlInput.trim());
                setUrlInput("");
              }
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-16 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
          {urlInput.trim() && (
            <button
              type="button"
              onClick={() => {
                onChange(urlInput.trim());
                setUrlInput("");
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] transition"
            >
              Áp dụng
            </button>
          )}
        </div>

        {/* Preset Sample Picker Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-slate-400 whitespace-nowrap">Ảnh mẫu:</span>
          {(SAMPLE_IMAGES[sampleCategory] || SAMPLE_IMAGES.solar).map((item, idx) => (
            <button
              key={`sample-${idx}`}
              type="button"
              onClick={() => onChange(item.url)}
              className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition"
            >
              ✨ {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Compression Info Notice */}
      {compressionInfo && (
        <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1">
          <CheckCircle2 size={12} />
          <span>{compressionInfo}</span>
        </div>
      )}
    </div>
  );
}

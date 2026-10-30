"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SPACES_DATA, SpaceData } from "@/data/spaces";
import { INITIAL_MUSEUMS, MuseumSite } from "@/data/museums-directory";
import {
  getStoredSpaces,
  saveStoredSpaces,
  getStoredMuseumSites,
  saveStoredMuseumSites,
  resetAllStorageDefaults,
} from "@/lib/spaces-storage";
import { spaceAudio } from "@/lib/audio-synth";
import Visual360CoordinatePicker from "@/components/admin/Visual360CoordinatePicker";
import ImageUploader from "@/components/admin/ImageUploader";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  Settings,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Upload,
  Volume2,
  Eye,
  Landmark,
  Orbit,
  ArrowLeft,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  BookOpen,
  Menu,
  X,
  Crosshair,
  MapPin,
  Sparkles,
  Download,
  FolderPlus,
} from "lucide-react";

export default function AdminPage() {
  const [adminSection, setAdminSection] = useState<"solar" | "museums">("solar");
  const [spaces, setSpaces] = useState<Record<string, SpaceData>>({});
  const [museums, setMuseums] = useState<Record<string, MuseumSite>>({});
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("sun");
  const [selectedMuseumId, setSelectedMuseumId] = useState<string>("history-museum-vn");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("grand-hall");
  const [activeTab, setActiveTab] = useState<"general" | "panorama" | "audio" | "faq" | "hotspots">("general");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [pickedCoords, setPickedCoords] = useState<{ pitch: number; yaw: number } | null>(null);
  const [activeCreationData, setActiveCreationData] = useState<{
    title: string;
    category: "info" | "portal" | "quiz" | "discovery";
    badge: string;
    era: string;
    emoji: string;
    description: string;
    fact: string;
    funFact: string;
    audioGuideText: string;
    image: string;
  }>({
    title: "",
    category: "info",
    badge: "Khám Phá",
    era: "Thời kỳ lịch sử",
    emoji: "🏺",
    description: "",
    fact: "",
    funFact: "",
    audioGuideText: "",
    image: "",
  });

  useEffect(() => {
    const loadedSpaces = getStoredSpaces();
    const loadedMuseums = getStoredMuseumSites();
    setSpaces(loadedSpaces);
    setMuseums(loadedMuseums);
    setSelectedSpaceId(Object.keys(loadedSpaces)[0] || "sun");
    const firstMusId = Object.keys(loadedMuseums)[0] || "history-museum-vn";
    setSelectedMuseumId(firstMusId);
    setSelectedRoomId(loadedMuseums[firstMusId]?.defaultRoomId || Object.keys(loadedMuseums[firstMusId]?.rooms || {})[0] || "grand-hall");
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentSpace = spaces[selectedSpaceId];
  const currentMuseum = museums[selectedMuseumId];
  const currentRoom = currentMuseum?.rooms?.[selectedRoomId];

  const handleSaveAll = () => {
    if (adminSection === "solar") {
      saveStoredSpaces(spaces);
      showToast("Đã lưu thành công dữ liệu Hệ Mặt Trời!");
    } else {
      saveStoredMuseumSites(museums);
      showToast("Đã lưu thành công danh sách Bảo Tàng & Gian Phòng!");
    }
  };

  const handleReset = () => {
    if (confirm("Bạn có chắc chắn muốn khôi phục về dữ liệu gốc ban đầu?")) {
      resetAllStorageDefaults();
      setSpaces(SPACES_DATA);
      setMuseums(INITIAL_MUSEUMS);
      setSelectedSpaceId("sun");
      setSelectedMuseumId("history-museum-vn");
      setSelectedRoomId("grand-hall");
      showToast("Đã khôi phục dữ liệu mặc định.");
    }
  };

  const handlePanoramaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;
      if (adminSection === "solar" && currentSpace) {
        setSpaces({
          ...spaces,
          [selectedSpaceId]: { ...currentSpace, customPanorama: result },
        });
        showToast("Đã cập nhật ảnh 360° cho " + currentSpace.name + ". Hãy bấm 'Lưu Thay Đổi'!");
      } else if (adminSection === "museums" && currentMuseum && currentRoom) {
        const nextRooms = { ...currentMuseum.rooms };
        nextRooms[selectedRoomId] = { ...currentRoom, customPanorama: result };
        setMuseums({
          ...museums,
          [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
        });
        showToast("Đã cập nhật ảnh 360° cho " + currentRoom.name + ". Hãy bấm 'Lưu Thay Đổi'!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExportBackup = () => {
    const backupData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      spaces,
      museums,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Solar-Museum-360-Backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Đã xuất file sao lưu dữ liệu (.JSON) thành công!");
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.spaces) {
          setSpaces(parsed.spaces);
          saveStoredSpaces(parsed.spaces);
        }
        if (parsed.museums) {
          setMuseums(parsed.museums);
          saveStoredMuseumSites(parsed.museums);
        }
        showToast("Đã khôi phục toàn bộ dữ liệu từ file sao lưu JSON!");
      } catch (err) {
        console.error(err);
        alert("File sao lưu JSON không đúng định dạng!");
      }
    };
    reader.readAsText(file);
  };

  const handleTestAudio = (text: string) => {
    spaceAudio.speakNarration(text);
  };

  const handleAddNewMuseum = () => {
    const name = prompt("Nhập tên bảo tàng / di tích mới:", "Bảo Tàng Lịch Sử Mới");
    if (!name || !name.trim()) return;
    const city = prompt("Nhập địa điểm / thành phố:", "Hà Nội") || "Việt Nam";
    const emoji = prompt("Biểu tượng Emoji (vd: 🏛️, 🏯, 🏺):", "🏛️") || "🏛️";

    const newId = "museum-" + Date.now();
    const defaultRoomId = "room-main";
    const newMuseum: MuseumSite = {
      id: newId,
      name: name.trim(),
      shortName: name.trim().slice(0, 15),
      city: city.trim(),
      badge: "Bảo Tàng Mới",
      thumbnailEmoji: emoji.trim(),
      description: "Khám phá không gian văn hóa nghệ thuật và các cổ vật lịch sử quý báu.",
      defaultRoomId: defaultRoomId,
      rooms: {
        [defaultRoomId]: {
          id: defaultRoomId,
          name: "Sảnh Trưng Bày Chính",
          subtitle: "Điểm khởi đầu chuyến tham quan bảo tàng",
          category: "grand_hall",
          themeColor: "#d97706",
          bgType: "grand_hall",
          audioNarration: {
            title: `Lời chào mừng tại ${name.trim()}`,
            speaker: "Thuyết Minh Viên Bảo Ngọc",
            transcript: `Kính chào quý khách đã đến với ${name.trim()}. Chúc quý khách có một chuyến tham quan thực tế ảo đầy thú vị.`,
          },
          aiGuide: {
            name: "Bảo Ngọc",
            avatar: "🏛️",
            title: "Hướng Dẫn Viên Di Sản",
            welcomeMessage: `Chào mừng bạn đến với ${name.trim()}! Hãy hỏi tôi về các hiện vật trưng bày tại đây nhé.`,
            suggestedQuestions: ["Bảo tàng được thành lập từ khi nào?", "Hiện vật quý nhất ở đây là gì?"],
            faqList: [],
          },
          navigationLinks: [],
          artifacts: [],
        },
      },
    };

    const nextMuseums = { ...museums, [newId]: newMuseum };
    setMuseums(nextMuseums);
    saveStoredMuseumSites(nextMuseums);
    setSelectedMuseumId(newId);
    setSelectedRoomId(defaultRoomId);
    showToast(`Đã tạo thành công bảo tàng "${name.trim()}"!`);
  };

  const handleAddNewRoom = () => {
    if (!currentMuseum) return;
    const roomName = prompt("Nhập tên gian phòng mới:", "Phòng Trưng Bày Mới");
    if (!roomName || !roomName.trim()) return;

    const newRoomId = "room-" + Date.now();
    const newRoom = {
      id: newRoomId,
      name: roomName.trim(),
      subtitle: "Gian phòng trưng bày chuyên đề",
      category: "relics_gallery" as const,
      themeColor: "#dc2626",
      bgType: "relics_gallery" as const,
      audioNarration: {
        title: `Thuyết minh tại ${roomName.trim()}`,
        speaker: "Thuyết Minh Viên AI",
        transcript: `Chào mừng quý khách đến với ${roomName.trim()}.`,
      },
      aiGuide: {
        name: "Hướng Dẫn Viên AI",
        avatar: "📜",
        title: "Chuyên Gia Thuyết Minh",
        welcomeMessage: `Chào mừng bạn đến với ${roomName.trim()}!`,
        suggestedQuestions: ["Gian phòng này trưng bày những gì?"],
        faqList: [],
      },
      navigationLinks: [
        {
          targetRoomId: currentMuseum.defaultRoomId,
          targetRoomName: "Sảnh Chính",
          direction: "backward" as const,
          pitch: -30,
          yaw: 180,
          label: "Quay về Sảnh Chính",
        },
      ],
      artifacts: [],
    };

    const nextRooms = { ...currentMuseum.rooms, [newRoomId]: newRoom };
    const nextMuseums = {
      ...museums,
      [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
    };
    setMuseums(nextMuseums);
    saveStoredMuseumSites(nextMuseums);
    setSelectedRoomId(newRoomId);
    showToast(`Đã thêm gian phòng "${roomName.trim()}" thành công!`);
  };

  // Add Hotspot from Visual 360 Crosshair Target
  const handleAddMarkerFromCoordinates = (coords: { pitch: number; yaw: number }) => {
    setPickedCoords(coords);
    if (adminSection === "solar") {
      setActiveCreationData({
        title: `Điểm Khám Phá (${coords.pitch}°, ${coords.yaw}°)`,
        category: "info",
        badge: "Khám Phá",
        era: "",
        emoji: "✨",
        description: "",
        fact: "",
        funFact: "",
        audioGuideText: "",
        image: "",
      });
    } else {
      setActiveCreationData({
        title: `Cổ Vật Mới (${coords.pitch}°, ${coords.yaw}°)`,
        category: "info",
        badge: "",
        era: "Thời kỳ lịch sử",
        emoji: "🏺",
        description: "",
        fact: "",
        funFact: "",
        audioGuideText: "",
        image: "",
      });
    }
    showToast(`Đã chọn tọa độ Pitch: ${coords.pitch}°, Yaw: ${coords.yaw}°. Hãy điền thông tin và tải ảnh bên dưới!`);
  };

  const handleSavePickedPoint = () => {
    if (!pickedCoords) return;
    if (adminSection === "solar" && currentSpace) {
      const newSpot = {
        id: "spot-" + Date.now(),
        pitch: pickedCoords.pitch,
        yaw: pickedCoords.yaw,
        title: activeCreationData.title || `Điểm Khám Phá (${pickedCoords.pitch}°, ${pickedCoords.yaw}°)`,
        category: activeCreationData.category,
        badge: activeCreationData.badge || undefined,
        description: activeCreationData.description || "Mô tả điểm khám phá không gian...",
        image: activeCreationData.image || undefined,
        details: {
          fact: activeCreationData.fact || "Thông tin khoa học về điểm này.",
          funFact: activeCreationData.funFact || undefined,
          image: activeCreationData.image || undefined,
        },
      };

      setSpaces({
        ...spaces,
        [selectedSpaceId]: {
          ...currentSpace,
          hotspots: [...currentSpace.hotspots, newSpot],
        },
      });
      setPickedCoords(null);
      showToast("Đã lưu điểm thuyết minh mới thành công!");
    } else if (adminSection === "museums" && currentMuseum && currentRoom) {
      const newArtifact = {
        id: "art-" + Date.now(),
        name: activeCreationData.title || `Cổ vật (${pickedCoords.pitch}°, ${pickedCoords.yaw}°)`,
        era: activeCreationData.era || "Thời kỳ lịch sử",
        thumbnailEmoji: activeCreationData.emoji || "🏺",
        shortSummary: activeCreationData.description || "Tóm tắt về hiện vật...",
        historicalStory: activeCreationData.fact || activeCreationData.description || "Câu chuyện lịch sử chi tiết...",
        funFact: activeCreationData.funFact || "Bí ẩn lịch sử thú vị.",
        pitch: pickedCoords.pitch,
        yaw: pickedCoords.yaw,
        audioGuideText: activeCreationData.audioGuideText || activeCreationData.description || "Lời giới thiệu hiện vật...",
        image: activeCreationData.image || undefined,
      };

      const nextRooms = { ...currentMuseum.rooms };
      nextRooms[selectedRoomId] = {
        ...currentRoom,
        artifacts: [...(currentRoom.artifacts || []), newArtifact],
      };

      setMuseums({
        ...museums,
        [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
      });
      setPickedCoords(null);
      showToast("Đã thêm cổ vật mới vào gian phòng thành công!");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-semibold text-xs sm:text-sm shadow-2xl animate-fade-in border border-emerald-400">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navbar */}
      <header className="px-3 sm:px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between sticky top-0 z-40 gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
            className="md:hidden min-h-[40px] min-w-[40px] p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
          >
            {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link
            href="/"
            className="min-h-[40px] min-w-[40px] p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center justify-center"
            title="Quay về Trang chủ"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0">
              <Settings size={16} />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-xs sm:text-base font-bold text-white truncate">
                Quản Trị Hệ Thống (Admin CMS)
              </h1>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sáng / Tối */}
          <ThemeToggle variant="icon" />

          {/* Xuất Sao Lưu JSON */}
          <button
            onClick={handleExportBackup}
            className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            title="Xuất file JSON sao lưu toàn bộ dữ liệu"
          >
            <Download size={13} />
            <span>Sao Lưu</span>
          </button>

          {/* Nhập Sao Lưu JSON */}
          <label
            className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            title="Khôi phục dữ liệu từ file JSON sao lưu"
          >
            <Upload size={13} />
            <span>Nhập File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={handleReset}
            className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            <RotateCcw size={13} />
            <span>Khôi Phục</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="min-h-[40px] flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition border border-cyan-300"
          >
            <Save size={15} />
            <span>Lưu Thay Đổi</span>
          </button>

          <Link
            href="/"
            className="min-h-[40px] flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition border border-emerald-400"
          >
            <Eye size={15} />
            <span className="hidden sm:inline">Xem Tour</span>
          </Link>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <aside
          className={`fixed md:relative inset-y-0 left-0 z-30 w-72 sm:w-80 bg-slate-900 border-r border-slate-800 flex flex-col p-4 overflow-y-auto transform transition-transform duration-300 ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Main Section Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-4">
            <button
              onClick={() => {
                setAdminSection("solar");
                setSelectedSpaceId(Object.keys(spaces)[0] || "sun");
                if (activeTab === "panorama") setActiveTab("general");
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
                adminSection === "solar"
                  ? "bg-cyan-500 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Orbit size={14} />
              <span>Hệ Mặt Trời</span>
            </button>

            <button
              onClick={() => {
                setAdminSection("museums");
                const firstM = Object.keys(museums)[0] || "history-museum-vn";
                setSelectedMuseumId(firstM);
                setSelectedRoomId(museums[firstM]?.defaultRoomId || "grand-hall");
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
                adminSection === "museums"
                  ? "bg-amber-500 text-stone-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Landmark size={14} />
              <span>Sky Lab / Bảo Tàng</span>
            </button>
          </div>

          <div className="space-y-1.5 flex-1">
            {adminSection === "solar"
              ? Object.values(spaces).map((s) => {
                  const isSelected = selectedSpaceId === s.id;
                  return (
                    <button
                      key={`s-${s.id}`}
                      onClick={() => {
                        setSelectedSpaceId(s.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full min-h-[44px] flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition border ${
                        isSelected
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-md"
                          : "bg-slate-800/40 text-slate-300 border-slate-800 hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-base">{s.aiContext.avatarEmoji}</span>
                      <div className="overflow-hidden">
                        <div className="font-bold truncate">{s.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{s.nameEn}</div>
                      </div>
                    </button>
                  );
                })
              : Object.values(museums).map((m) => {
                  const isSelected = selectedMuseumId === m.id;
                  const roomCount = Object.keys(m.rooms || {}).length;

                  return (
                    <button
                      key={`mus-item-${m.id}`}
                      onClick={() => {
                        setSelectedMuseumId(m.id);
                        setSelectedRoomId(m.defaultRoomId || Object.keys(m.rooms || {})[0]);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full min-h-[44px] flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition border ${
                        isSelected
                          ? "bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-md"
                          : "bg-slate-800/40 text-slate-300 border-slate-800 hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-base">{m.thumbnailEmoji}</span>
                      <div className="overflow-hidden flex-1">
                        <div className="font-bold truncate">{m.name}</div>
                        <div className="text-[10px] text-stone-400 flex items-center gap-1">
                          <span>{m.city}</span> • <span>{roomCount} phòng</span>
                        </div>
                      </div>
                    </button>
                  );
                })}

            {adminSection === "museums" && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={handleAddNewMuseum}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow"
                >
                  <Plus size={14} />
                  <span>Thêm Bảo Tàng Mới</span>
                </button>

                {currentMuseum && (
                  <button
                    onClick={handleAddNewRoom}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                  >
                    <FolderPlus size={14} />
                    <span>Thêm Gian Phòng Cho {currentMuseum.name}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Right Main Editor */}
        <main className="flex-1 flex flex-col bg-slate-950 overflow-y-auto p-4 sm:p-6">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-4 overflow-x-auto no-scrollbar">
            {/* Chỉ hiện Tab Ảnh 360 & Tọa độ khi đang ở phần Sky Lab / Bảo Tàng */}
            {adminSection === "museums" && (
              <button
                onClick={() => setActiveTab("panorama")}
                className={`min-h-[38px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  activeTab === "panorama" ? "bg-amber-500 text-stone-950 shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                <Crosshair size={14} />
                <span>1. Chấm Tọa Độ 360° Trực Quan</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("general")}
              className={`min-h-[38px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === "general" ? "bg-cyan-500 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText size={13} />
              <span>{adminSection === "solar" ? "1. Kiến Thức & Thông Số" : "2. Thông Tin"}</span>
            </button>
            <button
              onClick={() => setActiveTab("audio")}
              className={`min-h-[38px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === "audio" ? "bg-cyan-500 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Volume2 size={13} />
              <span>{adminSection === "solar" ? "2. Thuyết Minh Giọng AI" : "3. Thuyết Trình"}</span>
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`min-h-[38px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === "faq" ? "bg-cyan-500 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare size={13} />
              <span>{adminSection === "solar" ? "3. Câu Hỏi & Trợ Lý AI" : "4. FAQ & AI"}</span>
            </button>
            {adminSection === "museums" && (
              <button
                onClick={() => setActiveTab("hotspots")}
                className={`min-h-[38px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  activeTab === "hotspots" ? "bg-cyan-500 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <BookOpen size={13} />
                <span>5. Danh Sách Hiện Vật</span>
              </button>
            )}
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: BỘ CHẤM TỌA ĐỘ 360 ĐỘ TRỰC QUAN (CHỈ DÀNH CHO SKY LAB / BẢO TÀNG)  */}
          {/* ========================================================================= */}
          {activeTab === "panorama" && adminSection === "museums" && (
            <div className="max-w-4xl w-full mx-auto space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
                <h3 className="text-sm sm:text-base font-bold text-amber-200 flex items-center gap-2">
                  <Crosshair size={16} className="text-amber-400" />
                  Định Vị Tọa Độ & Điểm Thuyết Trình Trên Ảnh 360°
                </h3>
                <p className="text-xs text-stone-300 mt-1">
                  Cách dùng: <strong>Kéo xoay khung hình 360°</strong> bên dưới để đưa tâm ngắm (dấu cộng đỏ) vào đúng đồ vật/vị trí bạn muốn thuyết trình, sau đó bấm nút <strong>&ldquo;🎯 Chấm Tọa Độ Này Để Thuyết Trình&rdquo;</strong>.
                </p>
              </div>

              {/* Interactive Visual 360 Coordinate Picker Component */}
              <Visual360CoordinatePicker
                bgType={currentRoom?.bgType || "grand_hall"}
                isSpaceMode={false}
                spaceId={undefined}
                customPanoramaUrl={currentRoom?.customPanorama}
                existingMarkers={
                  (currentRoom?.artifacts || []).map((a) => ({
                    id: a.id,
                    name: a.name,
                    pitch: a.pitch,
                    yaw: a.yaw,
                    emoji: a.thumbnailEmoji,
                  }))
                }
                onAddMarkerAtCoordinate={handleAddMarkerFromCoordinates}
              />

              {/* Form Điền Nội Dung & Tải Ảnh Cho Điểm Vừa Chấm Tọa Độ */}
              {pickedCoords && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border-2 border-amber-500/80 shadow-2xl space-y-4 animate-slide-up">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs">
                        🎯
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-amber-200">
                          Điền Thông Tin & Tải Ảnh Cho Cổ Vật / Điểm Trưng Bày
                        </h4>
                        <p className="text-[11px] font-mono text-cyan-400">
                          Tọa độ: Pitch {pickedCoords.pitch}° | Yaw {pickedCoords.yaw}°
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPickedCoords(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Tên Cổ Vật / Hiện Vật:
                      </label>
                      <input
                        type="text"
                        value={activeCreationData.title}
                        onChange={(e) => setActiveCreationData({ ...activeCreationData, title: e.target.value })}
                        placeholder="Nhập tên/tiêu đề..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Niên Đại / Thời Kỳ:
                      </label>
                      <input
                        type="text"
                        value={activeCreationData.era}
                        onChange={(e) => setActiveCreationData({ ...activeCreationData, era: e.target.value })}
                        placeholder="Vd: Thế kỷ X..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Mô Tả / Tóm Tắt Ngắn:</label>
                    <textarea
                      rows={2}
                      value={activeCreationData.description}
                      onChange={(e) => setActiveCreationData({ ...activeCreationData, description: e.target.value })}
                      placeholder="Mô tả ngắn gọn về điểm này..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Câu Chuyện Lịch Sử Chi Tiết:
                      </label>
                      <textarea
                        rows={2}
                        value={activeCreationData.fact}
                        onChange={(e) => setActiveCreationData({ ...activeCreationData, fact: e.target.value })}
                        placeholder="Nội dung kiến thức / câu chuyện chi tiết..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Bí Ẩn / Sự Thật Thú Vị (Fun Fact):</label>
                      <textarea
                        rows={2}
                        value={activeCreationData.funFact}
                        onChange={(e) => setActiveCreationData({ ...activeCreationData, funFact: e.target.value })}
                        placeholder="Sự thật thú vị..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Upload Image Section with Step-by-Step UI */}
                  <ImageUploader
                    label="Hình Ảnh Minh Họa / Ảnh Tư Liệu Đính Kèm:"
                    value={activeCreationData.image}
                    onChange={(url) => setActiveCreationData({ ...activeCreationData, image: url })}
                    accentColor="amber"
                    sampleCategory="museum"
                  />

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setPickedCoords(null)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      onClick={handleSavePickedPoint}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition"
                    >
                      <Save size={14} />
                      <span>Lưu & Thêm Điểm Neo Này</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Panorama File Section (Chỉ dành cho phòng bảo tàng) */}
              <div className="space-y-2">
                <ImageUploader
                  label={`Ảnh Toàn Cảnh Panorama 360° Cho ${currentRoom?.name || "Gian Phòng"}:`}
                  value={currentRoom?.customPanorama}
                  onChange={(url) => {
                    if (currentMuseum && currentRoom) {
                      const nextRooms = { ...currentMuseum.rooms };
                      nextRooms[selectedRoomId] = { ...currentRoom, customPanorama: url };
                      setMuseums({
                        ...museums,
                        [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
                      });
                      showToast("Đã cập nhật ảnh 360° cho " + currentRoom.name + ". Hãy bấm 'Lưu Thay Đổi'!");
                    }
                  }}
                  accentColor="amber"
                  sampleCategory="museum"
                  isPanorama={true}
                />
              </div>
            </div>
          )}

          {/* TAB 2: THÔNG TIN */}
          {activeTab === "general" && (
            <div className="max-w-4xl w-full mx-auto space-y-4">
              {adminSection === "solar" && currentSpace ? (
                <div className="space-y-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-5 rounded-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Tên Hành Tinh / Thiên Thể</label>
                      <input
                        type="text"
                        value={currentSpace.name}
                        onChange={(e) =>
                          setSpaces({
                            ...spaces,
                            [selectedSpaceId]: { ...currentSpace, name: e.target.value },
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Tên Tiếng Anh</label>
                      <input
                        type="text"
                        value={currentSpace.nameEn}
                        onChange={(e) =>
                          setSpaces({
                            ...spaces,
                            [selectedSpaceId]: { ...currentSpace, nameEn: e.target.value },
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Khẩu Hiệu / Tagline</label>
                    <input
                      type="text"
                      value={currentSpace.tagline}
                      onChange={(e) =>
                        setSpaces({
                          ...spaces,
                          [selectedSpaceId]: { ...currentSpace, tagline: e.target.value },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>

                  {/* Khoảng cách từ Trái Đất & Mặt Trời */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-cyan-400 mb-1">Khoảng Cách Từ Trái Đất</label>
                      <input
                        type="text"
                        value={currentSpace.stats.distanceFromEarth || ""}
                        placeholder="Vd: 54.6 - 401 triệu km (~225 triệu km)"
                        onChange={(e) =>
                          setSpaces({
                            ...spaces,
                            [selectedSpaceId]: {
                              ...currentSpace,
                              stats: { ...currentSpace.stats, distanceFromEarth: e.target.value },
                            },
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Khoảng Cách Tới Mặt Trời</label>
                      <input
                        type="text"
                        value={currentSpace.stats.distanceFromSun}
                        onChange={(e) =>
                          setSpaces({
                            ...spaces,
                            [selectedSpaceId]: {
                              ...currentSpace,
                              stats: { ...currentSpace.stats, distanceFromSun: e.target.value },
                            },
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>

                  {/* Các thông số thiên văn & địa lý */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Đường Kính</label>
                      <input
                        type="text"
                        value={currentSpace.stats.diameter}
                        onChange={(e) =>
                          setSpaces({
                            ...spaces,
                            [selectedSpaceId]: {
                              ...currentSpace,
                              stats: { ...currentSpace.stats, diameter: e.target.value },
                            },
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Nhiệt Độ Bề Mặt</label>
                      <input
                        type="text"
                        value={currentSpace.stats.temperature}
                        onChange={(e) =>
                          setSpaces({
                            ...spaces,
                            [selectedSpaceId]: {
                              ...currentSpace,
                              stats: { ...currentSpace.stats, temperature: e.target.value },
                            },
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Độ Dài Ngày</label>
                      <input
                        type="text"
                        value={currentSpace.stats.dayLength}
                        onChange={(e) =>
                          setSpaces({
                            ...spaces,
                            [selectedSpaceId]: {
                              ...currentSpace,
                              stats: { ...currentSpace.stats, dayLength: e.target.value },
                            },
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Chu Kỳ Năm</label>
                      <input
                        type="text"
                        value={currentSpace.stats.yearLength}
                        onChange={(e) =>
                          setSpaces({
                            ...spaces,
                            [selectedSpaceId]: {
                              ...currentSpace,
                              stats: { ...currentSpace.stats, yearLength: e.target.value },
                            },
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Mô tả chi tiết tổng quan */}
                  <div className="pt-2 border-t border-slate-800">
                    <label className="block text-xs font-bold text-slate-300 mb-1">Mô Tả Chi Tiết / Kiến Thức Giáo Khoa</label>
                    <textarea
                      rows={5}
                      value={currentSpace.overview}
                      onChange={(e) =>
                        setSpaces({
                          ...spaces,
                          [selectedSpaceId]: { ...currentSpace, overview: e.target.value },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white leading-relaxed"
                    />
                  </div>
                </div>
              ) : adminSection === "museums" && currentMuseum ? (
                <div className="space-y-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-5 rounded-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Tên Bảo Tàng</label>
                      <input
                        type="text"
                        value={currentMuseum.name}
                        onChange={(e) =>
                          setMuseums({
                            ...museums,
                            [selectedMuseumId]: { ...currentMuseum, name: e.target.value },
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Thành Phố</label>
                      <input
                        type="text"
                        value={currentMuseum.city}
                        onChange={(e) =>
                          setMuseums({
                            ...museums,
                            [selectedMuseumId]: { ...currentMuseum, city: e.target.value },
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 3: THUYẾT TRÌNH */}
          {activeTab === "audio" && (
            <div className="max-w-4xl w-full mx-auto space-y-4">
              <div className="space-y-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-5 rounded-2xl">
                {/* Voice Selection & Engine Settings */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-400" />
                      Công Nghệ Giọng Đọc Nữ Việt Nam Truyền Cảm:
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Hệ thống tự động sử dụng giọng nữ tiếng Việt truyền cảm, phát âm tự nhiên, ngắt nghỉ câu rõ ràng.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const transcript =
                          adminSection === "solar"
                            ? currentSpace?.audioNarration.transcript || ""
                            : currentRoom?.audioNarration.transcript || "";
                        handleTestAudio(transcript);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-bold text-xs shadow-lg hover:scale-105 transition"
                    >
                      <Volume2 size={15} />
                      <span>Nghe Thử Giọng Nữ AI</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Văn Bản Thuyết Trình (Transcript)</h3>
                  <span className="text-[11px] text-slate-400">
                    Người đọc: {adminSection === "solar" ? currentSpace?.audioNarration.speaker : currentRoom?.audioNarration.speaker}
                  </span>
                </div>
                <textarea
                  rows={7}
                  value={
                    adminSection === "solar"
                      ? currentSpace?.audioNarration.transcript || ""
                      : currentRoom?.audioNarration.transcript || ""
                  }
                  onChange={(e) => {
                    if (adminSection === "solar" && currentSpace) {
                      setSpaces({
                        ...spaces,
                        [selectedSpaceId]: {
                          ...currentSpace,
                          audioNarration: { ...currentSpace.audioNarration, transcript: e.target.value },
                        },
                      });
                    } else if (currentMuseum && currentRoom) {
                      const nextRooms = { ...currentMuseum.rooms };
                      nextRooms[selectedRoomId] = {
                        ...currentRoom,
                        audioNarration: { ...currentRoom.audioNarration, transcript: e.target.value },
                      };
                      setMuseums({
                        ...museums,
                        [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
                      });
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 4: FAQ */}
          {activeTab === "faq" && (
            <div className="max-w-4xl w-full mx-auto space-y-6">
              {/* FAQ Section */}
              <div className="space-y-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <MessageSquare size={16} className="text-cyan-400" />
                      Danh Sách Câu Hỏi Thường Gặp (FAQ) & Câu Trả Lời
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Thêm câu hỏi và câu trả lời chi tiết để AI hoặc hệ thống giải đáp ngay cho người xem.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newFaq = {
                        id: "faq-" + Date.now(),
                        question: "",
                        answer: "",
                      };
                      if (adminSection === "solar" && currentSpace) {
                        const existing = currentSpace.aiContext.faqList || [];
                        setSpaces({
                          ...spaces,
                          [selectedSpaceId]: {
                            ...currentSpace,
                            aiContext: { ...currentSpace.aiContext, faqList: [...existing, newFaq] },
                          },
                        });
                      } else if (currentMuseum && currentRoom) {
                        const existing = currentRoom.aiGuide.faqList || [];
                        const nextRooms = { ...currentMuseum.rooms };
                        nextRooms[selectedRoomId] = {
                          ...currentRoom,
                          aiGuide: { ...currentRoom.aiGuide, faqList: [...existing, newFaq] },
                        };
                        setMuseums({
                          ...museums,
                          [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
                        });
                      }
                      showToast("Đã thêm một mục FAQ mới!");
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition"
                  >
                    <Plus size={14} /> Thêm FAQ
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  {((adminSection === "solar"
                    ? currentSpace?.aiContext.faqList
                    : currentRoom?.aiGuide.faqList) || []).length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                      Chưa có câu hỏi FAQ nào. Bấm &quot;Thêm FAQ&quot; ở trên để tạo câu hỏi đầu tiên.
                    </div>
                  )}

                  {((adminSection === "solar"
                    ? currentSpace?.aiContext.faqList
                    : currentRoom?.aiGuide.faqList) || []).map((faq, idx) => (
                    <div
                      key={faq.id || `faq-${idx}`}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 relative group hover:border-cyan-500/40 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                          #{idx + 1} Câu Hỏi FAQ
                        </span>
                        <button
                          onClick={() => {
                            if (adminSection === "solar" && currentSpace) {
                              const next = (currentSpace.aiContext.faqList || []).filter((_, i) => i !== idx);
                              setSpaces({
                                ...spaces,
                                [selectedSpaceId]: {
                                  ...currentSpace,
                                  aiContext: { ...currentSpace.aiContext, faqList: next },
                                },
                              });
                            } else if (currentMuseum && currentRoom) {
                              const next = (currentRoom.aiGuide.faqList || []).filter((_, i) => i !== idx);
                              const nextRooms = { ...currentMuseum.rooms };
                              nextRooms[selectedRoomId] = {
                                ...currentRoom,
                                aiGuide: { ...currentRoom.aiGuide, faqList: next },
                              };
                              setMuseums({
                                ...museums,
                                [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
                              });
                            }
                            showToast("Đã xóa mục FAQ!");
                          }}
                          className="p-1 rounded-lg text-red-400 hover:bg-red-950/50 hover:text-red-300 transition"
                          title="Xóa FAQ này"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Câu hỏi:</label>
                        <input
                          type="text"
                          placeholder="Nhập câu hỏi thường gặp..."
                          value={faq.question}
                          onChange={(e) => {
                            if (adminSection === "solar" && currentSpace) {
                              const next = [...(currentSpace.aiContext.faqList || [])];
                              next[idx] = { ...next[idx], question: e.target.value };
                              setSpaces({
                                ...spaces,
                                [selectedSpaceId]: {
                                  ...currentSpace,
                                  aiContext: { ...currentSpace.aiContext, faqList: next },
                                },
                              });
                            } else if (currentMuseum && currentRoom) {
                              const next = [...(currentRoom.aiGuide.faqList || [])];
                              next[idx] = { ...next[idx], question: e.target.value };
                              const nextRooms = { ...currentMuseum.rooms };
                              nextRooms[selectedRoomId] = {
                                ...currentRoom,
                                aiGuide: { ...currentRoom.aiGuide, faqList: next },
                              };
                              setMuseums({
                                ...museums,
                                [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
                              });
                            }
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Câu trả lời:</label>
                        <textarea
                          rows={3}
                          placeholder="Nhập câu trả lời giải thích cụ thể..."
                          value={faq.answer}
                          onChange={(e) => {
                            if (adminSection === "solar" && currentSpace) {
                              const next = [...(currentSpace.aiContext.faqList || [])];
                              next[idx] = { ...next[idx], answer: e.target.value };
                              setSpaces({
                                ...spaces,
                                [selectedSpaceId]: {
                                  ...currentSpace,
                                  aiContext: { ...currentSpace.aiContext, faqList: next },
                                },
                              });
                            } else if (currentMuseum && currentRoom) {
                              const next = [...(currentRoom.aiGuide.faqList || [])];
                              next[idx] = { ...next[idx], answer: e.target.value };
                              const nextRooms = { ...currentMuseum.rooms };
                              nextRooms[selectedRoomId] = {
                                ...currentRoom,
                                aiGuide: { ...currentRoom.aiGuide, faqList: next },
                              };
                              setMuseums({
                                ...museums,
                                [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
                              });
                            }
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Questions Section */}
              <div className="space-y-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookOpen size={16} className="text-amber-400" />
                      Bộ Câu Hỏi Gợi Ý Nhanh Cho Khách Tham Quan
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Các nút câu hỏi bấm nhanh hiển thị trên thanh gợi ý của khung chat AI.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (adminSection === "solar" && currentSpace) {
                        const existing = currentSpace.aiContext.suggestedQuestions || [];
                        setSpaces({
                          ...spaces,
                          [selectedSpaceId]: {
                            ...currentSpace,
                            aiContext: { ...currentSpace.aiContext, suggestedQuestions: [...existing, ""] },
                          },
                        });
                      } else if (currentMuseum && currentRoom) {
                        const existing = currentRoom.aiGuide.suggestedQuestions || [];
                        const nextRooms = { ...currentMuseum.rooms };
                        nextRooms[selectedRoomId] = {
                          ...currentRoom,
                          aiGuide: { ...currentRoom.aiGuide, suggestedQuestions: [...existing, ""] },
                        };
                        setMuseums({
                          ...museums,
                          [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
                        });
                      }
                      showToast("Đã thêm ô câu hỏi gợi ý!");
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
                  >
                    <Plus size={14} /> Thêm Gợi Ý
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  {(adminSection === "solar"
                    ? currentSpace?.aiContext.suggestedQuestions || []
                    : currentRoom?.aiGuide.suggestedQuestions || []
                  ).map((q, idx) => (
                    <div key={`q-edit-${idx}`} className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-500 w-5">#{idx + 1}</span>
                      <input
                        type="text"
                        placeholder="Nhập câu hỏi gợi ý nhanh..."
                        value={q}
                        onChange={(e) => {
                          if (adminSection === "solar" && currentSpace) {
                            const next = [...currentSpace.aiContext.suggestedQuestions];
                            next[idx] = e.target.value;
                            setSpaces({
                              ...spaces,
                              [selectedSpaceId]: {
                                ...currentSpace,
                                aiContext: { ...currentSpace.aiContext, suggestedQuestions: next },
                              },
                            });
                          } else if (currentMuseum && currentRoom) {
                            const next = [...currentRoom.aiGuide.suggestedQuestions];
                            next[idx] = e.target.value;
                            const nextRooms = { ...currentMuseum.rooms };
                            nextRooms[selectedRoomId] = {
                              ...currentRoom,
                              aiGuide: { ...currentRoom.aiGuide, suggestedQuestions: next },
                            };
                            setMuseums({
                              ...museums,
                              [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
                            });
                          }
                        }}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        onClick={() => {
                          if (adminSection === "solar" && currentSpace) {
                            const next = currentSpace.aiContext.suggestedQuestions.filter((_, i) => i !== idx);
                            setSpaces({
                              ...spaces,
                              [selectedSpaceId]: {
                                ...currentSpace,
                                aiContext: { ...currentSpace.aiContext, suggestedQuestions: next },
                              },
                            });
                          } else if (currentMuseum && currentRoom) {
                            const next = currentRoom.aiGuide.suggestedQuestions.filter((_, i) => i !== idx);
                            const nextRooms = { ...currentMuseum.rooms };
                            nextRooms[selectedRoomId] = {
                              ...currentRoom,
                              aiGuide: { ...currentRoom.aiGuide, suggestedQuestions: next },
                            };
                            setMuseums({
                              ...museums,
                              [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
                            });
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                        title="Xóa gợi ý này"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DANH SÁCH HIỆN VẬT (CHỈ DÀNH CHO SKY LAB / BẢO TÀNG) */}
          {activeTab === "hotspots" && adminSection === "museums" && currentRoom && (
            <div className="max-w-4xl w-full mx-auto space-y-4">
              <div className="space-y-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookOpen size={16} className="text-cyan-400" />
                      Chỉnh Sửa Chi Tiết & Tải Ảnh Cổ Vật / Điểm Trưng Bày
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Cập nhật tiêu đề, nội dung lịch sử, kiến thức và tải ảnh đính kèm (hoặc dán URL ảnh) hiển thị khi bấm vào điểm neo 360°.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {(currentRoom.artifacts || []).length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                      Chưa có cổ vật nào. Hãy qua tab &quot;1. Chấm Tọa Độ 360° Trực Quan&quot; để định vị cổ vật mới.
                    </div>
                  )}
                  {(currentRoom.artifacts || []).map((art, idx) => (
                      <div
                        key={`art-edit-${art.id || idx}`}
                        className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-3.5 relative group hover:border-amber-500/40 transition"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-amber-200">
                              {art.thumbnailEmoji} {art.name || "Cổ vật"}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono bg-stone-900 px-2 py-0.5 rounded-full border border-stone-700">
                              Pitch: {art.pitch}° | Yaw: {art.yaw}°
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              if (!currentMuseum) return;
                              const nextArts = currentRoom.artifacts.filter((_, i) => i !== idx);
                              const nextRooms = { ...currentMuseum.rooms };
                              nextRooms[selectedRoomId] = { ...currentRoom, artifacts: nextArts };
                              setMuseums({
                                ...museums,
                                [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
                              });
                              showToast("Đã xóa cổ vật!");
                            }}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/50 hover:text-red-300 transition"
                            title="Xóa cổ vật này"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {/* Tên & Niên đại & Icon */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-stone-400 mb-1">Tên Hiện Vật / Cổ Vật:</label>
                            <input
                              type="text"
                              value={art.name}
                              onChange={(e) => {
                                const nextArts = [...currentRoom.artifacts];
                                nextArts[idx] = { ...nextArts[idx], name: e.target.value };
                                const nextRooms = { ...currentMuseum.rooms };
                                nextRooms[selectedRoomId] = { ...currentRoom, artifacts: nextArts };
                                setMuseums({
                                  ...museums,
                                  [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
                                });
                              }}
                              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-400 mb-1">Niên đại / Thời kỳ:</label>
                            <input
                              type="text"
                              placeholder="Vd: Thế kỷ VII TCN..."
                              value={art.era || ""}
                              onChange={(e) => {
                                const nextArts = [...currentRoom.artifacts];
                                nextArts[idx] = { ...nextArts[idx], era: e.target.value };
                                const nextRooms = { ...currentMuseum.rooms };
                                nextRooms[selectedRoomId] = { ...currentRoom, artifacts: nextArts };
                                setMuseums({
                                  ...museums,
                                  [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
                                });
                              }}
                              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-400 mb-1">Biểu tượng Emoji:</label>
                            <input
                              type="text"
                              value={art.thumbnailEmoji || "🏺"}
                              onChange={(e) => {
                                const nextArts = [...currentRoom.artifacts];
                                nextArts[idx] = { ...nextArts[idx], thumbnailEmoji: e.target.value };
                                const nextRooms = { ...currentMuseum.rooms };
                                nextRooms[selectedRoomId] = { ...currentRoom, artifacts: nextArts };
                                setMuseums({
                                  ...museums,
                                  [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
                                });
                              }}
                              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 text-center"
                            />
                          </div>
                        </div>

                        {/* Tóm tắt & Câu chuyện lịch sử */}
                        <div className="space-y-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-400 mb-1">Tóm tắt ngắn (Short Summary):</label>
                            <input
                              type="text"
                              value={art.shortSummary}
                              onChange={(e) => {
                                const nextArts = [...currentRoom.artifacts];
                                nextArts[idx] = { ...nextArts[idx], shortSummary: e.target.value };
                                const nextRooms = { ...currentMuseum.rooms };
                                nextRooms[selectedRoomId] = { ...currentRoom, artifacts: nextArts };
                                setMuseums({
                                  ...museums,
                                  [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
                                });
                              }}
                              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-400 mb-1">Câu chuyện lịch sử chi tiết:</label>
                            <textarea
                              rows={3}
                              value={art.historicalStory}
                              onChange={(e) => {
                                const nextArts = [...currentRoom.artifacts];
                                nextArts[idx] = { ...nextArts[idx], historicalStory: e.target.value };
                                const nextRooms = { ...currentMuseum.rooms };
                                nextRooms[selectedRoomId] = { ...currentRoom, artifacts: nextArts };
                                setMuseums({
                                  ...museums,
                                  [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
                                });
                              }}
                              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-400 mb-1">Bí ẩn lịch sử (Fun Fact):</label>
                              <textarea
                                rows={2}
                                value={art.funFact}
                                onChange={(e) => {
                                  const nextArts = [...currentRoom.artifacts];
                                  nextArts[idx] = { ...nextArts[idx], funFact: e.target.value };
                                  const nextRooms = { ...currentMuseum.rooms };
                                  nextRooms[selectedRoomId] = { ...currentRoom, artifacts: nextArts };
                                  setMuseums({
                                    ...museums,
                                    [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
                                  });
                                }}
                                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-400 mb-1">Lời đọc thuyết minh (Audio Guide Text):</label>
                              <textarea
                                rows={2}
                                value={art.audioGuideText}
                                onChange={(e) => {
                                  const nextArts = [...currentRoom.artifacts];
                                  nextArts[idx] = { ...nextArts[idx], audioGuideText: e.target.value };
                                  const nextRooms = { ...currentMuseum.rooms };
                                  nextRooms[selectedRoomId] = { ...currentRoom, artifacts: nextArts };
                                  setMuseums({
                                    ...museums,
                                    [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
                                  });
                                }}
                                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Hình ảnh cổ vật thực tế (Upload hoặc URL với bộ nén ảnh tự động) */}
                        <ImageUploader
                          label="Ảnh Chụp Cổ Vật Thực Tế Đính Kèm:"
                          value={art.image}
                          onChange={(url) => {
                            const nextArts = [...currentRoom.artifacts];
                            nextArts[idx] = { ...nextArts[idx], image: url };
                            const nextRooms = { ...currentMuseum.rooms };
                            nextRooms[selectedRoomId] = { ...currentRoom, artifacts: nextArts };
                            setMuseums({
                              ...museums,
                              [selectedMuseumId]: { ...currentMuseum, rooms: nextRooms },
                            });
                          }}
                          accentColor="amber"
                          sampleCategory="museum"
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

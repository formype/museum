"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SPACES_DATA, SpaceData } from "@/data/spaces";
import {
  SpaceRoom,
  SpaceTopic,
} from "@/data/space-exhibition";
import {
  getStoredSpaceRooms,
  saveStoredSpaceRooms,
  resetStoredSpaceRooms,
} from "@/lib/space-exhibition-storage";
import {
  getStoredSpaces,
  saveStoredSpaces,
} from "@/lib/spaces-storage";
import {
  extractYouTubeVideoId,
  getYouTubeEmbedUrl,
} from "@/lib/youtube-utils";
import { spaceAudio } from "@/lib/audio-synth";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  Settings,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  ArrowLeft,
  CheckCircle,
  Video,
  Image as ImageIcon,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Download,
  Upload,
  ExternalLink,
  Menu,
  X,
  Eye,
  Info,
  Lock,
  Unlock,
  KeyRound,
  Edit3,
  Orbit,
  Bot,
  MessageSquare,
  Thermometer,
  Clock,
  Globe,
  BarChart3,
  FileText,
  Volume2,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Section switcher: 'solar' (Hệ Mặt Trời) | 'rooms' (Chuyên Đề Khám Phá)
  const [adminSection, setAdminSection] = useState<"solar" | "rooms">("solar");

  // State Hệ Mặt Trời
  const [spaces, setSpaces] = useState<Record<string, SpaceData>>(SPACES_DATA);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("sun");
  const [solarTab, setSolarTab] = useState<"stats" | "content" | "narration" | "ai_qa">("stats");

  // State Chuyên Đề Khám Phá
  const [rooms, setRooms] = useState<SpaceRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>("room-1");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("flights");
  const [activeTab, setActiveTab] = useState<"media" | "content" | "quiz" | "room">("media");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Check auth session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("admin_space_auth");
      if (auth === "true") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mật khẩu mặc định quản trị (hoặc do trường đặt)
    const validPasswords = ["123456", "admin123", "leanhxuan", "thcsleanhxuan"];
    if (validPasswords.includes(passwordInput.trim().toLowerCase())) {
      setIsAuthenticated(true);
      setPasswordError(null);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("admin_space_auth", "true");
      }
      showToast("Đăng nhập quyền quản trị thành công!");
    } else {
      setPasswordError("Mật khẩu không chính xác. Vui lòng thử lại!");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_space_auth");
    }
    showToast("Đã khóa quyền quản trị.");
  };

  // Load from LocalStorage
  useEffect(() => {
    const loadedRooms = getStoredSpaceRooms();
    setRooms(loadedRooms);
    if (loadedRooms.length > 0) {
      setActiveRoomId(loadedRooms[0].id);
      if (loadedRooms[0].topics.length > 0) {
        setSelectedTopicId(loadedRooms[0].topics[0].id);
      }
    }
    const loadedSpaces = getStoredSpaces();
    setSpaces(loadedSpaces);
    setSelectedSpaceId(Object.keys(loadedSpaces)[0] || "sun");
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];
  const currentTopic =
    currentRoom?.topics.find((t) => t.id === selectedTopicId) ||
    currentRoom?.topics[0];
  const currentSpace = spaces[selectedSpaceId] || spaces["sun"];

  // Helper to update current space in Solar System
  const updateCurrentSpace = (updated: Partial<SpaceData>) => {
    if (!currentSpace) return;
    const nextSpaces = {
      ...spaces,
      [selectedSpaceId]: {
        ...currentSpace,
        ...updated,
      },
    };
    setSpaces(nextSpaces);
  };

  const handleAddNewSpace = () => {
    const name = prompt("Nhập tên thiên thể / tiểu hành tinh mới:", "Thiên Thể Mới");
    if (!name || !name.trim()) return;
    const newId = `space-${Date.now()}`;
    const newSpace: SpaceData = {
      id: newId,
      name: name.trim(),
      nameEn: name.trim(),
      tagline: "Thiên thể thú vị trong Hệ Mặt Trời",
      category: "rocky_planet",
      themeColor: "#0ea5e9",
      accentGlow: "rgba(14, 165, 233, 0.4)",
      stats: {
        diameter: "~1.000 km",
        distanceFromSun: "~5.000 triệu km",
        distanceFromEarth: "~4.500 triệu km",
        dayLength: "24 giờ",
        yearLength: "100 năm",
        temperature: "-200°C",
        moons: "0",
      },
      overview: `Thông tin khoa học và kiến thức giáo khoa về ${name.trim()}...`,
      keyFeatures: ["Đặc điểm cấu tạo và bề mặt", "Ý nghĩa thiên văn học"],
      audioNarration: {
        title: `Thuyết minh về ${name.trim()}`,
        speaker: "Thuyết Minh Viên Hoài My",
        durationSec: 60,
        transcript: `Chào mừng các em học sinh đến với ${name.trim()}. Đây là một thiên thể đặc biệt trong Hệ Mặt Trời.`,
      },
      aiContext: {
        roleName: name.trim(),
        avatarEmoji: "🪐",
        personaDescription: `Bạn là trợ lý AI chuyên về ${name.trim()}.`,
        coreKnowledge: [`Kiến thức về ${name.trim()}`],
        suggestedQuestions: [`${name.trim()} cách Trái Đất bao xa?`, `Nhiệt độ trên ${name.trim()} là bao nhiêu?`],
        faqList: [
          {
            id: `faq-${Date.now()}-1`,
            question: `${name.trim()} cách Trái Đất bao xa?`,
            answer: `${name.trim()} có khoảng cách thay đổi theo chu kỳ quỹ đạo.`,
          },
        ],
      },
      hotspots: [],
      planet3d: {
        size: 1.0,
        distance: 25,
        speed: 0.5,
        color: "#0ea5e9",
        textureType: "moon",
      },
    };
    const nextSpaces = { ...spaces, [newId]: newSpace };
    setSpaces(nextSpaces);
    setSelectedSpaceId(newId);
    showToast(`Đã thêm thiên thể "${name.trim()}" thành công!`);
  };

  const handleDeleteSpace = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa thiên thể "${name}"?`)) {
      const nextSpaces = { ...spaces };
      delete nextSpaces[id];
      setSpaces(nextSpaces);
      setSelectedSpaceId(Object.keys(nextSpaces)[0] || "sun");
      showToast(`Đã xóa thiên thể "${name}".`);
    }
  };

  // Helper to update current topic
  const updateCurrentTopic = (updated: Partial<SpaceTopic>) => {
    if (!currentRoom || !currentTopic) return;
    const nextTopics = currentRoom.topics.map((t) =>
      t.id === currentTopic.id ? { ...t, ...updated } : t
    );
    const nextRooms = rooms.map((r) =>
      r.id === currentRoom.id ? { ...r, topics: nextTopics } : r
    );
    setRooms(nextRooms);
  };

  // Save changes to LocalStorage
  const handleSaveAll = () => {
    saveStoredSpaceRooms(rooms);
    saveStoredSpaces(spaces);
    showToast("Đã lưu thành công toàn bộ dữ liệu Hệ Mặt Trời & Chuyên Đề Khám Phá!");
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (
      confirm(
        "Bạn có chắc muốn khôi phục lại toàn bộ nội dung Hệ Mặt Trời và Chuyên Đề Khám Phá mặc định ban đầu?"
      )
    ) {
      const def = resetStoredSpaceRooms();
      setRooms(def);
      setActiveRoomId("room-1");
      setSelectedTopicId("flights");
      setSpaces(SPACES_DATA);
      saveStoredSpaces(SPACES_DATA);
      setSelectedSpaceId("sun");
      showToast("Đã khôi phục dữ liệu gốc thành công!");
    }
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const backupData = {
      version: "2.0",
      exportDate: new Date().toISOString(),
      rooms,
      spaces,
    };
    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Space-Learning-Backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Đã xuất file sao lưu JSON thành công!");
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.rooms && Array.isArray(parsed.rooms)) {
          setRooms(parsed.rooms);
          saveStoredSpaceRooms(parsed.rooms);
          setActiveRoomId(parsed.rooms[0]?.id || "room-1");
          setSelectedTopicId(parsed.rooms[0]?.topics[0]?.id || "");
        } else if (Array.isArray(parsed)) {
          setRooms(parsed);
          saveStoredSpaceRooms(parsed);
          setActiveRoomId(parsed[0]?.id || "room-1");
          setSelectedTopicId(parsed[0]?.topics[0]?.id || "");
        }
        if (parsed.spaces) {
          setSpaces(parsed.spaces);
          saveStoredSpaces(parsed.spaces);
        }
        showToast("Đã nhập dữ liệu thành công từ file JSON!");
      } catch (err) {
        console.error(err);
        alert("Không thể đọc file JSON. Vui lòng kiểm tra lại định dạng.");
      }
    };
    reader.readAsText(file);
  };

  // Add new topic to current room
  const handleAddNewTopic = () => {
    if (!currentRoom) return;
    const title = prompt("Nhập tiêu đề chủ đề khám phá mới:", "Chủ Đề Vũ Trụ Mới");
    if (!title || !title.trim()) return;

    const newId = `topic-${Date.now()}`;
    const newTopic: SpaceTopic = {
      id: newId,
      title: title.trim(),
      subtitle: "Khám phá khoa học thú vị dành cho học sinh",
      badge: "Mới Thêm",
      emoji: "🔭",
      coverImage:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80",
      youtubeUrl: "https://www.youtube.com/watch?v=FztR1y3_iP8",
      summary: "Tóm tắt ngắn gọn, dễ hiểu về chủ đề vũ trụ này...",
      keyFacts: [
        { label: "Đặc điểm chính", value: "Thông số hoặc sự kiện nổi bật", icon: "⭐" },
      ],
      explanation: [
        "Đoạn giải thích chi tiết, ngôn từ đơn giản, trực quan giúp học sinh tiếp thu nhanh.",
      ],
      funFacts: [
        "Một bí mật thú vị về chủ đề này mà ít người biết!",
      ],
      quizQuestions: [
        {
          question: "Câu hỏi trắc nghiệm kiểm tra kiến thức về chủ đề này?",
          options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
          answerIndex: 0,
          explanation: "Giải thích đáp án đúng một cách thuyết phục cho học sinh.",
        },
      ],
    };

    const nextTopics = [...currentRoom.topics, newTopic];
    const nextRooms = rooms.map((r) =>
      r.id === currentRoom.id ? { ...r, topics: nextTopics } : r
    );
    setRooms(nextRooms);
    setSelectedTopicId(newId);
    showToast(`Đã thêm chủ đề "${title.trim()}" thành công!`);
  };

  // Delete topic
  const handleDeleteTopic = (id: string, name: string) => {
    if (!currentRoom) return;
    if (confirm(`Bạn có chắc muốn xóa chủ đề "${name}"?`)) {
      const nextTopics = currentRoom.topics.filter((t) => t.id !== id);
      const nextRooms = rooms.map((r) =>
        r.id === currentRoom.id ? { ...r, topics: nextTopics } : r
      );
      setRooms(nextRooms);
      if (selectedTopicId === id) {
        setSelectedTopicId(nextTopics[0]?.id || "");
      }
      showToast("Đã xóa chủ đề.");
    }
  };

  const previewYoutubeEmbed = currentTopic
    ? getYouTubeEmbedUrl(currentTopic.youtubeUrl)
    : null;

  // Helper to update current room info
  const updateCurrentRoom = (updated: Partial<SpaceRoom>) => {
    if (!currentRoom) return;
    const nextRooms = rooms.map((r) =>
      r.id === currentRoom.id ? { ...r, ...updated } : r
    );
    setRooms(nextRooms);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-white">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-cyan-500/20 text-white">
              <Lock size={30} />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white">
              Cài Đặt Khám Phá Vũ Trụ
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vui lòng nhập mật khẩu quản trị để chỉnh sửa tiêu đề chuyên đề, bài học, hình ảnh, video YouTube và câu hỏi trắc nghiệm.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mật Khẩu Quản Trị:
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Nhập mật khẩu quản trị..."
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(null);
                  }}
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 tracking-wider font-mono"
                />
              </div>
              {passwordError && (
                <p className="text-xs text-rose-400 mt-2 flex items-center gap-1 font-medium">
                  <span>⚠️</span> {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <KeyRound size={16} />
              <span>Mở Khóa Quản Trị</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <Link
              href="/"
              className="hover:text-cyan-400 flex items-center gap-1 transition"
            >
              <ArrowLeft size={13} />
              <span>Quay về trang chủ</span>
            </Link>
            <span className="text-[11px] text-slate-500">Trường THCS Lê Anh Xuân</span>
          </div>
        </div>
      </div>
    );
  }

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
            title="Quay về Trang Khám Phá Vũ Trụ"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/20">
              <Settings size={16} />
            </div>
            <div>
              <h1 className="text-xs sm:text-base font-bold text-white truncate">
                Cài Đặt Phòng Khám Phá Vũ Trụ
              </h1>
              <p className="hidden sm:block text-[11px] text-slate-400">
                Thêm hình ảnh URL, link video YouTube và nội dung bài học cho học sinh
              </p>
            </div>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle variant="icon" />

          {/* Xuất file JSON */}
          <button
            onClick={handleExportBackup}
            className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            title="Xuất dữ liệu dự phòng JSON"
          >
            <Download size={13} />
            <span>Sao Lưu</span>
          </button>

          {/* Nhập file JSON */}
          <label
            className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            title="Khôi phục dữ liệu từ file JSON"
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

          {/* Khôi phục gốc */}
          <button
            onClick={handleResetDefaults}
            className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            title="Khôi phục lại dữ liệu gốc của cả 3 phòng"
          >
            <RotateCcw size={13} />
            <span>Khôi Phục Gốc</span>
          </button>

          {/* Lưu thay đổi */}
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
            <span className="hidden sm:inline">Xem Trực Tiếp</span>
          </Link>

          {/* Đăng xuất / Khóa quản trị */}
          <button
            onClick={handleLogout}
            className="min-h-[40px] flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 text-xs font-semibold border border-slate-700 hover:border-rose-500/40 transition"
            title="Khóa quyền quản trị"
          >
            <Lock size={14} />
            <span className="hidden sm:inline">Khóa</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Select Room & Topic */}
        <aside
          className={`fixed md:relative inset-y-0 left-0 z-30 w-72 sm:w-80 bg-slate-900 border-r border-slate-800 flex flex-col p-4 overflow-y-auto transform transition-transform duration-300 ${
            isMobileSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Main Section Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-3 shrink-0">
            <button
              onClick={() => {
                setAdminSection("solar");
                setSelectedSpaceId(Object.keys(spaces)[0] || "sun");
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
                adminSection === "solar"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Orbit size={14} />
              <span>Hệ Mặt Trời</span>
            </button>

            <button
              onClick={() => {
                setAdminSection("rooms");
                setSelectedTopicId(currentRoom?.topics[0]?.id || "");
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
                adminSection === "rooms"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen size={14} />
              <span>Chuyên Đề</span>
            </button>
          </div>

          {/* SECTION 1: HỆ MẶT TRỜI SIDEBAR */}
          {adminSection === "solar" && (
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Thiên Thể ({Object.keys(spaces).length})
                </span>
                <button
                  onClick={handleAddNewSpace}
                  className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
                  title="Thêm thiên thể mới vào Hệ Mặt Trời"
                >
                  <Plus size={14} />
                  <span>Thêm mới</span>
                </button>
              </div>

              {Object.values(spaces).map((s) => {
                const isSelected = selectedSpaceId === s.id;
                return (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition group ${
                      isSelected
                        ? "bg-slate-800 border-cyan-400 shadow-md text-white"
                        : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300 hover:text-white"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedSpaceId(s.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className="flex items-center gap-2.5 text-left flex-1 overflow-hidden"
                    >
                      <span className="text-xl p-1 bg-slate-900 rounded-xl border border-slate-700/60 shrink-0">
                        {s.aiContext.avatarEmoji || "🪐"}
                      </span>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate">{s.name}</p>
                        <p className="text-[10px] text-cyan-400 font-medium truncate">{s.nameEn}</p>
                      </div>
                    </button>

                    {/* Xóa thiên thể tạo thêm */}
                    {!["sun", "mercury", "venus", "earth", "moon", "mars", "jupiter", "saturn", "uranus", "neptune"].includes(s.id) && (
                      <button
                        onClick={() => handleDeleteSpace(s.id, s.name)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition shrink-0 ml-1"
                        title="Xóa thiên thể này"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* SECTION 2: CHUYÊN ĐỀ KHÁM PHÁ SIDEBAR */}
          {adminSection === "rooms" && (
            <>
              {/* Chuyên Đề Selector */}
              <div className="space-y-1 mb-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Chọn Chuyên Đề Khám Phá:
                </label>
                <div className="space-y-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  {rooms.map((room, idx) => {
                    const isActive = room.id === activeRoomId;
                    let emoji = "🚀";
                    if (idx === 1) emoji = "🕳️";
                    if (idx === 2) emoji = "✨";

                    return (
                      <button
                        key={room.id}
                        onClick={() => {
                          setActiveRoomId(room.id);
                          setSelectedTopicId(room.topics[0]?.id || "");
                        }}
                        className={`w-full py-2 px-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2 transition ${
                          isActive
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                            : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                        }`}
                      >
                        <span className="text-base shrink-0">{emoji}</span>
                        <span className="truncate flex-1">{room.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Room Info & Edit Title Button */}
              {currentRoom && (
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 mb-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      {currentRoom.badge || "Chuyên Đề"}
                    </span>
                    <button
                      onClick={() => setActiveTab("room")}
                      className="text-[11px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-800/40"
                      title="Chỉnh sửa tiêu đề và mô tả chuyên đề này"
                    >
                      <Edit3 size={11} />
                      <span>Sửa Tiêu Đề</span>
                    </button>
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    {currentRoom.title}
                  </h2>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {currentRoom.subtitle}
                  </p>
                </div>
              )}

              {/* Topics List Header */}
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Các Chủ Đề ({currentRoom?.topics.length || 0})
                </span>
                <button
                  onClick={handleAddNewTopic}
                  className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
                  title="Thêm chủ đề mới vào chuyên đề này"
                >
                  <Plus size={14} />
                  <span>Thêm mới</span>
                </button>
              </div>

              {/* Topics List */}
              <div className="space-y-1.5 flex-1">
                {currentRoom?.topics.map((t, idx) => {
                  const isSelected = t.id === currentTopic?.id;
                  const hasVideo = !!extractYouTubeVideoId(t.youtubeUrl);

                  return (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border transition group ${
                        isSelected
                          ? "bg-slate-800 border-cyan-400 shadow-md text-white"
                          : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300 hover:text-white"
                      }`}
                    >
                      <button
                        onClick={() => {
                          setSelectedTopicId(t.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className="flex items-center gap-2.5 text-left flex-1 overflow-hidden"
                      >
                        <span className="text-xl p-1 bg-slate-900 rounded-xl border border-slate-700/60 shrink-0">
                          {t.emoji || "🪐"}
                        </span>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-mono">
                              #{idx + 1}
                            </span>
                            {hasVideo && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-red-600/80 text-white font-bold">
                                YT
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold truncate">{t.title}</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleDeleteTopic(t.id, t.title)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition shrink-0 ml-1"
                        title="Xóa chủ đề này"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </aside>

        {/* Right Editor Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {adminSection === "solar" ? (
            currentSpace ? (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Editor Block */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 bg-slate-950 rounded-2xl border border-slate-800">
                        {currentSpace.aiContext.avatarEmoji || "🪐"}
                      </span>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800">
                          Hệ Mặt Trời • {currentSpace.category.replace("_", " ")}
                        </span>
                        <h2 className="text-base sm:text-xl font-bold text-white mt-1">
                          Chỉnh Sửa: {currentSpace.name} ({currentSpace.nameEn})
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* Important Notice: Fixed 3D */}
                  <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 flex items-start gap-2.5">
                    <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      💡 <strong>Hình ảnh 3D & quỹ đạo là cố định</strong>: Mô hình quả cầu 3D, bản đồ vân bề mặt và chuyển động quỹ đạo WebGL là <strong>cố định chuẩn thiên văn học</strong>. Bạn toàn quyền cập nhật các thông số thiên văn, bài học và bộ câu hỏi AI bên dưới.
                    </span>
                  </div>

                  {/* Sub-Tabs: 1. Thông Số | 2. Tên & Bài Học | 3. Thuyết Minh Giọng Nữ | 4. Bộ Câu Hỏi AI */}
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setSolarTab("stats")}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                        solarTab === "stats"
                          ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <BarChart3 size={14} />
                      <span>1. Thông Số Thiên Văn & Khoảng Cách</span>
                    </button>

                    <button
                      onClick={() => setSolarTab("content")}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                        solarTab === "content"
                          ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <FileText size={14} />
                      <span>2. Tên & Bài Học Giáo Khoa</span>
                    </button>

                    <button
                      onClick={() => setSolarTab("narration")}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                        solarTab === "narration"
                          ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <Volume2 size={14} />
                      <span>3. Thuyết Minh Giọng Nữ AI</span>
                    </button>

                    <button
                      onClick={() => setSolarTab("ai_qa")}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                        solarTab === "ai_qa"
                          ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <Bot size={14} />
                      <span>4. Bộ Câu Hỏi Trợ Lý AI</span>
                    </button>
                  </div>

                  {/* TAB 1: THÔNG SỐ THIÊN VĂN & KHOẢNG CÁCH */}
                  {solarTab === "stats" && (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                          <label className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                            <Globe size={14} /> Khoảng Cách Từ Trái Đất:
                          </label>
                          <input
                            type="text"
                            value={currentSpace.stats.distanceFromEarth || ""}
                            placeholder="Vd: 225 triệu km (~54.6 - 401 triệu km)..."
                            onChange={(e) => {
                              const nextSpaces = {
                                ...spaces,
                                [selectedSpaceId]: {
                                  ...currentSpace,
                                  stats: { ...currentSpace.stats, distanceFromEarth: e.target.value },
                                },
                              };
                              setSpaces(nextSpaces);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 font-semibold"
                          />
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                          <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <Orbit size={14} /> Khoảng Cách Tới Mặt Trời:
                          </label>
                          <input
                            type="text"
                            value={currentSpace.stats.distanceFromSun}
                            placeholder="Vd: 227.9 triệu km (1.52 AU)..."
                            onChange={(e) => {
                              const nextSpaces = {
                                ...spaces,
                                [selectedSpaceId]: {
                                  ...currentSpace,
                                  stats: { ...currentSpace.stats, distanceFromSun: e.target.value },
                                },
                              };
                              setSpaces(nextSpaces);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                          <label className="text-[11px] font-semibold text-slate-400">Đường Kính:</label>
                          <input
                            type="text"
                            value={currentSpace.stats.diameter}
                            onChange={(e) => {
                              const nextSpaces = {
                                ...spaces,
                                [selectedSpaceId]: {
                                  ...currentSpace,
                                  stats: { ...currentSpace.stats, diameter: e.target.value },
                                },
                              };
                              setSpaces(nextSpaces);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                          />
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                            <Thermometer size={12} className="text-amber-400" /> Nhiệt Độ:
                          </label>
                          <input
                            type="text"
                            value={currentSpace.stats.temperature}
                            onChange={(e) => {
                              const nextSpaces = {
                                ...spaces,
                                [selectedSpaceId]: {
                                  ...currentSpace,
                                  stats: { ...currentSpace.stats, temperature: e.target.value },
                                },
                              };
                              setSpaces(nextSpaces);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                          />
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                            <Clock size={12} className="text-blue-400" /> Độ Dài Ngày:
                          </label>
                          <input
                            type="text"
                            value={currentSpace.stats.dayLength}
                            onChange={(e) => {
                              const nextSpaces = {
                                ...spaces,
                                [selectedSpaceId]: {
                                  ...currentSpace,
                                  stats: { ...currentSpace.stats, dayLength: e.target.value },
                                },
                              };
                              setSpaces(nextSpaces);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400 font-medium"
                          />
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                          <label className="text-[11px] font-semibold text-slate-400">Chu Kỳ Năm:</label>
                          <input
                            type="text"
                            value={currentSpace.stats.yearLength}
                            onChange={(e) => {
                              const nextSpaces = {
                                ...spaces,
                                [selectedSpaceId]: {
                                  ...currentSpace,
                                  stats: { ...currentSpace.stats, yearLength: e.target.value },
                                },
                              };
                              setSpaces(nextSpaces);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 max-w-xs">
                        <label className="text-[11px] font-semibold text-slate-400">Số Lượng Vệ Tinh (Mặt Trăng):</label>
                        <input
                          type="text"
                          value={currentSpace.stats.moons}
                          onChange={(e) => {
                            const nextSpaces = {
                              ...spaces,
                              [selectedSpaceId]: {
                                ...currentSpace,
                                stats: { ...currentSpace.stats, moons: e.target.value },
                              },
                            };
                            setSpaces(nextSpaces);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: TÊN & BÀI HỌC GIÁO KHOA */}
                  {solarTab === "content" && (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Tên Tiếng Việt:</label>
                          <input
                            type="text"
                            value={currentSpace.name}
                            onChange={(e) => {
                              const nextSpaces = {
                                ...spaces,
                                [selectedSpaceId]: { ...currentSpace, name: e.target.value },
                              };
                              setSpaces(nextSpaces);
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Tên Tiếng Anh:</label>
                          <input
                            type="text"
                            value={currentSpace.nameEn}
                            onChange={(e) => {
                              const nextSpaces = {
                                ...spaces,
                                [selectedSpaceId]: { ...currentSpace, nameEn: e.target.value },
                              };
                              setSpaces(nextSpaces);
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Biểu Tượng Emoji:</label>
                          <input
                            type="text"
                            value={currentSpace.aiContext.avatarEmoji}
                            onChange={(e) => {
                              const nextSpaces = {
                                ...spaces,
                                [selectedSpaceId]: {
                                  ...currentSpace,
                                  aiContext: { ...currentSpace.aiContext, avatarEmoji: e.target.value },
                                },
                              };
                              setSpaces(nextSpaces);
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 text-center"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Khẩu Hiệu / Tagline:</label>
                        <input
                          type="text"
                          value={currentSpace.tagline}
                          onChange={(e) => {
                            const nextSpaces = {
                              ...spaces,
                              [selectedSpaceId]: { ...currentSpace, tagline: e.target.value },
                            };
                            setSpaces(nextSpaces);
                          }}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">
                          Kiến Thức Giáo Khoa & Tổng Quan Chi Tiết:
                        </label>
                        <textarea
                          rows={6}
                          value={currentSpace.overview}
                          onChange={(e) => {
                            const nextSpaces = {
                              ...spaces,
                              [selectedSpaceId]: { ...currentSpace, overview: e.target.value },
                            };
                            setSpaces(nextSpaces);
                          }}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                        />
                      </div>

                      {/* Key features */}
                      <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Sparkles size={14} className="text-amber-400" /> Các Đặc Điểm Nổi Bật:
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const nextFeat = [...(currentSpace.keyFeatures || []), "Đặc điểm khoa học mới..."];
                              const nextSpaces = {
                                ...spaces,
                                [selectedSpaceId]: { ...currentSpace, keyFeatures: nextFeat },
                              };
                              setSpaces(nextSpaces);
                            }}
                            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                          >
                            <Plus size={13} /> Thêm đặc điểm
                          </button>
                        </div>
                        {(currentSpace.keyFeatures || []).map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2">
                            <span className="text-cyan-400 font-bold">•</span>
                            <input
                              type="text"
                              value={feat}
                              onChange={(e) => {
                                const nextFeat = [...currentSpace.keyFeatures];
                                nextFeat[fIdx] = e.target.value;
                                const nextSpaces = {
                                  ...spaces,
                                  [selectedSpaceId]: { ...currentSpace, keyFeatures: nextFeat },
                                };
                                setSpaces(nextSpaces);
                              }}
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const nextFeat = currentSpace.keyFeatures.filter((_, i) => i !== fIdx);
                                const nextSpaces = {
                                  ...spaces,
                                  [selectedSpaceId]: { ...currentSpace, keyFeatures: nextFeat },
                                };
                                setSpaces(nextSpaces);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: THUYẾT MINH GIỌNG NỮ AI */}
                  {solarTab === "narration" && (
                    <div className="space-y-4 pt-2">
                      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Volume2 size={15} className="text-amber-400" /> Văn Bản Đọc Thuyết Minh Giọng Nữ AI:
                            </label>
                            <p className="text-[11px] text-slate-400">
                              Hệ thống sử dụng giọng đọc Nữ Hoài My truyền cảm để đọc bài học cho học sinh khi bấm &quot;Vào Học 3D & Thuyết Minh&quot;.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              spaceAudio.speakNarration(currentSpace.audioNarration.transcript);
                              showToast("Đang phát thuyết minh giọng Nữ AI...");
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-bold text-xs shadow-md"
                          >
                            <Volume2 size={14} />
                            <span>Nghe Thử Giọng Nữ AI</span>
                          </button>
                        </div>

                        <textarea
                          rows={6}
                          value={currentSpace.audioNarration.transcript}
                          onChange={(e) => {
                            const nextSpaces = {
                              ...spaces,
                              [selectedSpaceId]: {
                                ...currentSpace,
                                audioNarration: { ...currentSpace.audioNarration, transcript: e.target.value },
                              },
                            };
                            setSpaces(nextSpaces);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 4: BỘ CÂU HỎI TRỢ LÝ AI (THÊM / XÓA ĐẦY ĐỦ) */}
                  {solarTab === "ai_qa" && (
                    <div className="space-y-6 pt-2">
                      {/* Phần A: Bộ Câu Hỏi Gợi Ý Nhanh Bấm Vào Khung Chat */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                              <Bot size={16} className="text-cyan-400" />
                              <span>1. Bộ Câu Hỏi Gợi Ý Nhanh Bấm Vào Chat AI</span>
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              Các câu hỏi này xuất hiện dưới dạng nút bấm nhanh trên khung chat để học sinh bấm hỏi AI ngay lập tức.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const existing = currentSpace.aiContext.suggestedQuestions || [];
                              const nextQ = [...existing, "Câu hỏi mới cần gợi ý..."];
                              const nextSpaces = {
                                ...spaces,
                                [selectedSpaceId]: {
                                  ...currentSpace,
                                  aiContext: { ...currentSpace.aiContext, suggestedQuestions: nextQ },
                                },
                              };
                              setSpaces(nextSpaces);
                              showToast("Đã thêm câu hỏi gợi ý!");
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition shrink-0"
                          >
                            <Plus size={14} />
                            <span>Thêm Gợi Ý</span>
                          </button>
                        </div>

                        <div className="space-y-2 pt-1">
                          {(currentSpace.aiContext.suggestedQuestions || []).map((q, qIdx) => (
                            <div key={qIdx} className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-cyan-400 font-bold w-6">
                                #{qIdx + 1}
                              </span>
                              <input
                                type="text"
                                value={q}
                                onChange={(e) => {
                                  const nextQ = [...(currentSpace.aiContext.suggestedQuestions || [])];
                                  nextQ[qIdx] = e.target.value;
                                  const nextSpaces = {
                                    ...spaces,
                                    [selectedSpaceId]: {
                                      ...currentSpace,
                                      aiContext: { ...currentSpace.aiContext, suggestedQuestions: nextQ },
                                    },
                                  };
                                  setSpaces(nextSpaces);
                                }}
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const nextQ = currentSpace.aiContext.suggestedQuestions.filter((_, i) => i !== qIdx);
                                  const nextSpaces = {
                                    ...spaces,
                                    [selectedSpaceId]: {
                                      ...currentSpace,
                                      aiContext: { ...currentSpace.aiContext, suggestedQuestions: nextQ },
                                    },
                                  };
                                  setSpaces(nextSpaces);
                                  showToast("Đã xóa câu hỏi gợi ý.");
                                }}
                                className="p-2 text-slate-500 hover:text-rose-400 transition"
                                title="Xóa câu hỏi gợi ý này"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Phần B: Bộ Câu Hỏi Thường Gặp (FAQ) & Trả Lời Chuẩn */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                              <MessageSquare size={16} className="text-amber-400" />
                              <span>2. Bộ Câu Hỏi Thường Gặp (FAQ) & Lời Giải Thích AI</span>
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              Thêm câu hỏi và câu trả lời chuẩn xác để trợ lý AI học hỏi và giải đáp ngay cho học sinh.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const existing = currentSpace.aiContext.faqList || [];
                              const newFaq = {
                                id: `faq-${Date.now()}`,
                                question: "Câu hỏi thường gặp mới?",
                                answer: "Câu trả lời giải thích chi tiết...",
                              };
                              const nextSpaces = {
                                ...spaces,
                                [selectedSpaceId]: {
                                  ...currentSpace,
                                  aiContext: { ...currentSpace.aiContext, faqList: [...existing, newFaq] },
                                },
                              };
                              setSpaces(nextSpaces);
                              showToast("Đã thêm mục FAQ mới!");
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow transition shrink-0"
                          >
                            <Plus size={14} />
                            <span>Thêm FAQ Mới</span>
                          </button>
                        </div>

                        {/* Empty state */}
                        {(!currentSpace.aiContext.faqList || currentSpace.aiContext.faqList.length === 0) && (
                          <p className="text-xs text-slate-500 italic py-2">
                            Chưa có câu hỏi FAQ nào cho thiên thể này. Bấm &quot;Thêm FAQ Mới&quot; để tạo.
                          </p>
                        )}

                        <div className="space-y-3.5">
                          {(currentSpace.aiContext.faqList || []).map((faq, fIdx) => (
                            <div
                              key={faq.id || fIdx}
                              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 relative group hover:border-amber-500/40 transition"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                                  #{fIdx + 1} Câu Hỏi FAQ
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextFaq = currentSpace.aiContext.faqList!.filter((_, i) => i !== fIdx);
                                    const nextSpaces = {
                                      ...spaces,
                                      [selectedSpaceId]: {
                                        ...currentSpace,
                                        aiContext: { ...currentSpace.aiContext, faqList: nextFaq },
                                      },
                                    };
                                    setSpaces(nextSpaces);
                                    showToast("Đã xóa mục FAQ.");
                                  }}
                                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition"
                                  title="Xóa mục FAQ này"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Câu hỏi:</label>
                                <input
                                  type="text"
                                  value={faq.question}
                                  onChange={(e) => {
                                    const nextFaq = [...currentSpace.aiContext.faqList!];
                                    nextFaq[fIdx] = { ...nextFaq[fIdx], question: e.target.value };
                                    const nextSpaces = {
                                      ...spaces,
                                      [selectedSpaceId]: {
                                        ...currentSpace,
                                        aiContext: { ...currentSpace.aiContext, faqList: nextFaq },
                                      },
                                    };
                                    setSpaces(nextSpaces);
                                  }}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Câu trả lời:</label>
                                <textarea
                                  rows={3}
                                  value={faq.answer}
                                  onChange={(e) => {
                                    const nextFaq = [...currentSpace.aiContext.faqList!];
                                    nextFaq[fIdx] = { ...nextFaq[fIdx], answer: e.target.value };
                                    const nextSpaces = {
                                      ...spaces,
                                      [selectedSpaceId]: {
                                        ...currentSpace,
                                        aiContext: { ...currentSpace.aiContext, faqList: nextFaq },
                                      },
                                    };
                                    setSpaces(nextSpaces);
                                  }}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Chọn một thiên thể từ cột bên trái để bắt đầu chỉnh sửa.
              </div>
            )
          ) : currentTopic ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header Editor Block */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-slate-950 rounded-2xl border border-slate-800">
                      {currentTopic.emoji}
                    </span>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800">
                        {currentRoom?.title} • {currentTopic.badge}
                      </span>
                      <h2 className="text-base sm:text-xl font-bold text-white mt-1">
                        Chỉnh Sửa: {currentTopic.title}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Sub-Tabs: Sửa Tiêu Đề Chuyên Đề | Media | Nội Dung | Đố Vui */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setActiveTab("room")}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      activeTab === "room"
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Edit3 size={14} />
                    <span>1. Sửa Tiêu Đề Chuyên Đề</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("media")}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      activeTab === "media"
                        ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Video size={14} />
                    <span>2. Ảnh & Video YouTube</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("content")}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      activeTab === "content"
                        ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <BookOpen size={14} />
                    <span>3. Bài Học Dễ Hiểu</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("quiz")}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      activeTab === "quiz"
                        ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <HelpCircle size={14} />
                    <span>4. Đố Vui Trắc Nghiệm ({currentTopic.quizQuestions?.length || 0})</span>
                  </button>
                </div>

                {/* TAB 0: SỬA TIÊU ĐỀ & THÔNG TIN CHUYÊN ĐỀ */}
                {activeTab === "room" && currentRoom && (
                  <div className="space-y-4 pt-2">
                    <div className="p-4 sm:p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
                      <div className="border-b border-slate-800 pb-3">
                        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                          <Edit3 size={18} className="text-purple-400" />
                          <span>Chỉnh Sửa Tiêu Đề & Thông Tin Chuyên Đề Khám Phá</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Thay đổi tiêu đề chuyên đề, khẩu hiệu và phần mô tả tổng quan hiển thị cho học sinh.
                        </p>
                      </div>

                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Tiêu Đề Chuyên Đề Khám Phá:
                          </label>
                          <input
                            type="text"
                            value={currentRoom.title}
                            placeholder="Nhập tiêu đề chuyên đề..."
                            onChange={(e) => updateCurrentRoom({ title: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400 font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">
                              Khẩu Hiệu / Phụ Đề Chuyên Đề:
                            </label>
                            <input
                              type="text"
                              value={currentRoom.subtitle}
                              placeholder="Nhập phụ đề ngắn gọn..."
                              onChange={(e) => updateCurrentRoom({ subtitle: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">
                              Huy Hiệu (Badge):
                            </label>
                            <input
                              type="text"
                              value={currentRoom.badge}
                              placeholder="Vd: Khai Phá Không Gian..."
                              onChange={(e) => updateCurrentRoom({ badge: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">
                            Mô Tả Tổng Quan Chuyên Đề (Hiển thị đầu trang chuyên đề):
                          </label>
                          <textarea
                            rows={3}
                            value={currentRoom.description}
                            placeholder="Mô tả nội dung chuyên đề..."
                            onChange={(e) => updateCurrentRoom({ description: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400 leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 1: MEDIA (YOUTUBE & IMAGE LINK) */}
                {activeTab === "media" && (
                  <div className="space-y-6 pt-2">
                    {/* Notice */}
                    <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 flex items-start gap-2.5">
                      <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                      <span>
                        Hệ thống hoạt động theo nguyên tắc <strong>liên kết trực tiếp</strong>:
                        Bạn chỉ cần dán <strong>link video YouTube</strong> hoặc <strong>URL hình ảnh</strong> từ internet mà không cần tốn dung lượng upload file lên máy chủ.
                      </span>
                    </div>

                    {/* Section: YouTube Video */}
                    <div className="space-y-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-2">
                          <Video size={16} className="text-red-500" />
                          <span>Link Video YouTube (Không cần upload):</span>
                        </label>
                        {currentTopic.youtubeUrl && (
                          <a
                            href={currentTopic.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <span>Xem trên YouTube</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Dán link YouTube (vd: https://www.youtube.com/watch?v=FztR1y3_iP8 hoặc https://youtu.be/...)"
                          value={currentTopic.youtubeUrl || ""}
                          onChange={(e) =>
                            updateCurrentTopic({ youtubeUrl: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500"
                        />
                      </div>

                      {/* YouTube Live Preview */}
                      {previewYoutubeEmbed ? (
                        <div className="space-y-2 pt-2">
                          <p className="text-[11px] font-semibold text-slate-400">
                            Khung Xem Trước Video YouTube:
                          </p>
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 shadow-md">
                            <iframe
                              src={previewYoutubeEmbed}
                              title="YouTube Preview"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">
                          Chưa có link video YouTube hoặc link chưa đúng định dạng.
                        </p>
                      )}
                    </div>

                    {/* Section: Cover Image URL */}
                    <div className="space-y-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                      <label className="text-xs font-bold text-white flex items-center gap-2">
                        <ImageIcon size={16} className="text-cyan-400" />
                        <span>Link Hình Ảnh Thực Tế (URL trực tiếp):</span>
                      </label>

                      <input
                        type="text"
                        placeholder="Dán link ảnh (vd: https://images.unsplash.com/... hoặc ảnh từ NASA / Wikimedia)"
                        value={currentTopic.coverImage || ""}
                        onChange={(e) =>
                          updateCurrentTopic({ coverImage: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                      />

                      {/* Image Preview */}
                      {currentTopic.coverImage ? (
                        <div className="space-y-2 pt-2">
                          <p className="text-[11px] font-semibold text-slate-400">
                            Xem Trước Hình Ảnh:
                          </p>
                          <div className="relative aspect-video max-h-64 rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                            <img
                              src={currentTopic.coverImage}
                              alt="Cover Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">
                          Chưa có link hình ảnh đính kèm.
                        </p>
                      )}
                    </div>

                    {/* Quick Preset Space Images Picker */}
                    <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2.5">
                      <span className="text-xs font-bold text-slate-300 block">
                        Gợi ý ảnh không gian chất lượng cao (Bấm để áp dụng nhanh):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          {
                            title: "Trái Đất từ quỹ đạo",
                            url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80",
                          },
                          {
                            title: "Trạm không gian ISS",
                            url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1000&q=80",
                          },
                          {
                            title: "Sao Hỏa huyền bí",
                            url: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1000&q=80",
                          },
                          {
                            title: "Mặt Trăng & Apollo",
                            url: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1000&q=80",
                          },
                          {
                            title: "Hố Đen sâu thẳm",
                            url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1000&q=80",
                          },
                          {
                            title: "Sao Neutron & Pulsar",
                            url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=1000&q=80",
                          },
                          {
                            title: "Mưa Sao Băng",
                            url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
                          },
                          {
                            title: "Dải Ngân Hà",
                            url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
                          },
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              updateCurrentTopic({ coverImage: preset.url })
                            }
                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400 text-left text-[11px] text-slate-300 hover:text-white transition flex flex-col gap-1"
                          >
                            <span className="font-semibold truncate">{preset.title}</span>
                            <span className="text-[10px] text-cyan-400">Chọn ảnh này</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: CONTENT (EXPLANATIONS & FUN FACTS) */}
                {activeTab === "content" && (
                  <div className="space-y-5 pt-2">
                    {/* Basic Meta: Title, Subtitle, Emoji, Badge */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-400 mb-1">
                          Tiêu Đề Chủ Đề:
                        </label>
                        <input
                          type="text"
                          value={currentTopic.title}
                          onChange={(e) =>
                            updateCurrentTopic({ title: e.target.value })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">
                          Huy Hiệu (Badge):
                        </label>
                        <input
                          type="text"
                          value={currentTopic.badge}
                          onChange={(e) =>
                            updateCurrentTopic({ badge: e.target.value })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">
                          Biểu Tượng Emoji:
                        </label>
                        <input
                          type="text"
                          value={currentTopic.emoji}
                          onChange={(e) =>
                            updateCurrentTopic({ emoji: e.target.value })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 text-center"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Khẩu hiệu / Phụ đề ngắn gọn:
                      </label>
                      <input
                        type="text"
                        value={currentTopic.subtitle}
                        onChange={(e) =>
                          updateCurrentTopic({ subtitle: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Summary */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Tóm Tắt Dễ Hiểu (Hiển thị đầu bài học cho học sinh):
                      </label>
                      <textarea
                        rows={2}
                        value={currentTopic.summary}
                        onChange={(e) =>
                          updateCurrentTopic({ summary: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                      />
                    </div>

                    {/* Detailed Explanation Paragraphs */}
                    <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-2">
                          <BookOpen size={16} className="text-cyan-400" />
                          <span>Các Đoạn Giải Thích Chi Tiết Cho Học Sinh:</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            updateCurrentTopic({
                              explanation: [
                                ...currentTopic.explanation,
                                "Thêm nội dung giải thích mới cho bài học...",
                              ],
                            });
                          }}
                          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          <Plus size={14} /> Thêm đoạn
                        </button>
                      </div>

                      {currentTopic.explanation.map((para, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2">
                          <span className="text-[11px] font-mono text-slate-500 mt-2">
                            #{pIdx + 1}
                          </span>
                          <textarea
                            rows={3}
                            value={para}
                            onChange={(e) => {
                              const nextExp = [...currentTopic.explanation];
                              nextExp[pIdx] = e.target.value;
                              updateCurrentTopic({ explanation: nextExp });
                            }}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const nextExp = currentTopic.explanation.filter(
                                (_, i) => i !== pIdx
                              );
                              updateCurrentTopic({ explanation: nextExp });
                            }}
                            className="p-2 text-slate-500 hover:text-rose-400 transition"
                            title="Xóa đoạn này"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Fun facts */}
                    <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-2">
                          <Lightbulb size={16} className="text-amber-400" />
                          <span>Bí Mật Thú Vị (&quot;Em Có Biết?&quot;):</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            updateCurrentTopic({
                              funFacts: [
                                ...currentTopic.funFacts,
                                "Sự thật bất ngờ mới về vũ trụ...",
                              ],
                            });
                          }}
                          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                          <Plus size={14} /> Thêm sự thật
                        </button>
                      </div>

                      {currentTopic.funFacts.map((ff, ffIdx) => (
                        <div key={ffIdx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold mt-1.5">💡</span>
                          <textarea
                            rows={2}
                            value={ff}
                            onChange={(e) => {
                              const nextFF = [...currentTopic.funFacts];
                              nextFF[ffIdx] = e.target.value;
                              updateCurrentTopic({ funFacts: nextFF });
                            }}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const nextFF = currentTopic.funFacts.filter(
                                (_, i) => i !== ffIdx
                              );
                              updateCurrentTopic({ funFacts: nextFF });
                            }}
                            className="p-2 text-slate-500 hover:text-rose-400 transition"
                            title="Xóa mục này"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: QUIZ (MINI TEST FOR STUDENTS) */}
                {activeTab === "quiz" && (
                  <div className="space-y-6 pt-2">
                    {/* Header info & Add question button */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                          <HelpCircle size={18} className="text-indigo-400" />
                          <span>Bộ Câu Hỏi Trắc Nghiệm Đố Vui Cho Học Sinh</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Bạn có thể thêm nhiều câu hỏi trắc nghiệm để học sinh thử thách và ôn tập kiến thức sau bài học.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const existing = currentTopic.quizQuestions || [];
                          const newQ = {
                            question: `Câu hỏi trắc nghiệm số ${existing.length + 1}?`,
                            options: [
                              "Phương án A",
                              "Phương án B",
                              "Phương án C",
                              "Phương án D",
                            ],
                            answerIndex: 0,
                            explanation: "Giải thích lý do vì sao đáp án này là chính xác...",
                          };
                          updateCurrentTopic({
                            quizQuestions: [...existing, newQ],
                          });
                          showToast(`Đã thêm câu hỏi số #${existing.length + 1}!`);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition shrink-0"
                      >
                        <Plus size={15} />
                        <span>Thêm Câu Hỏi Mới</span>
                      </button>
                    </div>

                    {/* Empty State */}
                    {(!currentTopic.quizQuestions || currentTopic.quizQuestions.length === 0) && (
                      <div className="text-center py-10 px-4 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 flex items-center justify-center mx-auto text-xl">
                          🎯
                        </div>
                        <h4 className="text-sm font-bold text-slate-300">
                          Chưa có câu hỏi trắc nghiệm nào cho chủ đề này
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Bấm nút bên dưới để tạo câu hỏi trắc nghiệm đầu tiên cho học sinh cùng thử tài.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const newQ = {
                              question: "Nhập câu hỏi trắc nghiệm đầu tiên ở đây...",
                              options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
                              answerIndex: 0,
                              explanation: "Giải thích đáp án đúng...",
                            };
                            updateCurrentTopic({ quizQuestions: [newQ] });
                            showToast("Đã thêm câu hỏi đầu tiên!");
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                        >
                          <Plus size={14} />
                          <span>Tạo Câu Hỏi Đầu Tiên</span>
                        </button>
                      </div>
                    )}

                    {/* Questions List */}
                    <div className="space-y-5">
                      {(currentTopic.quizQuestions || []).map((quiz, qIdx) => (
                        <div
                          key={`quiz-item-${qIdx}`}
                          className="p-4 sm:p-5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-4 shadow-lg hover:border-indigo-500/40 transition relative group"
                        >
                          {/* Top Question Toolbar */}
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-xs flex items-center justify-center">
                                #{qIdx + 1}
                              </span>
                              <span className="text-xs font-bold text-slate-200">
                                Câu Hỏi Số {qIdx + 1}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                                Đáp án đúng: {String.fromCharCode(65 + quiz.answerIndex)}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Bạn có chắc muốn xóa câu hỏi #${qIdx + 1}?`)) {
                                  const nextQ = (currentTopic.quizQuestions || []).filter(
                                    (_, i) => i !== qIdx
                                  );
                                  updateCurrentTopic({ quizQuestions: nextQ });
                                  showToast(`Đã xóa câu hỏi #${qIdx + 1}!`);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition flex items-center gap-1 text-xs"
                              title="Xóa câu hỏi này"
                            >
                              <Trash2 size={14} />
                              <span className="hidden sm:inline">Xóa câu này</span>
                            </button>
                          </div>

                          {/* Question text */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">
                              Nội dung câu hỏi:
                            </label>
                            <input
                              type="text"
                              value={quiz.question}
                              placeholder="Nhập nội dung câu hỏi..."
                              onChange={(e) => {
                                const nextQ = [...(currentTopic.quizQuestions || [])];
                                nextQ[qIdx] = { ...nextQ[qIdx], question: e.target.value };
                                updateCurrentTopic({ quizQuestions: nextQ });
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-400 font-medium"
                            />
                          </div>

                          {/* Options */}
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-slate-400">
                              4 Phương án trả lời (Bấm vào chữ cái tròn để chọn đáp án ĐÚNG):
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {quiz.options.map((opt, optIdx) => {
                                const isCorrect = quiz.answerIndex === optIdx;
                                return (
                                  <div
                                    key={optIdx}
                                    className={`flex items-center gap-2 p-1.5 rounded-xl border transition ${
                                      isCorrect
                                        ? "bg-emerald-950/30 border-emerald-500/50"
                                        : "bg-slate-900/60 border-slate-800"
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextQ = [...(currentTopic.quizQuestions || [])];
                                        nextQ[qIdx] = {
                                          ...nextQ[qIdx],
                                          answerIndex: optIdx,
                                        };
                                        updateCurrentTopic({ quizQuestions: nextQ });
                                        showToast(`Đã đặt đáp án ${String.fromCharCode(65 + optIdx)} là đáp án đúng!`);
                                      }}
                                      className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 transition ${
                                        isCorrect
                                          ? "bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-500/30"
                                          : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
                                      }`}
                                      title={
                                        isCorrect
                                          ? "Đây là đáp án đúng"
                                          : `Bấm để chọn đáp án ${String.fromCharCode(65 + optIdx)} là ĐÚNG`
                                      }
                                    >
                                      {String.fromCharCode(65 + optIdx)}
                                    </button>
                                    <input
                                      type="text"
                                      value={opt}
                                      placeholder={`Nhập phương án ${String.fromCharCode(65 + optIdx)}...`}
                                      onChange={(e) => {
                                        const nextQ = [...(currentTopic.quizQuestions || [])];
                                        const nextOpts = [...nextQ[qIdx].options];
                                        nextOpts[optIdx] = e.target.value;
                                        nextQ[qIdx] = {
                                          ...nextQ[qIdx],
                                          options: nextOpts,
                                        };
                                        updateCurrentTopic({ quizQuestions: nextQ });
                                      }}
                                      className="flex-1 bg-transparent border-0 px-2 py-1 text-xs sm:text-sm text-white focus:outline-none"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Explanation */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">
                              Lời giải thích kiến thức (Hiển thị sau khi học sinh trả lời):
                            </label>
                            <textarea
                              rows={2}
                              value={quiz.explanation}
                              placeholder="Giải thích vì sao đáp án này đúng để giúp học sinh hiểu sâu bài học..."
                              onChange={(e) => {
                                const nextQ = [...(currentTopic.quizQuestions || [])];
                                nextQ[qIdx] = {
                                  ...nextQ[qIdx],
                                  explanation: e.target.value,
                                };
                                updateCurrentTopic({ quizQuestions: nextQ });
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-400 leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Add button */}
                    {(currentTopic.quizQuestions || []).length > 0 && (
                      <div className="flex justify-center pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            const existing = currentTopic.quizQuestions || [];
                            const newQ = {
                              question: `Câu hỏi trắc nghiệm số ${existing.length + 1}?`,
                              options: [
                                "Phương án A",
                                "Phương án B",
                                "Phương án C",
                                "Phương án D",
                              ],
                              answerIndex: 0,
                              explanation: "Giải thích lý do vì sao đáp án này là chính xác...",
                            };
                            updateCurrentTopic({
                              quizQuestions: [...existing, newQ],
                            });
                            showToast(`Đã thêm câu hỏi số #${existing.length + 1}!`);
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition shadow"
                        >
                          <Plus size={15} />
                          <span>Thêm Một Câu Hỏi Khác Cho Chủ Đề Này</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              Chọn một chủ đề từ cột bên trái để bắt đầu chỉnh sửa.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

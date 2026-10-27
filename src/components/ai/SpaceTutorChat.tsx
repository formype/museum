"use client";

import React, { useState, useRef, useEffect } from "react";
import { SpaceData } from "@/data/spaces";
import { spaceAudio } from "@/lib/audio-synth";
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  Trash2,
  HelpCircle,
  Award,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface SpaceTutorChatProps {
  space: SpaceData;
  isOpen: boolean;
  onClose: () => void;
}

export default function SpaceTutorChat({
  space,
  isOpen,
  onClose,
}: SpaceTutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const tutor = space.aiContext;

  // Set initial welcome greeting when space changes
  useEffect(() => {
    const welcomeMsg: Message = {
      id: "welcome-" + space.id,
      role: "assistant",
      content: `Chào em! Thầy là **${tutor.roleName}** ${tutor.avatarEmoji}.\n\nThầy là gia sư thiên văn học đồng hành cùng em tại **${space.name}** (${space.nameEn}). Em có câu hỏi nào về các hiện tượng vũ trụ, nhiệt độ, hay bí ẩn nơi đây không? Hãy hỏi thầy bất cứ điều gì nhé! ⭐`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([welcomeMsg]);
  }, [space.id, tutor.roleName, tutor.avatarEmoji, space.name, space.nameEn]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          spaceId: space.id,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const reply = data.reply || "Thầy đang cập nhật dữ liệu từ trạm thiên văn, em thử hỏi lại nhé!";

      const aiMessage: Message = {
        id: "ai-" + Date.now(),
        role: "assistant",
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const errorMessage: Message = {
        id: "ai-err-" + Date.now(),
        role: "assistant",
        content: "Có sự cố kết nối tới trạm vệ tinh. Em hãy thử lại câu hỏi nhé!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadAloud = (text: string) => {
    // Strip markdown formatting for cleaner speech synthesis
    const cleanText = text.replace(/[*#_`]/g, "");
    spaceAudio.speakNarration(cleanText);
  };

  const handleClearHistory = () => {
    const welcomeMsg: Message = {
      id: "welcome-reset-" + Date.now(),
      role: "assistant",
      content: `Thầy đã làm mới cuộc trò chuyện! Em muốn khám phá thêm điều gì về **${space.name}** nào?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([welcomeMsg]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-950/95 border-l border-cyan-500/30 backdrop-blur-2xl shadow-2xl flex flex-col transition-all duration-300 animate-slide-left">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/30 border border-cyan-400/40">
            {tutor.avatarEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{tutor.roleName}</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400">Gia sư AI đồng hành tại {space.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            title="Làm mới đoạn chat"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Persona Description Banner */}
      <div className="px-4 py-2 bg-cyan-950/40 border-b border-cyan-900/40 flex items-center justify-between text-xs text-cyan-200">
        <span className="truncate">{tutor.personaDescription}</span>
        <button
          onClick={() => handleSendMessage("Thầy đố em một câu hỏi vui về " + space.name + " đi ạ!")}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold border border-cyan-500/30 transition text-[11px]"
        >
          <Award size={12} />
          Đố vui
        </button>
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center shrink-0 text-base mt-1">
                  {tutor.avatarEmoji}
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-sm shadow-md leading-relaxed ${
                  isUser
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none"
                    : "bg-slate-900/90 text-slate-100 border border-slate-800 rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleReadAloud(msg.content)}
                      title="Đọc câu trả lời"
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-200 transition"
                    >
                      <Volume2 size={12} />
                      Đọc to
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white text-xs font-bold mt-1">
                  <User size={14} />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-full bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center shrink-0 text-base">
              {tutor.avatarEmoji}
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1.5 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0s]" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs font-mono ml-2 text-slate-400">Gia sư đang suy nghĩ...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Pills */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2">
          <HelpCircle size={13} className="text-cyan-400" />
          <span>Gợi ý câu hỏi nhanh:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {tutor.suggestedQuestions.map((q, idx) => (
            <button
              key={`sq-${idx}`}
              onClick={() => handleSendMessage(q)}
              className="text-left text-xs px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-cyan-600/30 hover:text-cyan-200 text-slate-300 border border-slate-700/60 transition truncate max-w-full"
            >
              💬 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Hỏi ${tutor.roleName} về ${space.name}...`}
            className="flex-1 bg-slate-800 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition shadow-lg shadow-cyan-500/20"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

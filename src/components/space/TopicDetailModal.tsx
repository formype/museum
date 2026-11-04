"use client";

import React, { useState, useEffect } from "react";
import { SpaceTopic } from "@/data/space-exhibition";
import { getYouTubeEmbedUrl } from "@/lib/youtube-utils";
import { spaceAudio } from "@/lib/audio-synth";
import confetti from "canvas-confetti";
import {
  X,
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  BookOpen,
  Video,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lightbulb,
} from "lucide-react";

interface TopicDetailModalProps {
  topic: SpaceTopic;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function TopicDetailModal({
  topic,
  onClose,
  onPrev,
  onNext,
}: TopicDetailModalProps) {
  const [activeMediaTab, setActiveMediaTab] = useState<"video" | "image">(
    topic.youtubeUrl ? "video" : "image"
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});

  const youtubeEmbed = getYouTubeEmbedUrl(topic.youtubeUrl);
  const quizList = topic.quizQuestions || [];
  const currentQuiz = quizList[activeQuizIndex] || null;

  // Reset state when topic changes
  useEffect(() => {
    setActiveMediaTab(topic.youtubeUrl ? "video" : "image");
    setActiveQuizIndex(0);
    setUserAnswers({});
    spaceAudio.stopSpeech();
    setIsSpeaking(false);
  }, [topic]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      spaceAudio.stopSpeech();
    };
  }, []);

  const handleToggleVoice = () => {
    if (isSpeaking) {
      spaceAudio.stopSpeech();
      setIsSpeaking(false);
    } else {
      const textToRead = `${topic.title}. ${topic.subtitle}. ${topic.summary} ${topic.explanation.join(" ")}`;
      setIsSpeaking(true);
      spaceAudio.speakNarration(textToRead, undefined, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleSelectQuiz = (optionIndex: number) => {
    if (!currentQuiz || userAnswers[activeQuizIndex] !== undefined) return;

    setUserAnswers((prev) => ({
      ...prev,
      [activeQuizIndex]: optionIndex,
    }));

    if (optionIndex === currentQuiz.answerIndex) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (err) {
        console.error("Confetti error", err);
      }
    }
  };

  const correctAnswersCount = quizList.reduce((count, q, idx) => {
    return userAnswers[idx] === q.answerIndex ? count + 1 : count;
  }, 0);
  const isAllQuizzesAnswered =
    quizList.length > 0 &&
    quizList.every((_, idx) => userAnswers[idx] !== undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900/95 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="text-2xl sm:text-3xl shrink-0 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow-inner">
              {topic.emoji || "🚀"}
            </span>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {topic.badge || "Khám Phá"}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-bold text-white truncate mt-0.5">
                {topic.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Đọc thuyết minh bằng giọng nói */}
            <button
              onClick={handleToggleVoice}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                isSpeaking
                  ? "bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/30 animate-pulse"
                  : "bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700"
              }`}
              title={isSpeaking ? "Dừng đọc thuyết minh" : "Nghe trợ lý AI đọc bài học"}
            >
              {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span className="hidden sm:inline">
                {isSpeaking ? "Dừng đọc" : "Nghe Giảng"}
              </span>
            </button>

            {/* Nút đóng */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Đóng cửa sổ"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Media Section: YouTube or Image */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            {/* Media Selector Tabs */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5">
                {youtubeEmbed && (
                  <button
                    onClick={() => setActiveMediaTab("video")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                      activeMediaTab === "video"
                        ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Video size={14} />
                    <span>Video YouTube Khám Phá</span>
                  </button>
                )}
                {topic.coverImage && (
                  <button
                    onClick={() => setActiveMediaTab("image")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                      activeMediaTab === "image"
                        ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <ImageIcon size={14} />
                    <span>Hình Ảnh Thực Tế</span>
                  </button>
                )}
              </div>

              {topic.youtubeUrl && (
                <a
                  href={topic.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 transition"
                  title="Mở trực tiếp trên YouTube"
                >
                  <span>Mở tab mới</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Media Player Display */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {activeMediaTab === "video" && youtubeEmbed ? (
                <iframe
                  src={youtubeEmbed}
                  title={topic.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : topic.coverImage ? (
                <img
                  src={topic.coverImage}
                  alt={topic.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-500 text-xs flex flex-col items-center gap-2">
                  <Sparkles size={24} className="text-cyan-400/50" />
                  <span>Chưa có video hoặc ảnh đính kèm cho mục này</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats & Key Facts Badges */}
          {topic.keyFacts && topic.keyFacts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {topic.keyFacts.map((fact, idx) => (
                <div
                  key={`fact-${idx}`}
                  className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3"
                >
                  <span className="text-xl sm:text-2xl p-2 rounded-xl bg-slate-900 border border-slate-700 shrink-0">
                    {fact.icon || "📌"}
                  </span>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide truncate">
                      {fact.label}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-white truncate">
                      {fact.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Core Explanation for Students */}
          <div className="space-y-3 bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-700/50">
            <h3 className="text-sm sm:text-base font-bold text-cyan-300 flex items-center gap-2">
              <BookOpen size={18} className="text-cyan-400" />
              Kiến Thức Dành Cho Học Sinh
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium italic border-l-2 border-cyan-400 pl-3">
              {topic.summary}
            </p>
            <div className="space-y-2.5 pt-1">
              {topic.explanation.map((para, idx) => (
                <p
                  key={`para-${idx}`}
                  className="text-xs sm:text-sm text-slate-200 leading-relaxed"
                >
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Fun Facts / "Em Có Biết?" */}
          {topic.funFacts && topic.funFacts.length > 0 && (
            <div className="space-y-3 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-4 sm:p-5 rounded-2xl border border-amber-500/30 shadow-lg">
              <h3 className="text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2">
                <Lightbulb size={18} className="text-amber-400 animate-bounce" />
                Góc Bí Mật Thú Vị &quot;Em Có Biết?&quot;
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topic.funFacts.map((ff, idx) => (
                  <div
                    key={`ff-${idx}`}
                    className="p-3 bg-slate-900/80 rounded-xl border border-amber-500/20 text-xs sm:text-sm text-amber-100 leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="text-amber-400 shrink-0 font-bold">✨</span>
                    <span>{ff}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Multi-Question Interactive Quiz for Students */}
          {quizList.length > 0 && currentQuiz && (
            <div className="space-y-4 bg-indigo-950/40 p-4 sm:p-5 rounded-2xl border border-indigo-500/30 shadow-lg">
              {/* Header with Progress Tracker */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-indigo-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
                    🎯
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-indigo-300 flex items-center gap-2">
                      <span>Thử Thách Đố Vui Vũ Trụ</span>
                      <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-200 border border-indigo-700/60">
                        Câu {activeQuizIndex + 1} / {quizList.length}
                      </span>
                    </h3>
                  </div>
                </div>

                {/* Question switcher dots */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {quizList.map((q, idx) => {
                    const answered = userAnswers[idx] !== undefined;
                    const isCorrect = userAnswers[idx] === q.answerIndex;
                    const isCurrent = idx === activeQuizIndex;

                    let dotClass = "bg-slate-800 text-slate-400 border-slate-700";
                    if (answered) {
                      dotClass = isCorrect
                        ? "bg-emerald-600 text-white border-emerald-400"
                        : "bg-rose-600 text-white border-rose-400";
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveQuizIndex(idx)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold border transition ${dotClass} ${
                          isCurrent ? "ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-900 scale-105" : ""
                        }`}
                        title={`Chuyển đến câu hỏi ${idx + 1}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Text */}
              <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                {currentQuiz.question}
              </p>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {currentQuiz.options.map((opt, idx) => {
                  const hasAnswered = userAnswers[activeQuizIndex] !== undefined;
                  const isSelected = userAnswers[activeQuizIndex] === idx;
                  const isCorrect = idx === currentQuiz.answerIndex;

                  let btnStyle =
                    "bg-slate-800/80 border-slate-700 text-slate-200 hover:border-indigo-400 hover:bg-slate-800";
                  if (hasAnswered) {
                    if (isCorrect) {
                      btnStyle =
                        "bg-emerald-600/30 border-emerald-400 text-emerald-200 font-bold";
                    } else if (isSelected && !isCorrect) {
                      btnStyle = "bg-rose-600/30 border-rose-400 text-rose-200";
                    } else {
                      btnStyle = "bg-slate-900/60 border-slate-800 text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={`opt-${idx}`}
                      onClick={() => handleSelectQuiz(idx)}
                      disabled={hasAnswered}
                      className={`min-h-[44px] px-3.5 py-2.5 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between gap-2 transition ${btnStyle}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-bold text-indigo-400 shrink-0">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span>{opt}</span>
                      </span>
                      {hasAnswered && isCorrect && (
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      )}
                      {hasAnswered && isSelected && !isCorrect && (
                        <XCircle size={16} className="text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Feedback */}
              {userAnswers[activeQuizIndex] !== undefined && (
                <div
                  className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed border animate-fade-in ${
                    userAnswers[activeQuizIndex] === currentQuiz.answerIndex
                      ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
                      : "bg-rose-950/60 border-rose-500/40 text-rose-200"
                  }`}
                >
                  <p className="font-bold flex items-center gap-1.5">
                    {userAnswers[activeQuizIndex] === currentQuiz.answerIndex ? (
                      <>
                        <span>🎉</span>
                        <span>Chính xác tuyệt đối! Em giỏi lắm!</span>
                      </>
                    ) : (
                      <>
                        <span>💡</span>
                        <span>Chưa chính xác rồi! Hãy xem giải thích kiến thức nhé:</span>
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-slate-200">{currentQuiz.explanation}</p>
                </div>
              )}

              {/* Quiz Navigation Buttons (Prev / Next Question) */}
              <div className="flex items-center justify-between pt-2 border-t border-indigo-500/20 text-xs">
                <button
                  type="button"
                  disabled={activeQuizIndex === 0}
                  onClick={() => setActiveQuizIndex((prev) => Math.max(0, prev - 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  <ChevronLeft size={14} />
                  <span>Câu trước</span>
                </button>

                {/* Score or Completion Summary */}
                {isAllQuizzesAnswered ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-300">
                      🏆 Kết quả: {correctAnswersCount}/{quizList.length} câu đúng
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUserAnswers({});
                        setActiveQuizIndex(0);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 font-semibold text-[11px] border border-indigo-400/40 transition"
                    >
                      Làm lại
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Đã trả lời: {Object.keys(userAnswers).length}/{quizList.length} câu
                  </span>
                )}

                <button
                  type="button"
                  disabled={activeQuizIndex >= quizList.length - 1}
                  onClick={() => setActiveQuizIndex((prev) => Math.min(quizList.length - 1, prev + 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  <span>Câu tiếp</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation: Previous & Next topic */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
          {onPrev ? (
            <button
              onClick={onPrev}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Chủ đề trước</span>
            </button>
          ) : (
            <div />
          )}

          <div className="text-[11px] text-slate-500 font-mono">
            Vũ trụ là phòng học lớn nhất 🌟
          </div>

          {onNext ? (
            <button
              onClick={onNext}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition"
            >
              <span>Chủ đề tiếp</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Đóng lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

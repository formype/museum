"use client";

import React, { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Award,
  CheckCircle,
  XCircle,
  RotateCcw,
  Download,
  Sparkles,
  Trophy,
  X,
  HelpCircle,
  Check,
  Star,
  User,
} from "lucide-react";
import { SpaceData } from "@/data/spaces";
import { MuseumRoom } from "@/data/museum-spaces";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  space?: SpaceData;
  room?: MuseumRoom;
  museumName?: string;
}

// Generate dynamic quiz questions based on space or museum room
function getQuestions(space?: SpaceData, room?: MuseumRoom): QuizQuestion[] {
  if (space) {
    const list: QuizQuestion[] = [
      {
        id: "q1",
        question: `Đặc điểm nổi bật nhất của ${space.name} (${space.nameEn}) là gì?`,
        options: [
          space.tagline,
          "Là hành tinh lạnh nhất vũ trụ",
          "Có bề mặt hoàn toàn bằng kim cương",
          "Không chịu lực hấp dẫn của Mặt Trời",
        ],
        correctIndex: 0,
        explanation: `${space.name}: ${space.tagline}`,
      },
      {
        id: "q2",
        question: `Nhiệt độ trung bình hoặc đặc trưng tại ${space.name} là bao nhiêu?`,
        options: [
          space.stats.temperature,
          "Luôn luôn cố định ở 0°C",
          "Nóng hơn 100 triệu độ C",
          "Lạnh tuyệt đối âm 500°C",
        ],
        correctIndex: 0,
        explanation: `Theo dữ liệu thiên văn: Nhiệt độ đo được là ${space.stats.temperature}.`,
      },
      {
        id: "q3",
        question: `Đường kính ước tính của ${space.name} là bao nhiêu?`,
        options: [
          space.stats.diameter,
          "Chỉ khoảng 100 mét",
          "Bằng một nửa Mặt Trăng",
          "Gấp 10.000 lần dải Ngân Hà",
        ],
        correctIndex: 0,
        explanation: `Kích thước đường kính của ${space.name} là ${space.stats.diameter}.`,
      },
    ];

    if (space.aiContext?.faqList && space.aiContext.faqList.length > 0) {
      const faq = space.aiContext.faqList[0];
      list.push({
        id: "q4",
        question: faq.question,
        options: [
          faq.answer.slice(0, 80) + "...",
          "Không có lời giải thích khoa học nào",
          "Do hiện tượng nhật thực toàn phần gây ra",
          "Do lực hấp dẫn của Sao Diêm Vương",
        ],
        correctIndex: 0,
        explanation: faq.answer,
      });
    }

    return list;
  }

  if (room) {
    const art = room.artifacts?.[0];
    const list: QuizQuestion[] = [
      {
        id: "q1",
        question: `Không gian "${room.name}" là nơi trưng bày nội dung gì?`,
        options: [
          room.subtitle,
          "Phòng thí nghiệm vật lý hiện đại",
          "Khu vui chơi giải trí",
          "Kho lưu trữ đồ cổ bí mật",
        ],
        correctIndex: 0,
        explanation: room.subtitle,
      },
    ];

    if (art) {
      list.push({
        id: "q2",
        question: `Hiện vật "${art.name}" thuộc niên đại / thời kỳ lịch sử nào?`,
        options: [
          art.era,
          "Thời kỳ Đồ Đá Cũ",
          "Thế kỷ XXI hiện đại",
          "Chưa xác định được niên đại",
        ],
        correctIndex: 0,
        explanation: `${art.name} có niên đại: ${art.era}.`,
      });

      list.push({
        id: "q3",
        question: `Bí ẩn hoặc sự thật thú vị về "${art.name}" là gì?`,
        options: [
          art.funFact,
          "Hiện vật được làm bằng nhựa tổng hợp",
          "Không có giá trị lịch sử nào",
          "Tìm thấy dưới đáy biển Thái Bình Dương",
        ],
        correctIndex: 0,
        explanation: art.funFact,
      });
    }

    return list;
  }

  return [];
}

export default function QuizCertificateModal({
  isOpen,
  onClose,
  space,
  room,
  museumName,
}: QuizCertificateModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [learnerName, setLearnerName] = useState("Nhà Thám Hiểm");
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const titleTopic = space ? space.name : room ? `${room.name} (${museumName})` : "Di Sản & Vũ Trụ";
  const isSpace = !!space;

  useEffect(() => {
    if (isOpen) {
      const q = getQuestions(space, room);
      // Shuffle choices slightly
      setQuestions(q);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setIsSubmitted(false);
    }
  }, [isOpen, space, room]);

  if (!isOpen) return null;

  const score = Object.entries(selectedAnswers).reduce((total, [qIdx, ansIdx]) => {
    const q = questions[Number(qIdx)];
    return q && q.correctIndex === ansIdx ? total + 1 : total;
  }, 0);

  const totalQuestions = questions.length || 1;
  const percentage = Math.round((score / totalQuestions) * 100);
  const isPassed = percentage >= 60;

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: optIdx });
  };

  const handleFinishQuiz = () => {
    setIsSubmitted(true);
    if (isPassed) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDownloadCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsGeneratingCert(true);
    canvas.width = 1200;
    canvas.height = 800;

    // 1. Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 800);
    if (isSpace) {
      bgGradient.addColorStop(0, "#030712");
      bgGradient.addColorStop(0.5, "#0b1528");
      bgGradient.addColorStop(1, "#020617");
    } else {
      bgGradient.addColorStop(0, "#1c1917");
      bgGradient.addColorStop(0.5, "#292524");
      bgGradient.addColorStop(1, "#0c0a09");
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 800);

    // 2. Gold Outer Border
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, 1140, 740);

    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, 1110, 710);

    // 3. Header Title
    ctx.textAlign = "center";
    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("★ CHỨNG CHỈ VINH DANH HOÀN THÀNH XUẤT SẮC ★", 600, 120);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText(
      isSpace ? "DANH HIỆU PHI HÀNH GIA KHÁM PHÁ VŨ TRỤ" : "DANH HIỆU NHÀ KHÁM PHÁ DI SẢN LỊCH SỬ",
      600,
      180
    );

    // 4. Recipient Name
    ctx.fillStyle = "#94a3b8";
    ctx.font = "20px sans-serif";
    ctx.fillText("Chứng nhận trao tặng cho:", 600, 260);

    ctx.fillStyle = isSpace ? "#38bdf8" : "#fbbf24";
    ctx.font = "bold 56px sans-serif";
    ctx.fillText(learnerName.toUpperCase(), 600, 340);

    // 5. Achievement details
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "22px sans-serif";
    ctx.fillText(
      `Đã hoàn thành xuất sắc thử thách trắc nghiệm kiến thức tại: ${titleTopic}`,
      600,
      420
    );

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(`Kết quả: ${score}/${totalQuestions} Điểm (${percentage}%) - Xếp loại: XUẤT SẮC`, 600, 480);

    // 6. Seal & Star Icons
    ctx.fillStyle = "#f59e0b";
    ctx.font = "40px sans-serif";
    ctx.fillText("⭐⭐⭐⭐⭐", 600, 560);

    // 7. Footer & Date
    const today = new Date().toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    ctx.textAlign = "left";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "18px sans-serif";
    ctx.fillText(`Ngày cấp: ${today}`, 100, 700);
    ctx.fillText("Hệ Thống Giáo Dục Solar & Museum 360°", 100, 730);

    ctx.textAlign = "right";
    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("BAN KHẢO THÍ VR VŨ TRỤ & DI SẢN", 1100, 700);
    ctx.font = "italic 16px sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("Đã xác thực chữ ký điện tử", 1100, 730);

    // Download canvas as image
    const link = document.createElement("a");
    link.download = `Chung-Chi-${learnerName.replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setIsGeneratingCert(false);
  };

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl text-white max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-500/30">
            <Trophy size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {isSpace ? "Thử Thách Vũ Trụ" : "Đố Vui Di Sản"}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
              Trắc Nghiệm Kiến Thức: {titleTopic}
            </h2>
          </div>
        </div>

        {/* Quiz Playing State */}
        {!isSubmitted && currentQ && (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>
                Câu hỏi <strong>{currentQuestionIndex + 1}</strong> / {totalQuestions}
              </span>
              <span className="font-mono text-amber-300 font-bold">
                {Object.keys(selectedAnswers).length}/{totalQuestions} Đã chọn
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                }}
              />
            </div>

            {/* Question Text */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 min-h-[80px] flex items-center">
              <h3 className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
                {currentQ.question}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                return (
                  <button
                    key={`opt-${optIdx}`}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-500/10 scale-[1.01]"
                        : "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    <span>{opt}</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                        isSelected
                          ? "border-amber-400 bg-amber-500 text-stone-950"
                          : "border-slate-600"
                      }`}
                    >
                      {isSelected && <Check size={12} className="stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation & Submit Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold disabled:opacity-30 hover:bg-slate-700 transition"
              >
                ← Câu Trước
              </button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-lg"
                >
                  Câu Tiếp Theo →
                </button>
              ) : (
                <button
                  onClick={handleFinishQuiz}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-stone-950 text-xs font-bold transition shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95"
                >
                  ✨ Nộp Bài & Xem Kết Quả
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quiz Result & Certificate Generator */}
        {isSubmitted && (
          <div className="space-y-5 animate-slide-up text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-3xl shadow-xl shadow-amber-500/20 mx-auto">
              {isPassed ? "🏆" : "💡"}
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                {isPassed ? "Chúc Mừng! Bạn Đã Xuất Sắc Hoàn Thành" : "Bạn Hãy Thử Lại Nhé!"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Bạn đạt được <strong>{score}/{totalQuestions}</strong> câu đúng ({percentage}% điểm số)
              </p>
            </div>

            {/* Explanations Accordion */}
            <div className="text-left space-y-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 max-h-48 overflow-y-auto">
              <div className="text-xs font-bold text-amber-300 mb-2">Xem Lại Lời Giải Chi Tiết:</div>
              {questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correctIndex;
                return (
                  <div key={`exp-${idx}`} className="text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                      {isCorrect ? (
                        <CheckCircle size={14} className="text-emerald-400" />
                      ) : (
                        <XCircle size={14} className="text-red-400" />
                      )}
                      <span>Câu {idx + 1}: {q.question}</span>
                    </div>
                    <p className="text-[11px] text-emerald-300/90 pl-5">
                      <strong>Đáp án đúng:</strong> {q.options[q.correctIndex]}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Certificate Section for Passed Learners */}
            {isPassed && (
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-950/40 to-yellow-950/20 border border-amber-500/50 space-y-3">
                <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-sm">
                  <Sparkles size={16} />
                  <span>Xuất Chứng Chỉ Vinh Danh</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative flex-1 w-full">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={learnerName}
                      onChange={(e) => setLearnerName(e.target.value)}
                      placeholder="Nhập họ và tên của bạn để in lên chứng chỉ..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    onClick={handleDownloadCertificate}
                    disabled={isGeneratingCert || !learnerName.trim()}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition disabled:opacity-40"
                  >
                    <Download size={14} />
                    <span>Tải Chứng Chỉ (.PNG)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Hidden Canvas for Certificate Generation */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setIsSubmitted(false);
                  setCurrentQuestionIndex(0);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                <RotateCcw size={13} />
                <span>Làm Lại Bài Thi</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg"
              >
                Hoàn Thành & Trở Lại Tour
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

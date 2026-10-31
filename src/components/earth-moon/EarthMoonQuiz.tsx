"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import { spaceAudio } from "@/lib/audio-synth";

export interface QuizQuestion {
  id: number;
  category: "rotation" | "day_night" | "solar_eclipse" | "lunar_eclipse";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: "rotation",
    question:
      "Đứng trên Trái Đất, vì sao ta luôn thấy Mặt Trời mọc ở hướng Đông và lặn ở hướng Tây mỗi ngày?",
    options: [
      "Do Mặt Trời thực sự quay xung quanh Trái Đất từ Đông sang Tây.",
      "Do Trái Đất tự quay quanh trục từ Tây sang Đông (ngược chiều kim đồng hồ khi nhìn từ cực Bắc).",
      "Do lực hút hấp dẫn của Mặt Trăng kéo Mặt Trời di chuyển.",
      "Do trục Trái Đất nghiêng cố định một góc 23.5°.",
    ],
    correctIndex: 1,
    explanation:
      "Chính xác! Trái Đất tự quay quanh trục theo chiều từ Tây sang Đông. Vì ta đứng trên bề mặt Trái Đất đang chuyển động, nên ta quan sát thấy chuyển động tương đối (biểu kiến) của Mặt Trời và các vì sao đi từ Đông sang Tây.",
  },
  {
    id: 2,
    category: "day_night",
    question:
      "Quan sát Trái Đất và Mặt Trăng từ ngoài không gian, vì sao luôn có một nửa được chiếu sáng và một nửa chìm trong bóng tối?",
    options: [
      "Do Trái Đất và Mặt Trăng có dạng hình cầu đục, ánh sáng Mặt Trời chỉ chiếu tới một phía đối diện tại mỗi thời điểm.",
      "Do tầng khí quyển dày đặc ngăn cản ánh sáng truyền ra phía sau.",
      "Do Mặt Trăng che khuất một nửa Trái Đất liên tục.",
      "Do tốc độ quay quá nhanh tạo ra vùng chân không bóng tối.",
    ],
    correctIndex: 0,
    explanation:
      "Tuyệt vời! Do Trái Đất và Mặt Trăng đều là khối cầu đục, không tự phát sáng, nên nguồn sáng song song từ Mặt Trời chỉ chiếu rọi được một bán cầu (tạo thành Ban Ngày), bán cầu đối diện không nhận được ánh sáng trực tiếp sẽ là Ban Đêm.",
  },
  {
    id: 3,
    category: "solar_eclipse",
    question:
      "Vị trí thẳng hàng nào của 3 thiên thể trong không gian sẽ dẫn đến hiện tượng NHẬT THỰC?",
    options: [
      "Trái Đất — Mặt Trời — Mặt Trăng",
      "Mặt Trời — Mặt Trăng — Trái Đất (Mặt Trăng ở chính giữa).",
      "Mặt Trời — Trái Đất — Mặt Trăng (Trái Đất ở chính giữa).",
      "Mặt Trăng vuông góc với đường nối Mặt Trời và Trái Đất.",
    ],
    correctIndex: 1,
    explanation:
      "Đúng rồi! Khi Mặt Trăng di chuyển vào vị trí chính giữa Mặt Trời và Trái Đất trên một đường thẳng (vào ngày trăng non / Sóc), Mặt Trăng sẽ che khuất Mặt Trời và đổ nón bóng tối lên bề mặt Trái Đất, tạo nên Nhật thực.",
  },
  {
    id: 4,
    category: "solar_eclipse",
    question:
      "Người đứng ở vùng bóng tối trên Trái Đất sẽ quan sát thấy hiện tượng NHẬT THỰC TOÀN PHẦN như thế nào?",
    options: [
      "Mặt Trời đổi sang màu đỏ rực trong suốt 24 giờ liên tiếp.",
      "Mặt Trăng che khít hoàn toàn đĩa Mặt Trời, trời tối sầm lại giữa ban ngày và hiện lên Vành Nhật Hoa (Corona) trắng bạc rực rỡ.",
      "Bầu trời biến thành màu xanh lá cây và xuất hiện cực quang khắp nơi.",
      "Mặt Trời nở to gấp đôi và phát ra tia sét khắp vòm trời.",
    ],
    correctIndex: 1,
    explanation:
      "Xuất sắc! Khi đĩa tối của Mặt Trăng che khít hoàn toàn quang cầu Mặt Trời, ánh sáng ban ngày tắt hẳn, trời tối như hoàng hôn muộn, nhiệt độ hạ xuống, và để lộ Vành Nhật Hoa lấp lánh huyền ảo cùng các vì sao sáng bỗng hiện rõ giữa ban trưa!",
  },
  {
    id: 5,
    category: "lunar_eclipse",
    question:
      "Vị trí thẳng hàng nào của 3 thiên thể sẽ gây ra hiện tượng NGUYỆT THỰC?",
    options: [
      "Mặt Trời — Trái Đất — Mặt Trăng (Trái Đất ở chính giữa che ánh sáng Mặt Trời).",
      "Mặt Trời — Mặt Trăng — Trái Đất (Mặt Trăng ở chính giữa).",
      "Trái Đất — Mặt Trăng — Mặt Trời (Trái Đất ở rìa ngoài).",
      "Mặt Trời và Mặt Trăng nằm đối xứng qua Sao Hỏa.",
    ],
    correctIndex: 0,
    explanation:
      "Chính xác! Nguyệt thực xảy ra khi Trái Đất nằm chính giữa Mặt Trời và Mặt Trăng (vào đêm trăng tròn / ngày Vọng). Trái Đất chắn ánh sáng Mặt Trời chiếu tới Mặt Trăng, khiến Mặt Trăng đi vào vùng bóng tối của Trái Đất.",
  },
  {
    id: 6,
    category: "lunar_eclipse",
    question:
      "Vì sao khi xảy ra Nguyệt Thực Toàn Phần, nhìn từ Trái Đất ta thấy Mặt Trăng chuyển sang MÀU ĐỎ ĐỒNG ('Trăng Máu') mà không biến mất hoàn toàn?",
    options: [
      "Do bề mặt Mặt Trăng bị nung nóng bốc cháy phát ra ngọn lửa đỏ.",
      "Do ánh sáng đỏ của Mặt Trời bị tán xạ Rayleigh và khúc xạ qua bầu khí quyển Trái Đất, uốn cong rồi hội tụ chiếu lên Mặt Trăng.",
      "Do bụi từ Sao Hỏa bay sang nhuộm đỏ đĩa Mặt Trăng.",
      "Do mắt người trong bóng đêm tự cảm nhận thấy màu đỏ ảo giác.",
    ],
    correctIndex: 1,
    explanation:
      "Rất sâu sắc! Ánh sáng Mặt Trời khi đi qua tầng khí quyển bao quanh Trái Đất: các tia sáng xanh có bước sóng ngắn bị tán xạ hết, chỉ có các tia đỏ bước sóng dài xuyên qua được và bị khúc xạ uốn cong, chiếu rọi lên bề mặt Mặt Trăng, tạo nên sắc màu 'Trăng Máu' kỳ diệu!",
  },
];

export default function EarthMoonQuiz() {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentQ = QUESTIONS[currentIdx];
  const userAns = selectedAnswers[currentQ.id];
  const isAnswered = userAns !== undefined;
  const isCorrect = isAnswered && userAns === currentQ.correctIndex;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    spaceAudio.playWarpSound();
    const updated = { ...selectedAnswers, [currentQ.id]: idx };
    setSelectedAnswers(updated);

    if (idx === currentQ.correctIndex) {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const handleNext = () => {
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsFinished(true);
      const score = calculateScore();
      if (score >= 80) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });
    return Math.round((correctCount / QUESTIONS.length) * 100);
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentIdx(0);
    setIsFinished(false);
  };

  const score = calculateScore();

  return (
    <div className="w-full h-full p-3 sm:p-6 flex flex-col justify-between overflow-y-auto bg-slate-950 text-white select-none">
      {!isFinished ? (
        <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-between space-y-4">
          {/* Header Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
              <span className="text-cyan-400 flex items-center gap-1.5">
                <HelpCircle size={16} />
                Câu hỏi {currentIdx + 1} / {QUESTIONS.length}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700">
                Chủ đề: {currentQ.category === "rotation" ? "Trái Đất Tự Quay" : currentQ.category === "day_night" ? "Ngày & Đêm" : currentQ.category === "solar_eclipse" ? "Nhật Thực" : "Nguyệt Thực"}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl space-y-3">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Options List */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map((opt, optIdx) => {
                const isThisSelected = userAns === optIdx;
                const isThisCorrect = optIdx === currentQ.correctIndex;

                let btnStyle =
                  "bg-slate-950/70 border-slate-800 text-slate-200 hover:border-cyan-500/50 hover:bg-slate-800/80";

                if (isAnswered) {
                  if (isThisCorrect) {
                    btnStyle = "bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-500/20";
                  } else if (isThisSelected) {
                    btnStyle = "bg-rose-950/90 border-rose-400 text-rose-200 shadow-lg shadow-rose-500/20";
                  } else {
                    btnStyle = "bg-slate-950/40 border-slate-800/50 text-slate-500 opacity-60";
                  }
                }

                return (
                  <button
                    key={`opt-${optIdx}`}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full min-h-[48px] p-3 rounded-2xl border text-left text-xs sm:text-sm font-medium transition flex items-start gap-3 active:scale-[0.99] ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1 pt-0.5 leading-snug">{opt}</span>
                    {isAnswered && isThisCorrect && (
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    {isAnswered && isThisSelected && !isThisCorrect && (
                      <XCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Box appears after answering */}
            {isAnswered && (
              <div
                className={`p-3 sm:p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed animate-fade-in ${
                  isCorrect
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
                    : "bg-amber-950/60 border-amber-500/40 text-amber-200"
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <Sparkles size={14} />
                  <span>{isCorrect ? "Giải Thích Khoa Học:" : "Giải Thích Đúng:"}</span>
                </div>
                <p>{currentQ.explanation}</p>
              </div>
            )}
          </div>

          {/* Action Footer Button */}
          <div className="flex items-center justify-end pt-2">
            {isAnswered && (
              <button
                onClick={handleNext}
                className="min-h-[46px] px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-stone-950 font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition"
              >
                <span>{currentIdx < QUESTIONS.length - 1 ? "Câu Tiếp Theo" : "Xem Kết Quả"}</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Finished Screen */
        <div className="max-w-xl mx-auto w-full p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/40 shadow-2xl text-center space-y-5 my-auto animate-slide-up">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl shadow-2xl shadow-amber-500/30">
            {score >= 80 ? "🏆" : score >= 50 ? "🌟" : "🔭"}
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {score >= 80
                ? "Xuất Sắc! Bạn Là Nhà Thiên Văn Nhí!"
                : score >= 50
                ? "Khá Tốt! Nắm Vững Bản Chất Thiên Văn!"
                : "Cố Lên Nhé! Hãy Xem Lại Mô Phỏng 3D!"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Bài tập hệ Mặt Trời - Trái Đất, Mặt Trăng (SGK Khoa học tự nhiên)
            </p>
          </div>

          {/* Score Badge */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-around">
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Điểm Số</div>
              <div className="text-3xl font-extrabold text-cyan-400">{score}/100</div>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Số Câu Đúng</div>
              <div className="text-3xl font-extrabold text-amber-400">
                {Object.values(selectedAnswers).filter((ans, idx) => ans === QUESTIONS[idx].correctIndex).length} / {QUESTIONS.length}
              </div>
            </div>
          </div>

          {/* Key Insights Recap */}
          <div className="text-left text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2 text-slate-300">
            <div className="font-bold text-cyan-300">📌 Ghi Nhớ Cốt Lõi:</div>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Mặt Trời mọc <strong>Đông</strong> lặn <strong>Tây</strong> do Trái Đất tự quay từ <strong>Tây sang Đông</strong>.</li>
              <li>Trong không gian, Trái Đất & Mặt Trăng luôn có <strong>1 nửa ban ngày & 1 nửa ban đêm</strong>.</li>
              <li><strong>Nhật thực:</strong> Mặt Trời — Mặt Trăng — Trái Đất (bóng Mặt Trăng đổ lên Trái Đất).</li>
              <li><strong>Nguyệt thực:</strong> Mặt Trời — Trái Đất — Mặt Trăng (Trái Đất che ánh sáng, Mặt Trăng đỏ thành &quot;Trăng Máu&quot;).</li>
            </ul>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="min-h-[44px] px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg active:scale-95 transition"
            >
              <RotateCcw size={15} />
              <span>Làm Lại Bài Tập</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

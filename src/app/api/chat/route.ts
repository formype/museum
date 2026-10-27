import { NextResponse } from "next/server";
import { SPACES_DATA } from "@/data/spaces";
import { MUSEUM_ROOMS } from "@/data/museum-spaces";

export async function POST(req: Request) {
  try {
    const { message, spaceId, history } = await req.json();

    // Check if this is a museum room chat
    if (spaceId && spaceId.startsWith("museum-")) {
      const roomId = spaceId.replace("museum-", "");
      const room = MUSEUM_ROOMS[roomId] || MUSEUM_ROOMS["grand-hall"];
      const reply = generateMuseumGuideResponse(message, room);
      return NextResponse.json({ reply });
    }

    // Otherwise space tutor chat
    const space = SPACES_DATA[spaceId] || SPACES_DATA["sun"];
    const tutor = space.aiContext;

    // Check if environment has OpenAI API key
    const openAiKey = process.env.OPENAI_API_KEY;

    if (openAiKey) {
      try {
        const systemPrompt = `Bạn là ${tutor.roleName} (${tutor.avatarEmoji}), một gia sư thiên văn học thông thái, vui vẻ và truyền cảm hứng dành cho học sinh.
Không gian hiện tại: ${space.name} (${space.nameEn}).
Khẩu hiệu: ${space.tagline}
Kiến thức cốt lõi về ${space.name}:
${tutor.coreKnowledge.join("\n")}
Thông số:
- Đường kính: ${space.stats.diameter}
- Khoảng cách: ${space.stats.distanceFromSun}
- Nhiệt độ: ${space.stats.temperature}
- Ngày / Năm: ${space.stats.dayLength} / ${space.stats.yearLength}
- Vệ tinh: ${space.stats.moons}

Quy tắc trả lời:
1. Luôn dùng ngôn ngữ gần gũi, sinh động, dễ hiểu và truyền cảm hứng cho học sinh (cấp 1 - cấp 3).
2. Trình bày có gạch đầu dòng rõ ràng, kèm icon/emoji sinh động.
3. Luôn kết thúc bằng một câu hỏi gợi mở hoặc câu đố vui nhỏ để kích thích tư duy của học sinh.
4. Trả lời bằng tiếng Việt.`;

        const messages = [
          { role: "system", content: systemPrompt },
          ...(history || []).slice(-6),
          { role: "user", content: message },
        ];

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.7,
            max_tokens: 600,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.choices[0]?.message?.content;
          if (reply) {
            return NextResponse.json({ reply });
          }
        }
      } catch (err) {
        console.warn("OpenAI API call failed, falling back to local tutor engine:", err);
      }
    }

    // Built-in Space Engine
    const smartReply = generatePedagogicalResponse(message, space);
    return NextResponse.json({ reply: smartReply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Không thể xử lý tin nhắn lúc này." },
      { status: 500 }
    );
  }
}

// Rule-based response for Museum Rooms & Artifacts
function generateMuseumGuideResponse(userMsg: string, room: typeof MUSEUM_ROOMS[string]): string {
  const q = userMsg.toLowerCase();
  const guide = room.aiGuide;

  // Check custom FAQ match first
  if (guide?.faqList && guide.faqList.length > 0) {
    for (const faq of guide.faqList) {
      const faqQ = faq.question.toLowerCase();
      const qWords = faqQ.split(" ").filter((w) => w.length > 3);
      if (q.includes(faqQ) || (qWords.length > 0 && qWords.filter((w) => q.includes(w)).length >= Math.min(2, qWords.length))) {
        return `💡 **Giải đáp thắc mắc: ${faq.question}**\n\n${faq.answer}\n\n✨ *Bạn có câu hỏi nào khác về ${room.name} không?*`;
      }
    }
  }

  if (q.includes("chào") || q.includes("hello") || q.includes("hi")) {
    return `Kính chào quý khách! Tôi là **${guide.name}** ${guide.avatar} tại **${room.name}**.\n\nRất hân hạnh được đồng hành cùng bạn khám phá các cổ vật và trang sử hào hùng nơi đây. Bạn muốn tìm hiểu sâu về hiện vật nào trong phòng?`;
  }

  // Check matching artifact
  for (const art of room.artifacts) {
    const artKeywords = art.name.toLowerCase().split(" ");
    const isMatched = artKeywords.some((w) => w.length > 3 && q.includes(w)) || q.includes(art.id);
    if (isMatched) {
      return `🏛️ **Thông tin hiện vật: ${art.name}** ${art.thumbnailEmoji}

📅 **Niên đại:** ${art.era}
📜 **Câu chuyện lịch sử:**
${art.historicalStory}

✨ **Bí ẩn lịch sử:**
${art.funFact}

💡 *Bạn có thể bấm nút "Nghe Thuyết Minh" trên màn hình để nghe giọng đọc chi tiết về hiện vật này nhé!*`;
    }
  }

  if (q.includes("trống đồng") || q.includes("đông sơn")) {
    return `🥁 **Trống Đồng Đông Sơn - Bảo Vật Quốc Gia:**
- **Niên đại:** Thế kỷ VII TCN - Thế kỷ I SCN (Thời dựng nước Văn Lang - Âu Lạc).
- **Đặc sắc:** Hoa văn hình Mặt Trời ở tâm, đàn chim Lạc bay ngược chiều kim đồng hồ, cảnh giã gạo và lễ hội chèo thuyền.
- **Ý nghĩa:** Biểu tượng quyền lực của thủ lĩnh và nhạc khí thiêng liêng trong các nghi lễ cầu mùa màng tốt tươi.`;
  }

  if (q.includes("micro") || q.includes("1945") || q.includes("tuyên ngôn")) {
    return `🎙️ **Chiếc Micro Lịch Sử Ngày 2/9/1945:**
- Tại Quảng trường Ba Đình lịch sử, chiếc micro này đã thu trọn giọng đọc bản Tuyên ngôn Độc lập của Bác Hồ.
- Câu nói ân cần: *"Tôi nói đồng bào nghe rõ không?"* đã trở thành khoảnh khắc rung động hàng triệu trái tim đồng bào cả nước!`;
  }

  if (q.includes("xe đạp") || q.includes("điện biên") || q.includes("thồ")) {
    return `🚲 **Chiếc Xe Đạp Thồ Điện Biên Phủ Huyền Thoại:**
- Được gia cố thêm khung gỗ, nâng cao tay ngai và lót săm đặc biệt.
- Kỷ lục vận tải lên tới **352 kg lương thực/chuyến** vượt đèo dốc hiểm trở, đóng góp quyết định vào chiến thắng "lừng lẫy năm châu, chấn động địa cầu".`;
  }

  if (q.includes("galileo") || q.includes("kính thiên văn")) {
    return `🔭 **Kính Thiên Văn Cổ Của Galileo (1609):**
- Phát minh đã làm thay đổi hoàn toàn nhân loại khi chứng minh Mặt Trăng có hố va chạm và Sao Mộc có 4 mặt trăng xoay quanh.
- Khẳng định thuyết Nhật tâm của Copernicus (Mặt Trời là trung tâm).`;
  }

  return `📜 **Hướng dẫn viên ${guide.name} xin chia sẻ:**

Tại **${room.name}**, chúng ta đang lưu giữ những hiện vật vô giá:
${room.artifacts.map((a) => `• **${a.name}** (${a.era})`).join("\n")}

Bạn có thể bấm vào từng **điểm sáng màu vàng** trong không gian 360° để xem hình ảnh và câu chuyện chi tiết, hoặc dùng **mũi tên dưới sàn** để bước sang các phòng khác!`;
}

// Rule-based high-quality pedagogical response generator
function generatePedagogicalResponse(userMsg: string, space: typeof SPACES_DATA[string]): string {
  const q = userMsg.toLowerCase();
  const name = space.name;
  const stats = space.stats;

  // Check custom FAQ match first
  if (space.aiContext?.faqList && space.aiContext.faqList.length > 0) {
    for (const faq of space.aiContext.faqList) {
      const faqQ = faq.question.toLowerCase();
      const qWords = faqQ.split(" ").filter((w) => w.length > 3);
      if (q.includes(faqQ) || (qWords.length > 0 && qWords.filter((w) => q.includes(w)).length >= Math.min(2, qWords.length))) {
        return `💡 **Gia sư giải đáp thắc mắc: ${faq.question}**\n\n${faq.answer}\n\n🌟 *Em có muốn khám phá thêm điều gì nữa không?*`;
      }
    }
  }

  if (q.includes("chào") || q.includes("hello") || q.includes("hi")) {
    return `Chào em! Thầy là **${space.aiContext.roleName}** ${space.aiContext.avatarEmoji}! 
Thầy rất vui được đồng hành cùng em khám phá **${name}** hôm nay. Em muốn tìm hiểu về nhiệt độ, địa hình, hay những bí ẩn kỳ thú nào ở đây?`;
  }

  if (q.includes("nhiệt độ") || q.includes("nóng") || q.includes("lạnh")) {
    return `🌡️ **Nhiệt độ tại ${name}:**
- Mức nhiệt đo được: **${stats.temperature}**
${
  space.id === "venus"
    ? "- Sao Kim là nơi nóng nhất Hệ Mặt Trời do bầu khí quyển CO2 dày đặc tạo hiệu ứng nhà kính mất kiểm soát đấy!"
    : space.id === "mercury"
    ? "- Vì không có khí quyển nên Sao Thủy chênh lệch tới 600°C giữa ngày và đêm!"
    : space.id === "sun"
    ? "- Lõi Mặt Trời nóng tới 15 triệu °C, đủ để nung chảy mọi vật chất thành plasma!"
    : `- Hãy so sánh với nhiệt độ trung bình 15°C trên Trái Đất nhé!`
}

❓ *Đố em biết: Nếu mặc áo phi hành gia đứng ở đây thì chúng ta cần hệ thống điều hòa công suất thế nào?*`;
  }

  if (q.includes("khoảng cách") || q.includes("xa") || q.includes("bao xa")) {
    return `📏 **Khoảng cách và Vị trí của ${name}:**
- Khoảng cách đến Mặt Trời: **${stats.distanceFromSun}**
- Kích thước đường kính: **${stats.diameter}**

🚀 *Nếu đi bằng máy bay chở khách (900 km/h), em sẽ mất hàng chục năm mới bay tới được đây đấy!*`;
  }

  if (q.includes("vệ tinh") || q.includes("mặt trăng") || q.includes("moon")) {
    return `🌕 **Số lượng Vệ tinh của ${name}:**
- Hiện tại các nhà khoa học ghi nhận: **${stats.moons}**
${
  space.id === "jupiter"
    ? "- Sao Mộc có vệ tinh Europa chứa đại dương nước lỏng ngầm bên dưới lớp băng dày!"
    : space.id === "saturn"
    ? "- Sao Thổ giữ kỷ lục với hơn 140 vệ tinh, trong đó Titan có khí quyển dày và hồ methane!"
    : space.id === "earth"
    ? "- Trái Đất chỉ có duy nhất 1 Mặt Trăng xinh đẹp đồng hành suốt 4.5 tỷ năm qua."
    : ""
}

✨ *Em có muốn khám phá bí ẩn của vệ tinh nào không?*`;
  }

  if (q.includes("ngày") || q.includes("năm") || q.includes("thời gian") || q.includes("quay")) {
    return `⏳ **Thời gian trên ${name}:**
- Một ngày dài: **${stats.dayLength}**
- Một năm dài: **${stats.yearLength}**

💡 *Điều thú vị là:* Mỗi hành tinh có tốc độ tự quay và chu kỳ quỹ đạo rất khác nhau do khoảng cách và lực hấp dẫn của Mặt Trời đấy!`;
  }

  if (q.includes("đố") || q.includes("quiz") || q.includes("câu đố")) {
    const quizMap: Record<string, string> = {
      sun: "☀️ **Câu đố vui:** Ánh sáng từ Mặt Trời mất bao nhiêu phút để bay tới Trái Đất?\nA) 8 phút 20 giây\nB) 1 tiếng\nC) 1 giây\n*(Hãy trả lời A, B hoặc C nhé!)*",
      mars: "🔴 **Câu đố vui:** Núi lửa Olympus Mons trên Sao Hỏa cao gấp mấy lần đỉnh Everest của Trái Đất?\nA) Gấp 1.5 lần\nB) Gấp gần 3 lần (22km)\nC) Bằng nhau\n*(Hãy đoán thử xem nào!)*",
      saturn: "🪐 **Câu đố vui:** Nếu có một bể nước khổng lồ vừa vặn, Sao Thổ sẽ chìm hay nổi?\nA) Chìm nghỉm\nB) Nổi bồng bềnh\n*(Gợi ý: Sao Thổ có tỷ trọng nhẹ hơn nước đấy!)*",
      earth: "🌍 **Câu đố vui:** Nước chiếm bao nhiêu phần trăm bề mặt Trái Đất?\nA) 50%\nB) 71%\nC) 90%",
    };
    return quizMap[space.id] || `🎯 **Câu đố vui về ${name}:** Em có biết đặc điểm nổi bật nhất khiến các nhà thiên văn học ấn tượng về ${name} là gì không? Hãy thử nêu một điều em vừa phát hiện qua ảnh 360 độ nhé!`;
  }

  if (q === "a" || q === "b" || q === "c" || q.includes("đáp án")) {
    return `🎉 **Hoan hô em!** Tinh thần học hỏi của em rất tuyệt vời! 
Khám phá vũ trụ luôn đòi hỏi sự tò mò và dám thử nghiệm. Em hãy nhấp tiếp vào các điểm neo Hotspot 360° trong không gian để tìm thêm nhiều manh mối thú vị nhé! ⭐`;
  }

  return `✨ **Gia sư ${space.aiContext.roleName} xin chia sẻ:**

Về **${name}**, đây là một trong những kỳ quan tuyệt vời nhất của Hệ Mặt Trời:
${space.aiContext.coreKnowledge.map((k) => `• ${k}`).join("\n")}

Em có muốn hỏi sâu hơn về **${space.aiContext.suggestedQuestions[0]}** không? Hãy bấm vào gợi ý bên dưới hoặc gõ câu hỏi cho thầy nhé!`;
}

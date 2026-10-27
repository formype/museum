import { MuseumRoom, MUSEUM_ROOMS } from "./museum-spaces";

export interface MuseumSite {
  id: string;
  name: string;
  shortName: string;
  city: string;
  badge: string;
  thumbnailEmoji: string;
  description: string;
  defaultRoomId: string;
  rooms: Record<string, MuseumRoom>;
}

export const INITIAL_MUSEUMS: Record<string, MuseumSite> = {
  "history-museum-vn": {
    id: "history-museum-vn",
    name: "Bảo Tàng Lịch Sử Quốc Gia",
    shortName: "BT Lịch Sử",
    city: "Hà Nội",
    badge: "Bảo Tàng Hạng Đặc Biệt",
    thumbnailEmoji: "🏛️",
    description: "Nơi lưu giữ hàng trăm nghìn cổ vật quý giá từ thời tiền sử, thời kỳ dựng nước Hùng Vương đến lịch sử cận hiện đại.",
    defaultRoomId: "grand-hall",
    rooms: MUSEUM_ROOMS,
  },

  "ho-chi-minh-museum": {
    id: "ho-chi-minh-museum",
    name: "Bảo Tàng Hồ Chí Minh",
    shortName: "BT Hồ Chí Minh",
    city: "Hà Nội",
    badge: "Di Tích Quốc Gia",
    thumbnailEmoji: "⭐",
    description: "Không gian trưng bày toàn diện về cuộc đời, sự nghiệp cách mạng vĩ đại và tư tưởng của Chủ tịch Hồ Chí Minh.",
    defaultRoomId: "hcm-main-hall",
    rooms: {
      "hcm-main-hall": {
        id: "hcm-main-hall",
        name: "Gian Trưng Bày Trung Tâm",
        subtitle: "Tượng Chủ tịch Hồ Chí Minh và biểu tượng đài hoa sen trắng",
        category: "grand_hall",
        themeColor: "#e11d48",
        bgType: "grand_hall",
        audioNarration: {
          title: "Lời chào tại Bảo tàng Hồ Chí Minh",
          speaker: "Thuyết Minh Viên Bảo Tàng",
          transcript: "Chào mừng quý khách đến với Bảo tàng Hồ Chí Minh. Nơi đây là công trình kiến trúc mang hình tượng bông sen trắng thanh tao, lưu giữ hơn 13 vạn tài liệu, hiện vật về Người anh hùng giải phóng dân tộc, danh nhân văn hóa thế giới.",
        },
        aiGuide: {
          name: "Thảo Ly - HDV Bảo Tàng Bác",
          avatar: "⭐",
          title: "Chuyên viên Thuyết minh Tư liệu Bác Hồ",
          welcomeMessage: "Chào mừng các bạn đến với Bảo tàng Hồ Chí Minh! Hãy cùng tôi tìm hiểu những dấu mốc lịch sử vĩ đại của Người nhé!",
          suggestedQuestions: [
            "Kiến trúc của Bảo tàng Hồ Chí Minh mang ý nghĩa gì?",
            "Hành trình 30 năm tìm đường cứu nước của Bác bắt đầu từ đâu?",
            "Những hiện vật nào gắn liền với lối sống giản dị của Bác?"
          ]
        },
        navigationLinks: [
          {
            targetRoomId: "hcm-pac-bo",
            targetRoomName: "Gian Tái Hiện Hang Pác Bó",
            direction: "forward",
            pitch: -30,
            yaw: 0,
            label: "Bước vào Gian Pác Bó - Cao Bằng",
          }
        ],
        artifacts: [
          {
            id: "hcm-rubber-sandals",
            name: "Đôi Dép Lốp Cao Su Huyền Thoại",
            era: "Kháng chiến chống Pháp và Mỹ (1947 - 1969)",
            thumbnailEmoji: "👡",
            shortSummary: "Đôi dép cao su cắt từ lốp xe quân sự - biểu tượng của sự giản dị thanh bạch.",
            historicalStory: "Đôi dép lốp được Bác Hồ sử dụng suốt hơn 20 năm từ chiến khu Việt Bắc cho đến khi Người qua đời. Dép được chế tác khéo léo từ lốp ô tô quân sự chiến lợi phẩm. Đôi dép đã cùng Bác đi khắp mọi miền Tổ quốc và xuất hiện trong các chuyến công du quốc tế, khiến bạn bè năm châu vô cùng xúc động và khâm phục phong cách sống thanh bạch của vị lãnh tụ tối cao.",
            funFact: "Đôi dép lốp nổi tiếng đến mức các nhà báo quốc tế từng sáng tác nhiều bài thơ ca ngợi đôi dép cao su vĩ đại của Bác Hồ!",
            pitch: -15,
            yaw: 20,
            audioGuideText: "Đôi dép cao su Bác Hồ - biểu tượng giản dị nhưng chất chứa nhân cách cao đẹp của Người.",
          }
        ]
      },
      "hcm-pac-bo": {
        id: "hcm-pac-bo",
        name: "Không Gian Tái Hiện Hang Pác Bó",
        subtitle: "Nơi Bác trở về Tổ quốc sau 30 năm bôn ba (1941)",
        category: "relics_gallery",
        themeColor: "#059669",
        bgType: "relics_gallery",
        audioNarration: {
          title: "Pác Bó - Nơi cội nguồn cách mạng",
          speaker: "HDV Bảo Tàng",
          transcript: "Mùa xuân năm 1941, sau 30 năm bôn ba hải ngoại, Bác Hồ đã đặt bước chân đầu tiên trở về đất mẹ tại cột mốc 108 Pác Bó, Cao Bằng. Tại đây, 'Sáng ra bờ suối, tối vào hang - Cháo bẹ rau măng vẫn sẵn sàng'.",
        },
        aiGuide: {
          name: "Thảo Ly - HDV Bảo Tàng Bác",
          avatar: "⭐",
          title: "Chuyên viên Thuyết minh Tư liệu Bác Hồ",
          welcomeMessage: "Chào bạn! Cùng ngắm nhìn chiếc bàn đá chông chênh nơi Bác dịch sử Đảng nhé!",
          suggestedQuestions: [
            "Bác Hồ đã sống và làm việc tại hang Pác Bó như thế nào?",
            "Dòng suối Lê Nin và núi Các Mác có nguồn gốc từ đâu?"
          ]
        },
        navigationLinks: [
          {
            targetRoomId: "hcm-main-hall",
            targetRoomName: "Gian Trưng Bày Trung Tâm",
            direction: "backward",
            pitch: -35,
            yaw: 180,
            label: "Quay lại Gian Trung Tâm",
          }
        ],
        artifacts: [
          {
            id: "hcm-stone-table",
            name: "Chiếc Bàn Đá Dịch Sử Đảng",
            era: "Năm 1941 (Hang Cốc Bó, Cao Bằng)",
            thumbnailEmoji: "🪨",
            shortSummary: "Chiếc bàn đá tự nhiên nơi Bác ngồi dịch cuốn Lịch sử Đảng Cộng sản Liên Xô.",
            historicalStory: "Chiếc bàn đá mộc mạc bên bờ suối Lê Nin là nơi Bác Hồ thường ngồi làm việc mỗi sáng sớm. Trong hoàn cảnh thiếu thốn trăm bề, Người đã tự tay dịch cuốn sách Lịch sử Đảng làm tài liệu huấn luyện cho cán bộ cách mạng Việt Nam.",
            funFact: "Bài thơ 'Tức cảnh Pác Bó' nổi tiếng đã ra đời ngay tại chiếc bàn đá này vào tháng 2 năm 1941.",
            pitch: -12,
            yaw: -25,
            audioGuideText: "Chiếc bàn đá Pác Bó - nơi khởi nguồn cho những quyết sách lịch sử của cách mạng Việt Nam.",
          }
        ]
      }
    }
  },

  "nha-rong-wharf": {
    id: "nha-rong-wharf",
    name: "Khu Di Tích Bến Nhà Rồng",
    shortName: "Bến Nhà Rồng",
    city: "TP. Hồ Chí Minh",
    badge: "Di Tích Lịch Sử Biển",
    thumbnailEmoji: "🚢",
    description: "Nơi người thanh niên Nguyễn Tất Thành bước lên con tàu Amiral Latouche-Tréville ra đi tìm đường cứu nước ngày 5/6/1911.",
    defaultRoomId: "nha-rong-main",
    rooms: {
      "nha-rong-main": {
        id: "nha-rong-main",
        name: "Sảnh Lịch Sử Bến Cảng 1911",
        subtitle: "Không gian nhìn ra dòng sông Sài Gòn lịch sử",
        category: "grand_hall",
        themeColor: "#0284c7",
        bgType: "grand_hall",
        audioNarration: {
          title: "Bến Nhà Rồng - Điểm hẹn lịch sử của dân tộc",
          speaker: "Thuyết Minh Viên Miền Nam",
          transcript: "Chào mừng quý khách đến với Bến Nhà Rồng bên bờ sông Sài Gòn. Ngày 5 tháng 6 năm 1911, từ bến cảng này, người thanh niên yêu nước Nguyễn Tất Thành với hai bàn tay trắng đã bước lên con tàu viễn dương, mở đầu cuộc hành trình 30 năm tìm con đường tự do cho dân tộc.",
        },
        aiGuide: {
          name: "Minh Quân - HDV Bến Nhà Rồng",
          avatar: "🚢",
          title: "Chuyên viên Thuyết minh Bến Cảng Lịch Sử",
          welcomeMessage: "Chào bạn! Tôi sẽ kể cho bạn nghe hành trình vượt đại dương của Bác Hồ từ Bến cảng Sài Gòn!",
          suggestedQuestions: [
            "Con tàu Amiral Latouche-Tréville có lịch trình đi qua những nước nào?",
            "Tại sao bến cảng này lại có tên gọi là Bến Nhà Rồng?",
            "Bác Hồ đã làm những công việc gì khi ở nước ngoài?"
          ]
        },
        navigationLinks: [],
        artifacts: [
          {
            id: "ship-model-1911",
            name: "Mô Hình Tàu Amiral Latouche-Tréville",
            era: "Năm 1911 (Tàu hơi nước Pháp)",
            thumbnailEmoji: "🚢",
            shortSummary: "Con tàu buôn chở người thanh niên Văn Ba rời Tổ quốc ra đi tìm chân lý cứu nước.",
            historicalStory: "Con tàu buôn hơi nước trọng tải 5.500 tấn mang tên Đô đốc Latouche-Tréville của hãng vận tải Năm Sao (Pháp). Tại đây, người thanh niên Nguyễn Tất Thành lấy tên Văn Ba nhận làm phụ bếp, trải qua muôn vàn sóng to gió lớn trên hành trình vượt biển sang châu Âu và châu Phi.",
            funFact: "Công việc phụ bếp trên tàu thời đó vô cùng vất vả, phải dậy từ 4 giờ sáng cọ rửa nồi chảo khổng lồ và gánh than dưới hầm lò nóng rực.",
            pitch: -15,
            yaw: 10,
            audioGuideText: "Mô hình con tàu lịch sử - nơi bắt đầu hành trình tìm đường cứu nước của Bác Hồ.",
          }
        ]
      }
    }
  },

  "fine-arts-museum": {
    id: "fine-arts-museum",
    name: "Bảo Tàng Mỹ Thuật Việt Nam",
    shortName: "BT Mỹ Thuật",
    city: "Hà Nội",
    badge: "Kho Tàng Nghệ Thuật",
    thumbnailEmoji: "🎨",
    description: "Nơi tôn vinh các bảo vật mỹ thuật dân gian, sơn mài, tranh lụa và tượng điêu khắc tinh hoa Việt Nam.",
    defaultRoomId: "fine-arts-hall",
    rooms: {
      "fine-arts-hall": {
        id: "fine-arts-hall",
        name: "Phòng Trưng Bày Tranh Sơn Mài & Lụa",
        subtitle: "Đỉnh cao mỹ thuật hội họa Đông Dương",
        category: "cultural_art",
        themeColor: "#854d0e",
        bgType: "cultural_art",
        audioNarration: {
          title: "Nghệ thuật Sơn mài truyền thống Việt Nam",
          speaker: "Họa Sĩ Giám Tuyển AI",
          transcript: "Chào mừng quý khách đến với Bảo tàng Mỹ thuật Việt Nam. Sơn mài Việt Nam là kỹ thuật độc nhất vô nhị trên thế giới kết hợp giữa sơn ta tự nhiên, vỏ trứng, vàng quỳ và bạc dát tạo nên những tác phẩm lung linh sâu thẳm.",
        },
        aiGuide: {
          name: "Họa Sĩ Ánh Dương",
          avatar: "🎨",
          title: "Giám tuyển Nghệ thuật Hội Họa",
          welcomeMessage: "Chào bạn! Hãy cùng tôi chiêm ngưỡng sắc màu kỳ ảo của chất liệu sơn mài và tranh lụa Việt Nam nhé!",
          suggestedQuestions: [
            "Kỹ thuật mài tranh sơn mài độc đáo như thế nào?",
            "Bức tranh nào là Bảo vật Quốc gia tại bảo tàng?",
            "Sự khác biệt giữa tranh sơn dầu phương Tây và sơn mài Việt Nam?"
          ]
        },
        navigationLinks: [],
        artifacts: [
          {
            id: "lacquer-painting-masterpiece",
            name: "Bức Tranh Sơn Mài 'Vườn Xuân Trung Nam Bắc'",
            era: "Năm 1969 - 1989 (Danh họa Nguyễn Gia Trí)",
            thumbnailEmoji: "🖼️",
            shortSummary: "Bảo vật quốc gia - kiệt tác sơn mài khổ lớn đồ sộ nhất của mỹ thuật Việt Nam.",
            historicalStory: "Danh họa Nguyễn Gia Trí đã dành trọn gần 20 năm tâm huyết để sáng tác bức tranh sơn mài này. Tác phẩm khắc họa vẻ đẹp thiếu nữ ba miền trong trang phục truyền thống vui hội giữa vườn xuân rực rỡ, biểu tượng cho khát vọng thống nhất non sông.",
            funFact: "Bức tranh được ghép từ 9 tấm gỗ phủ nhiều lớp sơn son thếp vàng với diện tích gần 12m2!",
            pitch: -10,
            yaw: 0,
            audioGuideText: "Kiệt tác Vườn Xuân Trung Nam Bắc - bảo vật quốc gia rực rỡ của hội họa Việt Nam.",
          }
        ]
      }
    }
  }
};

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface MuseumArtifact {
  id: string;
  name: string;
  era: string; // Niên đại / Thời kỳ
  thumbnailEmoji: string;
  image?: string; // Uploaded image
  shortSummary: string;
  historicalStory: string;
  funFact: string;
  pitch: number;
  yaw: number;
  audioGuideText: string;
}

export interface FloorNavigationLink {
  targetRoomId: string;
  targetRoomName: string;
  direction: "forward" | "backward" | "left" | "right" | "up" | "down";
  pitch: number;
  yaw: number;
  label: string;
}

export interface MuseumRoom {
  id: string;
  name: string;
  subtitle: string;
  category: "grand_hall" | "relics_gallery" | "space_heritage" | "cultural_art" | "courtyard";
  themeColor: string;
  bgType: "grand_hall" | "relics_gallery" | "space_heritage" | "cultural_art" | "courtyard";
  customPanorama?: string;
  audioNarration: {
    title: string;
    speaker: string;
    transcript: string;
  };
  aiGuide: {
    name: string;
    avatar: string;
    title: string;
    welcomeMessage: string;
    suggestedQuestions: string[];
    faqList?: FAQItem[];
  };
  navigationLinks: FloorNavigationLink[];
  artifacts: MuseumArtifact[];
}

export const MUSEUM_ROOMS: Record<string, MuseumRoom> = {
  "grand-hall": {
    id: "grand-hall",
    name: "Sảnh Khánh Tiết Trung Tâm",
    subtitle: "Nơi tiếp đón trang trọng và điểm khởi đầu hành trình khám phá di sản ngàn năm",
    category: "grand_hall",
    themeColor: "#d97706",
    bgType: "grand_hall",
    audioNarration: {
      title: "Lời chào mừng tại Sảnh Khánh Tiết Bảo Tàng",
      speaker: "Thuyết Minh Viên Bảo Ngọc",
      transcript: "Kính chào quý khách và các bạn học sinh thân mến! Chào mừng mọi người đến với Bảo tàng 3D Lịch sử và Văn hóa Việt Nam. Sảnh Khánh Tiết là không gian trang trọng nhất, nơi lưu giữ tinh hoa luyện kim và hồn thiêng sông núi qua hàng ngàn năm dựng nước và giữ nước.",
    },
    aiGuide: {
      name: "Bảo Ngọc - Hướng Dẫn Viên Di Sản",
      avatar: "🏛️",
      title: "Chuyên gia Thuyết minh Di sản Văn hóa",
      welcomeMessage: "Chào mừng bạn đến với Sảnh Khánh Tiết! Tôi là Bảo Ngọc. Hãy hỏi tôi về kiến trúc bảo tàng hoặc những đồ vật lịch sử bạn nhìn thấy quanh đây nhé!",
      suggestedQuestions: [
        "Kiến trúc của bảo tàng được xây dựng theo phong cách nào?",
        "Ý nghĩa hoa văn trên Trống Đồng Đông Sơn ở giữa sảnh là gì?"
      ],
      faqList: [
        {
          id: "faq-gh-1",
          question: "Ý nghĩa hoa văn trên Trống Đồng Đông Sơn ở giữa sảnh là gì?",
          answer: "Tâm trống khắc hình ngôi sao 14 tia tượng trưng cho thần Mặt Trời ban phát ánh sáng và sự sống. Vòng ngoài khắc đàn chim Lạc bay ngược chiều kim đồng hồ cùng cảnh giã gạo, lễ hội chèo thuyền, phản ánh tín ngưỡng nông nghiệp lúa nước của tổ tiên thời Hùng Vương.",
        }
      ]
    },
    navigationLinks: [
      {
        targetRoomId: "relics-gallery",
        targetRoomName: "Phòng Hiện Vật Lịch Sử",
        direction: "forward",
        pitch: -30,
        yaw: 0,
        label: "Tiến vào Phòng Hiện Vật Lịch Sử",
      },
      {
        targetRoomId: "space-heritage",
        targetRoomName: "Gian Thiên Văn & Vũ Trụ",
        direction: "right",
        pitch: -30,
        yaw: 85,
        label: "Rẽ sang Gian Thiên Văn & Vũ Trụ",
      }
    ],
    artifacts: [
      {
        id: "dong-son-drum",
        name: "Trống Đồng Đông Sơn Cổ",
        era: "Thế kỷ VII TCN - Thế kỷ I SCN (Thời kỳ Văn Lang - Âu Lạc)",
        thumbnailEmoji: "🥁",
        image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
        shortSummary: "Bảo vật quốc gia đỉnh cao của kỹ thuật luyện kim đúc đồng thời dựng nước.",
        historicalStory: "Trống đồng Đông Sơn là biểu tượng thiêng liêng của nền văn minh lúa nước Việt cổ. Tâm trống khắc hình Mặt Trời rực rỡ tỏa ra các tia sáng, tượng trưng cho tín ngưỡng thờ thần Mặt Trời ban phát sự sống. Vòng ngoài khắc đàn chim Lạc bay cùng cảnh giã gạo và thuyền chiến thời các vua Hùng.",
        funFact: "Hợp kim đồng pha thiếc và chì của trống đạt tỷ lệ chuẩn xác đến mức âm thanh vang xa hàng cây số!",
        pitch: -12,
        yaw: 15,
        audioGuideText: "Trước mắt quý khách là Trống Đồng Đông Sơn, bảo vật quốc gia minh chứng cho tài hoa luyện kim đỉnh cao của tổ tiên.",
      }
    ]
  },

  "relics-gallery": {
    id: "relics-gallery",
    name: "Phòng Hiện Vật Lịch Sử Cận Đại",
    subtitle: "Nơi lưu giữ kỷ vật thiêng liêng của các mốc son độc lập vẻ vang",
    category: "relics_gallery",
    themeColor: "#dc2626",
    bgType: "relics_gallery",
    audioNarration: {
      title: "Tham quan Phòng Hiện Vật Lịch Sử Cận Đại",
      speaker: "Thuyết Minh Viên Hồng Hạnh",
      transcript: "Chào mừng quý khách bước vào gian phòng lịch sử cận đại. Nơi đây lưu giữ những kỷ vật thiêng liêng đã đồng hành cùng bao thế hệ cha anh, từ chiếc micro vang vọng lời Tuyên ngôn Độc lập năm 1945 đến chiếc xe đạp thồ làm nên chiến thắng Điện Biên Phủ huyền thoại.",
    },
    aiGuide: {
      name: "Sử Gia Hoàng Minh",
      avatar: "📜",
      title: "Cố vấn Lịch sử Dân tộc",
      welcomeMessage: "Chào các bạn trẻ! Tôi sẽ kể cho các bạn nghe những câu chuyện lịch sử hào hùng.",
      suggestedQuestions: [
        "Chiếc micro lịch sử ngày 2/9/1945 có ý nghĩa gì?",
        "Xe đạp thồ Điện Biên Phủ chở được tối đa bao nhiêu kg?"
      ]
    },
    navigationLinks: [
      {
        targetRoomId: "grand-hall",
        targetRoomName: "Sảnh Khánh Tiết",
        direction: "backward",
        pitch: -35,
        yaw: 180,
        label: "Quay lại Sảnh Khánh Tiết",
      }
    ],
    artifacts: [
      {
        id: "historical-mic-1945",
        name: "Chiếc Micro Lịch Sử 2/9/1945",
        era: "Ngày 2 tháng 9 năm 1945 (Quảng trường Ba Đình)",
        thumbnailEmoji: "🎙️",
        shortSummary: "Chiếc micro thu âm giọng đọc Tuyên ngôn Độc lập của Chủ tịch Hồ Chí Minh.",
        historicalStory: "Chiều ngày 2/9/1945, tại Quảng trường Ba Đình lịch sử, chiếc micro này đã truyền đi lời đọc Tuyên ngôn Độc lập hào sảng của Bác Hồ tới hàng chục vạn đồng bào cả nước. Khoảnh khắc câu hỏi ân cần 'Tôi nói đồng bào nghe rõ không?' vang lên đã trở thành dấu ấn lịch sử bất diệt.",
        funFact: "Chiếc micro này là loại Shure 55 cổ điển được các kỹ sư đài phát thanh bảo quản bí mật suốt kháng chiến.",
        pitch: -15,
        yaw: 0,
        audioGuideText: "Chiếc micro lịch sử - nơi âm vang lời Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa.",
      },
      {
        id: "dien-bien-bicycle",
        name: "Xe Đạp Thồ Điện Biên Phủ",
        era: "Năm 1954 (Chiến dịch Điện Biên Phủ)",
        thumbnailEmoji: "🚲",
        shortSummary: "Phương tiện vận tải huyền thoại vượt đèo lội suối tiếp tế hỏa tuyến.",
        historicalStory: "Những chiếc xe đạp thồ được gia cố khung gỗ, nâng cao tay ngai và lót săm đặc biệt đã lập nên kỳ tích vận tải hơn 2 vạn tấn lương thực vũ khí lên lòng chảo Điện Biên Phủ, làm nên chiến thắng chấn động địa cầu.",
        funFact: "Chiếc xe của chiến sĩ Ma Văn Thắng đã lập kỷ lục thồ tới 352 kg lương thực chỉ trong một chuyến đi!",
        pitch: -18,
        yaw: -75,
        audioGuideText: "Xe đạp thồ Điện Biên Phủ - biểu tượng của ý chí quật cường và sức mạnh toàn dân trong kháng chiến.",
      }
    ]
  },

  "space-heritage": {
    id: "space-heritage",
    name: "Gian Thiên Văn & Vũ Trụ Di Sản",
    subtitle: "Lịch sử khám phá bầu trời và khát vọng vươn tới các vì sao",
    category: "space_heritage",
    themeColor: "#0284c7",
    bgType: "space_heritage",
    audioNarration: {
      title: "Khám phá Gian Thiên Văn & Di Sản Vũ Trụ",
      speaker: "Nhà Thiên Văn Minh Thư",
      transcript: "Chào mừng các bạn đến với gian phòng trưng bày Thiên văn học và Vũ trụ. Từ những chiếc kính thiên văn thô sơ thời Galileo cho đến những bức ảnh chụp hàng tỷ thiên hà của kính James Webb, nhân loại chưa bao giờ ngừng ước mơ chạm tới những vì sao xa.",
    },
    aiGuide: {
      name: "TS. Cosmos Tuấn",
      avatar: "🔭",
      title: "Chuyên viên Khám phá Vũ trụ",
      welcomeMessage: "Chào bạn! Đây là nơi tôn vinh những phát kiến vĩ đại của thiên văn học.",
      suggestedQuestions: [
        "Kính thiên văn của Galileo đã chứng minh điều gì?"
      ]
    },
    navigationLinks: [
      {
        targetRoomId: "grand-hall",
        targetRoomName: "Sảnh Khánh Tiết",
        direction: "backward",
        pitch: -35,
        yaw: -150,
        label: "Quay lại Sảnh Khánh Tiết",
      }
    ],
    artifacts: [
      {
        id: "galileo-telescope",
        name: "Kính Thiên Văn Cổ Galileo",
        era: "Năm 1609 (Phát minh thiên văn học)",
        thumbnailEmoji: "🔭",
        shortSummary: "Phát minh vĩ đại mở ra kỷ nguyên thiên văn học quan sát hiện đại.",
        historicalStory: "Năm 1609, Galileo Galilei đã hướng ống kính thiên văn tự chế lên bầu trời đêm và phát hiện ra bề mặt lồi lõm của Mặt Trăng cùng 4 mặt trăng lớn quay quanh Sao Mộc, qua đó khẳng định Trái Đất không phải là trung tâm của vũ trụ.",
        funFact: "Ống kính đầu tiên của Galileo chỉ có độ phóng đại khoảng 3 lần, sau đó ông tự mài thấu kính nâng lên 30 lần!",
        pitch: -10,
        yaw: 40,
        audioGuideText: "Kính thiên văn Galileo - chiếc chìa khóa mở ra cánh cửa hiểu biết về vũ trụ bao la của loài người.",
      }
    ]
  },

  "cultural-art": {
    id: "cultural-art",
    name: "Gian Gốm Sứ & Mỹ Thuật Cổ Truyền",
    subtitle: "Nét tài hoa tinh xảo trong di sản gốm sứ và điêu khắc truyền thống",
    category: "cultural_art",
    themeColor: "#059669",
    bgType: "cultural_art",
    audioNarration: {
      title: "Khám phá Gian Gốm Sứ & Mỹ Thuật Cổ Truyền",
      speaker: "Thuyết Minh Viên Thu Hà",
      transcript: "Chào mừng quý khách bước vào không gian của gốm hoa lam và nghệ thuật điêu khắc dân gian. Từng nét vẽ thanh thoát trên men gốm Chu Đậu, Bát Tràng đã vượt trùng dương theo những con tàu buôn cổ ra khắp thế giới.",
    },
    aiGuide: {
      name: "Họa Sĩ Thanh Trúc",
      avatar: "🎨",
      title: "Nhà Nghiên Cứu Mỹ Thuật Cổ",
      welcomeMessage: "Chào bạn! Tôi rất vui được giới thiệu vẻ đẹp tinh tế của gốm men và hoa văn cổ truyền.",
      suggestedQuestions: [
        "Gốm Chu Đậu thế kỷ XV có đặc điểm gì nổi bật?"
      ]
    },
    navigationLinks: [
      {
        targetRoomId: "grand-hall",
        targetRoomName: "Sảnh Khánh Tiết",
        direction: "backward",
        pitch: -35,
        yaw: 180,
        label: "Quay lại Sảnh Khánh Tiết",
      }
    ],
    artifacts: [
      {
        id: "chu-dau-vase",
        name: "Bình Gốm Hoa Lam Chu Đậu",
        era: "Thế kỷ XV (Thời kỳ Hậu Lê)",
        thumbnailEmoji: "🏺",
        image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80",
        shortSummary: "Đỉnh cao gốm men trắng vẽ lam trứ danh của đồng bằng Bắc Bộ xuất khẩu ra thế giới.",
        historicalStory: "Gốm Chu Đậu nổi tiếng với chất men tro trấu tự nhiên óng ả và nét vẽ phóng khoáng hình hoa sen, chim muông. Chiếc bình gốm Chu Đậu lưu giữ tại bảo tàng Topkapi Thổ Nhĩ Kỳ từng được định giá hàng triệu đô la.",
        funFact: "Men gốm Chu Đậu được làm hoàn toàn từ tro rơm nếp và đất sét trắng lọc kỹ tạo nên độ trong suốt độc nhất vô nhị.",
        pitch: -15,
        yaw: 10,
        audioGuideText: "Bình gốm Chu Đậu - tinh hoa gốm men Việt vang danh trên con đường tơ lụa trên biển.",
      }
    ]
  },

  "courtyard": {
    id: "courtyard",
    name: "Sân Vườn Di Tích & Cột Đá",
    subtitle: "Không gian mở kết nối thiên nhiên và các bia đá, tác phẩm ngoài trời",
    category: "courtyard",
    themeColor: "#65a30d",
    bgType: "courtyard",
    audioNarration: {
      title: "Dạo bước tại Sân Vườn Di Tích Bảo Tàng",
      speaker: "Hướng Dẫn Viên Mai Phương",
      transcript: "Chào mừng quý khách bước ra không gian sân vườn thoáng đãng ngập tràn sắc xanh. Nơi đây trưng bày các văn bia đá cổ, cột trụ điêu khắc rồng phượng thời Lý - Trần dưới bóng mát của những cây cổ thụ trăm năm tuổi.",
    },
    aiGuide: {
      name: "Trần An - Người Làm Vườn Di Sản",
      avatar: "🌿",
      title: "Quản Lý Cảnh Quan Bảo Tàng",
      welcomeMessage: "Chào bạn! Hãy tận hưởng không khí trong lành và tìm hiểu các tượng đá ngoài trời nhé.",
      suggestedQuestions: [
        "Họa tiết rồng thời Lý trên cột đá có gì đặc biệt?"
      ]
    },
    navigationLinks: [
      {
        targetRoomId: "grand-hall",
        targetRoomName: "Sảnh Khánh Tiết",
        direction: "backward",
        pitch: -35,
        yaw: 180,
        label: "Quay lại Sảnh Khánh Tiết",
      }
    ],
    artifacts: [
      {
        id: "stone-stele",
        name: "Cột Đá Chạm Rồng Thời Lý",
        era: "Thế kỷ XI - XII (Thời Lý)",
        thumbnailEmoji: "🗿",
        shortSummary: "Kiệt tác điêu khắc đá rồng cuộn mềm mại hình chữ S đặc trưng thời Lý.",
        historicalStory: "Rồng thời Lý mang thân hình tròn lẳn, uốn khúc mềm mại như ngọn lửa hoặc làn sóng, biểu trưng cho sự uyển chuyển, bác ái và tinh thần độc lập thịnh trị của triều đại Đại Việt.",
        funFact: "Đá dùng để chạm khắc cột trụ được vận chuyển bằng bè mảng vượt hàng trăm cây số đường sông từ vùng núi Thanh Hóa!",
        pitch: -12,
        yaw: -30,
        audioGuideText: "Cột đá chạm rồng thời Lý - tác phẩm điêu khắc đá tinh xảo biểu tượng cho nền nghệ thuật Đại Việt ngàn năm.",
      }
    ]
  }
};

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface Hotspot {
  id: string;
  pitch: number; // -90 to 90 degrees
  yaw: number;   // -180 to 180 degrees
  title: string;
  category: "info" | "portal" | "quiz" | "discovery";
  description: string;
  targetSpaceId?: string;
  badge?: string;
  image?: string; // Uploaded custom image (DataURL or URL)
  details?: {
    image?: string;
    fact: string;
    funFact?: string;
  };
}

export interface AudioNarration {
  title: string;
  speaker: string;
  durationSec: number;
  transcript: string;
  timestamps?: { time: number; text: string }[];
}

export interface SpaceData {
  id: string;
  name: string;
  nameEn: string;
  tagline: string;
  category: "star" | "rocky_planet" | "gas_giant" | "satellite" | "space_station";
  themeColor: string;
  accentGlow: string;
  customPanorama?: string;
  stats: {
    diameter: string;
    distanceFromSun: string;
    dayLength: string;
    yearLength: string;
    temperature: string;
    moons: string;
  };
  overview: string;
  keyFeatures: string[];
  audioNarration: AudioNarration;
  aiContext: {
    roleName: string;
    avatarEmoji: string;
    personaDescription: string;
    coreKnowledge: string[];
    suggestedQuestions: string[];
    faqList?: FAQItem[];
  };
  hotspots: Hotspot[];
  planet3d: {
    size: number;
    distance: number;
    speed: number;
    color: string;
    emissive?: string;
    ring?: boolean;
    ringColor?: string;
    ringInnerRadius?: number;
    ringOuterRadius?: number;
    textureType: "sun" | "mercury" | "venus" | "earth" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune" | "moon" | "station";
  };
}

export const SPACES_DATA: Record<string, SpaceData> = {
  "sun": {
    id: "sun",
    name: "Mặt Trời",
    nameEn: "The Sun",
    tagline: "Trái tim rực lửa và nguồn sống vô tận của toàn Hệ Mặt Trời",
    category: "star",
    themeColor: "#f59e0b",
    accentGlow: "rgba(245, 158, 11, 0.4)",
    stats: {
      diameter: "1,392,700 km (gấp 109 lần Trái Đất)",
      distanceFromSun: "0 km (Trung tâm Hệ Mặt Trời)",
      dayLength: "27 ngày (tự quay quanh trục)",
      yearLength: "230 triệu năm (quanh dải Ngân Hà)",
      temperature: "5,500°C (bề mặt) / 15 triệu°C (lõi)",
      moons: "8 hành tinh chính + hàng trăm nghìn tiểu hành tinh"
    },
    overview: "Mặt Trời là một ngôi sao lùn vàng lớp G2V ở trung tâm Hệ Mặt Trời, chiếm tới 99.86% tổng khối lượng của toàn bộ hệ hành tinh.",
    keyFeatures: [
      "Chiếm tới 99.86% tổng khối lượng toàn bộ Hệ Mặt Trời",
      "Nhiệt độ tại lõi đạt xấp xỉ 15.000.000 độ C",
      "Ánh sáng Mặt Trời mất khoảng 8 phút 20 giây để tới Trái Đất"
    ],
    audioNarration: {
      title: "Mặt Trời: Trái tim nhiệt hạch và nguồn sống của vũ trụ",
      speaker: "Hướng Dẫn Viên Thiên Văn Ánh Dương",
      durationSec: 50,
      transcript: "Chào mừng các bạn đến với Mặt Trời, ngọn hải đăng khổng lồ và nguồn sống diệu kỳ của muôn loài. Tại tâm lõi rực cháy hơn 15 triệu độ C, hàng trăm triệu tấn hydro đang hợp nhất mỗi giây để tạo nên nguồn năng lượng thắp sáng cả hệ hành tinh.",
    },
    aiContext: {
      roleName: "Helios - Gia Sư Mặt Trời",
      avatarEmoji: "☀️",
      personaDescription: "Chuyên gia vật lý thiên văn vui vẻ, giải thích hiện tượng năng lượng mặt trời một cách gần gũi.",
      coreKnowledge: [
        "Mặt Trời là sao lùn vàng lớp G2V",
        "Cấu tạo gồm 73% Hydro, 25% Heli và 2% các nguyên tố nặng hơn",
        "Có chu kỳ hoạt động từ 11 năm với các cực đại bão từ (Solar Flare, CME)"
      ],
      suggestedQuestions: [
        "Tại sao Mặt Trời có thể cháy liên tục hàng tỷ năm mà không cần oxy?",
        "Bão từ Mặt Trời có gây nguy hiểm cho Trái Đất không?",
        "Khi nào Mặt Trời sẽ tắt và điều gì xảy ra sau đó?"
      ],
      faqList: [
        {
          id: "faq-sun-1",
          question: "Tại sao Mặt Trời có thể cháy liên tục hàng tỷ năm mà không cần oxy?",
          answer: "Mặt Trời không cháy bằng phản ứng oxy hóa như lửa thông thường. Nó hoạt động nhờ phản ứng nhiệt hạch: dưới áp suất và nhiệt độ 15 triệu độ C, các hạt nhân Hydro bị ép chặt và hợp nhất thành Heli, giải phóng nguồn năng lượng khổng lồ.",
        },
        {
          id: "faq-sun-2",
          question: "Bão từ Mặt Trời có gây nguy hiểm cho Trái Đất không?",
          answer: "Trái Đất có từ trường và bầu khí quyển bảo vệ. Khi bão từ thổi tới, nó tạo ra hiện tượng Cực Quang (Aurora) tuyệt đẹp ở hai cực. Tuy nhiên, bão từ cực mạnh có thể gây nhiễu sóng vệ tinh viễn thông và lưới điện.",
        }
      ]
    },
    hotspots: [
      {
        id: "sun-core",
        pitch: 5,
        yaw: 20,
        title: "Lõi Phản Ứng Nhiệt Hạch",
        category: "info",
        description: "Vùng trung tâm với áp suất cực lớn biến Hydro thành Heli, giải phóng các photon ánh sáng nuôi dưỡng sự sống.",
        badge: "15 Triệu °C",
        image: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=800&auto=format&fit=crop&q=80",
        details: {
          fact: "Một thìa vật chất từ lõi Mặt Trời nặng tương đương một đoàn tàu hỏa trên Trái Đất.",
          funFact: "Một hạt photon ánh sáng mất tới 100.000 năm để đi từ lõi ra bề mặt Mặt Trời!"
        }
      },
      {
        id: "sun-flare",
        pitch: -15,
        yaw: -70,
        title: "Vết Lóa & Bão Mặt Trời (Solar Flare)",
        category: "discovery",
        description: "Các vụ nổ năng lượng khổng lồ bắn những dòng hạt mang điện tích ra ngoài không gian với tốc độ hàng triệu km/h.",
        badge: "Hiện tượng vũ trụ",
        details: {
          fact: "Khi gió mặt trời va chạm với từ trường Trái Đất, nó sinh ra hiện tượng Cực Quang kỳ ảo ở hai cực."
        }
      }
    ],
    planet3d: {
      size: 3.2,
      distance: 0,
      speed: 0,
      color: "#ff8a00",
      emissive: "#ff4500",
      textureType: "sun"
    }
  },

  "mercury": {
    id: "mercury",
    name: "Sao Thủy",
    nameEn: "Mercury",
    tagline: "Kẻ chạy nhanh nhất và thế giới của những thái cực nhiệt độ",
    category: "rocky_planet",
    themeColor: "#94a3b8",
    accentGlow: "rgba(148, 163, 184, 0.4)",
    stats: {
      diameter: "4,879 km",
      distanceFromSun: "57.9 triệu km (0.39 AU)",
      dayLength: "59 ngày Trái Đất",
      yearLength: "88 ngày Trái Đất",
      temperature: "-180°C (đêm) đến 430°C (ngày)",
      moons: "0 vệ tinh"
    },
    overview: "Sao Thủy là hành tinh nhỏ nhất và gần Mặt Trời nhất trong Hệ Mặt Trời.",
    keyFeatures: [
      "Hành tinh di chuyển nhanh nhất trong Hệ Mặt Trời (47 km/s)",
      "Bề mặt đầy hố va chạm tương tự Mặt Trăng"
    ],
    audioNarration: {
      title: "Sao Thủy: Vùng đất của những hố va chạm và thái cực nhiệt độ",
      speaker: "Hướng Dẫn Viên Thiên Văn Mai Lan",
      durationSec: 45,
      transcript: "Xin chào các bạn! Chúng ta đang đặt chân lên Sao Thủy, hành tinh chạy nhanh nhất trong Hệ Mặt Trời. Nơi đây không có bầu khí quyển để giữ nhiệt, ban ngày nóng như lò nung hơn 400 độ C nhưng ban đêm lại đóng băng âm 180 độ C.",
    },
    aiContext: {
      roleName: "Mercury Explorer Bot",
      avatarEmoji: "🪨",
      personaDescription: "Robot thám hiểm siêu bền bỉ làm việc trên bề mặt Sao Thủy.",
      coreKnowledge: [
        "Sao Thủy không có bầu khí quyển đáng kể mà chỉ có ngoại quyển mỏng (exosphere)",
        "Miệng hố lớn nhất là Bồn địa Caloris rộng 1.550 km"
      ],
      suggestedQuestions: [
        "Tại sao gần Mặt Trời như vậy mà Sao Thủy vẫn có băng ở hai cực?",
        "Vì sao Sao Thủy không phải là hành tinh nóng nhất?"
      ],
      faqList: [
        {
          id: "faq-merc-1",
          question: "Tại sao gần Mặt Trời như vậy mà Sao Thủy vẫn có băng ở hai cực?",
          answer: "Bởi vì trục quay của Sao Thủy hầu như thẳng đứng, ánh sáng Mặt Trời không bao giờ rọi xuống đáy các hố va chạm sâu tại hai cực. Nơi đó vĩnh viễn là bóng tối lạnh âm 180°C, giúp băng nước tồn tại hàng tỷ năm!",
        }
      ]
    },
    hotspots: [
      {
        id: "mercury-caloris",
        pitch: -10,
        yaw: 45,
        title: "Bồn Địa Caloris Khổng Lồ",
        category: "discovery",
        description: "Hố va chạm thiên thạch khổng lồ rộng hơn 1.500 km được tạo ra hàng tỷ năm trước.",
        badge: "Di tích va chạm",
        details: {
          fact: "Cú va chạm tạo ra Caloris mạnh tới mức tạo nên những rặng núi lồi lõm ở phía đối diện của hành tinh."
        }
      }
    ],
    planet3d: {
      size: 0.8,
      distance: 6,
      speed: 0.04,
      color: "#a8a29e",
      textureType: "mercury"
    }
  },

  "venus": {
    id: "venus",
    name: "Sao Kim",
    nameEn: "Venus",
    tagline: "Hành tinh chị em với Trái Đất nhưng nóng như một lò thiêu địa ngục",
    category: "rocky_planet",
    themeColor: "#fbbf24",
    accentGlow: "rgba(251, 191, 36, 0.4)",
    stats: {
      diameter: "12,104 km (bằng 95% Trái Đất)",
      distanceFromSun: "108.2 triệu km (0.72 AU)",
      dayLength: "243 ngày Trái Đất (quay ngược)",
      yearLength: "225 ngày Trái Đất",
      temperature: "465°C (nóng nhất Hệ Mặt Trời)",
      moons: "0 vệ tinh"
    },
    overview: "Sao Kim có kích thước và cấu tạo đá rất giống Trái Đất, nhưng lại là nơi nóng nhất Hệ Mặt Trời do hiệu ứng nhà kính mất kiểm soát.",
    keyFeatures: [
      "Hành tinh nóng nhất trong Hệ Mặt Trời, nóng hơn cả Sao Thủy",
      "Quay quanh trục theo chiều ngược lại (Mặt Trời mọc ở hướng Tây)"
    ],
    audioNarration: {
      title: "Sao Kim: Hiệu ứng nhà kính và bầu khí quyển axit nghẹt thở",
      speaker: "Hướng Dẫn Viên Thiên Văn Ngọc Bích",
      durationSec: 46,
      transcript: "Các bạn có biết không, Sao Kim từng được coi là người chị em song sinh của Trái Đất vì kích thước tương đương. Nhưng bầu khí quyển dày đặc khí CO2 đã tạo nên hiệu ứng nhà kính khủng khiếp, biến nơi đây thành hành tinh nóng nhất Hệ Mặt Trời.",
    },
    aiContext: {
      roleName: "Venus Science Guide",
      avatarEmoji: "🌋",
      personaDescription: "Nhà khoa học khí quyển giải thích về biến đổi khí hậu và hiệu ứng nhà kính.",
      coreKnowledge: [
        "Áp suất 92 bar, thành phần 96.5% CO2",
        "Có hàng nghìn núi lửa trên bề mặt"
      ],
      suggestedQuestions: [
        "Tại sao Sao Kim ở xa Mặt Trời hơn Sao Thủy nhưng lại nóng hơn?",
        "Vì sao Sao Kim lại quay ngược chiều?"
      ]
    },
    hotspots: [
      {
        id: "venus-greenhouse",
        pitch: 20,
        yaw: 0,
        title: "Tầng Mây Axit Sulfuric",
        category: "info",
        description: "Màn mây dày đặc phản chiếu ánh sáng mặt trời nhưng giữ lại toàn bộ nhiệt lượng bức xạ.",
        badge: "Hiệu ứng nhà kính"
      }
    ],
    planet3d: {
      size: 1.2,
      distance: 9,
      speed: 0.03,
      color: "#eab308",
      textureType: "venus"
    }
  },

  "earth": {
    id: "earth",
    name: "Trái Đất",
    nameEn: "Earth",
    tagline: "Hòn ngọc xanh lộng lẫy - cái nôi duy nhất của sự sống trong vũ trụ",
    category: "rocky_planet",
    themeColor: "#38bdf8",
    accentGlow: "rgba(56, 189, 248, 0.4)",
    stats: {
      diameter: "12,742 km",
      distanceFromSun: "149.6 triệu km (1.0 AU)",
      dayLength: "24 giờ",
      yearLength: "365.25 ngày",
      temperature: "Trung bình 15°C (-88°C đến 58°C)",
      moons: "1 vệ tinh tự nhiên (Mặt Trăng)"
    },
    overview: "Trái Đất là hành tinh thứ 3 tính từ Mặt Trời, nơi duy nhất trong vũ trụ được xác nhận có nước lỏng và sự sống sinh sôi.",
    keyFeatures: [
      "Hành tinh duy nhất có nước lỏng ổn định trên bề mặt",
      "Bầu khí quyển bảo vệ giàu oxy và tầng Ozone"
    ],
    audioNarration: {
      title: "Trái Đất: Viên ngọc xanh kỳ diệu và ngôi nhà chung của sự sống",
      speaker: "Hướng Dẫn Viên Thiên Văn Thùy Dương",
      durationSec: 48,
      transcript: "Chào mừng các bạn trở về với Trái Đất, hành tinh xanh thân yêu của chúng ta. Nhìn từ ngoài không gian, những đại dương bao la, các lục địa xanh tươi và dải mây trắng tạo nên một bức tranh tuyệt mỹ, nơi duy nhất nuôi dưỡng hàng triệu loài sinh vật.",
    },
    aiContext: {
      roleName: "Gaia - Trợ Lý Trái Đất",
      avatarEmoji: "🌍",
      personaDescription: "Người bạn thiên nhiên thông thái, truyền cảm hứng về khoa học và bảo vệ môi trường.",
      coreKnowledge: [
        "Vùng sinh sống (Habitable Zone / Goldilocks Zone)",
        "Nước chiếm 71% bề mặt"
      ],
      suggestedQuestions: [
        "Tại sao Trái Đất lại có 4 mùa trong năm?",
        "Nước trên Trái Đất có nguồn gốc từ đâu?"
      ]
    },
    hotspots: [
      {
        id: "earth-atmosphere",
        pitch: 25,
        yaw: 30,
        title: "Bầu Khí Quyển & Tầng Ozone",
        category: "info",
        description: "Lớp vỏ khí mỏng manh bảo vệ mọi sinh vật khỏi thiên thạch và bức xạ cực tím nguy hiểm.",
        badge: "Tấm khiên sinh quyển",
        image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&auto=format&fit=crop&q=80"
      }
    ],
    planet3d: {
      size: 1.3,
      distance: 13,
      speed: 0.02,
      color: "#2563eb",
      textureType: "earth"
    }
  },

  "moon": {
    id: "moon",
    name: "Mặt Trăng",
    nameEn: "The Moon",
    tagline: "Vệ tinh tự nhiên và bước đệm vĩ đại đưa nhân loại vươn xa",
    category: "satellite",
    themeColor: "#cbd5e1",
    accentGlow: "rgba(203, 213, 225, 0.4)",
    stats: {
      diameter: "3,474 km",
      distanceFromSun: "149.6 triệu km (cách Trái Đất 384,400 km)",
      dayLength: "27.3 ngày",
      yearLength: "27.3 ngày",
      temperature: "-130°C đến 120°C",
      moons: "0"
    },
    overview: "Mặt Trăng là vệ tinh tự nhiên duy nhất của Trái Đất và là thiên thể duy nhất ngoài Trái Đất mà con người đã từng đặt chân tới.",
    keyFeatures: [
      "Trọng lực chỉ bằng 1/6 Trái Đất",
      "Nơi Neil Armstrong để lại dấu chân lịch sử đầu tiên vào năm 1969"
    ],
    audioNarration: {
      title: "Mặt Trăng: Dấu chân lịch sử của loài người ngoài không gian",
      speaker: "Phi Hành Gia AI Phương Linh",
      durationSec: 46,
      transcript: "Chào mừng các bạn đến với Mặt Trăng! Trọng lực ở đây chỉ bằng một phần sáu Trái Đất, giúp các bạn nhảy bổng lên không trung cực kỳ nhẹ nhàng. Hãy cùng khám phá những vết tích lịch sử từ sứ mệnh Apollo nhé!",
    },
    aiContext: {
      roleName: "Artemis - Chỉ Huy Mặt Trăng",
      avatarEmoji: "👨🚀",
      personaDescription: "Chỉ huy phi vụ thám hiểm Mặt Trăng.",
      coreKnowledge: ["Cuộc đổ bộ Apollo 11", "Trọng lực 1/6"],
      suggestedQuestions: ["Vì sao dấu chân trên Mặt Trăng không bị gió thổi bay?"]
    },
    hotspots: [],
    planet3d: {
      size: 0.5,
      distance: 14.5,
      speed: 0.05,
      color: "#94a3b8",
      textureType: "moon"
    }
  },

  "mars": {
    id: "mars",
    name: "Sao Hỏa",
    nameEn: "Mars",
    tagline: "Hành tinh Đỏ bí ẩn và giấc mơ định cư thế hệ tương lai của loài người",
    category: "rocky_planet",
    themeColor: "#ef4444",
    accentGlow: "rgba(239, 68, 68, 0.4)",
    stats: {
      diameter: "6,779 km (bằng 53% Trái Đất)",
      distanceFromSun: "227.9 triệu km (1.52 AU)",
      dayLength: "24 giờ 37 phút",
      yearLength: "687 ngày Trái Đất",
      temperature: "Trung bình -63°C (-140°C đến 20°C)",
      moons: "2 (Phobos và Deimos)"
    },
    overview: "Sao Hỏa nổi tiếng với màu đỏ gỉ sắt từ oxit sắt trên bề mặt cát bụi và sở hữu những hẻm núi, núi lửa lớn nhất Hệ Mặt Trời.",
    keyFeatures: [
      "Núi lửa Olympus Mons cao 22 km, ngọn núi cao nhất vũ trụ",
      "Hẻm núi Valles Marineris dài hơn 4.000 km"
    ],
    audioNarration: {
      title: "Sao Hỏa: Miền đất đỏ và hành trình tìm kiếm sự sống cổ đại",
      speaker: "Kỹ Sư Thám Hiểm NASA Thu Hà",
      durationSec: 50,
      transcript: "Xin chào các nhà thám hiểm nhí! Chúng ta đang đứng tại bề mặt Sao Hỏa đỏ rực, cùng xe tự hành Perseverance tìm kiếm dấu vết vi sinh vật cổ đại. Bầu trời nơi đây ánh lên màu hồng cam kỳ diệu và một ngày dài rất gần với 24 giờ của Trái Đất.",
    },
    aiContext: {
      roleName: "Percy - AI Xe Tự Hành",
      avatarEmoji: "🤖",
      personaDescription: "Robot tự hành của NASA tìm kiếm hóa thạch vi sinh trên Sao Hỏa.",
      coreKnowledge: [
        "Sứ mệnh tìm kiếm dấu vết sinh học cổ đại tại hố Jezero",
        "Thiết bị MOXIE tạo oxy từ CO2"
      ],
      suggestedQuestions: [
        "Tại sao Sao Hỏa lại có màu đỏ rực?",
        "Làm thế nào để tạo oxy trên Sao Hỏa?"
      ],
      faqList: [
        {
          id: "faq-mars-1",
          question: "Tại sao Sao Hỏa lại có màu đỏ rực như vậy?",
          answer: "Bề mặt Sao Hỏa chứa lượng lớn khoáng chất Oxit Sắt (chính là chất rỉ sét màu đỏ cam). Bụi oxit sắt này bay lơ lửng trong bầu khí quyển mỏng tạo nên bầu trời và cảnh quan đỏ rực ngoạn mục.",
        }
      ]
    },
    hotspots: [
      {
        id: "mars-olympus",
        pitch: 15,
        yaw: 110,
        title: "Núi Lửa Olympus Mons Khổng Lồ",
        category: "info",
        description: "Ngọn núi lửa dạng khiên khổng lồ cao 22 km, gấp gần 3 lần đỉnh Everest của Trái Đất.",
        badge: "Kỷ lục Hệ Mặt Trời",
        image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop&q=80"
      }
    ],
    planet3d: {
      size: 0.9,
      distance: 17,
      speed: 0.015,
      color: "#dc2626",
      textureType: "mars"
    }
  },

  "jupiter": {
    id: "jupiter",
    name: "Sao Mộc",
    nameEn: "Jupiter",
    tagline: "Vua của các hành tinh và người vệ sĩ khổng lồ che chở Trái Đất",
    category: "gas_giant",
    themeColor: "#d97706",
    accentGlow: "rgba(217, 119, 6, 0.4)",
    stats: {
      diameter: "139,820 km (gấp 11 lần Trái Đất)",
      distanceFromSun: "778.5 triệu km (5.2 AU)",
      dayLength: "9 giờ 55 phút (quay nhanh nhất)",
      yearLength: "11.86 năm Trái Đất",
      temperature: "-110°C",
      moons: "95 vệ tinh"
    },
    overview: "Sao Mộc là hành tinh lớn nhất trong Hệ Mặt Trời, lớn gấp 2.5 lần tổng khối lượng của tất cả các hành tinh khác cộng lại.",
    keyFeatures: [
      "Vết Đỏ Lớn là cơn bão to hơn cả Trái Đất đã thổi hàng trăm năm",
      "Sở hữu 95 vệ tinh xoay quanh"
    ],
    audioNarration: {
      title: "Sao Mộc: Gã khổng lồ khí và tấm khiên che chở vũ trụ",
      speaker: "Hướng Dẫn Viên Thiên Văn Khánh Vy",
      durationSec: 48,
      transcript: "Chào mừng các bạn đến với Sao Mộc, người anh cả khổng lồ của Hệ Mặt Trời. Với lực hấp dẫn cực mạnh, Sao Mộc giống như một chiếc máy hút bụi vũ trụ, hút sạch nhiều sao chổi và thiên thạch để bảo vệ Trái Đất của chúng ta.",
    },
    aiContext: {
      roleName: "Jovian - Thần Khí",
      avatarEmoji: "🌀",
      personaDescription: "Chuyên gia bão khí quyển Sao Mộc.",
      coreKnowledge: ["Cơn bão Great Red Spot", "Vệ tinh Europa có đại dương ngầm"],
      suggestedQuestions: ["Cơn bão Vết Đỏ Lớn tồn tại bao lâu rồi?"]
    },
    hotspots: [],
    planet3d: {
      size: 2.5,
      distance: 22,
      speed: 0.008,
      color: "#f59e0b",
      textureType: "jupiter"
    }
  },

  "saturn": {
    id: "saturn",
    name: "Sao Thổ",
    nameEn: "Saturn",
    tagline: "Tuyệt tác lộng lẫy nhất với những vành đai băng đá kỳ vĩ",
    category: "gas_giant",
    themeColor: "#fde047",
    accentGlow: "rgba(253, 224, 71, 0.4)",
    stats: {
      diameter: "116,460 km (gấp 9 lần Trái Đất)",
      distanceFromSun: "1.43 tỷ km (9.5 AU)",
      dayLength: "10 giờ 33 phút",
      yearLength: "29.4 năm Trái Đất",
      temperature: "-140°C",
      moons: "146 vệ tinh"
    },
    overview: "Sao Thổ nổi tiếng với hệ thống vành đai băng đá lộng lẫy và rộng lớn nhất thiên hà.",
    keyFeatures: [
      "Tỷ trọng nhẹ hơn nước (có thể nổi trên mặt nước)",
      "146 vệ tinh tự nhiên đa dạng"
    ],
    audioNarration: {
      title: "Sao Thổ: Vương miện băng ngọc lộng lẫy nhất thiên hà",
      speaker: "Hướng Dẫn Viên Thiên Văn Mỹ Duyên",
      durationSec: 48,
      transcript: "Trước mắt các bạn là Sao Thổ, viên ngọc quý lộng lẫy bậc nhất của Hệ Mặt Trời. Hàng tỷ mảnh băng đá và bụi vũ trụ lấp lánh quay quanh hành tinh tạo nên những vành đai tuyệt đẹp mà không nơi nào có được.",
    },
    aiContext: {
      roleName: "Cassini - Linh Hồn Tàu Thám Hiểm",
      avatarEmoji: "🪐",
      personaDescription: "Kể chuyện vành đai và mặt trăng Titan.",
      coreKnowledge: ["Vành đai 99% băng nước", "Mặt trăng Titan có hồ methane"],
      suggestedQuestions: ["Sao Thổ có thể nổi trên mặt nước không?"]
    },
    hotspots: [],
    planet3d: {
      size: 2.1,
      distance: 28,
      speed: 0.006,
      color: "#eab308",
      ring: true,
      ringColor: "#fef08a",
      ringInnerRadius: 2.8,
      ringOuterRadius: 4.8,
      textureType: "saturn"
    }
  },

  "iss-station": {
    id: "iss-station",
    name: "Trạm Vũ Trụ ISS",
    nameEn: "ISS Station",
    tagline: "Ngôi nhà chung của nhân loại giữa quỹ đạo không trọng lực",
    category: "space_station",
    themeColor: "#3b82f6",
    accentGlow: "rgba(59, 130, 246, 0.4)",
    stats: {
      diameter: "Dài 109m (bằng sân bóng đá)",
      distanceFromSun: "Cách mặt đất 408 km",
      dayLength: "90 phút/vòng quanh Trái Đất",
      yearLength: "Quỹ đạo LEO",
      temperature: "24°C (bên trong khoang)",
      moons: "Trạm không gian quốc tế"
    },
    overview: "Trạm Vũ Trụ Quốc Tế bay quanh Trái Đất ở vận tốc 27.600 km/h, nơi các phi hành gia làm việc và ngắm 16 lần bình minh mỗi ngày.",
    keyFeatures: [
      "16 lần hoàng hôn và bình minh mỗi ngày",
      "Khoang vòm Cupola 360 độ ngắm toàn cảnh Trái Đất"
    ],
    audioNarration: {
      title: "Trạm ISS: Một ngày làm việc của các phi hành gia",
      speaker: "Chỉ Huy Trạm ISS Thu Thảo",
      durationSec: 46,
      transcript: "Chào mừng các bạn lên Trạm Vũ Trụ Quốc Tế ISS. Cứ mỗi 90 phút, chúng ta lại bay hết một vòng quanh Trái Đất và ngắm nhìn bình minh rực rỡ từ khoang kính vòm Cupola huyền thoại.",
    },
    aiContext: {
      roleName: "Alex - Chỉ Huy ISS",
      avatarEmoji: "🛰️",
      personaDescription: "Hướng dẫn cuộc sống phi hành gia trong không gian.",
      coreKnowledge: ["Tập thể dục chống teo cơ", "Tái chế nước và không khí"],
      suggestedQuestions: ["Phi hành gia tắm rửa trên vũ trụ như thế nào?"]
    },
    hotspots: [],
    planet3d: {
      size: 0.6,
      distance: 13.8,
      speed: 0.03,
      color: "#60a5fa",
      textureType: "station"
    }
  }
};

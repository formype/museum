export interface SpaceTopic {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  emoji: string;
  coverImage?: string;
  youtubeUrl?: string; // Link video YouTube khám phá
  summary: string;
  keyFacts: {
    label: string;
    value: string;
    icon?: string;
  }[];
  explanation: string[]; // Các đoạn giải thích trực quan, dễ hiểu cho học sinh
  funFacts: string[]; // Góc bí mật thú vị / "Em có biết?"
  quizQuestions?: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  }[];
}

export interface SpaceRoom {
  id: string;
  title: string;
  code: string; // "Phòng 1", "Phòng 2", "Phòng 3"
  subtitle: string;
  description: string;
  badge: string;
  themeColor: string; // hex or tailwind tone
  bannerImage?: string;
  topics: SpaceTopic[];
}

export const DEFAULT_SPACE_ROOMS: SpaceRoom[] = [
  {
    id: "room-1",
    code: "Phòng 1",
    title: "Lịch Sử Khám Phá Không Gian",
    subtitle: "Hành trình con người rời khỏi Trái Đất vươn tới các vì sao",
    description:
      "Nơi các em học sinh được chứng kiến những cột mốc vĩ đại nhất: từ chuyến bay đầu tiên của Yuri Gagarin, trạm không gian ISS bay lơ lửng trên đầu chúng ta, dấu chân lịch sử trên Mặt Trăng đến các siêu robot tự hành trên Sao Hỏa.",
    badge: "Khai Phá Không Gian",
    themeColor: "#0ea5e9", // Sky blue
    bannerImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    topics: [
      {
        id: "flights",
        title: "Các Chuyến Bay Vào Vũ Trụ Lịch Sử",
        subtitle: "Bước đột phá đầu tiên thoát khỏi lực hút Trái Đất",
        badge: "Cột Mốc Vĩ Đại",
        emoji: "🚀",
        coverImage: "https://images.unsplash.com/photo-1517976487504-59a1a04c2efd?auto=format&fit=crop&w=1000&q=80",
        youtubeUrl: "https://www.youtube.com/watch?v=FztR1y3_iP8",
        summary:
          "Vào ngày 12 tháng 4 năm 1961, phi hành gia Yuri Gagarin đã bay vào quỹ đạo Trái Đất trên con tàu Vostok 1, mở ra kỷ nguyên thám hiểm không gian của nhân loại.",
        keyFacts: [
          { label: "Người đầu tiên", value: "Yuri Gagarin (1961)", icon: "🧑‍🚀" },
          { label: "Tốc độ bay thoát", value: "11.2 km/giây (~40.000 km/h)", icon: "⚡" },
          { label: "Chuyến bay dài nhất", value: "437 ngày liên tục ngoài vũ trụ", icon: "⏱️" },
        ],
        explanation: [
          "Để một phi thuyền có thể bay ra ngoài không gian, nó cần tên lửa đẩy tạo ra một lực cực kỳ mạnh mẽ để thắng lực hấp dẫn của Trái Đất. Tốc độ này được gọi là Vận tốc vũ trụ cấp 1 (~7.9 km/s) để bay quanh Trái Đất.",
          "Sau chuyến bay của Gagarin, loài người đã liên tục phóng tàu thăm dò, mang theo cả vệ tinh viễn thông (giúp chúng ta gọi điện, xem TV, lướt web mỗi ngày) và kính thiên văn hiện đại.",
        ],
        funFacts: [
          "Ở ngoài vũ trụ không có không khí và không có trọng lực, các phi hành gia cao thêm 2-5 cm vì cột sống được thư giãn!",
          "Nước tiểu của các nhà du hành trên tàu vũ trụ được lọc sạch tinh khiết 100% để tái chế thành nước uống hàng ngày.",
        ],
        quizQuestions: [
          {
            question: "Ai là con người đầu tiên bay vào không gian ngoài Trái Đất?",
            options: ["Neil Armstrong", "Yuri Gagarin", "Albert Einstein", "Isaac Newton"],
            answerIndex: 1,
            explanation: "Yuri Gagarin (Liên Xô) bay vào không gian ngày 12/4/1961 trên con tàu Vostok 1.",
          },
        ],
      },
      {
        id: "iss",
        title: "Trạm Vũ Trụ Quốc Tế ISS",
        subtitle: "Ngôi nhà bay chung của các nhà khoa học toàn cầu",
        badge: "Phòng Lab Quỹ Đạo",
        emoji: "🛰️",
        coverImage: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1000&q=80",
        youtubeUrl: "https://www.youtube.com/watch?v=SOCX5VxHUE4",
        summary:
          "Trạm ISS có kích thước to bằng một sân bóng đá, bay quanh Trái Đất ở độ cao ~400 km với vận tốc chóng mặt 28.000 km/h.",
        keyFacts: [
          { label: "Độ cao bay", value: "~400 km trên đầu chúng ta", icon: "📏" },
          { label: "Vận tốc", value: "27.600 km/h (90 phút/vòng)", icon: "🌀" },
          { label: "Bình minh / ngày", value: "16 lần ngắm mặt trời mọc mỗi ngày", icon: "🌅" },
        ],
        explanation: [
          "Trạm ISS là công trình đắt giá nhất mà nhân loại từng xây dựng (hơn 150 tỷ USD), được kết hợp bởi Mỹ, Nga, Châu Âu, Nhật Bản và Canada.",
          "Đây là một phòng thí nghiệm không trọng lực, nơi các nhà khoa học thử nghiệm trồng rau diếp, nghiên cứu thuốc chữa bệnh, và học cách cơ thể con người thích nghi khi sống ngoài không gian.",
        ],
        funFacts: [
          "Bởi vì ISS bay một vòng Trái Đất chỉ mất 90 phút, các nhà du hành được ngắm bình minh và hoàng hôn 16 lần mỗi ngày!",
          "Vào ban đêm ở Việt Nam, nếu trời trong, các em có thể dùng mắt thường nhìn thấy trạm ISS sáng lấp lánh như một ngôi sao di chuyển rất nhanh.",
        ],
      },
      {
        id: "mars-rovers",
        title: "Tàu Thăm Dò & Robot Khám Phá Sao Hỏa",
        subtitle: "Những 'thám tử cơ khí' tìm kiếm dấu vết sự sống tại Hành Tinh Đỏ",
        badge: "Chiến Binh Robot",
        emoji: "🤖",
        coverImage: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1000&q=80",
        youtubeUrl: "https://www.youtube.com/watch?v=4czjS9h4Fpg",
        summary:
          "Sao Hỏa là hành tinh giống Trái Đất nhất trong Hệ Mặt Trời. Các siêu robot như Curiosity và Perseverance đang khoan đá và tìm kiếm dấu tích của nước và vi sinh vật cổ đại.",
        keyFacts: [
          { label: "Thời gian bay tới", value: "Khoảng 7 đến 9 tháng", icon: "🚀" },
          { label: "Robot nổi tiếng", value: "Curiosity, Perseverance & trực thăng Ingenuity", icon: "🚁" },
          { label: "Nhiệt độ trung bình", value: "-60°C (rất lạnh)", icon: "❄️" },
        ],
        explanation: [
          "Sao Hỏa có màu đỏ rực vì bề mặt của nó chứa rất nhiều oxit sắt (bột rỉ sét). Dù hiện nay là hoang mạc khô cằn, các nhà khoa học đã tìm thấy các lòng sông khô cạn, chứng tỏ hàng tỷ năm trước Sao Hỏa từng có hồ nước trong xanh.",
          "Robot Perseverance còn mang theo máy tạo oxy MOXIE - cỗ máy biến đổi khí CO2 độc hại trên Sao Hỏa thành khí Oxy tinh khiết để chuẩn bị cho con người đặt chân lên trong tương lai.",
        ],
        funFacts: [
          "Chiếc trực thăng tí hon Ingenuity đã lập kỷ lục bay hơn 70 lần trong bầu khí quyển cực mỏng của Sao Hỏa!",
          "Hoàng hôn trên Sao Hỏa có màu xanh lam huyền ảo, ngược lại hoàn toàn với hoàng hôn đỏ rực trên Trái Đất.",
        ],
      },
      {
        id: "moon-landing",
        title: "Những Bước Chân Đầu Tiên Trên Mặt Trăng",
        subtitle: "'Một bước đi nhỏ của con người, một bước tiến vĩ đại của nhân loại'",
        badge: "Kỳ Tích Apollo 11",
        emoji: "🌕",
        coverImage: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1000&q=80",
        youtubeUrl: "https://www.youtube.com/watch?v=cwZb2mqId0A",
        summary:
          "Ngày 20 tháng 7 năm 1969, Neil Armstrong và Buzz Aldrin đã hạ cánh tàu Apollo 11 xuống Mặt Trăng, đánh dấu lần đầu tiên con người chạm chân vào một thiên thể khác.",
        keyFacts: [
          { label: "Ngày lịch sử", value: "20/07/1969 (Apollo 11)", icon: "📅" },
          { label: "Trọng lực Mặt Trăng", value: "Chỉ bằng 1/6 Trái Đất (nhảy siêu cao)", icon: "🦘" },
          { label: "Dấu chân tồn tại", value: "Hàng triệu năm không bị xóa nhòa", icon: "👣" },
        ],
        explanation: [
          "Mặt Trăng không có khí quyển bảo vệ, do đó không có gió, không có mưa bão để xóa mờ dấu vết. Dấu chân của Neil Armstrong để lại từ năm 1969 vẫn còn nguyên vẹn cho đến tận ngày hôm nay.",
          "Các nhà du hành đã mang về Trái Đất gần 400 kg đá Mặt Trăng để phân tích, giúp chúng ta hiểu rõ nguồn gốc Mặt Trăng hình thành do một vụ va chạm khổng lồ từ thời sơ khai của Trái Đất.",
        ],
        funFacts: [
          "Nếu bạn nặng 60 kg trên Trái Đất, khi lên Mặt Trăng bạn chỉ nặng đúng 10 kg và có thể nhảy cao gấp 6 lần bình thường!",
          "Mặt Trăng chỉ luôn hướng một mặt duy nhất về phía Trái Đất, mặt bên kia được gọi là 'mặt tối của Mặt Trăng'.",
        ],
      },
    ],
  },
  {
    id: "room-2",
    code: "Phòng 2",
    title: "Những Bí Ẩn Chưa Có Lời Giải",
    subtitle: "Khám phá các hiện tượng kỳ lạ và thách thức lớn nhất của vật lý hiện đại",
    description:
      "Vũ trụ bao la chứa đựng những quái vật hố đen nuốt trọn cả ánh sáng, các ngôi sao neutron nặng hàng tỷ tấn chỉ bằng một thìa cà phê, và bí ẩn lớn nhất mọi thời đại: Liệu chúng ta có đơn độc trong vũ trụ?",
    badge: "Bí Ẩn Vũ Trụ",
    themeColor: "#8b5cf6", // Purple violet
    bannerImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
    topics: [
      {
        id: "black-holes",
        title: "Hố Đen (Black Holes)",
        subtitle: "'Quái vật lực hấp dẫn' nuốt trọn mọi vật chất và cả ánh sáng",
        badge: "Lực Hút Vô Tận",
        emoji: "🕳️",
        coverImage: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1000&q=80",
        youtubeUrl: "https://www.youtube.com/watch?v=e-P5IFTqB98",
        summary:
          "Hố đen là một vùng không gian có lực hấp dẫn cực kỳ mãnh liệt đến mức không một vật chất nào, kể cả ánh sáng (thứ nhanh nhất vũ trụ), có thể thoát ra được một khi đã lọt vào ranh giới 'chân trời sự kiện'.",
        keyFacts: [
          { label: "Tốc độ ánh sáng", value: "300.000 km/s (vẫn bị hút chặt)", icon: "💡" },
          { label: "Hố đen trung tâm", value: "Sagittarius A* (ngay tim Ngân Hà)", icon: "🎯" },
          { label: "Hiệu ứng kỳ lạ", value: "Thời gian bị làm chậm lại đến gần như dừng hẳn", icon: "⏳" },
        ],
        explanation: [
          "Hố đen sinh ra khi một ngôi sao khổng lồ (lớn hơn Mặt Trời nhiều lần) chết đi và tự sụp đổ vào chính tâm của nó dưới sức nặng hấp dẫn khủng khiếp.",
          "Nếu bạn tiến lại gần một hố đen, thời gian của bạn sẽ trôi chậm hơn rất nhiều so với người ở Trái Đất (như trong bộ phim Interstellar). Khi bị rơi vào, cơ thể sẽ bị kéo dãn dài ra như một sợi mì Ý - hiện tượng khoa học gọi là 'Mì ống hóa' (Spaghettification)!",
        ],
        funFacts: [
          "Nếu Trái Đất bị nén lại thành một hố đen, nó sẽ chỉ nhỏ bằng một viên bi ve trong lòng bàn tay bạn nhưng nặng nguyên vẹn cả hành tinh!",
          "Năm 2019, kính thiên văn EHT đã lần đầu tiên chụp được bức ảnh lịch sử về một chiếc hố đen thực sự ở thiên hà M87.",
        ],
      },
      {
        id: "dark-matter-energy",
        title: "Vật Chất Tối & Năng Lượng Tối",
        subtitle: "95% vũ trụ là những thứ vô hình mà loài người chưa thể nhìn thấy",
        badge: "Bí Ẩn Lớn Nhất",
        emoji: "🌌",
        coverImage: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1000&q=80",
        youtubeUrl: "https://www.youtube.com/watch?v=QAa2O_8wBUQ",
        summary:
          "Tất cả các ngôi sao, hành tinh, Trái Đất và cơ thể chúng ta gộp lại chỉ chiếm đúng 5% vũ trụ. 95% còn lại là Vật chất tối (27%) và Năng lượng tối (68%) hoàn toàn vô hình!",
        keyFacts: [
          { label: "Vật chất thông thường", value: "Chỉ chiếm ~5% vũ trụ", icon: "✨" },
          { label: "Vật chất tối (Dark Matter)", value: "~27% giữ các thiên hà không bị văng ra", icon: "🕸️" },
          { label: "Năng lượng tối (Dark Energy)", value: "~68% xé toạc và đẩy vũ trụ nở rộng ra", icon: "💥" },
        ],
        explanation: [
          "Tại sao các thiên hà quay rất nhanh mà các ngôi sao không bị bắn văng ra ngoài? Các nhà thiên văn học phát hiện có một loại 'chất keo vô hình' có lực hấp dẫn giữ chúng lại, đó chính là Vật chất tối.",
          "Còn Năng lượng tối thì hoạt động như một phản lực hấp dẫn, đẩy các thiên hà bay xa nhau ra với tốc độ ngày càng nhanh hơn. Cho đến nay, chưa một máy móc nào 'bắt' được một hạt vật chất tối.",
        ],
        funFacts: [
          "Hàng tỷ hạt vật chất tối đang bay xuyên qua cơ thể bạn ngay lúc này mà bạn không hề cảm thấy gì cả!",
          "Ai giải mã được bản chất thực sự của Vật chất tối và Năng lượng tối chắc chắn sẽ nhận được giải thưởng Nobel Vật lý.",
        ],
      },
      {
        id: "neutron-stars",
        title: "Sao Neutron (Neutron Stars & Pulsar)",
        subtitle: "Những 'con quay vũ trụ' đặc quánh nhất và từ trường mạnh nhất",
        badge: "Vật Thể Siêu Đậm Đặc",
        emoji: "⚛️",
        coverImage: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=1000&q=80",
        youtubeUrl: "https://www.youtube.com/watch?v=udFxKZRyXt4",
        summary:
          "Sau khi một ngôi sao phát nổ Siêu tân tinh (Supernova), lõi của nó bị ép lại chặt đến mức các nguyên tử bị đè nát, tạo thành sao neutron có đường kính chỉ bằng một thành phố nhỏ (~20 km).",
        keyFacts: [
          { label: "Kích thước", value: "Đường kính chỉ khoảng 20 km", icon: "🏙️" },
          { label: "Khối lượng", value: "Nặng gấp 1.4 đến 2.1 lần Mặt Trời", icon: "⚖️" },
          { label: "Tốc độ quay", value: "Quay tới 700 vòng mỗi giây!", icon: "💫" },
        ],
        explanation: [
          "Mật độ của sao neutron khủng khiếp đến mức không thể tưởng tượng: một thìa cà phê vật chất sao neutron sẽ nặng tương đương với cả ngọn núi Everest (khoảng 1 tỷ tấn)!",
          "Một số sao neutron quay cực nhanh và phát ra các chùm bức xạ vô tuyến quét qua không gian như ngọn hải đăng - được gọi là ẩn tinh (Pulsar). Khi lần đầu bắt được tín hiệu này, các nhà khoa học từng tưởng nhầm là sóng phát thanh của người ngoài hành tinh.",
        ],
        funFacts: [
          "Nếu bạn vô tình đứng trên một ngôi sao neutron, trọng lực mạnh đến mức sẽ ép bẹp bạn thành một lớp mỏng chỉ vài nguyên tử!",
          "Hai ngôi sao neutron va chạm vào nhau sẽ tạo ra hầu hết số Vàng và Bạch kim có trong vũ trụ và cả trong chiếc nhẫn vàng trên Trái Đất.",
        ],
      },
      {
        id: "meteors",
        title: "Thiên Thạch & Mưa Sao Băng",
        subtitle: "Những màn trình diễn pháo hoa tự nhiên rực rỡ trên bầu trời đêm",
        badge: "Bụi Vũ Trụ Rực Rỡ",
        emoji: "☄️",
        coverImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
        youtubeUrl: "https://www.youtube.com/watch?v=kYJjZg1H23Y",
        summary:
          "Sao băng thực chất không phải là một ngôi sao rơi xuống! Đó chỉ là những mẩu đá bụi vũ trụ nhỏ bằng hạt cát lao vào bầu khí quyển Trái Đất với tốc độ cực nhanh và ma sát bốc cháy tạo thành vệt sáng rực rỡ.",
        keyFacts: [
          { label: "Kích thước sao băng", value: "Thường chỉ nhỏ bằng hạt đậu hoặc hạt cát", icon: "🫘" },
          { label: "Tốc độ lao vào khí quyển", value: "Từ 11 đến 72 km/giây (~200.000 km/h)", icon: "🔥" },
          { label: "Mưa sao băng nổi tiếng", value: "Perseids (tháng 8), Geminids (tháng 12)", icon: "✨" },
        ],
        explanation: [
          "Khi sao chổi bay quanh Mặt Trời, nó để lại một vệt bụi đá kéo dài hàng triệu km. Mỗi năm khi Trái Đất bay xuyên qua đám bụi này, hàng ngàn mảnh đá nhỏ bốc cháy cùng lúc tạo nên trận 'Mưa sao băng' tuyệt đẹp.",
          "Nếu một khối thiên thạch đủ to không bị cháy hết và rơi xuống mặt đất, nó được gọi là 'Viên thiên thạch' (Meteorite). Một tảng thiên thạch khổng lồ rộng 10 km đâm vào Trái Đất 66 triệu năm trước đã khiến loài khủng long bị tuyệt chủng.",
        ],
        funFacts: [
          "Mỗi ngày có khoảng 100 tấn bụi thiên thạch rơi xuống Trái Đất nhưng hầu hết chúng ta không nhận ra!",
          "Ước nguyện khi thấy sao băng là một phong tục dân gian dễ thương, bắt nguồn từ niềm tin rằng bầu trời mở ra và các vị thần đang lắng nghe.",
        ],
      },
      {
        id: "alien-life",
        title: "Sự Sống Ngoài Trái Đất & Các Hành Tinh Tiềm Năng",
        subtitle: "Liệu có nền văn minh nào đang nhìn về phía Trái Đất chúng ta?",
        badge: "Câu Hỏi Triệu Đô",
        emoji: "👽",
        coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80",
        youtubeUrl: "https://www.youtube.com/watch?v=sNhhvQGsMEc",
        summary:
          "Trong vũ trụ có hơn 2.000 tỷ thiên hà, mỗi thiên hà có hàng trăm tỷ ngôi sao. Các nhà khoa học đã tìm thấy hơn 5.500 ngoại hành tinh (Exoplanets) và một số rất giống Trái Đất có nước ngọt và khí quyển.",
        keyFacts: [
          { label: "Số ngoại hành tinh đã biết", value: "Hơn 5.500 hành tinh ngoài Hệ Mặt Trời", icon: "🪐" },
          { label: "Vùng Goldilocks", value: "Khoảng cách hoàn hảo không quá nóng, không quá lạnh", icon: "🍲" },
          { label: "Nơi nghi có sự sống gần nhất", value: "Mặt trăng Europa (sao Mộc) & Enceladus (sao Thổ)", icon: "🧊" },
        ],
        explanation: [
          "Để có sự sống phát triển, một hành tinh cần nước ở thể lỏng, khí quyển bảo vệ và một nguồn năng lượng (như ánh sáng mặt trời). Vùng này được gọi là 'Vùng Goldilocks' (Vùng ở được).",
          "Kính viễn vọng không gian James Webb đang phân tích bầu khí quyển của các ngoại hành tinh như hệ TRAPPIST-1 để tìm kiếm các dấu hiệu sinh học (như khí Methane, Oxy hay Di-methyl Sulfide do sinh vật sống thải ra).",
        ],
        funFacts: [
          "Mặt trăng Europa của Sao Mộc có một đại dương nước ngầm ấm áp khổng lồ dưới lớp băng dày, chứa lượng nước nhiều gấp đôi toàn bộ đại dương Trái Đất cộng lại!",
          "Nghịch lý Fermi đặt câu hỏi: 'Nếu vũ trụ rộng lớn và cổ xưa như vậy, thì người ngoài hành tinh đang ở đâu?'",
        ],
      },
    ],
  },
  {
    id: "room-3",
    code: "Phòng 3",
    title: "Thế Giới Các Vì Sao Và Thiên Hà",
    subtitle: "Bản giao hưởng ánh sáng và vòng đời bất tận của các 'lò luyện nguyên tử' vũ trụ",
    description:
      "Tất cả nguyên tử sắt trong máu của em, canxi trong xương hay oxy em đang thở đều được nấu chín từ trong lòng các ngôi sao cổ xưa. Hãy cùng giải mã vòng đời của các vì sao và chiêm ngưỡng Dải Ngân Hà lộng lẫy.",
    badge: "Vũ Điệu Thiên Hà",
    themeColor: "#f59e0b", // Amber gold
    bannerImage: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
    topics: [
      {
        id: "star-types",
        title: "Các Loại Sao Trong Vũ Trụ",
        subtitle: "Từ những ngôi sao lùn đỏ nhỏ bé đến siêu khổng lồ xanh rực lửa",
        badge: "Đa Dạng Vì Sao",
        emoji: "⭐",
        coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
        youtubeUrl: "https://www.youtube.com/watch?v=HEheh1BH34Q",
        summary:
          "Các ngôi sao có màu sắc khác nhau phụ thuộc vào nhiệt độ bề mặt của chúng: sao màu đỏ là mát nhất (~3.000°C), sao vàng như Mặt Trời (~5.500°C), và sao màu xanh lam là nóng nhất (hơn 25.000°C).",
        keyFacts: [
          { label: "Mặt Trời của chúng ta", value: "Thuộc loại Sao lùn vàng (Yellow Dwarf)", icon: "☀️" },
          { label: "Sao lùn đỏ (Red Dwarf)", value: "Chiếm tới 75% tổng số sao trong vũ trụ", icon: "🔴" },
          { label: "Sao siêu khổng lồ (UY Scuti)", value: "To gấp 1.700 lần Mặt Trời!", icon: "👑" },
        ],
        explanation: [
          "Màu sắc của sao tiết lộ bí mật nhiệt độ: Giống như ngọn lửa trên bếp ga, phần lửa xanh nóng hơn phần lửa vàng và đỏ. Sao xanh lam cháy rất mãnh liệt nhưng sống rất ngắn.",
          "Những ngôi sao lùn đỏ nhỏ bé lại cháy rất tiết kiệm nhiên liệu, chúng có thể sống hàng nghìn tỷ năm - lâu hơn cả tuổi thọ hiện tại của toàn vũ trụ!",
        ],
        funFacts: [
          "Nếu đặt ngôi sao Stephenson 2-18 vào vị trí của Mặt Trời, nó sẽ nuốt chửng Sao Thủy, Sao Kim, Trái Đất, Sao Hỏa và chạm tới tận quỹ đạo của Sao Thổ!",
          "Mỗi giây, Mặt Trời đốt cháy khoảng 600 triệu tấn khí Hydro để phát ra ánh sáng sưởi ấm cho muôn loài trên Trái Đất.",
        ],
      },
      {
        id: "star-lifecycle",
        title: "Sự Hình Thành & Vòng Đời Của Một Ngôi Sao",
        subtitle: "Sinh ra từ bụi khí tinh vân, tỏa sáng hàng tỷ năm và kết thúc huy hoàng",
        badge: "Vòng Đời Bất Tận",
        emoji: "✨",
        coverImage: "https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?auto=format&fit=crop&w=1000&q=80",
        youtubeUrl: "https://www.youtube.com/watch?v=PM9CQDlQI0A",
        summary:
          "Các ngôi sao sinh ra trong những đám mây bụi khí khổng lồ gọi là Tinh vân (Nebula). Khi hết nhiên liệu Hydro, sao sẽ phình to thành sao khổng lồ đỏ, sau đó phát nổ Siêu tân tinh để gieo rắc nguyên tố nuôi dưỡng các thế hệ hành tinh tiếp theo.",
        keyFacts: [
          { label: "Cái nôi sinh sao", value: "Tinh vân Orion, Đại bàng (Cột trụ sáng tạo)", icon: "☁️" },
          { label: "Tuổi thọ Mặt Trời", value: "Khoảng 10 tỷ năm (hiện đã 4.6 tỷ năm tuổi)", icon: "⏳" },
          { label: "Cái chết rực rỡ", value: "Vụ nổ Siêu tân tinh (Supernova)", icon: "💥" },
        ],
        explanation: [
          "Trong hàng triệu năm, lực hấp dẫn kéo các phân tử khí Hydro trong tinh vân lại gần nhau, nén chúng nóng lên hàng triệu độ cho đến khi phản ứng nhiệt hạch bùng cháy - một ngôi sao sơ sinh ra đời!",
          "Khi một ngôi sao lớn nổ tung (Supernova), ánh sáng của một vụ nổ có thể sáng bằng cả trăm tỷ ngôi sao của toàn thiên hà cộng lại và tạo ra các nguyên tố nặng như Vàng, Bạc, Sắt.",
        ],
        funFacts: [
          "Nhà khoa học Carl Sagan từng nói một câu bất hủ: 'Chúng ta được tạo nên từ vật liệu của các vì sao' - nguyên tố canxi trong răng và sắt trong máu của bạn từng nằm trong tim của một ngôi sao phát nổ!",
          "Sau khoảng 5 tỷ năm nữa, Mặt Trời sẽ nở to thành Sao khổng lồ đỏ và đẩy lớp vỏ ngoài để lại một lõi nhỏ gọi là Sao lùn trắng.",
        ],
      },
      {
        id: "constellations",
        title: "Chòm Sao & Bản Đồ Bầu Trời",
        subtitle: "Học cách đọc bầu trời và định hướng như những nhà hàng hải cổ đại",
        badge: "Bản Đồ Ngàn Sao",
        emoji: "🗺️",
        coverImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80",
        youtubeUrl: "https://www.youtube.com/watch?v=1sZ15SUeS9w",
        summary:
          "Từ hàng ngàn năm trước, con người đã nối các ngôi sao sáng lại thành hình thù tưởng tượng như thợ săn, gấu lớn, sư tử. Hiệp hội Thiên văn Quốc tế (IAU) chính thức công nhận 88 chòm sao trên bầu trời.",
        keyFacts: [
          { label: "Số lượng chòm sao", value: "Chính xác 88 chòm sao bao phủ bầu trời", icon: "🔢" },
          { label: "Sao Bắc Đẩu (Polaris)", value: "Chỉ thẳng về hướng Bắc địa lý, không bao giờ di chuyển", icon: "🧭" },
          { label: "Chòm sao thợ săn Orion", value: "Dễ nhận biết nhất với 3 ngôi sao thắt lưng thẳng hàng", icon: "🏹" },
        ],
        explanation: [
          "Bằng cách tìm chòm sao Đại Hùng (Gấu Lớn) có hình chiếc gáo múc nước, các em có thể dễ dàng tìm ra Sao Bắc Cực (Polaris) để tìm hướng Bắc mà không cần la bàn điện thoại.",
          "Mặc dù nhìn từ Trái Đất các ngôi sao trong một chòm trông như nằm cạnh nhau, nhưng trên thực tế chúng cách nhau hàng trăm năm ánh sáng theo chiều sâu vũ trụ.",
        ],
        funFacts: [
          "Do Trái Đất quay quanh trục của nó, bầu trời sao dường như quay chậm quanh Sao Bắc Cực suốt cả đêm.",
          "12 chòm sao Hoàng Đạo (Bạch Dương, Kim Ngưu, Song Tử...) chính là các chòm sao nằm trên đường đi biểu kiến của Mặt Trời trong một năm.",
        ],
      },
      {
        id: "milky-way",
        title: "Dải Ngân Hà (Milky Way)",
        subtitle: "Dòng sông sao lấp lánh - Ngôi nhà khổng lồ chứa Hệ Mặt Trời",
        badge: "Ngôi Nhà Thiên Hà",
        emoji: "🌌",
        coverImage: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1000&q=80",
        youtubeUrl: "https://www.youtube.com/watch?v=7uiv6tKtoKg",
        summary:
          "Dải Ngân Hà là một thiên hà xoắn ốc khổng lồ chứa từ 100 đến 400 tỷ ngôi sao. Hệ Mặt Trời của chúng ta chỉ là một hạt bụi nhỏ nằm trên cánh tay xoắn ốc Orion của Ngân Hà.",
        keyFacts: [
          { label: "Đường kính Ngân Hà", value: "Khoảng 100.000 năm ánh sáng", icon: "📏" },
          { label: "Số lượng ngôi sao", value: "Hơn 100.000.000.000 (100 tỷ) ngôi sao", icon: "✨" },
          { label: "Vận tốc bay của Hệ Mặt Trời", value: "828.000 km/h quanh tâm Ngân Hà", icon: "🌪️" },
        ],
        explanation: [
          "Một tia sáng di chuyển với vận tốc 300.000 km/giây cũng phải mất 100.000 năm mới bay hết từ đầu này sang đầu kia của Dải Ngân Hà!",
          "Ở chính giữa tâm Dải Ngân Hà là một hố đen siêu nặng khổng lồ có tên là Sagittarius A*, nặng gấp 4 triệu lần Mặt Trời của chúng ta.",
        ],
        funFacts: [
          "Dải Ngân Hà đang lao về phía thiên hà Tiên Nữ (Andromeda) với tốc độ 110 km/s. Sau khoảng 4.5 tỷ năm nữa, hai thiên hà khổng lồ này sẽ sáp nhập lại thành một thiên hà mới!",
          "Vào những đêm hè không trăng ở vùng quê hoặc bờ biển không bị ô nhiễm ánh sáng đèn điện, em có thể nhìn thấy Ngân Hà như một dải sữa bạc vắt ngang qua bầu trời.",
        ],
      },
    ],
  },
];

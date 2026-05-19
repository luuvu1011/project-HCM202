import type { GameQuestion } from '@/types/game';
import { GAME_PHASES } from './gamePhases';

export const GAME_QUESTIONS: GameQuestion[] = [
  // ── BẾN NHÀ RỒNG ──────────────────────────────────────────────────────────
  {
    id: 'bnr-1',
    phaseId: 'ben_nha_rong',
    type: 'multiple_choice',
    text: 'Nguyễn Tất Thành rời Việt Nam trên con tàu nào vào ngày 5 tháng 6 năm 1911?',
    options: [
      { id: 'a', text: 'Amiral Latouche-Tréville', isCorrect: true,  explanation: 'Đúng! Đây là chiếc tàu hơi nước của Pháp anh làm phụ bếp để được đi cùng.' },
      { id: 'b', text: 'La Marseillaise',          isCorrect: false, explanation: 'La Marseillaise là tên quốc ca Pháp, không phải tàu biển.' },
      { id: 'c', text: 'Orient Express',            isCorrect: false, explanation: 'Orient Express là tàu hỏa nổi tiếng ở châu Âu.' },
      { id: 'd', text: 'Tonkin Star',               isCorrect: false, explanation: 'Tên tàu này không liên quan đến chuyến đi lịch sử.' },
    ],
    timeLimit: 20,
    points: 100,
  },
  {
    id: 'bnr-2',
    phaseId: 'ben_nha_rong',
    type: 'multiple_choice',
    text: 'Tên bí danh mà Nguyễn Tất Thành dùng khi lên tàu rời Việt Nam là gì?',
    options: [
      { id: 'a', text: 'Lý Thụy',      isCorrect: false, explanation: 'Lý Thụy là tên anh dùng khi ở Quảng Châu.' },
      { id: 'b', text: 'Nguyễn Ái Quốc', isCorrect: false, explanation: 'Nguyễn Ái Quốc là tên anh dùng ở Paris.' },
      { id: 'c', text: 'Văn Ba',        isCorrect: true,  explanation: 'Đúng! Văn Ba là tên anh khai khi xin việc làm trên tàu.' },
      { id: 'd', text: 'Hồ Chí Minh',  isCorrect: false, explanation: 'Hồ Chí Minh là tên anh dùng từ năm 1942 trở đi.' },
    ],
    timeLimit: 20,
    points: 100,
    hint: 'Đây là tên dùng để xin làm việc trên tàu hơi nước.',
  },
  {
    id: 'bnr-3',
    phaseId: 'ben_nha_rong',
    type: 'ideology_choice',
    text: 'Năm 1911, Nguyễn Tất Thành ra đi với mục tiêu gì?',
    subtitle: 'Đặt mình vào vị trí người thanh niên 21 tuổi đó — điều gì thôi thúc anh?',
    options: [
      { id: 'a', text: 'Tìm kiếm cuộc sống tốt hơn cho bản thân ở châu Âu', isCorrect: false, explanation: 'Nếu chỉ vì lợi ích cá nhân, anh đã không trở về sau 30 năm.' },
      { id: 'b', text: 'Học hỏi văn minh phương Tây để tìm con đường cứu nước', isCorrect: true,  explanation: 'Đúng! Anh tự nói: "Tôi muốn ra nước ngoài xem nước Pháp và các nước khác họ làm như thế nào rồi về giúp đồng bào ta."' },
      { id: 'c', text: 'Theo học tại các trường đại học danh tiếng ở Pháp', isCorrect: false, explanation: 'Anh không có tiền để học đại học — anh phải tự học mọi thứ trong khi làm thuê.' },
      { id: 'd', text: 'Tham gia vào các tổ chức chính trị châu Âu ngay từ đầu', isCorrect: false, explanation: 'Lúc đầu anh chưa có tư tưởng chính trị rõ ràng, chỉ có lòng yêu nước cháy bỏng.' },
    ],
    timeLimit: 25,
    points: 150,
  },
  {
    id: 'bnr-4',
    phaseId: 'ben_nha_rong',
    type: 'multiple_choice',
    text: 'Tên khai sinh của Chủ tịch Hồ Chí Minh là gì?',
    options: [
      { id: 'a', text: 'Nguyễn Tất Thành',  isCorrect: false, explanation: 'Nguyễn Tất Thành là tên thời niên thiếu, đặt khi đi học.' },
      { id: 'b', text: 'Nguyễn Sinh Cung',  isCorrect: true,  explanation: 'Đúng! Tên khai sinh là Nguyễn Sinh Cung, sinh ngày 19/5/1890 tại làng Hoàng Trù, Nghệ An.' },
      { id: 'c', text: 'Nguyễn Ái Quốc',    isCorrect: false, explanation: 'Nguyễn Ái Quốc là tên dùng từ năm 1919 ở Paris.' },
      { id: 'd', text: 'Nguyễn Sinh Sắc',   isCorrect: false, explanation: 'Nguyễn Sinh Sắc là tên cha của Người — một nhà nho học, đỗ Phó bảng.' },
    ],
    timeLimit: 18,
    points: 100,
  },
  {
    id: 'bnr-5',
    phaseId: 'ben_nha_rong',
    type: 'multiple_choice',
    text: 'Nguyễn Tất Thành sinh ra tại làng nào, tỉnh nào?',
    options: [
      { id: 'a', text: 'Làng Sen, Nghệ An',     isCorrect: false, explanation: 'Làng Sen (Kim Liên) là quê nội — nơi Người sống thời niên thiếu, không phải nơi sinh.' },
      { id: 'b', text: 'Làng Hoàng Trù, Nghệ An', isCorrect: true,  explanation: 'Đúng! Người sinh tại làng Hoàng Trù (quê ngoại), xã Kim Liên, huyện Nam Đàn, tỉnh Nghệ An.' },
      { id: 'c', text: 'Huế, Thừa Thiên',        isCorrect: false, explanation: 'Người chỉ học tại Huế ở Trường Quốc học, không sinh ở đó.' },
      { id: 'd', text: 'Hà Tĩnh',                 isCorrect: false, explanation: 'Hà Tĩnh giáp với Nghệ An nhưng không phải quê Người.' },
    ],
    timeLimit: 20,
    points: 100,
  },
  {
    id: 'bnr-6',
    phaseId: 'ben_nha_rong',
    type: 'multiple_choice',
    text: 'Cha của Nguyễn Tất Thành là ai?',
    options: [
      { id: 'a', text: 'Nguyễn Sinh Sắc — Phó bảng, nhà nho yêu nước', isCorrect: true,  explanation: 'Đúng! Cụ Nguyễn Sinh Sắc đỗ Phó bảng năm 1901, là tấm gương yêu nước và đạo đức của Người.' },
      { id: 'b', text: 'Nguyễn Sinh Khiêm — anh trai',                 isCorrect: false, explanation: 'Nguyễn Sinh Khiêm là anh trai của Người, không phải cha.' },
      { id: 'c', text: 'Hoàng Thị Loan — mẹ',                         isCorrect: false, explanation: 'Hoàng Thị Loan là mẹ của Người, một phụ nữ Việt Nam mẫu mực.' },
      { id: 'd', text: 'Phan Bội Châu — nhà cách mạng',                isCorrect: false, explanation: 'Phan Bội Châu là bạn của cha Người, không phải cha.' },
    ],
    timeLimit: 20,
    points: 100,
  },

  // ── MARSEILLE ──────────────────────────────────────────────────────────────
  {
    id: 'mar-1',
    phaseId: 'marseille',
    type: 'multiple_choice',
    text: 'Điều gì khiến Nguyễn Tất Thành quyết định đến Pháp thay vì các nước phương Tây khác?',
    options: [
      { id: 'a', text: 'Nước Pháp có khí hậu tốt nhất cho người Việt', isCorrect: false, explanation: 'Khí hậu không phải lý do — Pháp thực ra khá lạnh so với Việt Nam.' },
      { id: 'b', text: 'Pháp là nước đang đô hộ Việt Nam nên cần hiểu kẻ thù', isCorrect: true,  explanation: 'Đúng! Anh muốn hiểu nước Pháp từ bên trong để tìm điểm yếu và con đường đấu tranh.' },
      { id: 'c', text: 'Anh có họ hàng đang sống tại Marseille',           isCorrect: false, explanation: 'Anh không có người thân ở Pháp — đi hoàn toàn một mình.' },
      { id: 'd', text: 'Vé tàu đến Pháp rẻ hơn các nước khác',            isCorrect: false, explanation: 'Anh phải làm việc để kiếm tiền đi — không phải vì giá vé.' },
    ],
    timeLimit: 22,
    points: 100,
  },
  {
    id: 'mar-2',
    phaseId: 'marseille',
    type: 'document_decode',
    text: 'Đọc trích dẫn lịch sử này và cho biết — ai đã nói câu này?',
    documentText: '"Tự do, Bình đẳng, Bác ái là những gì?\nNếu đó là sự thật, tại sao người Pháp không mang\nnhững giá trị ấy đến cho người dân An Nam?"',
    options: [
      { id: 'a', text: 'Nguyễn Tất Thành / Hồ Chí Minh', isCorrect: true,  explanation: 'Đúng! Sự mâu thuẫn này là động lực lớn trong tư tưởng của anh.' },
      { id: 'b', text: 'Phan Chu Trinh',                  isCorrect: false, explanation: 'Phan Chu Trinh là nhà cải cách, không phải người đặt câu hỏi đối đầu như vậy.' },
      { id: 'c', text: 'Jean Jaurès, nhà xã hội Pháp',    isCorrect: false, explanation: 'Jean Jaurès là nhà hoạt động người Pháp, không liên quan trực tiếp đến câu hỏi này.' },
      { id: 'd', text: 'Phan Bội Châu',                   isCorrect: false, explanation: 'Phan Bội Châu chọn con đường bạo động, không đặt vấn đề về giá trị Pháp.' },
    ],
    timeLimit: 25,
    points: 120,
  },
  {
    id: 'mar-3',
    phaseId: 'marseille',
    type: 'multiple_choice',
    text: 'Khi tàu Latouche-Tréville cập cảng Marseille, Nguyễn Tất Thành bao nhiêu tuổi?',
    options: [
      { id: 'a', text: '18 tuổi', isCorrect: false, explanation: '18 tuổi là khi anh học tại Trường Quốc học Huế.' },
      { id: 'b', text: '21 tuổi', isCorrect: true,  explanation: 'Đúng! Sinh ngày 19/5/1890, đến Marseille tháng 7/1911 — anh vừa tròn 21 tuổi.' },
      { id: 'c', text: '25 tuổi', isCorrect: false, explanation: 'Anh đến Marseille trước khi 25 tuổi, lúc 21 tuổi.' },
      { id: 'd', text: '30 tuổi', isCorrect: false, explanation: '30 tuổi là khi anh tham gia Đại hội Tours (1920) tại Pháp.' },
    ],
    timeLimit: 18,
    points: 100,
  },
  {
    id: 'mar-4',
    phaseId: 'marseille',
    type: 'multiple_choice',
    text: 'Tại Marseille tháng 9/1911, Nguyễn Tất Thành đã làm đơn xin học trường nào nhưng bị từ chối?',
    options: [
      { id: 'a', text: 'Trường Đại học Sorbonne',           isCorrect: false, explanation: 'Sorbonne là đại học danh tiếng nhưng anh không xin học ở đây.' },
      { id: 'b', text: 'Trường Thuộc địa (École Coloniale)', isCorrect: true,  explanation: 'Đúng! Anh xin học để hiểu cách Pháp đào tạo cán bộ thuộc địa — nhưng đơn bị bác bỏ.' },
      { id: 'c', text: 'Trường Lyon Sư phạm',                isCorrect: false, explanation: 'Anh không có ý định trở thành giáo viên Pháp.' },
      { id: 'd', text: 'Trường Bách khoa Paris',             isCorrect: false, explanation: 'Trường Bách khoa Paris tuyển sinh rất chọn lọc — anh không nộp đơn vào đây.' },
    ],
    timeLimit: 22,
    points: 120,
  },
  {
    id: 'mar-5',
    phaseId: 'marseille',
    type: 'ideology_choice',
    text: 'Khi đặt chân lên Marseille, Nguyễn Tất Thành nhận xét điều gì khiến anh suy nghĩ nhiều nhất?',
    options: [
      { id: 'a', text: '"Sao người Pháp ở Pháp cũng có người nghèo khổ như người Việt?"', isCorrect: true,  explanation: 'Đúng! Anh nhận ra giai cấp bị áp bức không chỉ là người thuộc địa — đó là khám phá tư tưởng quan trọng.' },
      { id: 'b', text: '"Nước Pháp giàu có và văn minh hơn Việt Nam rất nhiều."',         isCorrect: false, explanation: 'Anh không bị choáng ngợp bởi sự giàu có — anh chú ý đến sự bất công.' },
      { id: 'c', text: '"Phải nhanh chóng học tiếng Pháp để giao tiếp."',                  isCorrect: false, explanation: 'Việc học tiếng Pháp là cần thiết nhưng không phải điều khiến anh suy nghĩ về tư tưởng.' },
      { id: 'd', text: '"Người Pháp đối xử rất tốt với người An Nam."',                    isCorrect: false, explanation: 'Trải nghiệm thực tế cho thấy sự phân biệt đối xử, không phải sự tốt đẹp.' },
    ],
    timeLimit: 25,
    points: 150,
  },

  // ── LONDON ─────────────────────────────────────────────────────────────────
  {
    id: 'lon-1',
    phaseId: 'london',
    type: 'multiple_choice',
    text: 'Nguyễn Tất Thành làm việc tại nhà hàng nào ở London dưới tay bếp trưởng Auguste Escoffier?',
    options: [
      { id: 'a', text: 'The Ritz',          isCorrect: false, explanation: 'The Ritz là khách sạn ở Paris, không ở London.' },
      { id: 'b', text: 'Claridge\'s Hotel', isCorrect: false, explanation: 'Claridge\'s cũng nổi tiếng ở London nhưng không phải nơi anh làm việc.' },
      { id: 'c', text: 'Carlton Hotel',     isCorrect: true,  explanation: 'Đúng! Anh làm phụ bếp tại Carlton Hotel và được bếp trưởng Escoffier chú ý.' },
      { id: 'd', text: 'The Savoy',         isCorrect: false, explanation: 'The Savoy nổi tiếng nhưng không phải nơi anh làm.' },
    ],
    timeLimit: 20,
    points: 100,
  },
  {
    id: 'lon-2',
    phaseId: 'london',
    type: 'ideology_choice',
    text: 'Ở London, điều gì ảnh hưởng lớn nhất đến tư tưởng chính trị của Nguyễn Tất Thành?',
    options: [
      { id: 'a', text: 'Phong trào Fabian và Đảng Lao động Anh', isCorrect: true,  explanation: 'Đúng! Đây là lần đầu tiên anh tiếp xúc với tư tưởng xã hội chủ nghĩa thực tiễn.' },
      { id: 'b', text: 'Ẩm thực Anh và văn hóa quý tộc',         isCorrect: false, explanation: 'Văn hóa quý tộc ngược lại với tư tưởng bình đẳng mà anh đang hướng đến.' },
      { id: 'c', text: 'Bóng đá — môn thể thao mà anh rất yêu',  isCorrect: false, explanation: 'Không có ghi chép nào về việc anh yêu bóng đá ở London.' },
      { id: 'd', text: 'Triết học Anh của John Locke',             isCorrect: false, explanation: 'Anh có thể đọc Locke nhưng ảnh hưởng chính trị lớn nhất là từ phong trào lao động.' },
    ],
    timeLimit: 22,
    points: 120,
  },
  {
    id: 'lon-3',
    phaseId: 'london',
    type: 'multiple_choice',
    text: 'Nguyễn Tất Thành sống và làm việc tại London trong khoảng thời gian nào?',
    options: [
      { id: 'a', text: '1911–1913', isCorrect: false, explanation: 'Đây là thời kỳ anh ở Marseille và đi tàu các nước.' },
      { id: 'b', text: '1914–1917', isCorrect: true,  explanation: 'Đúng! Anh ở London khoảng 1914–1917, trùng thời kỳ Chiến tranh thế giới thứ nhất.' },
      { id: 'c', text: '1919–1923', isCorrect: false, explanation: 'Đây là thời kỳ anh hoạt động tại Paris.' },
      { id: 'd', text: '1924–1927', isCorrect: false, explanation: 'Thời kỳ này anh ở Liên Xô và Trung Quốc.' },
    ],
    timeLimit: 20,
    points: 100,
  },
  {
    id: 'lon-4',
    phaseId: 'london',
    type: 'multiple_choice',
    text: 'Tại London, Nguyễn Tất Thành đã tham gia tổ chức nào của những người lao động hải ngoại?',
    options: [
      { id: 'a', text: 'Hội Hải ngoại Lao động (Overseas Workers Association)', isCorrect: true,  explanation: 'Đúng! Anh tham gia tổ chức này — tập hợp lao động các nước thuộc địa đang sinh sống tại Anh.' },
      { id: 'b', text: 'Hiệp hội Doanh nhân Á châu',                            isCorrect: false, explanation: 'Anh không phải doanh nhân, anh là người lao động.' },
      { id: 'c', text: 'Hội Người Việt tại Anh',                                isCorrect: false, explanation: 'Số người Việt ở Anh khi đó rất ít — không có tổ chức như vậy.' },
      { id: 'd', text: 'Câu lạc bộ Tự do Luân Đôn',                             isCorrect: false, explanation: 'Không có tổ chức nào với tên này liên quan đến hoạt động của anh.' },
    ],
    timeLimit: 22,
    points: 120,
  },
  {
    id: 'lon-5',
    phaseId: 'london',
    type: 'ideology_choice',
    text: 'Phong trào đòi độc lập của nước nào đã tác động đến tư tưởng của Nguyễn Tất Thành tại London?',
    options: [
      { id: 'a', text: 'Phong trào Ireland đòi độc lập khỏi Anh',           isCorrect: true,  explanation: 'Đúng! Cuộc đấu tranh của người Ireland (Sinn Féin, khởi nghĩa Easter 1916) cho anh thấy: dân tộc bị áp bức có thể đứng lên giải phóng mình.' },
      { id: 'b', text: 'Phong trào dân quyền Mỹ',                            isCorrect: false, explanation: 'Phong trào dân quyền Mỹ phát triển mạnh hơn vào giữa thế kỷ 20.' },
      { id: 'c', text: 'Cách mạng Pháp 1789',                                isCorrect: false, explanation: 'Cách mạng Pháp đã diễn ra hơn 100 năm trước, không phải sự kiện đương đại.' },
      { id: 'd', text: 'Phong trào đòi quyền bầu cử cho phụ nữ (Suffragette)', isCorrect: false, explanation: 'Phong trào này quan trọng nhưng không phải mục tiêu nghiên cứu của anh.' },
    ],
    timeLimit: 25,
    points: 150,
  },

  // ── PARIS ──────────────────────────────────────────────────────────────────
  {
    id: 'par-1',
    phaseId: 'paris',
    type: 'multiple_choice',
    text: 'Tài liệu nào Nguyễn Ái Quốc đã gửi đến Hội nghị Versailles năm 1919?',
    options: [
      { id: 'a', text: 'Đường Kách Mệnh',                 isCorrect: false, explanation: '"Đường Kách Mệnh" được viết năm 1927 ở Quảng Châu, không phải 1919.' },
      { id: 'b', text: 'Yêu sách của nhân dân An Nam',    isCorrect: true,  explanation: 'Đúng! Văn kiện lịch sử gồm 8 điều đòi quyền bình đẳng và tự quyết cho người Việt.' },
      { id: 'c', text: 'Tuyên ngôn Độc lập Việt Nam',     isCorrect: false, explanation: 'Tuyên ngôn Độc lập được đọc ngày 2/9/1945 tại Ba Đình.' },
      { id: 'd', text: 'Lời kêu gọi toàn quốc kháng chiến', isCorrect: false, explanation: 'Lời kêu gọi này ra đời năm 1946.' },
    ],
    timeLimit: 22,
    points: 100,
  },
  {
    id: 'par-2',
    phaseId: 'paris',
    type: 'document_decode',
    text: 'Tờ báo nào Nguyễn Ái Quốc sáng lập tại Paris năm 1922 để đấu tranh cho người thuộc địa?',
    documentText: '"Tờ báo của những kẻ cùng khổ —\ntiếng nói của những người không có tiếng nói,\nngọn đuốc soi đường trong bóng tối thuộc địa."',
    options: [
      { id: 'a', text: 'Le Paria (Người Cùng Khổ)',        isCorrect: true,  explanation: 'Đúng! Le Paria — "Người Cùng Khổ" — tiếng nói của các dân tộc bị áp bức.' },
      { id: 'b', text: 'L\'Humanité',                      isCorrect: false, explanation: 'L\'Humanité là cơ quan của Đảng Cộng sản Pháp, không phải do anh sáng lập.' },
      { id: 'c', text: 'Le Monde',                         isCorrect: false, explanation: 'Le Monde là báo lớn của Pháp, ra đời năm 1944.' },
      { id: 'd', text: 'La Vérité',                        isCorrect: false, explanation: 'La Vérité là tờ báo Trotskyist Pháp.' },
    ],
    timeLimit: 20,
    points: 120,
  },
  {
    id: 'par-3',
    phaseId: 'paris',
    type: 'ideology_choice',
    text: 'Luận cương của Lenin về "vấn đề dân tộc và thuộc địa" tác động đến Nguyễn Ái Quốc như thế nào?',
    subtitle: 'Chọn câu mô tả đúng nhất cảm xúc và nhận thức của anh khi đọc văn kiện này.',
    options: [
      { id: 'a', text: 'Anh cảm thấy đây là con đường duy nhất để giải phóng Việt Nam', isCorrect: true,  explanation: 'Đúng! Anh nói: "Đây là điều tôi cần tìm, đây là con đường cứu nước."' },
      { id: 'b', text: 'Anh nghi ngờ và chỉ ủng hộ một phần lý thuyết',                isCorrect: false, explanation: 'Anh hoàn toàn bị thuyết phục — đây là bước ngoặt tư tưởng quan trọng nhất.' },
      { id: 'c', text: 'Anh thấy đây chỉ là lý thuyết, không áp dụng được ở Việt Nam', isCorrect: false, explanation: 'Ngược lại, anh lập tức thấy tính ứng dụng trực tiếp cho cuộc đấu tranh của Việt Nam.' },
      { id: 'd', text: 'Anh đọc xong và thấy cần thêm thời gian suy nghĩ',             isCorrect: false, explanation: 'Theo hồi ký, tác động là ngay lập tức và mạnh mẽ — không cần thêm thời gian.' },
    ],
    timeLimit: 25,
    points: 150,
  },
  {
    id: 'par-4',
    phaseId: 'paris',
    type: 'multiple_choice',
    text: 'Tại Đại hội Tours tháng 12/1920, Nguyễn Ái Quốc đã có hành động lịch sử nào?',
    options: [
      { id: 'a', text: 'Đọc bản tuyên ngôn độc lập của Việt Nam',                                                       isCorrect: false, explanation: 'Tuyên ngôn Độc lập được đọc ngày 2/9/1945 tại Hà Nội.' },
      { id: 'b', text: 'Bỏ phiếu tán thành Quốc tế III và trở thành đảng viên cộng sản đầu tiên của Việt Nam',  isCorrect: true,  explanation: 'Đúng! Tại Đại hội Tours, Nguyễn Ái Quốc bỏ phiếu thành lập Đảng Cộng sản Pháp và là người Việt đầu tiên trở thành đảng viên cộng sản.' },
      { id: 'c', text: 'Gặp gỡ Lenin lần đầu tiên',                                                                       isCorrect: false, explanation: 'Lenin lúc đó đang ở Liên Xô — họ chưa gặp nhau trực tiếp.' },
      { id: 'd', text: 'Thành lập Đảng Cộng sản Việt Nam',                                                                isCorrect: false, explanation: 'ĐCSVN thành lập năm 1930 tại Hong Kong, không phải Paris 1920.' },
    ],
    timeLimit: 22,
    points: 120,
  },
  {
    id: 'par-5',
    phaseId: 'paris',
    type: 'multiple_choice',
    text: 'Tên gọi "Nguyễn Ái Quốc" có ý nghĩa gì?',
    options: [
      { id: 'a', text: 'Người Nguyễn yêu nước',         isCorrect: true,  explanation: 'Đúng! "Ái Quốc" nghĩa là "yêu nước" — tên thể hiện lý tưởng và sứ mệnh của Người.' },
      { id: 'b', text: 'Người Nguyễn từ phương Bắc',    isCorrect: false, explanation: 'Tên không có nghĩa địa lý.' },
      { id: 'c', text: 'Người Nguyễn đi xa quê hương',  isCorrect: false, explanation: '"Ái Quốc" không có nghĩa là "đi xa".' },
      { id: 'd', text: 'Người Nguyễn theo đạo',         isCorrect: false, explanation: 'Tên không liên quan đến tôn giáo.' },
    ],
    timeLimit: 18,
    points: 100,
  },
  {
    id: 'par-6',
    phaseId: 'paris',
    type: 'multiple_choice',
    text: 'Bản "Yêu sách của nhân dân An Nam" gửi đến Hội nghị Versailles năm 1919 gồm bao nhiêu điểm?',
    options: [
      { id: 'a', text: '5 điểm',  isCorrect: false, explanation: 'Số điểm trong bản Yêu sách nhiều hơn 5.' },
      { id: 'b', text: '8 điểm',  isCorrect: true,  explanation: 'Đúng! Bản Yêu sách gồm 8 điểm — đòi quyền tự do, bình đẳng và quyền tự quyết cho người Việt.' },
      { id: 'c', text: '10 điểm', isCorrect: false, explanation: 'Không phải 10 — bản Yêu sách có 8 điểm.' },
      { id: 'd', text: '12 điểm', isCorrect: false, explanation: 'Quá nhiều — bản Yêu sách súc tích với 8 điểm.' },
    ],
    timeLimit: 20,
    points: 100,
  },

  // ── MOSKVA ─────────────────────────────────────────────────────────────────
  {
    id: 'mos-1',
    phaseId: 'moscow',
    type: 'multiple_choice',
    text: 'Nguyễn Ái Quốc tham dự Đại hội nào tại Liên Xô năm 1923?',
    options: [
      { id: 'a', text: 'Đại hội Quốc tế Cộng sản lần thứ 5',        isCorrect: false, explanation: 'Đại hội Comintern lần 5 diễn ra năm 1924.' },
      { id: 'b', text: 'Đại hội Quốc tế Nông dân (Krestintern)',      isCorrect: true,  explanation: 'Đúng! Anh là đại biểu tại Đại hội Quốc tế Nông dân và phát biểu về vấn đề thuộc địa.' },
      { id: 'c', text: 'Đại hội Liên đoàn Lao động Thế giới',         isCorrect: false, explanation: 'Không có đại hội nào với tên này trong lịch sử phong trào cộng sản.' },
      { id: 'd', text: 'Hội nghị Yalta đầu tiên',                     isCorrect: false, explanation: 'Yalta diễn ra năm 1945, quá muộn so với thời gian anh ở Liên Xô.' },
    ],
    timeLimit: 20,
    points: 100,
  },
  {
    id: 'mos-2',
    phaseId: 'moscow',
    type: 'ideology_choice',
    text: 'Điều gì phân biệt Chủ nghĩa Marx-Lenin với các tư tưởng xã hội chủ nghĩa khác mà Nguyễn Ái Quốc đã học?',
    options: [
      { id: 'a', text: 'Nó coi vấn đề thuộc địa và giải phóng dân tộc là một phần thiết yếu của cách mạng', isCorrect: true,  explanation: 'Đúng! Đây là điểm then chốt — Lenin đặt cuộc đấu tranh của các dân tộc thuộc địa vào trung tâm lý thuyết.' },
      { id: 'b', text: 'Nó hoàn toàn ủng hộ bạo lực cách mạng trong mọi trường hợp', isCorrect: false, explanation: 'Chủ nghĩa Marx-Lenin phức tạp hơn — không phải lúc nào cũng ủng hộ bạo lực.' },
      { id: 'c', text: 'Nó tập trung hoàn toàn vào giai cấp công nhân châu Âu', isCorrect: false, explanation: 'Ngược lại — Lenin mở rộng phân tích sang các dân tộc thuộc địa ở châu Á và châu Phi.' },
      { id: 'd', text: 'Nó đòi hỏi mỗi nước phải có đảng cộng sản riêng', isCorrect: false, explanation: 'Đây chỉ là một kết quả, không phải điểm phân biệt chính.' },
    ],
    timeLimit: 25,
    points: 150,
  },
  {
    id: 'mos-3',
    phaseId: 'moscow',
    type: 'multiple_choice',
    text: 'Nguyễn Ái Quốc theo học tại trường nào ở Liên Xô để nghiên cứu lý luận Marxist-Leninist?',
    options: [
      { id: 'a', text: 'Trường Đại học Lomonosov',                            isCorrect: false, explanation: 'Lomonosov là đại học tổng hợp, không chuyên về cách mạng.' },
      { id: 'b', text: 'Trường Đại học Cộng sản của những người Lao động Phương Đông', isCorrect: true,  explanation: 'Đúng! KUTV (Communist University of the Toilers of the East) đào tạo cán bộ cách mạng cho các nước thuộc địa Á-Phi.' },
      { id: 'c', text: 'Học viện Quân sự Frunze',                              isCorrect: false, explanation: 'Học viện này đào tạo sĩ quan quân đội, không phải lý luận cách mạng.' },
      { id: 'd', text: 'Trường Đảng Trung ương ĐCS Liên Xô',                   isCorrect: false, explanation: 'Trường này dành cho cán bộ Liên Xô, không phải đại biểu các nước thuộc địa.' },
    ],
    timeLimit: 22,
    points: 120,
  },
  {
    id: 'mos-4',
    phaseId: 'moscow',
    type: 'multiple_choice',
    text: 'Lenin — nhà cách mạng vĩ đại mà Nguyễn Ái Quốc ngưỡng mộ — qua đời vào ngày tháng năm nào?',
    options: [
      { id: 'a', text: 'Ngày 21 tháng 1 năm 1924',  isCorrect: true,  explanation: 'Đúng! Lenin mất ngày 21/1/1924. Nguyễn Ái Quốc đã viết bài "Lenin và các dân tộc thuộc địa" trên báo Pravda để tưởng nhớ.' },
      { id: 'b', text: 'Ngày 7 tháng 11 năm 1917',  isCorrect: false, explanation: 'Đây là ngày Cách mạng tháng Mười Nga thành công, không phải ngày Lenin mất.' },
      { id: 'c', text: 'Ngày 1 tháng 5 năm 1925',   isCorrect: false, explanation: 'Lenin đã mất từ 1924, không phải 1925.' },
      { id: 'd', text: 'Ngày 22 tháng 4 năm 1923',  isCorrect: false, explanation: 'Đây là ngày sinh của Lenin (22/4/1870), không phải ngày mất.' },
    ],
    timeLimit: 20,
    points: 100,
  },
  {
    id: 'mos-5',
    phaseId: 'moscow',
    type: 'multiple_choice',
    text: 'Tại Đại hội Quốc tế Cộng sản lần thứ V năm 1924, Nguyễn Ái Quốc đã đề cập đến vấn đề gì?',
    options: [
      { id: 'a', text: 'Vai trò cách mạng của giai cấp công nhân châu Âu',          isCorrect: false, explanation: 'Đây không phải trọng tâm phát biểu của Người.' },
      { id: 'b', text: 'Mối quan hệ giữa cách mạng vô sản và cách mạng giải phóng dân tộc ở thuộc địa', isCorrect: true,  explanation: 'Đúng! Người nhấn mạnh: cách mạng thuộc địa và cách mạng vô sản là hai cánh của cùng một con chim.' },
      { id: 'c', text: 'Lý thuyết kinh tế chính trị Marxist',                       isCorrect: false, explanation: 'Người tập trung vào vấn đề thực tiễn, không phải lý thuyết kinh tế thuần túy.' },
      { id: 'd', text: 'Quan hệ giữa Liên Xô và các nước tư bản',                   isCorrect: false, explanation: 'Đây không phải trọng tâm phát biểu của Người.' },
    ],
    timeLimit: 25,
    points: 150,
  },

  // ── QUẢNG CHÂU ─────────────────────────────────────────────────────────────
  {
    id: 'qua-1',
    phaseId: 'guangzhou',
    type: 'multiple_choice',
    text: 'Tổ chức cách mạng nào Nguyễn Ái Quốc thành lập tại Quảng Châu năm 1925?',
    options: [
      { id: 'a', text: 'Việt Nam Độc lập Đồng minh (Việt Minh)', isCorrect: false, explanation: 'Việt Minh được thành lập năm 1941 tại Pác Bó.' },
      { id: 'b', text: 'Đảng Cộng sản Đông Dương',               isCorrect: false, explanation: 'Đảng Cộng sản Đông Dương thành lập năm 1930.' },
      { id: 'c', text: 'Việt Nam Thanh niên Cách mạng Đồng chí hội', isCorrect: true, explanation: 'Đúng! Đây là tổ chức đầu tiên có tính đảng, tiền thân của ĐCSVN.' },
      { id: 'd', text: 'Hội Việt Nam Cách mạng Thanh niên',       isCorrect: false, explanation: 'Đây là tên thông dụng của tổ chức, nhưng tên đầy đủ là đáp án C.' },
    ],
    timeLimit: 20,
    points: 100,
  },
  {
    id: 'qua-2',
    phaseId: 'guangzhou',
    type: 'document_decode',
    text: 'Cuốn sách lý luận cách mạng nào Nguyễn Ái Quốc viết tại Quảng Châu để huấn luyện cán bộ?',
    documentText: '"Muốn làm cách mệnh, trước hết phải có\ncách mệnh đảng... Cách mệnh phải hiểu\nnghĩa vụ của mình và sức mạnh của mình."',
    options: [
      { id: 'a', text: 'Đường Kách Mệnh (1927)',            isCorrect: true,  explanation: 'Đúng! Cuốn sách huấn luyện cán bộ cách mạng, tổng hợp lý luận và thực tiễn.' },
      { id: 'b', text: 'Tuyên ngôn Cộng sản (1848)',         isCorrect: false, explanation: 'Tuyên ngôn Cộng sản do Marx và Engels viết, không phải Hồ Chí Minh.' },
      { id: 'c', text: 'Bản án chế độ thực dân Pháp (1925)', isCorrect: false, explanation: '"Bản án..." được viết ở Paris, không phải Quảng Châu.' },
      { id: 'd', text: 'Nhật ký trong tù (1942)',            isCorrect: false, explanation: 'Nhật ký trong tù được viết khi anh bị bắt giam ở Trung Quốc.' },
    ],
    timeLimit: 22,
    points: 120,
  },
  {
    id: 'qua-3',
    phaseId: 'guangzhou',
    type: 'multiple_choice',
    text: 'Tên bí danh nào Nguyễn Ái Quốc sử dụng khi hoạt động tại Quảng Châu (1924–1927)?',
    options: [
      { id: 'a', text: 'Văn Ba',     isCorrect: false, explanation: 'Văn Ba là tên anh dùng khi xin việc trên tàu năm 1911.' },
      { id: 'b', text: 'Lý Thụy',    isCorrect: true,  explanation: 'Đúng! Lý Thụy là tên Nguyễn Ái Quốc dùng tại Quảng Châu, hoạt động dưới danh nghĩa phiên dịch cho phái đoàn Borodin.' },
      { id: 'c', text: 'Hồ Chí Minh', isCorrect: false, explanation: 'Tên Hồ Chí Minh được dùng từ năm 1942 trở đi.' },
      { id: 'd', text: 'Trần Vương',  isCorrect: false, explanation: 'Đây không phải bí danh của Người.' },
    ],
    timeLimit: 20,
    points: 100,
  },
  {
    id: 'qua-4',
    phaseId: 'guangzhou',
    type: 'multiple_choice',
    text: 'Tờ báo cách mạng nào Nguyễn Ái Quốc sáng lập tại Quảng Châu ngày 21/6/1925?',
    options: [
      { id: 'a', text: 'Le Paria',          isCorrect: false, explanation: 'Le Paria được sáng lập ở Paris năm 1922.' },
      { id: 'b', text: 'Báo Thanh Niên',    isCorrect: true,  explanation: 'Đúng! Báo Thanh Niên ra số đầu ngày 21/6/1925, là cơ quan tuyên truyền của Hội Việt Nam Cách mạng Thanh niên. Ngày này được lấy làm Ngày Báo chí Cách mạng Việt Nam.' },
      { id: 'c', text: 'Báo Nhân Dân',      isCorrect: false, explanation: 'Báo Nhân Dân ra đời năm 1951, không phải 1925.' },
      { id: 'd', text: 'Việt Nam Hồn',      isCorrect: false, explanation: 'Việt Nam Hồn không phải tờ báo Nguyễn Ái Quốc sáng lập.' },
    ],
    timeLimit: 22,
    points: 120,
  },
  {
    id: 'qua-5',
    phaseId: 'guangzhou',
    type: 'ideology_choice',
    text: 'Tại Quảng Châu, Nguyễn Ái Quốc mở lớp huấn luyện cán bộ với mục đích gì là chính?',
    options: [
      { id: 'a', text: 'Đào tạo lực lượng cán bộ cách mạng cho Việt Nam, để khi về nước có thể tổ chức quần chúng', isCorrect: true,  explanation: 'Đúng! Lớp huấn luyện chính trị tại Quảng Châu đào tạo khoảng 200 thanh niên Việt yêu nước — nòng cốt cho cách mạng sau này.' },
      { id: 'b', text: 'Đào tạo phiên dịch tiếng Hoa cho người Việt',                                                  isCorrect: false, explanation: 'Mục tiêu chính trị, không phải ngôn ngữ học.' },
      { id: 'c', text: 'Tuyển mộ binh lính cho quân đội Trung Quốc',                                                   isCorrect: false, explanation: 'Đây không phải mục đích — anh đào tạo cho cách mạng Việt Nam.' },
      { id: 'd', text: 'Học hỏi văn hóa Trung Hoa cổ đại',                                                              isCorrect: false, explanation: 'Lớp huấn luyện là lý luận cách mạng, không phải văn hóa.' },
    ],
    timeLimit: 25,
    points: 150,
  },

  // ── NEW YORK ───────────────────────────────────────────────────────────────
  {
    id: 'ny-1',
    phaseId: 'new_york',
    type: 'multiple_choice',
    text: 'Tại Mỹ, điều gì tác động mạnh nhất đến nhận thức của Nguyễn Tất Thành?',
    options: [
      { id: 'a', text: 'Sự giàu có và phát triển của nền kinh tế Mỹ', isCorrect: false, explanation: 'Sự giàu có không thay đổi tư tưởng anh — trái lại, nó càng làm nổi bật sự bất công.' },
      { id: 'b', text: 'Nạn phân biệt chủng tộc với người Mỹ gốc Phi', isCorrect: true,  explanation: 'Đúng! Anh thấy sự tương đồng giữa người da đen ở Mỹ và người Việt dưới ách thực dân — cùng bị áp bức vì màu da.' },
      { id: 'c', text: 'Hệ thống giáo dục Mỹ tiên tiến và cởi mở',     isCorrect: false, explanation: 'Anh không được tiếp cận hệ thống giáo dục Mỹ — anh làm lao động phổ thông.' },
      { id: 'd', text: 'Phong trào tự do báo chí tại New York',          isCorrect: false, explanation: 'Dù báo chí Mỹ tự do hơn, nhưng không phải điều ấn tượng nhất với anh.' },
    ],
    timeLimit: 22,
    points: 100,
  },
  {
    id: 'ny-2',
    phaseId: 'new_york',
    type: 'ideology_choice',
    text: 'Đứng trước tượng Nữ thần Tự do ở New York, Nguyễn Tất Thành nghĩ gì?',
    subtitle: 'Đặt mình vào vị trí người thanh niên Việt Nam ấy — cảm xúc nào đúng nhất?',
    options: [
      { id: 'a', text: 'Ngưỡng mộ tự do của Mỹ và muốn học theo mô hình dân chủ Mỹ', isCorrect: false, explanation: 'Anh nhận ra tự do của Mỹ không đến với người da đen, người nghèo — không phải tự do đích thực.' },
      { id: 'b', text: 'Phẫn uất vì "tự do" chỉ dành cho người da trắng, người giàu — không phải cho người thuộc địa', isCorrect: true, explanation: 'Đúng! Anh ghi nhận: Tượng Nữ thần Tự do chiếu sáng về phía Đông, quay lưng với người da đen và người nghèo ngay trên đất Mỹ.' },
      { id: 'c', text: 'Quyết định ở lại Mỹ để đấu tranh cho quyền của người da đen', isCorrect: false, explanation: 'Anh không ở lại — con đường của anh là về giải phóng Việt Nam.' },
      { id: 'd', text: 'Cảm thấy nước Mỹ là mô hình lý tưởng cho Việt Nam tương lai', isCorrect: false, explanation: 'Ngược lại — trải nghiệm ở Mỹ khiến anh hoài nghi về mô hình dân chủ tư sản.' },
    ],
    timeLimit: 25,
    points: 150,
  },
  {
    id: 'ny-3',
    phaseId: 'new_york',
    type: 'multiple_choice',
    text: 'Khoảng thời gian nào Nguyễn Tất Thành sinh sống và làm việc tại Hoa Kỳ?',
    options: [
      { id: 'a', text: 'Khoảng 1908–1910', isCorrect: false, explanation: 'Đây là thời kỳ anh học tại Trường Quốc học Huế.' },
      { id: 'b', text: 'Khoảng 1912–1913', isCorrect: true,  explanation: 'Đúng! Anh đến Mỹ khoảng 1912, làm việc ở Boston và New York đến khoảng đầu năm 1913.' },
      { id: 'c', text: 'Khoảng 1918–1919', isCorrect: false, explanation: 'Lúc này anh đang ở Paris chuẩn bị gửi Yêu sách đến Versailles.' },
      { id: 'd', text: 'Khoảng 1923–1924', isCorrect: false, explanation: 'Đây là thời kỳ anh ở Liên Xô.' },
    ],
    timeLimit: 20,
    points: 100,
  },
  {
    id: 'ny-4',
    phaseId: 'new_york',
    type: 'multiple_choice',
    text: 'Tại New York, Nguyễn Tất Thành đặc biệt chú ý đến khu nào — nơi sinh sống của cộng đồng người Mỹ gốc Phi?',
    options: [
      { id: 'a', text: 'Manhattan trung tâm',  isCorrect: false, explanation: 'Manhattan là khu trung tâm thương mại, không phải khu của người Mỹ gốc Phi.' },
      { id: 'b', text: 'Brooklyn',              isCorrect: false, explanation: 'Brooklyn đa dạng nhưng không phải khu trung tâm của cộng đồng da đen thời đó.' },
      { id: 'c', text: 'Harlem',                isCorrect: true,  explanation: 'Đúng! Harlem là trung tâm văn hóa và đấu tranh của người Mỹ gốc Phi — nơi anh quan sát sự phân biệt chủng tộc và tinh thần phản kháng.' },
      { id: 'd', text: 'Queens',                isCorrect: false, explanation: 'Queens chủ yếu là khu nhập cư đa dạng, không phải trung tâm cộng đồng da đen.' },
    ],
    timeLimit: 22,
    points: 120,
  },
  {
    id: 'ny-5',
    phaseId: 'new_york',
    type: 'ideology_choice',
    text: 'Trải nghiệm tại Hoa Kỳ giúp Nguyễn Tất Thành rút ra kết luận quan trọng nào về bản chất chủ nghĩa tư bản?',
    options: [
      { id: 'a', text: 'Sự "tự do" và "dân chủ" tư sản chỉ là hình thức — bản chất là sự thống trị của giai cấp giàu có và sự phân biệt với người yếu thế', isCorrect: true,  explanation: 'Đúng! Đây là khám phá tư tưởng quan trọng — không thể đi theo mô hình tư bản phương Tây để giải phóng dân tộc.' },
      { id: 'b', text: 'Hoa Kỳ là quốc gia hoàn hảo về quyền con người',                                  isCorrect: false, explanation: 'Anh nhìn thấy quá nhiều bất công để có thể tin điều này.' },
      { id: 'c', text: 'Cần học theo cách quản lý kinh tế của Hoa Kỳ',                                     isCorrect: false, explanation: 'Anh không tin vào mô hình kinh tế tư bản như giải pháp.' },
      { id: 'd', text: 'Không có gì đáng học hỏi từ Hoa Kỳ',                                                isCorrect: false, explanation: 'Quá cực đoan — anh học được nhiều bài học, chỉ là không phải mô hình toàn diện.' },
    ],
    timeLimit: 25,
    points: 150,
  },

  // ── PÁC BÓ ────────────────────────────────────────────────────────────────
  {
    id: 'pac-1',
    phaseId: 'pac_bo',
    type: 'multiple_choice',
    text: 'Sau bao nhiêu năm, Hồ Chí Minh mới trở về Việt Nam tại Pác Bó năm 1941?',
    options: [
      { id: 'a', text: '20 năm', isCorrect: false, explanation: 'Chưa đủ — hành trình của Người dài hơn nhiều.' },
      { id: 'b', text: '25 năm', isCorrect: false, explanation: 'Gần đúng nhưng chưa chính xác.' },
      { id: 'c', text: '30 năm', isCorrect: true,  explanation: 'Đúng! Ra đi năm 1911, về năm 1941 — đúng 30 năm xa cách Tổ quốc.' },
      { id: 'd', text: '35 năm', isCorrect: false, explanation: 'Nếu 35 năm, thì phải về năm 1946 mới đúng.' },
    ],
    timeLimit: 18,
    points: 100,
  },
  {
    id: 'pac-2',
    phaseId: 'pac_bo',
    type: 'multiple_choice',
    text: 'Tổ chức nào được Hồ Chí Minh thành lập tại Pác Bó năm 1941?',
    options: [
      { id: 'a', text: 'Đảng Cộng sản Đông Dương',        isCorrect: false, explanation: 'ĐCSĐD thành lập năm 1930, không phải 1941.' },
      { id: 'b', text: 'Việt Nam Độc lập Đồng minh (Việt Minh)', isCorrect: true, explanation: 'Đúng! Việt Minh là mặt trận đoàn kết dân tộc rộng rãi, tiền đề Cách mạng Tháng Tám.' },
      { id: 'c', text: 'Hội Phụ nữ Cứu quốc',             isCorrect: false, explanation: 'Đây là tổ chức thành viên trong Việt Minh, không phải Việt Minh.' },
      { id: 'd', text: 'Quân đội Nhân dân Việt Nam',       isCorrect: false, explanation: 'Đội Việt Nam Tuyên truyền Giải phóng quân thành lập tháng 12/1944.' },
    ],
    timeLimit: 20,
    points: 100,
  },
  {
    id: 'pac-3',
    phaseId: 'pac_bo',
    type: 'ideology_choice',
    text: 'Hồ Chí Minh đặt tên suối là "Lê-nin" và núi là "Các Mác" tại Pác Bó. Hành động này có ý nghĩa gì?',
    options: [
      { id: 'a', text: 'Để vinh danh những người thầy tư tưởng đã soi đường cho con đường cứu nước', isCorrect: true, explanation: 'Đúng! Đây là sự gắn kết giữa lý luận Marxist-Leninist với thực tiễn cách mạng Việt Nam.' },
      { id: 'b', text: 'Đơn giản vì những cái tên đó dễ nhớ', isCorrect: false, explanation: 'Hành động có chiều sâu tư tưởng, không chỉ là việc đặt tên ngẫu nhiên.' },
      { id: 'c', text: 'Để làm bí danh nhằm tránh mật thám nhận ra vị trí', isCorrect: false, explanation: 'Ngược lại — đặt tên như vậy là tuyên ngôn lý tưởng rõ ràng.' },
      { id: 'd', text: 'Theo yêu cầu của Quốc tế Cộng sản', isCorrect: false, explanation: 'Đây là quyết định cá nhân của Người, không phải chỉ đạo từ Quốc tế Cộng sản.' },
    ],
    timeLimit: 25,
    points: 150,
  },
  {
    id: 'pac-4',
    phaseId: 'pac_bo',
    type: 'multiple_choice',
    text: 'Tên hang động nào tại Pác Bó là nơi Hồ Chí Minh sống và làm việc khi trở về Việt Nam năm 1941?',
    options: [
      { id: 'a', text: 'Hang Bồ Đề',  isCorrect: false, explanation: 'Đây không phải tên hang Bác chọn làm nơi hoạt động.' },
      { id: 'b', text: 'Hang Cốc Bó', isCorrect: true,  explanation: 'Đúng! Hang Cốc Bó (tiếng Tày nghĩa là "đầu nguồn") là nơi Bác Hồ ở từ ngày 8/2/1941 sau khi vượt biên giới về nước.' },
      { id: 'c', text: 'Hang Sơn Đoòng', isCorrect: false, explanation: 'Sơn Đoòng ở Quảng Bình, không liên quan đến Pác Bó.' },
      { id: 'd', text: 'Hang Thiên Cung', isCorrect: false, explanation: 'Hang Thiên Cung ở vịnh Hạ Long, không liên quan đến Pác Bó.' },
    ],
    timeLimit: 20,
    points: 100,
  },
  {
    id: 'pac-5',
    phaseId: 'pac_bo',
    type: 'multiple_choice',
    text: 'Tên gọi "Hồ Chí Minh" được Người chính thức sử dụng từ năm nào?',
    options: [
      { id: 'a', text: 'Năm 1930 — khi thành lập Đảng Cộng sản Việt Nam', isCorrect: false, explanation: 'Năm 1930 Người vẫn dùng tên Nguyễn Ái Quốc.' },
      { id: 'b', text: 'Năm 1941 — khi về Pác Bó',                          isCorrect: false, explanation: 'Tại Pác Bó năm 1941, Người vẫn dùng tên Nguyễn Ái Quốc.' },
      { id: 'c', text: 'Năm 1942 — trong chuyến đi Trung Quốc',              isCorrect: true,  explanation: 'Đúng! Năm 1942, khi sang Trung Quốc liên lạc với Đồng Minh, Người bắt đầu dùng tên "Hồ Chí Minh" — gắn liền với Người từ đó.' },
      { id: 'd', text: 'Năm 1945 — khi đọc Tuyên ngôn Độc lập',              isCorrect: false, explanation: 'Tên đã được dùng từ 1942, trước Tuyên ngôn Độc lập 3 năm.' },
    ],
    timeLimit: 22,
    points: 120,
  },
  {
    id: 'pac-6',
    phaseId: 'pac_bo',
    type: 'multiple_choice',
    text: 'Đội Việt Nam Tuyên truyền Giải phóng quân — tiền thân của Quân đội Nhân dân Việt Nam — thành lập vào ngày nào?',
    options: [
      { id: 'a', text: 'Ngày 22 tháng 12 năm 1944', isCorrect: true,  explanation: 'Đúng! Theo chỉ thị của Hồ Chí Minh, ngày 22/12/1944 tại khu rừng Trần Hưng Đạo (Cao Bằng), Đội Việt Nam Tuyên truyền Giải phóng quân được thành lập với 34 chiến sĩ — Võ Nguyên Giáp làm đội trưởng.' },
      { id: 'b', text: 'Ngày 2 tháng 9 năm 1945',   isCorrect: false, explanation: 'Đây là ngày Tuyên ngôn Độc lập.' },
      { id: 'c', text: 'Ngày 19 tháng 8 năm 1945',  isCorrect: false, explanation: 'Đây là ngày Tổng khởi nghĩa thành công ở Hà Nội.' },
      { id: 'd', text: 'Ngày 19 tháng 5 năm 1941',  isCorrect: false, explanation: 'Đây là ngày sinh nhật Bác (19/5/1890), trùng với ngày thành lập Việt Minh.' },
    ],
    timeLimit: 22,
    points: 120,
  },
];

// ── PRNG có seed (mulberry32) — cùng seed → cùng dãy số ─────────────────────
function seededRandom(seed: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return () => {
    h = (h + 0x6d2b79f5) >>> 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: string): T[] {
  const rng = seededRandom(seed);
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const PHASE_IDS = [
  'ben_nha_rong', 'marseille', 'new_york', 'london',
  'paris', 'moscow', 'guangzhou', 'pac_bo',
] as const;

/**
 * Trả về danh sách câu hỏi cho 1 phase.
 * - Nếu truyền roomId: shuffle deterministic theo (roomId + phaseId),
 *   rồi cắt lấy `questionCount` câu đầu → cùng phòng thấy cùng bộ,
 *   khác phòng thấy bộ khác.
 * - Không truyền roomId: trả về tất cả câu của phase đó (dùng cho dev/inspect).
 */
export function getQuestionsForPhase(phaseIndex: number, roomId?: string): GameQuestion[] {
  const phaseId = PHASE_IDS[phaseIndex];
  if (!phaseId) return [];
  const all = GAME_QUESTIONS.filter((q) => q.phaseId === phaseId);
  if (!roomId) return all;

  const count = GAME_PHASES[phaseIndex]?.questionCount ?? all.length;
  return seededShuffle(all, `${roomId}:${phaseId}`).slice(0, count);
}

export function getQuestion(questionId: string): GameQuestion | undefined {
  return GAME_QUESTIONS.find((q) => q.id === questionId);
}

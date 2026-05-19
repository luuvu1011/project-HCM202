export type LocationId =
  | "ben-nha-rong"
  | "marseille"
  | "quang-chau"
  | "london"
  | "new-york"
  | "paris"
  | "lien-xo";

export interface VoyageLocation {
  id: LocationId;
  name: string;
  /** [longitude, latitude] for react-simple-maps */
  coordinates: [number, number];
  /** Approximate chronological order for route storytelling */
  order: number;
  /** One-line mood / emotional hook for the stop */
  atmosphere: string;
  /** Bối cảnh lịch sử — đặt sự kiện trong dòng chảy thời đại */
  historicalContext: string;
  /** Nguyễn Tất Thành chứng kiến, làm việc, va chạm điều gì */
  experienced: string;
  /** Thức tỉnh — chuyển hóa nhận thức, tư tưởng tiến lên */
  ideologicalEvolution: string;
  /** Ý nghĩa đối với con đường cứu nước và học thuật */
  significance: string;
  /** Lời dẫn ngắn khi thuyền cập bến — hành trình điện ảnh */
  arrivalNarration: string;
}

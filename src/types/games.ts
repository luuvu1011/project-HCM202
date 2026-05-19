export interface TimelineEventItem {
  id: string;
  label: string;
  correctOrder: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface SuggestedQuestion {
  id: string;
  text: string;
}

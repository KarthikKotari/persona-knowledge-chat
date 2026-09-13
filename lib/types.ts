export type PersonaId = "teacher" | "analyst" | "skeptic";

export interface PersonaMeta {
  id: PersonaId;
  name: string;
  description: string;        // one sentence for the UI card
  systemPrompt: string;       // loaded from personas/*.md at startup
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SourceRef {
  title: string;
  filename: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: SourceRef[];      // only on assistant messages
}

export interface DocumentMeta {
  id: number;
  title: string;
  filename: string;
}

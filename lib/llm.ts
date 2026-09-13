import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatMessage } from "./types";
import { RetrievedChunk } from "./retrieval";

export function buildSystemMessage(
  personaSystemPrompt: string,
  chunks: RetrievedChunk[],
): string {
  if (chunks.length === 0) {
    return `${personaSystemPrompt}\n\n--- Knowledge Base Context ---\nNo relevant excerpts were found for this query.`;
  }

  const excerpts = chunks
    .map(
      (c) =>
        `Source: ${c.source.title} (${c.source.filename})\n---\n${c.content}\n---`,
    )
    .join("\n\n");

  return `${personaSystemPrompt}\n\n--- Knowledge Base Context ---\nUse only these excerpts as factual sources.\n\n${excerpts}`;
}

export async function chatWithPersona(
  personaSystemPrompt: string,
  chunks: RetrievedChunk[],
  history: ChatMessage[],
  userMessage: string,
): Promise<string> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not configured");

  const client = new GoogleGenerativeAI(apiKey);
  const systemContent = buildSystemMessage(personaSystemPrompt, chunks);

  const model = client.getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    systemInstruction: systemContent,
  });

  // Gemini uses "model" for assistant turns; map history accordingly.
  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const response = await model.generateContent({ contents });

  return response.response.text() ?? "";
}

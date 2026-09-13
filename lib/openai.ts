import OpenAI from "openai";
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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const client = new OpenAI({ apiKey });
  const systemContent = buildSystemMessage(personaSystemPrompt, chunks);

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemContent },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    messages,
  });

  return response.choices[0]?.message?.content ?? "";
}

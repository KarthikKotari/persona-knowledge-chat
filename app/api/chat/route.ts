import { NextRequest, NextResponse } from "next/server";
import { retrieveChunks } from "@/lib/retrieval";
import { personaMap } from "@/lib/personas";
import { chatWithPersona } from "@/lib/llm";
import { ChatMessage, PersonaId, SourceRef } from "@/lib/types";

function deduplicateSources(sources: SourceRef[]): SourceRef[] {
  const seen = new Set<string>();
  return sources.filter((s) => {
    if (seen.has(s.filename)) return false;
    seen.add(s.filename);
    return true;
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Early guard: require API key before doing any work
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json(
      { error: "Server configuration error: API key is not set." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Validate request body
  if (
    typeof body !== "object" ||
    body === null
  ) {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }

  const { message, personaId, history } = body as Record<string, unknown>;

  if (typeof message !== "string" || message.trim() === "") {
    return NextResponse.json(
      { error: "Field 'message' must be a non-empty string." },
      { status: 400 },
    );
  }

  const VALID_PERSONA_IDS: PersonaId[] = ["teacher", "analyst", "skeptic"];
  if (typeof personaId !== "string" || !VALID_PERSONA_IDS.includes(personaId as PersonaId)) {
    return NextResponse.json(
      { error: "Field 'personaId' must be one of: teacher, analyst, skeptic." },
      { status: 400 },
    );
  }

  if (!Array.isArray(history)) {
    return NextResponse.json(
      { error: "Field 'history' must be an array." },
      { status: 400 },
    );
  }

  // Validate each history entry
  for (const entry of history) {
    if (
      typeof entry !== "object" ||
      entry === null ||
      (entry.role !== "user" && entry.role !== "assistant") ||
      typeof entry.content !== "string"
    ) {
      return NextResponse.json(
        { error: "Each history entry must have role 'user'|'assistant' and a string content." },
        { status: 400 },
      );
    }
  }

  const persona = personaMap.get(personaId as PersonaId)!;
  const typedHistory = history as ChatMessage[];

  try {
    const chunks = await retrieveChunks(message);
    const reply = await chatWithPersona(persona.systemPrompt, chunks, typedHistory, message);
    const sources = deduplicateSources(chunks.map((c) => c.source));

    return NextResponse.json({ reply, sources }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("GOOGLE_GENERATIVE_AI_API_KEY")) {
      return NextResponse.json(
        { error: "Server configuration error: API key is not set." },
        { status: 500 },
      );
    }
    if (
      err instanceof Error &&
      (err.name.startsWith("GoogleGenerativeAI") ||
        err.message.includes("GoogleGenerativeAI"))
    ) {
      return NextResponse.json(
        { error: "The AI service returned an error. Please try again." },
        { status: 502 },
      );
    }
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

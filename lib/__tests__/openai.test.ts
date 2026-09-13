import { describe, it, expect } from "vitest";
import { buildSystemMessage } from "../openai";
import { RetrievedChunk } from "../retrieval";

const makeChunk = (title: string, filename: string, content: string): RetrievedChunk => ({
  content,
  score: 1.0,
  source: { title, filename },
});

describe("buildSystemMessage", () => {
  const personaPrompt = "You are a helpful teacher.";

  it("includes the persona system prompt in all cases", () => {
    const result = buildSystemMessage(personaPrompt, []);
    expect(result).toContain(personaPrompt);
  });

  it("includes the persona prompt when chunks are provided", () => {
    const chunks = [makeChunk("Doc Title", "doc.md", "Some content.")];
    const result = buildSystemMessage(personaPrompt, chunks);
    expect(result).toContain(personaPrompt);
  });

  it('includes "No relevant excerpts were found" when chunks array is empty', () => {
    const result = buildSystemMessage(personaPrompt, []);
    expect(result).toContain("No relevant excerpts were found");
  });

  it("does NOT include no-results message when chunks are provided", () => {
    const chunks = [makeChunk("Doc Title", "doc.md", "Some content.")];
    const result = buildSystemMessage(personaPrompt, chunks);
    expect(result).not.toContain("No relevant excerpts were found");
  });

  it("includes chunk content when chunks are provided", () => {
    const chunks = [makeChunk("Doc Title", "doc.md", "Specific chunk content here.")];
    const result = buildSystemMessage(personaPrompt, chunks);
    expect(result).toContain("Specific chunk content here.");
  });

  it("includes the source title for each chunk", () => {
    const chunks = [makeChunk("My Document Title", "my-doc.md", "Content.")];
    const result = buildSystemMessage(personaPrompt, chunks);
    expect(result).toContain("My Document Title");
  });

  it("includes the source filename for each chunk", () => {
    const chunks = [makeChunk("My Document", "my-document.md", "Content.")];
    const result = buildSystemMessage(personaPrompt, chunks);
    expect(result).toContain("my-document.md");
  });

  it("includes all chunks when multiple are provided", () => {
    const chunks = [
      makeChunk("Doc One", "doc1.md", "Content from doc one."),
      makeChunk("Doc Two", "doc2.md", "Content from doc two."),
    ];
    const result = buildSystemMessage(personaPrompt, chunks);
    expect(result).toContain("Content from doc one.");
    expect(result).toContain("Content from doc two.");
    expect(result).toContain("Doc One");
    expect(result).toContain("Doc Two");
    expect(result).toContain("doc1.md");
    expect(result).toContain("doc2.md");
  });

  it("includes the Knowledge Base Context section header", () => {
    const result = buildSystemMessage(personaPrompt, []);
    expect(result).toContain("Knowledge Base Context");
  });

  it("persona prompt appears before the KB context block", () => {
    const chunks = [makeChunk("Title", "file.md", "Content.")];
    const result = buildSystemMessage(personaPrompt, chunks);
    const promptIndex = result.indexOf(personaPrompt);
    const contextIndex = result.indexOf("Knowledge Base Context");
    expect(promptIndex).toBeLessThan(contextIndex);
  });

  it("handles a persona prompt that is an empty string", () => {
    const result = buildSystemMessage("", []);
    expect(result).toContain("No relevant excerpts were found");
  });
});

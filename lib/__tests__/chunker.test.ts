import { describe, it, expect } from "vitest";
import { chunkDocument } from "../chunker";

describe("chunkDocument", () => {
  it("returns empty array for empty string", () => {
    expect(chunkDocument("")).toEqual([]);
  });

  it("returns empty array for whitespace-only string", () => {
    expect(chunkDocument("   \n\n   \n")).toEqual([]);
  });

  it("returns a single chunk for content with no blank lines or headings", () => {
    const result = chunkDocument("Hello world");
    expect(result).toHaveLength(1);
    expect(result[0]).toBe("Hello world");
  });

  it("splits on blank lines (paragraph separator)", () => {
    const content = "First paragraph.\n\nSecond paragraph.";
    const result = chunkDocument(content);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe("First paragraph.");
    expect(result[1]).toBe("Second paragraph.");
  });

  it("splits on multiple blank lines", () => {
    const content = "Para one.\n\n\n\nPara two.";
    const result = chunkDocument(content);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe("Para one.");
    expect(result[1]).toBe("Para two.");
  });

  it("splits at markdown h1 heading boundary", () => {
    const content = "Intro text.\n# Section One\nContent here.";
    const result = chunkDocument(content);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.some((c) => c.includes("Intro text."))).toBe(true);
    expect(result.some((c) => c.startsWith("# Section One"))).toBe(true);
  });

  it("splits at markdown h2 heading boundary", () => {
    const content = "Some intro.\n## Subsection\nMore content.";
    const result = chunkDocument(content);
    expect(result.some((c) => c.startsWith("## Subsection"))).toBe(true);
  });

  it("splits at markdown h3 heading boundary", () => {
    const content = "Intro.\n### Deep Section\nContent.";
    const result = chunkDocument(content);
    expect(result.some((c) => c.startsWith("### Deep Section"))).toBe(true);
  });

  it("does NOT split at h4 or deeper headings", () => {
    const content = "Before.\n#### Not a split\nAfter.";
    // h4 should NOT be a split boundary per spec (only #{1,3})
    const result = chunkDocument(content);
    expect(result).toHaveLength(1);
  });

  it("trims whitespace from each chunk", () => {
    const content = "  padded chunk  \n\n  another chunk  ";
    const result = chunkDocument(content);
    expect(result[0]).toBe("padded chunk");
    expect(result[1]).toBe("another chunk");
  });

  it("filters out chunks that are only whitespace after trimming", () => {
    const content = "Real content.\n\n   \n\nMore content.";
    const result = chunkDocument(content);
    expect(result.every((c) => c.trim().length > 0)).toBe(true);
    expect(result).toHaveLength(2);
  });

  it("all returned chunks are non-empty strings", () => {
    const content = "# Title\n\nParagraph one.\n\nParagraph two.\n## Section\nBody text.";
    const result = chunkDocument(content);
    expect(result.length).toBeGreaterThan(0);
    result.forEach((chunk) => {
      expect(chunk.length).toBeGreaterThan(0);
    });
  });
});

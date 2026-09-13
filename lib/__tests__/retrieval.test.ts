import { describe, it, expect } from "vitest";
import { tokenise, scoreChunk } from "../retrieval";

describe("tokenise", () => {
  it("returns empty array for empty string", () => {
    expect(tokenise("")).toEqual([]);
  });

  it("returns empty array for whitespace-only string", () => {
    expect(tokenise("   ")).toEqual([]);
  });

  it("lowercases all tokens", () => {
    const result = tokenise("Hello WORLD Foo");
    expect(result).toContain("hello");
    expect(result).toContain("world");
    expect(result).toContain("foo");
  });

  it("strips non-alphanumeric characters", () => {
    const result = tokenise("hello, world! foo-bar.");
    expect(result).toContain("hello");
    expect(result).toContain("world");
    expect(result).toContain("foo");
    expect(result).toContain("bar");
  });

  it("removes stop words", () => {
    const stopWords = ["a", "an", "the", "is", "in", "it", "of", "to", "and", "or", "for", "with", "on", "at", "by", "from"];
    for (const word of stopWords) {
      const result = tokenise(word);
      expect(result).not.toContain(word);
    }
  });

  it("removes stop words from a sentence", () => {
    const result = tokenise("the quick brown fox");
    expect(result).not.toContain("the");
    expect(result).toContain("quick");
    expect(result).toContain("brown");
    expect(result).toContain("fox");
  });

  it("filters out single-character tokens", () => {
    const result = tokenise("a b c hello");
    expect(result).not.toContain("a");
    expect(result).not.toContain("b");
    expect(result).not.toContain("c");
    expect(result).toContain("hello");
  });

  it("handles numeric tokens", () => {
    const result = tokenise("version 42 update");
    expect(result).toContain("42");
    expect(result).toContain("version");
    expect(result).toContain("update");
  });
});

describe("scoreChunk", () => {
  it("returns 0 when queryTokens is empty", () => {
    expect(scoreChunk("some content here", [])).toBe(0);
  });

  it("returns 0 when chunk content is empty string", () => {
    expect(scoreChunk("", ["hello"])).toBe(0);
  });

  it("returns 0 when chunk content has no words after tokenising", () => {
    // content that tokenises to empty (all stop words or single chars)
    expect(scoreChunk("a an the is in", ["hello"])).toBe(0);
  });

  it("returns 0 when query token does not appear in chunk", () => {
    expect(scoreChunk("the quick brown fox", ["elephant"])).toBe(0);
  });

  it("returns a positive score when query token appears in chunk", () => {
    const score = scoreChunk("hello world", ["hello"]);
    expect(score).toBeGreaterThan(0);
  });

  it("returns higher score when query token appears more frequently", () => {
    const scoreOnce = scoreChunk("hello world foo bar", ["hello"]);
    const scoreTwice = scoreChunk("hello hello world foo", ["hello"]);
    expect(scoreTwice).toBeGreaterThan(scoreOnce);
  });

  it("returns higher score when more query tokens match", () => {
    const scoreOne = scoreChunk("hello world python coding", ["hello"]);
    const scoreTwo = scoreChunk("hello world python coding", ["hello", "world"]);
    expect(scoreTwo).toBeGreaterThan(scoreOne);
  });

  it("TF score is count divided by total word count", () => {
    // chunk: "hello hello world" → tokenised = ["hello","hello","world"] (3 words)
    // query token "hello" appears 2 times → TF = 2/3
    const score = scoreChunk("hello hello world", ["hello"]);
    expect(score).toBeCloseTo(2 / 3, 5);
  });

  it("multiple query tokens sum their TF contributions", () => {
    // chunk: "hello world test" → 3 words
    // "hello" TF = 1/3, "world" TF = 1/3 → total = 2/3
    const score = scoreChunk("hello world test", ["hello", "world"]);
    expect(score).toBeCloseTo(2 / 3, 5);
  });

  it("stop words in chunk do not affect scoring (they are stripped by tokenise)", () => {
    // "the" and "is" are stop words, actual chunk words = ["hello", "world"]
    const scoreWithStopWords = scoreChunk("the hello is world", ["hello"]);
    const scoreWithout = scoreChunk("hello world", ["hello"]);
    expect(scoreWithStopWords).toBeCloseTo(scoreWithout, 5);
  });
});

/**
 * Split markdown content into chunks at paragraph / heading boundaries.
 * Returns an array of non-empty trimmed strings.
 */
export function chunkDocument(content: string): string[] {
  // Split on blank lines (paragraph separator) or markdown headings
  const rawChunks = content.split(/\n{2,}|(?=^#{1,3} )/m);

  return rawChunks
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

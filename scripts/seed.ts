import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { chunkDocument } from "../lib/chunker";

const prisma = new PrismaClient();
const KB_DIR = path.resolve(process.cwd(), "..", "knowledge-base-documents");

function extractTitle(content: string, filename: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : path.basename(filename, path.extname(filename));
}

async function seed() {
  const files = fs.readdirSync(KB_DIR).filter((f) => /\.(md|txt)$/.test(f));

  for (const file of files) {
    const existing = await prisma.document.findUnique({ where: { filename: file } });
    if (existing) {
      console.log(`Skipping (already exists): ${file}`);
      continue;
    }

    const content = fs.readFileSync(path.join(KB_DIR, file), "utf-8");
    const title = extractTitle(content, file);
    const chunks = chunkDocument(content);

    await prisma.document.create({
      data: {
        filename: file,
        title,
        content,
        chunks: {
          create: chunks.map((text, position) => ({ content: text, position })),
        },
      },
    });

    console.log(`Seeded: ${title} (${chunks.length} chunks)`);
  }

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

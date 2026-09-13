import fs from "fs";
import path from "path";
import { PersonaId, PersonaMeta } from "./types";

const PERSONA_DESCRIPTIONS: Record<PersonaId, string> = {
  teacher: "Patient and example-driven — breaks concepts into clear steps.",
  analyst: "Concise and evidence-focused — leads with conclusions.",
  skeptic: "Highlights caveats, limits, and unsupported assumptions.",
};

export function loadPersonas(): PersonaMeta[] {
  // personas/ lives one level above the Next.js project root
  const personasDir = path.join(process.cwd(), "..", "personas");
  const ids: PersonaId[] = ["teacher", "analyst", "skeptic"];

  return ids.map((id) => {
    const filePath = path.join(personasDir, `${id}.md`);
    const systemPrompt = fs.readFileSync(filePath, "utf-8").trim();
    return {
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      description: PERSONA_DESCRIPTIONS[id],
      systemPrompt,
    };
  });
}

// Loaded once at module initialisation (server-side singleton)
export const personas: PersonaMeta[] = loadPersonas();
export const personaMap = new Map(personas.map((p) => [p.id, p]));

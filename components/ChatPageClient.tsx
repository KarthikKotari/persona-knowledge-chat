"use client";

import { useState } from "react";
import PersonaSelector from "@/components/PersonaSelector";
import { PersonaMeta } from "@/lib/types";

interface ChatPageClientProps {
  personas: PersonaMeta[];
}

export default function ChatPageClient({ personas }: ChatPageClientProps) {
  const [activePersona, setActivePersona] = useState<PersonaMeta>(personas[0]);

  function handleSelectPersona(id: string) {
    const found = personas.find((p) => p.id === id);
    if (found && found.id !== activePersona.id) {
      setActivePersona(found);
    }
  }

  return (
    <div>
      <PersonaSelector
        personas={personas}
        activeId={activePersona.id}
        onSelect={handleSelectPersona}
      />

      {/* Placeholder chat area — will be replaced by ChatWindow */}
      <div
        style={{
          border: "1px dashed var(--color-nav-border)",
          borderRadius: 8,
          padding: "2rem",
          minHeight: 320,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <p style={{ fontSize: "0.9rem" }}>
          <strong>Active persona:</strong> {activePersona.name}
        </p>
        <p style={{ fontSize: "0.85rem", opacity: 0.6 }}>
          Chat window 
        </p>
      </div>
    </div>
  );
}

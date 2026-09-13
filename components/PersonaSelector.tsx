"use client";

import { PersonaMeta } from "@/lib/types";

interface PersonaSelectorProps {
  personas: PersonaMeta[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function PersonaSelector({
  personas,
  activeId,
  onSelect,
}: PersonaSelectorProps) {
  return (
    <div className="persona-selector">
      {personas.map((persona) => {
        const isActive = persona.id === activeId;
        return (
          <button
            key={persona.id}
            type="button"
            className={`persona-card${isActive ? " persona-card--active" : ""}`}
            onClick={() => onSelect(persona.id)}
            aria-pressed={isActive}
          >
            <span className="persona-card__name">{persona.name}</span>
            <span className="persona-card__description">{persona.description}</span>
          </button>
        );
      })}
    </div>
  );
}

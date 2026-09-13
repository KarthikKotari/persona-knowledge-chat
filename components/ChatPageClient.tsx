"use client";

import { useState } from "react";
import PersonaSelector from "@/components/PersonaSelector";
import ChatWindow from "@/components/ChatWindow";
import { PersonaMeta, Message, ChatMessage } from "@/lib/types";

interface ChatPageClientProps {
  personas: PersonaMeta[];
}

export default function ChatPageClient({ personas }: ChatPageClientProps) {
  const [activePersona, setActivePersona] = useState<PersonaMeta>(personas[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSelectPersona(id: string) {
    const found = personas.find((p) => p.id === id);
    if (found && found.id !== activePersona.id) {
      setActivePersona(found);
      setMessages([]);
      setError(null);
    }
  }

  async function handleSend(text: string) {
    setLoading(true);
    setError(null);

    // Build history from current messages before appending the new user message
    const history: ChatMessage[] = messages.map(({ role, content }) => ({
      role,
      content,
    }));

    // Optimistically append the user message
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          personaId: activePersona.id,
          history,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const { reply, sources } = data;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, sources },
      ]);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PersonaSelector
        personas={personas}
        activeId={activePersona.id}
        onSelect={handleSelectPersona}
      />
      <ChatWindow
        persona={activePersona}
        messages={messages}
        onSend={handleSend}
        loading={loading}
        error={error}
      />
    </div>
  );
}

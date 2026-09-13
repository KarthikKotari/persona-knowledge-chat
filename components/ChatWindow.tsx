"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { Message, PersonaMeta } from "@/lib/types";
import MessageBubble from "./MessageBubble";

interface ChatWindowProps {
  persona: PersonaMeta;
  messages: Message[];
  onSend: (text: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function ChatWindow({
  persona,
  messages,
  onSend,
  loading,
  error,
}: ChatWindowProps) {
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Refocus textarea after loading completes or error appears
  useEffect(() => {
    if (!loading) {
      textareaRef.current?.focus();
    }
  }, [loading]);

  async function handleSubmit() {
    const trimmed = draft.trim();
    if (!trimmed || loading) return;
    setDraft("");
    await onSend(trimmed);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const isInputDisabled = loading;

  return (
    <div className="chat-window">
      {/* Message list */}
      <div className="chat-window__messages" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 ? (
          <div className="chat-window__empty">
            <p className="chat-window__empty-title">
              Start a conversation with {persona.name}
            </p>
            <p className="chat-window__empty-description">{persona.description}</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))
        )}

        {/* Loading indicator — shown while awaiting assistant reply */}
        {loading && (
          <div className="chat-window__typing" aria-label="Assistant is typing">
            <span className="chat-window__typing-dot" />
            <span className="chat-window__typing-dot" />
            <span className="chat-window__typing-dot" />
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="chat-window__error" role="alert">
          {error}
        </div>
      )}

      {/* Input area */}
      <div className="chat-window__input-row">
        <textarea
          ref={textareaRef}
          className="chat-window__textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isInputDisabled}
          placeholder={
            loading
              ? `${persona.name} is thinking…`
              : `Message ${persona.name}… (Enter to send)`
          }
          rows={1}
          aria-label={`Message ${persona.name}`}
          aria-disabled={isInputDisabled}
        />
        <button
          type="button"
          className="chat-window__send-btn"
          onClick={handleSubmit}
          disabled={isInputDisabled || !draft.trim()}
          aria-label="Send message"
        >
          {loading ? (
            <span className="chat-window__send-spinner" aria-hidden="true" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="18"
              height="18"
              aria-hidden="true"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

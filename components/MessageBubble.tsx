import { Message } from "@/lib/types";
import SourceList from "./SourceList";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`message-bubble message-bubble--${message.role}`}>
      <div className="message-bubble__content">{message.content}</div>
      {!isUser && message.sources && message.sources.length > 0 && (
        <SourceList sources={message.sources} />
      )}
    </div>
  );
}

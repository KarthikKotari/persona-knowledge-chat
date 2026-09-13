// Server component — reads personas on the server and passes them down
import { personas } from "@/lib/personas";
import ChatPageClient from "@/components/ChatPageClient";

export default function ChatPage() {
  // Strip systemPrompt before sending to client (not needed in the browser)
  const personaMetas = personas.map(({ id, name, description }) => ({
    id,
    name,
    description,
  }));

  return <ChatPageClient personas={personaMetas as any} />;
}

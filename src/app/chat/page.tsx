import { ChatLayout } from "@/components/chat/ChatLayout";

interface Props {
  searchParams: { prompt?: string };
}

export default function ChatPage({ searchParams }: Props) {
  return <ChatLayout initialPrompt={searchParams.prompt} />;
}
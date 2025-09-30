import { ChatLayout } from "@/components/chat/ChatLayout";

interface Props {
  searchParams: Promise<{ prompt?: string }>;
}

export default async function ChatPage({ searchParams }: Props) {
  const params = await searchParams;
  return <ChatLayout initialPrompt={params.prompt} />;
}
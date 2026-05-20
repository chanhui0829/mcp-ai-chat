import ChatLayout from '@/components/chat/ChatLayout';

/**
 * @description 동적 라우팅 채팅 페이지 (Next.js App Router)
 */
export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChatLayout initialChatId={id} />;
}

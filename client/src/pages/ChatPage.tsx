import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

/* --- 핵심 도메인 부품 임포트 --- */
import ChatWindow from '../features/chat/components/ChatWindow';
import ChatInput from '../features/chat/components/ChatInput';
import { useChat } from '../features/chat/hooks/useChat';
import { useChatStore } from '../store/chat.store';

/**
 * @description 채팅 메인 페이지
 * [Architecture]:
 * - 비즈니스 로직은 useChat 훅으로 캡슐화하여 UI 컴포넌트의 복잡도를 낮춤.
 * - 도메인 기반 설계를 통해 각 부품(Window, Input)의 관심사를 분리함.
 */
function ChatPage() {
  const { id } = useParams();
  const { loadChats, setCurrentChat, chats } = useChatStore();

  // 모든 복잡한 로직(전송, 중단, 타이핑 상태 등)은 이 훅 하나에 들어있습니다.
  const {
    input,
    setInput,
    typing,
    loading,
    activeChatId,
    handleSend,
    handleStop,
    handleQuickSend,
  } = useChat();

  /**
   * [Life Cycle] 초기 데이터 로딩
   */
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  /**
   * [Life Cycle] URL 파라미터 동기화
   */
  useEffect(() => {
    if (id && chats.length > 0) {
      setCurrentChat(id);
    }
  }, [id, chats, setCurrentChat]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* [Message Display Area] 
        - typing: 실시간 AI 응답 텍스트
        - loading: AI 응답 대기 상태
      */}
      <ChatWindow
        typing={typing}
        loading={loading}
        activeChatId={activeChatId}
        onQuickSend={handleQuickSend}
      />

      {/* [User Interaction Area] 
        - Input 제어 및 전송/중단 액션 연결
      */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSend={handleSend}
        onStop={handleStop}
        loading={loading}
        typing={typing}
      />
    </div>
  );
}

export default ChatPage;

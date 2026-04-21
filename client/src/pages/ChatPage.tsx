import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';

/* Components & API */
import ChatWindow from '../components/chat/chatWindow';
import ChatInput from '../components/chat/chatInput';
import { useChatStore } from '../store/chat.store';
import { sendMessageStream, getChatSummary } from '../api/mcp';

/**
 * @description 채팅의 메인 비즈니스 로직을 담당하는 페이지 컴포넌트입니다.
 * 실시간 AI 스트리밍 통제 및 Zustand 스토어 데이터 연동을 총괄합니다.
 */
function ChatPage() {
  const { id } = useParams();
  const {
    addMessage,
    loadChats,
    createChat,
    currentChatId,
    chats,
    setCurrentChat,
    updateChatTitle,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const stopStreamRef = useRef<(() => void) | null>(null);

  /**
   * [Life Cycle] 채팅 내역 초기 로드
   */
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  /**
   * [Life Cycle] URL 파라미터(id) 변경 시 현재 채팅 세션 활성화
   */
  useEffect(() => {
    if (id && chats.length > 0) {
      setCurrentChat(id);
    }
  }, [id, chats, setCurrentChat]);

  /**
   * [Core Logic] 메시지 전송 및 실시간 AI 응답 스트리밍 핸들러
   */
  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    let targetChatId = currentChatId;

    // 새로운 채팅 세션일 경우 DB에 세션 생성 후 ID 확보
    if (!targetChatId) {
      targetChatId = await createChat();
      if (!targetChatId) return;
    }

    const currentInput = input;
    setInput('');
    setLoading(true);
    setActiveChatId(targetChatId);

    // 1. 사용자 메시지 즉시 반영 및 DB 저장
    await addMessage(targetChatId, {
      role: 'user',
      content: currentInput,
      time: new Date().toISOString(),
    });

    // 2. AI 응답 스트리밍 시작
    stopStreamRef.current = sendMessageStream(
      currentInput,
      ({ full }) => setTyping(full),
      async (finalContent) => {
        // [Finalization] 스트리밍 종료 시 최종 응답 저장
        await addMessage(targetChatId, {
          role: 'assistant',
          content: finalContent,
          time: new Date().toISOString(),
        });

        /**
         * [Feature] 자동 제목 생성 로직
         * 첫 대화(제목이 초기 상태인 경우)일 때 AI를 통해 대화 주제를 요약합니다.
         */
        const currentChat = chats.find((c) => c.id === targetChatId);
        const currentTitle = currentChat?.title || '새로운 채팅';
        const messageCount = currentChat?.messages?.length || 0;

        // 제목이 초기값이거나 메시지가 적은 상태(첫 대화)일 때 트리거
        const isInitialChat = currentTitle.includes('새로운') || messageCount <= 2;

        if (targetChatId && isInitialChat) {
          try {
            const newTitle = await getChatSummary(currentInput);
            if (newTitle && newTitle !== '새로운 대화') {
              await updateChatTitle(targetChatId, newTitle);
            }
          } catch (error) {
            console.error('자동 제목 생성 실패:', error);
          }
        }

        setTyping('');
        setLoading(false);
        setActiveChatId(null);
        stopStreamRef.current = null;
      }
    );
  }, [input, loading, currentChatId, createChat, addMessage, chats, updateChatTitle]);

  /**
   * [UX Logic] AI 응답 스트리밍 중단 처리
   */
  const handleStop = useCallback(async () => {
    const currentId = activeChatId;

    if (stopStreamRef.current && currentId) {
      stopStreamRef.current();
      stopStreamRef.current = null;

      const interruptedContent = typing
        ? `${typing}\n\n> 요청을 중단하였습니다.`
        : '> 요청을 중단하였습니다.';

      await addMessage(currentId, {
        role: 'assistant',
        content: interruptedContent,
        time: new Date().toISOString(),
      });

      setLoading(false);
      setTyping('');
      setActiveChatId(null);
    }
  }, [typing, addMessage, activeChatId]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* 채팅 메시지 출력 영역 */}
      <ChatWindow
        typing={typing}
        loading={loading}
        activeChatId={activeChatId}
        onQuickSend={(q) => {
          setInput(q);
          setTimeout(() => handleSend(), 0);
        }}
      />
      {/* 사용자 입력 제어 영역 */}
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

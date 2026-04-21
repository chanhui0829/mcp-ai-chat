import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';

/* Components & API */
import ChatWindow from '../components/chat/chatWindow';
import ChatInput from '../components/chat/chatInput';
import { useChatStore } from '../store/chat.store';
import { sendMessageStream, getChatSummary } from '../api/mcp';

/**
 * @description 채팅의 메인 비즈니스 로직을 담당하는 페이지 컴포넌트입니다.
 * 스트리밍 통제 및 스토어 데이터 연동을 총괄합니다.
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

  // 채팅 내역 로드 및 현재 채팅 세션 설정
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (id && chats.length > 0) {
      setCurrentChat(id);
    }
  }, [id, chats, setCurrentChat]);

  /**
   * [Core Logic] 메시지 전송 및 실시간 스트리밍 핸들러
   */
  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    let targetChatId = currentChatId;

    if (!targetChatId) {
      targetChatId = await createChat();
      if (!targetChatId) return;
    }

    const currentInput = input;
    setInput('');
    setLoading(true);
    setActiveChatId(targetChatId);

    await addMessage(targetChatId, {
      role: 'user',
      content: currentInput,
      time: new Date().toISOString(),
    });

    stopStreamRef.current = sendMessageStream(
      currentInput,
      ({ full }) => setTyping(full),
      async (finalContent) => {
        await addMessage(targetChatId, {
          role: 'assistant',
          content: finalContent,
          time: new Date().toISOString(),
        });
        const targetChat = chats.find((c) => c.id === targetChatId);
        if (
          targetChat &&
          (targetChat.title === '새로운 채팅' || targetChat.title === '새로운 대화')
        ) {
          try {
            // 서버에 요약 요청 (getChatSummary 함수 활용)
            const newTitle = await getChatSummary(currentInput);
            // 스토어의 updateChatTitle로 DB와 UI 업데이트
            await updateChatTitle(targetChatId, newTitle);
          } catch (error) {
            console.error('제목 생성 실패:', error);
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
   * [UX] 스트리밍 중단 기능
   */
  /**
   * [UX] 스트리밍 중단 기능
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
      <ChatWindow
        typing={typing}
        loading={loading}
        activeChatId={activeChatId}
        onQuickSend={(q) => {
          setInput(q);
          setTimeout(() => handleSend(), 0);
        }}
      />
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

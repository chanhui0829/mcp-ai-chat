'use client';

import { useState, useRef, useCallback } from 'react';
import { useChatStore } from '../lib/store';
import { sendMessageStream, getChatSummary } from '../lib/api/chatApi';

export const useChat = () => {
  const { addMessage, createChat, currentChatId, updateChatTitle } = useChatStore();
  const getState = useChatStore.getState;

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [lastQuickSendText, setLastQuickSendText] = useState<string | null>(null);

  const stopStreamRef = useRef<(() => void) | null>(null);

  // 메시지 전송 로직
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
      id: crypto.randomUUID(),
      role: 'user',
      content: currentInput,
      time: new Date().toISOString(),
    });

    // [Bug Fix] addMessage 이후 최신 상태를 Zustand getState()로 직접 읽어 stale closure 방지
    const freshChats = getState().chats;
    const currentChat = freshChats.find((c) => c.id === targetChatId);
    const history = currentChat?.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })) || [];

    stopStreamRef.current = sendMessageStream(
      currentInput,
      ({ full }) => setTyping(full),
      async (finalContent) => {
        await addMessage(targetChatId!, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: finalContent,
          time: new Date().toISOString(),
        });

        // [Bug Fix] 제목 생성 시에도 getState()로 최신 chats 참조
        const latestChats = getState().chats;
        const latestChat = latestChats.find((c) => c.id === targetChatId);
        const currentTitle = latestChat?.title || '새로운 채팅';
        const isDefaultTitle = currentTitle === '새로운 채팅' || currentTitle === '새로운 대화';

        if (targetChatId && isDefaultTitle) {
          try {
            const newTitle = await getChatSummary(currentInput);
            if (newTitle) await updateChatTitle(targetChatId, newTitle);
          } catch (e) {
            console.error('제목 생성 실패', e);
          }
        }

        setTyping('');
        setLoading(false);
        setActiveChatId(null);
      },
      history
    );
  }, [input, loading, currentChatId, createChat, addMessage, getState, updateChatTitle]);

  // 중단 로직
  const handleStop = useCallback(async () => {
    if (stopStreamRef.current && activeChatId) {
      stopStreamRef.current();
      stopStreamRef.current = null;

      await addMessage(activeChatId, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: typing ? `${typing}\n\n> 중단됨` : '> 중단됨',
        time: new Date().toISOString(),
      });

      setLoading(false);
      setTyping('');
      setActiveChatId(null);
    }
  }, [typing, addMessage, activeChatId]);

  // 퀵 센드 (추천 질문 등)
  const handleQuickSend = useCallback(
    (text: string) => {
      if (lastQuickSendText === text) {
        handleSend();
        setLastQuickSendText(null);
      } else {
        setInput(text);
        setLastQuickSendText(text);
      }
    },
    [lastQuickSendText, handleSend]
  );

  return {
    input,
    setInput,
    typing,
    loading,
    activeChatId,
    handleSend,
    handleStop,
    handleQuickSend,
  };
};
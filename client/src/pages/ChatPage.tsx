import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

import ChatWindow from '../components/chat/chatWindow';
import ChatInput from '../components/chat/chatInput';
import { useChatStore } from '../store/chat.store';
import { sendMessageStream } from '../api/mcp';

function ChatPage() {
  const { addMessage, loadChats, createChat, currentChatId, chats, setCurrentChat } =
    useChatStore();

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState('');
  const [loading, setLoading] = useState(false);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const { id } = useParams();

  const currentRequestId = useRef(0);
  const streamRef = useRef<unknown>(null);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (id && chats.length > 0) {
      setCurrentChat(id);
    }
  }, [id, chats]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (!currentChatId) createChat();

    let targetChatId = currentChatId;

    if (!targetChatId) {
      targetChatId = await createChat();
      if (!targetChatId) return;
    }

    const requestId = ++currentRequestId.current;
    const userInput = input;

    setInput('');
    setLoading(true);
    setTyping('');
    setActiveChatId(targetChatId);

    addMessage({
      role: 'user',
      content: userInput,
      time: new Date().toISOString(),
    });

    sendMessageStream(
      userInput,
      ({ full }) => {
        if (requestId !== currentRequestId.current) return;
        if (loading) setLoading(false);

        setTyping(full);
      },
      (finalText) => {
        if (requestId !== currentRequestId.current) return;

        addMessage({
          role: 'ai',
          content: finalText,
          time: new Date().toISOString(),
        });

        setTyping('');
        setLoading(false);
        setActiveChatId(null);
        streamRef.current = null;
      }
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
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
        onStop={() => {}}
        loading={loading}
      />
    </div>
  );
}

export default ChatPage;

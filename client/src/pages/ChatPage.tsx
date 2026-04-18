import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

import ChatWindow from '../components/chat/chatWindow';
import ChatInput from '../components/chat/chatInput';
import { useChatStore, subscribeChatStorage } from '../store/chat.store';
import { sendMessageStream } from '../api/mcp';

function ChatPage() {
  const { addMessage, loadChats, createChat, currentChatId, chats, setCurrentChat } =
    useChatStore();

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState('');
  const [loading, setLoading] = useState(false);

  const { id } = useParams();

  const currentRequestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    loadChats();
    subscribeChatStorage();
  }, []);

  useEffect(() => {
    if (id && chats.length > 0) {
      setCurrentChat(id);
    }
  }, [id, chats]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (!currentChatId) createChat();

    const requestId = ++currentRequestId.current;

    const userInput = input;

    setInput('');
    setLoading(true);

    addMessage({
      role: 'user',
      content: userInput,
      time: new Date().toISOString(),
    });

    setTyping('');

    sendMessageStream(
      userInput,
      ({ chunk }) => {
        if (requestId !== currentRequestId.current) return;

        if (loading) setLoading(false);

        setTyping((prev) => prev + chunk);
      },
      (fullText) => {
        if (requestId !== currentRequestId.current) return;

        addMessage({
          role: 'ai',
          content: fullText,
          time: new Date().toISOString(),
        });

        setTyping('');
        setLoading(false);
      }
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ChatWindow
        typing={typing}
        loading={loading}
        onQuickSend={(q) => {
          setInput(q);
          setTimeout(() => handleSend(), 0);
        }}
      />

      <ChatInput
        input={input}
        setInput={setInput}
        onSend={handleSend}
        onStop={() => abortRef.current?.abort()}
        loading={loading}
      />
    </div>
  );
}

export default ChatPage;

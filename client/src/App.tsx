import { useEffect, useState } from 'react';
import ChatList from './components/chatList';
import ChatWindow from './components/chatWindow';
import ChatInput from './components/chatInput';
import { useChatStore, subscribeChatStorage } from './store/chat.store';
import { useSendMessage } from './hooks/useChat';

type MCPResponse =
  | string
  | { result?: string }
  | { translated?: string }
  | { summary?: string }
  | { todo?: string }
  | { city?: string; temperature?: string; condition?: string }
  | { time?: string }
  | Record<string, unknown>;

function App() {
  const { addMessage, loadChats, createChat, currentChatId } = useChatStore();
  const { mutateAsync } = useSendMessage();

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChats();
    subscribeChatStorage();
  }, []);

  /**
   * 🔥 타이핑 효과
   */
  const typeMessage = async (text: string) => {
    setTyping('');
    for (let i = 0; i < text.length; i++) {
      await new Promise((r) => setTimeout(r, 10));
      setTyping((prev) => prev + text[i]);
    }
  };

  /**
   * 🔥 응답 포맷
   */
  const formatResponse = (res: MCPResponse): string => {
    if (typeof res === 'string') return res;

    if ('result' in res && typeof res.result === 'string') {
      return res.result;
    }

    if ('translated' in res && res.translated) return `🌐 ${res.translated}`;
    if ('summary' in res && res.summary) return `📝 ${res.summary}`;
    if ('todo' in res && res.todo) return `✅ ${res.todo}`;

    if ('temperature' in res && res.temperature)
      return `🌤️ ${res.city} 날씨: ${res.temperature}, ${res.condition}`;

    if ('time' in res && res.time) return `⏰ 현재 시간: ${res.time}`;

    return JSON.stringify(res);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (!currentChatId) createChat();

    const userInput = input;
    setInput('');

    addMessage({
      role: 'user',
      content: userInput,
      time: new Date().toISOString(),
    });

    setLoading(true);

    try {
      const res = await mutateAsync(userInput);

      console.log('🔥 서버 응답:', res);

      await new Promise((r) => setTimeout(r, 300));

      const formatted = formatResponse(res);

      await typeMessage(formatted);

      addMessage({
        role: 'ai',
        content: formatted,
        time: '',
      });

      setTyping('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      <ChatList />

      <div className="flex-1 flex flex-col max-w-3xl mx-auto">
        <ChatWindow typing={typing} loading={loading} />
        <ChatInput input={input} setInput={setInput} onSend={handleSend} />
      </div>
    </div>
  );
}

export default App;

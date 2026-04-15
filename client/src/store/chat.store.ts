import { create } from 'zustand';

export type Message = {
  role: 'user' | 'ai';
  content: string;
  time: string;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
};

type ChatStore = {
  chats: Chat[];
  currentChatId: string | null;

  createChat: () => string;

  setCurrentChat: (id: string | null) => void;
  addMessage: (msg: Message) => void;
  deleteChat: (id: string) => void;
  loadChats: () => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  currentChatId: null,

  createChat: () => {
    const newId = Date.now().toString();

    const newChat: Chat = {
      id: newId,
      title: '새 채팅',
      messages: [],
    };

    set((state) => ({
      chats: [newChat, ...state.chats],
      currentChatId: newId,
    }));

    return newId;
  },

  setCurrentChat: (id) => set({ currentChatId: id }),

  addMessage: (msg) => {
    const { chats, currentChatId } = get();

    const updated = chats.map((chat) =>
      chat.id === currentChatId
        ? {
            ...chat,
            messages: [...chat.messages, msg],
            title: chat.messages.length === 0 ? msg.content.slice(0, 10) : chat.title,
          }
        : chat
    );

    set({ chats: updated });
  },

  deleteChat: (id) => {
    const filtered = get().chats.filter((c) => c.id !== id);

    set({
      chats: filtered,
      currentChatId: filtered[0]?.id || null,
    });
  },

  loadChats: () => {
    const saved = localStorage.getItem('mcp-chats');
    if (!saved) return;

    const parsed = JSON.parse(saved);

    set({
      chats: parsed,
      currentChatId: parsed[0]?.id || null,
    });
  },
}));

export const subscribeChatStorage = () => {
  useChatStore.subscribe((state) => {
    localStorage.setItem('mcp-chats', JSON.stringify(state.chats));
  });
};

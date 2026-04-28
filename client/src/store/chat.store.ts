import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { getChatSummary } from '../api/mcp';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */
export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
};

interface DBChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  created_at: string;
  session_id: string;
}

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
};

type ChatStore = {
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  loadChats: () => Promise<void>;
  createChat: () => Promise<string | null>;
  setCurrentChat: (id: string | null) => void;
  addMessage: (sessionId: string, msg: Message) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  updateChatTitle: (id: string, newTitle: string) => Promise<void>;
};

/**
 * @description Zustand를 활용한 전역 상태 관리 저장소입니다.
 * Supabase DB와의 동기화를 통해 영구적인 채팅 내역 보존을 담당합니다.
 */
export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  currentChatId: null,
  isLoading: false,

  /* DB 데이터 로드 */
  loadChats: async () => {
    set({ isLoading: true });
    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('*, chat_messages(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('데이터 로드 실패:', error);
      set({ isLoading: false });
      return;
    }

    const formattedChats: Chat[] = sessions.map((s) => ({
      id: s.id,
      title: s.title || '새로운 채팅',
      messages: (s.chat_messages || []).map((m: DBChatMessage) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        time: m.created_at,
      })),
    }));

    set({ chats: formattedChats, isLoading: false });
  },

  /* 세션 제어 */
  setCurrentChat: (id) => set({ currentChatId: id }),

  createChat: async () => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([{ title: '새로운 채팅' }])
      .select()
      .single();

    if (error) return null;
    const newChat: Chat = { id: data.id, title: data.title, messages: [] };
    set((state) => ({ chats: [newChat, ...state.chats], currentChatId: data.id }));
    return data.id;
  },

  /* 메시지 추가 및 영구 저장 */
  addMessage: async (sessionId: string, msg: Message) => {
    const { chats, updateChatTitle } = get();

    const currentChat = chats.find((c) => c.id === sessionId);
    if (!currentChat) return;

    // UI 즉시 업데이트
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === sessionId ? { ...c, messages: [...c.messages, msg] } : c
      ),
    }));

    // DB 저장
    const { error } = await supabase.from('chat_messages').insert([
      {
        session_id: sessionId,
        role: msg.role,
        content: msg.content,
      },
    ]);

    // 3. 제목 자동 생성 로직 (첫 번째 메시지이고, 역할이 'user'일 때만 실행)
    if (msg.role === 'user' && currentChat.messages.length === 0) {
      try {
        const summaryTitle = await getChatSummary(msg.content);
        if (summaryTitle) {
          await updateChatTitle(sessionId, summaryTitle);
        }
      } catch (err) {
        console.error('제목 요약 중 오류:', err);
      }
    }
    if (error) {
      console.error('메시지 저장 에러:', error.message);
    }
  },

  deleteChat: async (id) => {
    const { error } = await supabase.from('chat_sessions').delete().eq('id', id);
    if (error) return;

    const filtered = get().chats.filter((c) => c.id !== id);
    set({
      chats: filtered,
      currentChatId: filtered[0]?.id || null,
    });
  },

  updateChatTitle: async (id, newTitle) => {
    await supabase.from('chat_sessions').update({ title: newTitle }).eq('id', id);
    set((state) => ({
      chats: state.chats.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
    }));
  },
}));

import { create } from 'zustand';
import { chatService } from '../features/chat/services/chatService';
import { getChatSummary } from '../features/chat/api/chatApi';
import type { Chat, Message, DBChatMessage } from '../features/chat/types/chat';

/**
 * [Zustand Store Interface]
 * 상태(State)와 행위(Actions)를 명확히 분리하여 스토어의 역할을 정의합니다.
 */
interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
}

interface ChatActions {
  loadChats: () => Promise<void>;
  createChat: () => Promise<string | null>;
  setCurrentChat: (id: string | null) => void;
  addMessage: (sessionId: string, msg: Message) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  updateChatTitle: (id: string, newTitle: string) => Promise<void>;
}

interface ChatSessionResponse {
  id: string;
  title: string | null;
  chat_messages: DBChatMessage[];
}

/**
 * @description 채팅 도메인 전역 상태 관리 스토어
 * [Technical Point]
 * 1. Layered Architecture: DB 통신 로직은 Service 레이어로 위임하여 결합도를 낮춤.
 * 2. Data Transformation: DB의 raw 데이터를 UI 친화적인 도메인 모델로 변환하여 관리.
 * 3. Optimistic Updates: 사용자 경험 향상을 위해 서버 응답 전 UI를 선제적으로 업데이트함.
 */
export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  /* --- Initial State --- */
  chats: [],
  currentChatId: null,
  isLoading: false,

  /* --- Actions --- */

  /**
   * 전체 채팅 세션 로드 및 초기화
   * [Performance] API 응답 데이터를 Service 레이어의 Mapper를 통해 규격화된 타입으로 정제합니다.
   */
  loadChats: async () => {
    set({ isLoading: true });
    try {
      const sessions = await chatService.fetchSessions();

      const formattedChats: Chat[] = (sessions as ChatSessionResponse[]).map((s) => ({
        id: s.id,
        title: s.title || '새로운 채팅',
        // DB Raw 데이터를 도메인 Message 타입으로 매핑
        messages: chatService.mapMessages(s.chat_messages || []),
      }));

      set({ chats: formattedChats });
    } catch (error) {
      console.error('[Store: loadChats Error]', error);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 현재 활성화된 채팅 세션 설정
   */
  setCurrentChat: (id) => set({ currentChatId: id }),

  /**
   * 새로운 채팅 세션 생성
   * 생성 즉시 로컬 상태에 반영하여 대화 시작 지연 시간을 최소화합니다.
   */
  createChat: async () => {
    try {
      const data = await chatService.createSession('새로운 채팅');
      const newChat: Chat = { id: data.id, title: data.title, messages: [] };

      set((state) => ({
        chats: [newChat, ...state.chats],
        currentChatId: data.id,
      }));

      return data.id;
    } catch (error) {
      console.error('[Store: createChat Error]', error);
      return null;
    }
  },

  /**
   * 메시지 추가 및 영구 저장
   * [UX Strategy] 낙관적 업데이트를 적용하여 실시간 대화 흐름의 속도감을 확보합니다.
   */
  addMessage: async (sessionId: string, msg: Message) => {
    const { chats, updateChatTitle } = get();
    const currentChat = chats.find((c) => c.id === sessionId);
    if (!currentChat) return;

    // 1. [Optimistic Update] UI 상태를 먼저 업데이트
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === sessionId ? { ...c, messages: [...c.messages, msg] } : c
      ),
    }));

    try {
      // 2. 서버 영구 저장 (Service 레이어 활용)
      await chatService.saveMessage(sessionId, msg);

      // 3. [Feature] 첫 사용자 메시지에 대한 제목 자동 요약
      if (msg.role === 'user' && currentChat.messages.length === 0) {
        const summaryTitle = await getChatSummary(msg.content);
        if (summaryTitle) {
          await updateChatTitle(sessionId, summaryTitle);
        }
      }
    } catch (error) {
      // 실무에서는 여기서 에러 발생 시 UI를 롤백하거나 에러 토스트를 띄우는 로직을 추가합니다.
      console.error('[Store: addMessage Sync Error]', error);
    }
  },

  /**
   * 채팅 세션 삭제
   */
  deleteChat: async (id) => {
    try {
      await chatService.deleteSession(id);

      const filtered = get().chats.filter((c) => c.id !== id);
      set({
        chats: filtered,
        currentChatId: filtered[0]?.id || null,
      });
    } catch (error) {
      console.error('[Store: deleteChat Error]', error);
    }
  },

  /**
   * 채팅 제목 수동/자동 업데이트
   */
  updateChatTitle: async (id, newTitle) => {
    try {
      await chatService.updateSessionTitle(id, newTitle);

      set((state) => ({
        chats: state.chats.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
      }));
    } catch (error) {
      console.error('[Store: updateChatTitle Error]', error);
    }
  },
}));

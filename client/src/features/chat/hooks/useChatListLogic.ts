import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../../store/chat.store';

/**
 * @description ChatList 컴포넌트의 비즈니스 로직을 관리하는 커스텀 훅
 * @param setSidebarOpen 사이드바 열림/닫힘 상태 제어 함수 (반응형 UX 대응용)
 * [Technical Point]
 * 1. Logic Separation: UI와 로직을 분리하여 컴포넌트 비대화를 방지하고 가독성을 확보함.
 * 2. Optimized Handlers: useCallback을 통해 핸들러 함수 재생성을 방지하여 자식 컴포넌트(ChatItem)의 불필요한 리렌더링 최적화.
 * 3. Responsive UX: 모바일 환경에서 항목 선택 시 사이드바를 자동으로 닫아주는 사용자 경험(UX) 로직 내장.
 */
export const useChatListLogic = (setSidebarOpen: (v: boolean) => void) => {
  const navigate = useNavigate();
  const { chats, currentChatId, createChat, setCurrentChat, updateChatTitle } = useChatStore();

  /* --- UI 관련 로컬 상태 --- */
  const [search, setSearch] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  /* --- DOM 참조 (외부 클릭 감지용) --- */
  const menuRef = useRef<HTMLDivElement | null>(null);
  const editRef = useRef<HTMLDivElement | null>(null);

  /**
   * [Search Optimization]: 실시간 검색 필터링 (메모이제이션 적용)
   */
  const filteredChats = useMemo(() => {
    const keyword = search.toLowerCase();
    return chats.filter((chat) => chat.title.toLowerCase().includes(keyword));
  }, [chats, search]);

  /**
   * [UX Handler]: 채팅방 선택 시 이동 및 사이드바 제어
   */
  const handleChatSelect = useCallback(
    (id: string) => {
      setCurrentChat(id);
      navigate(`/chat/${id}`);
      // [UX] 데스크탑은 CSS(md:relative)에 의해 고정되지만, 모바일에서는 사이드바를 닫아 대화창에 집중하게 함.
      setSidebarOpen(false);
    },
    [navigate, setCurrentChat, setSidebarOpen]
  );

  /**
   * [UX Handler]: 신규 채팅 생성
   */
  const handleCreateChat = useCallback(async () => {
    const newId = await createChat();
    if (newId) {
      navigate(`/chat/${newId}`);
      setSidebarOpen(false);
    }
  }, [createChat, navigate, setSidebarOpen]);

  /**
   * [Business Logic]: 채팅 제목 업데이트
   */
  const handleSaveEdit = useCallback(async () => {
    if (!editingId || !editValue.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await updateChatTitle(editingId, editValue.trim());
    } finally {
      setEditingId(null);
      setEditValue('');
    }
  }, [editingId, editValue, updateChatTitle]);

  /**
   * [Interaction]: 외부 영역 클릭 시 메뉴 닫기 및 편집 완료 처리
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // 컨텍스트 메뉴 외부 클릭 시 닫기
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpenId(null);
      // 편집 모드 중 외부 클릭 시 자동 저장
      if (editRef.current && !editRef.current.contains(target)) {
        if (editingId) handleSaveEdit();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingId, handleSaveEdit]);

  return {
    state: { search, menuOpenId, editingId, editValue, filteredChats, currentChatId },
    actions: {
      setSearch,
      setMenuOpenId,
      setEditingId,
      setEditValue,
      handleSaveEdit,
      handleCreateChat,
      handleChatSelect,
    },
    refs: { menuRef, editRef },
  };
};

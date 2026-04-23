import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiMoreVertical,
  FiTrash2,
  FiEdit2,
  FiSearch,
  FiMessageSquare,
} from 'react-icons/fi';

/* Stores: Zustand를 활용한 상태 관리 연동 */
import { useChatStore } from '../../store/chat.store';

/**
 * Interface Definitions
 */
interface Chat {
  id: string;
  title: string;
}

type Props = {
  setDeleteTargetId: (id: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
};

// ChatItem 컴포넌트를 위한 상세 타입 정의
interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  isEditing: boolean;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  setEditingId: (id: string | null) => void;
  setEditValue: (value: string) => void;
  editValue: string;
  handleSaveEdit: () => Promise<void>;
  setDeleteTargetId: (id: string) => void;
  setCurrentChat: (id: string | null) => void;
  setSidebarOpen: (v: boolean) => void;
  navigate: (path: string) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  editRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * ChatList Component
 * @description 채팅 세션 관리, 검색 필터링 및 UI/UX 인터랙션을 담당하는 사이드바 컴포넌트
 * @optimization useMemo 및 React.memo를 활용하여 대량의 리스트 렌더링 성능 최적화 완료
 */
export default function ChatList({ setDeleteTargetId, sidebarOpen, setSidebarOpen }: Props) {
  const navigate = useNavigate();
  const { chats, currentChatId, createChat, setCurrentChat, updateChatTitle } = useChatStore();

  /* Local UI States */
  const [search, setSearch] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const menuRef = useRef<HTMLDivElement | null>(null);
  const editRef = useRef<HTMLDivElement | null>(null);

  /**
   * [Optimization]: 연산 부하가 큰 필터링 로직에 useMemo 적용
   */
  const filteredChats = useMemo(() => {
    const keyword = search.toLowerCase();
    return chats.filter((chat: Chat) => chat.title.toLowerCase().includes(keyword));
  }, [chats, search]);

  /**
   * [Business Logic]: 채팅 제목 업데이트 처리
   */
  const handleSaveEdit = useCallback(async () => {
    if (!editingId || !editValue.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await updateChatTitle(editingId, editValue.trim());
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setEditingId(null);
      setEditValue('');
    }
  }, [editingId, editValue, updateChatTitle]);

  /**
   * [UX]: 신규 채팅 생성 및 페이지 이동 핸들러
   */
  const handleCreateChat = useCallback(async () => {
    const newId = await createChat();
    if (newId) {
      navigate(`/chat/${newId}`);
      setSidebarOpen(false);
    }
  }, [createChat, navigate, setSidebarOpen]);

  /**
   * [Event Handling]: 외부 클릭 감지 및 키보드 접근성(ESC) 대응
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpenId(null);
      if (editRef.current && !editRef.current.contains(target)) {
        if (editingId) handleSaveEdit();
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingId(null);
        setEditValue('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [editingId, handleSaveEdit]);

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-zinc-50/80 backdrop-blur-2xl border-r border-zinc-200/50 
        transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}
    >
      <div className="flex flex-col h-full px-5 py-6">
        {/* Main CTA Button */}
        <div className="mb-8">
          <button
            onClick={handleCreateChat}
            className="
              relative group w-full py-3.5 flex items-center justify-center gap-2.5
              bg-zinc-900 hover:bg-zinc-800 text-zinc-50 rounded-2xl font-semibold
              shadow-[0_10px_20px_-10px_rgba(24,24,27,0.3)] transition-all duration-300
              active:scale-[0.96] overflow-hidden
            "
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-center bg-white/10 rounded-lg p-1">
              <FiPlus strokeWidth={3} size={16} />
            </div>
            <span className="relative tracking-tight">New Conversation</span>
          </button>
        </div>

        {/* Search Input Area */}
        <div className="relative mb-10">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
            <FiSearch size={16} />
          </div>
          <input
            type="text"
            placeholder="기록 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full pl-11 pr-4 py-3 bg-white border border-zinc-200/50 rounded-2xl text-sm
              shadow-[0_2px_10px_rgba(0,0,0,0.02)] outline-none transition-all duration-300
              placeholder:text-zinc-400 focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900/20
            "
          />
        </div>

        {/* List Label Section */}
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">
            History
          </span>
          <span className="h-px flex-1 bg-zinc-200/60 ml-4" />
        </div>

        {/* Scrollable Chat History List */}
        <div className="flex-1 overflow-y-auto space-y-1 sidebar-scroll pr-1">
          {filteredChats.map((chat: Chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isSelected={chat.id === currentChatId}
              isEditing={editingId === chat.id}
              menuOpenId={menuOpenId}
              setMenuOpenId={setMenuOpenId}
              setEditingId={setEditingId}
              setEditValue={setEditValue}
              editValue={editValue}
              handleSaveEdit={handleSaveEdit}
              setDeleteTargetId={setDeleteTargetId}
              setCurrentChat={setCurrentChat}
              setSidebarOpen={setSidebarOpen}
              navigate={navigate}
              menuRef={menuRef}
              editRef={editRef}
            />
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 pt-6 border-t border-zinc-200/50">
          <button
            className="
              group w-full flex items-center justify-between px-5 py-4 rounded-2xl 
              bg-white border border-zinc-200/60 shadow-sm hover:shadow-md 
              text-zinc-900 text-[13px] font-bold transition-all active:scale-[0.98]
            "
            onClick={() => {
              setCurrentChat(null);
              navigate('/case-study');
              setSidebarOpen(false);
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Project Insight</span>
            </div>
            <span className="text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all">
              →
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}

/**
 * [Optimization]: 개별 채팅 아이템 메모이제이션
 */
const ChatItem = memo(
  ({
    chat,
    isSelected,
    isEditing,
    menuOpenId,
    setMenuOpenId,
    setEditingId,
    setEditValue,
    editValue,
    handleSaveEdit,
    setDeleteTargetId,
    setCurrentChat,
    setSidebarOpen,
    navigate,
    menuRef,
    editRef,
  }: ChatItemProps) => {
    return (
      <div
        className={`
        group relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-200
        ${
          isSelected
            ? 'bg-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.08)] ring-1 ring-zinc-200/50'
            : 'hover:bg-zinc-200/40 text-zinc-500 hover:text-zinc-900'
        }
      `}
        onClick={() => {
          if (isEditing) return;
          navigate(`/chat/${chat.id}`);
          setCurrentChat(chat.id);
          setSidebarOpen(false);
        }}
      >
        <FiMessageSquare className={isSelected ? 'text-zinc-900' : 'text-zinc-400'} size={18} />

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div ref={editRef} className="w-full">
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                className="w-full bg-zinc-100 border-none rounded-lg px-2 py-1 text-sm outline-none ring-2 ring-zinc-900/10"
                autoFocus
              />
            </div>
          ) : (
            <span
              className={`text-[13.5px] truncate block ${
                isSelected ? 'font-bold text-zinc-900' : 'font-medium'
              }`}
            >
              {chat.title}
            </span>
          )}
        </div>

        {!isEditing && (
          <div className="relative shrink-0" ref={menuOpenId === chat.id ? menuRef : null}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(menuOpenId === chat.id ? null : chat.id);
              }}
              className={`p-1.5 rounded-xl hover:bg-zinc-100 transition ${
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <FiMoreVertical size={14} className="text-zinc-400" />
            </button>

            {menuOpenId === chat.id && (
              <div className="absolute right-0 top-10 z-[100] w-40 bg-white border border-zinc-200/60 rounded-2xl shadow-2xl py-2 animate-in slide-in-from-top-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(chat.id);
                    setEditValue(chat.title);
                    setMenuOpenId(null);
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[12px] text-zinc-600 hover:bg-zinc-50 transition"
                >
                  <FiEdit2 size={13} /> 제목 수정
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTargetId(chat.id);
                    setMenuOpenId(null);
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[12px] text-red-500 hover:bg-red-50 transition"
                >
                  <FiTrash2 size={13} /> 삭제
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

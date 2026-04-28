import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiMoreVertical,
  FiTrash2,
  FiEdit2,
  FiSearch,
  FiMessageSquare,
  FiBookOpen, // 케이스 스터디 아이콘 추가
} from 'react-icons/fi';

import { useChatListLogic } from '../hooks/useChatListLogic';
import type { Chat } from '../types/chat';

interface ChatListProps {
  setDeleteTargetId: (id: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

/**
 * @description 채팅 히스토리 및 내비게이션을 담당하는 사이드바 컴포넌트
 * [Portfolio Highlights]
 * 1. Logic Separation: useChatListLogic 커스텀 훅을 통한 관심사 분리(SoC).
 * 2. Adaptive UI: 모바일과 데스크탑 환경에 최적화된 반응형 레이아웃 제공.
 * 3. User Experience: 하단 고정 메뉴를 통해 기술적 자산(Case Study)에 대한 접근성 강화.
 */
export default function ChatList({
  setDeleteTargetId,
  sidebarOpen,
  setSidebarOpen,
}: ChatListProps) {
  const navigate = useNavigate();
  const { state, actions, refs } = useChatListLogic(setSidebarOpen);

  return (
    <aside
      className={`
      fixed inset-y-0 left-0 z-40 w-80 bg-zinc-50/80 backdrop-blur-2xl border-r border-zinc-200/50 
      transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:relative md:translate-x-0
      ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
    `}
    >
      <div className="flex flex-col h-full px-5 py-6">
        {/* 상단: 액션 버튼 영역 */}
        <div className="mb-8">
          <button
            onClick={actions.handleCreateChat}
            className="group w-full py-3.5 flex items-center justify-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-50 rounded-2xl font-semibold shadow-lg transition-all active:scale-[0.96]"
          >
            <FiPlus size={16} />
            <span>New Conversation</span>
          </button>
        </div>

        {/* 중단: 필터링 검색 영역 */}
        <div className="relative mb-10">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="기록 검색..."
            value={state.search}
            onChange={(e) => actions.setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200/50 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all"
          />
        </div>

        {/* 메인: 채팅 히스토리 리스트 (Scroll Area) */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {state.filteredChats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isSelected={chat.id === state.currentChatId}
              isEditing={state.editingId === chat.id}
              menuOpenId={state.menuOpenId}
              setMenuOpenId={actions.setMenuOpenId}
              setEditingId={actions.setEditingId}
              setEditValue={actions.setEditValue}
              editValue={state.editValue}
              handleSaveEdit={actions.handleSaveEdit}
              setDeleteTargetId={setDeleteTargetId}
              onSelect={() => actions.handleChatSelect(chat.id)}
              menuRef={refs.menuRef}
              editRef={refs.editRef}
            />
          ))}
        </div>

        {/* 하단: 케이스 스터디 이동 버튼 (Fixed Bottom) */}
        <div className="mt-auto pt-6 border-t border-zinc-200/50">
          <button
            onClick={() => {
              navigate('/case-study');
              setSidebarOpen(false); // 이동 시 모바일 사이드바 닫기
            }}
            className="flex items-center gap-3.5 w-full px-4 py-4 rounded-2xl text-zinc-500 hover:bg-zinc-900 hover:text-white hover:shadow-md transition-all duration-300 group"
          >
            <FiBookOpen size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[14px] font-bold tracking-tight">Technical Case Study</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

/* --- 하위 컴포넌트: ChatItem (개별 리스트 아이템) --- */
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
  onSelect: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  editRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * [Optimization] React.memo를 사용하여 불필요한 리렌더링을 방지
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
    onSelect,
    menuRef,
    editRef,
  }: ChatItemProps) => {
    return (
      <div
        className={`group relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl cursor-pointer transition-all ${
          isSelected ? 'bg-white shadow-sm ring-1 ring-zinc-200/50' : 'hover:bg-zinc-200/40'
        }`}
        onClick={onSelect}
      >
        <FiMessageSquare className={isSelected ? 'text-zinc-900' : 'text-zinc-400'} size={18} />

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div ref={editRef} onClick={(e) => e.stopPropagation()}>
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                className="w-full bg-zinc-100 rounded-lg px-2 py-1 text-sm outline-none ring-2 ring-zinc-900/10"
                autoFocus
              />
            </div>
          ) : (
            <span
              className={`text-[13.5px] truncate block ${
                isSelected ? 'font-bold text-zinc-900' : 'text-zinc-500'
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
              className={`p-1.5 rounded-xl hover:bg-zinc-100 transition-all ${
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <FiMoreVertical size={14} className="text-zinc-400" />
            </button>

            {menuOpenId === chat.id && (
              <div className="absolute right-0 top-10 z-[100] w-32 bg-white border border-zinc-200 rounded-xl shadow-xl py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(chat.id);
                    setEditValue(chat.title);
                    setMenuOpenId(null);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-[12px] text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  <FiEdit2 size={12} /> 수정
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTargetId(chat.id);
                    setMenuOpenId(null);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-[12px] text-red-500 hover:bg-red-50 transition-colors"
                >
                  <FiTrash2 size={12} /> 삭제
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

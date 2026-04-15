import { useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import { useChatStore } from '../store/chat.store';
import { useNavigate } from 'react-router-dom';

type Props = {
  setDeleteTargetId: (id: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
};

export default function ChatList({ setDeleteTargetId, sidebarOpen, setSidebarOpen }: Props) {
  const navigate = useNavigate();

  const { chats, currentChatId, createChat, setCurrentChat } = useChatStore();
  const [search, setSearch] = useState('');

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    // 🔥 여기 교체된 부분 (핵심)
    <div
      className={`
        fixed md:static z-40
        w-[260px] h-full bg-white border-r p-4 flex flex-col
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}
    >
      {/* 🔥 모바일에서 사이드바 클릭하면 닫히게 */}

      <div className="md:hidden flex justify-end mb-2">
        <button onClick={() => setSidebarOpen(false)}>✕</button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 검색어를 입력해주세요"
        className="mb-3 pl-3 p-2 border rounded-lg text-sm"
      />

      <button
        onClick={() => {
          const newId = createChat();

          navigate(`/chat/${newId}`);
          setSidebarOpen(false);
        }}
        className="w-full flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-400 text-white py-2 rounded-lg mb-4"
      >
        <FiPlus /> 새 채팅
      </button>

      <div className="text-xs text-left text-gray-400 mb-2 px-1">최근</div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border-l-4 ${
              chat.id === currentChatId
                ? 'bg-gray-100 border-blue-500 text-gray-900'
                : 'border-transparent hover:bg-gray-50'
            }`}
          >
            <div
              onClick={() => {
                navigate(`/chat/${chat.id}`);
                setTimeout(() => {
                  setCurrentChat(chat.id);
                  setSidebarOpen(false); // 🔥 모바일에서 선택하면 닫힘
                }, 0);
              }}
              className="flex-1 truncate text-left text-sm"
            >
              {chat.title}
            </div>

            <FiX
              size={14}
              className="cursor-pointer text-gray-400 hover:text-gray-600"
              onClick={() => setDeleteTargetId(chat.id)}
            />
          </div>
        ))}
      </div>

      <div className="pt-2 mt-2 border-t">
        <div className="text-xs text-gray-400 mb-1 px-1">Case Study</div>

        <button
          className="w-full text-left px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm transition"
          onClick={() => {
            setCurrentChat(null);
            navigate('/case-study');
            setSidebarOpen(false); // 🔥 이것도 중요
          }}
        >
          👉 프로젝트 보기
        </button>
      </div>
    </div>
  );
}

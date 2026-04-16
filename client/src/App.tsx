import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import ChatList from './components/chat/chatList';
import ChatPage from './pages/ChatPage';
import CaseStudy from './pages/CaseStudy';
import { useChatStore } from './store/chat.store';

function App() {
  const { deleteChat } = useChatStore();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="h-screen flex bg-gray-50">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <ChatList
          setDeleteTargetId={setDeleteTargetId}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 🔥 모바일 헤더 (여기로 이동) */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white">
            <div className="flex gap-2 text-gray-800 font-semibold text-lg">
              <span>💬</span>
              <span>FlowChat</span>
            </div>

            <button onClick={() => setSidebarOpen(true)} className="text-2xl">
              ☰
            </button>
          </div>

          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/chat/:id" element={<ChatPage />} />
            <Route path="/case-study" element={<CaseStudy />} />
          </Routes>
        </div>

        {deleteTargetId && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5">
              <div className="text-lg font-semibold mb-2">채팅 삭제</div>

              <div className="text-sm text-gray-600 mb-4">정말 이 채팅을 삭제하시겠습니까?</div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="px-3 py-1.5 text-sm rounded-md border hover:bg-gray-100"
                >
                  취소
                </button>

                <button
                  onClick={() => {
                    deleteChat(deleteTargetId);
                    setDeleteTargetId(null);
                  }}
                  className="px-3 py-1.5 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;

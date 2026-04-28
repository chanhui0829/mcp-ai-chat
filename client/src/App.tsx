import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { FiTrash2 } from 'react-icons/fi';

/* --- Components & Domain Logic --- */
import ChatList from './features/chat/components/ChatList';
import ChatPage from './pages/ChatPage';
import CaseStudy from './pages/CaseStudy';
import { useChatStore } from './store/chat.store';
import Logo from './assets/Logo';

/**
 * [Main Layout Component]
 * 애플리케이션의 전체 레이아웃 구조와 전역 UI 상태(모달, 사이드바)를 제어합니다.
 * * [Key Points]
 * 1. State Lifting: 여러 컴포넌트에서 공유하는 '삭제 대상 ID'와 '사이드바 상태'를 상위에서 관리.
 * 2. Responsive Design: 모바일 대응을 위한 사이드바 제어 로직 및 헤더 내비게이션 구현.
 * 3. Portal-like Modal: 사용자 실수 방지를 위한 인터렉티브 삭제 확인 모달 구현.
 */
function App() {
  const navigate = useNavigate();
  const { deleteChat } = useChatStore();

  // 전역 UI 상태 관리
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /**
   * [Business Logic] 채팅 세션 삭제 처리
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (deleteTargetId) {
      await deleteChat(deleteTargetId);
      setDeleteTargetId(null);
      // 삭제 후 메인으로 이동하여 데이터 무결성 유지
      navigate('/chat', { replace: true });
    }
  }, [deleteTargetId, deleteChat, navigate]);

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden font-sans text-slate-900">
      {/* [Overlay] 모바일 사이드바 활성화 시 배경 처리 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* [Navigation] 채팅 히스토리 사이드바 */}
      <ChatList
        setDeleteTargetId={setDeleteTargetId}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* [Mobile Header] 모바일 환경 전용 내비게이션 상단 바 */}
        <header className="md:hidden flex items-center justify-between px-5 py-3 border-b bg-white/80 backdrop-blur-md">
          <div
            className="flex items-center gap-2 shrink-0 cursor-pointer"
            onClick={() => navigate('/chat')}
          >
            <Logo className="w-8 h-8 animate-pulse text-zinc-900" />
            <span className="text-xl font-extrabold tracking-tighter text-zinc-900">FlowChat</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
            aria-label="메뉴 열기"
          >
            <span className="text-2xl">☰</span>
          </button>
        </header>

        {/* [Routing Area] 페이지 콘텐츠 영역 */}
        <Routes>
          {/* 기본 경로 접속 시 채팅 메인으로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/chat" replace />} />

          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:id" element={<ChatPage />} />
          <Route path="/case-study" element={<CaseStudy />} />

          {/* 예외 경로 처리 (404 등) */}
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </main>

      {/* [Global Modal] 삭제 확인 대화상자 */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setDeleteTargetId(null)}
          />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-[360px] p-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <FiTrash2 size={28} className="text-red-500" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">채팅을 삭제할까요?</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">
                삭제된 채팅은 복구할 수 없습니다.
                <br />
                정말 삭제하시겠습니까?
              </p>

              <div className="flex flex-col w-full gap-2">
                <button
                  onClick={handleDeleteConfirm}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all active:scale-[0.98] shadow-lg shadow-red-200"
                >
                  네, 삭제할게요
                </button>
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="w-full py-4 bg-zinc-100 text-slate-500 rounded-2xl font-bold hover:bg-zinc-200 transition-all active:scale-[0.98]"
                >
                  아니요, 취소할게요
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

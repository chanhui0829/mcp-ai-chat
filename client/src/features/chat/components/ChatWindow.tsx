import { useState } from 'react';
import { Streamdown } from 'streamdown';
import Logo from '../../../assets/Logo';
import { useChatStore } from '../../../store/chat.store';
import { useChatScroll } from '../hooks/useChatScroll';
import { markdownComponents } from '../../../components/common/markdown/markdownComponents';
import { isSameDay } from '../utils/dateHelpers';
import MessageItem from './MessageItem';
import WelcomeScreen from './WelcomeScreen';

interface ChatWindowProps {
  typing: string; // AI 응답 스트리밍 텍스트
  loading: boolean; // 응답 대기 상태 여부
  activeChatId: string | null; // 현재 응답이 진행 중인 채팅 세션 ID
  onQuickSend: (text: string) => void; // 웰컴 스크린 질문 제안 핸들러
}

/**
 * @description 채팅 메시지 목록 및 실시간 스트리밍 응답을 시각화하는 핵심 컴포넌트
 * [Key Logic & UX]
 * 1. Infinite Scroll & Auto-Scroll: useChatScroll을 통해 새로운 메시지 유입 시 사용자 경험 최적화.
 * 2. Real-time Streaming Render: Streamdown 라이브러리를 활용하여 마크다운 형식을 실시간 렌더링.
 * 3. Conditional Rendering: 대화 내역 유무에 따라 WelcomeScreen과 MessageList를 전환.
 */
export default function ChatWindow({
  typing,
  loading,
  activeChatId,
  onQuickSend,
}: ChatWindowProps) {
  /* --- 데이터 및 상태 관리 --- */
  const { chats, currentChatId } = useChatStore();
  const currentChat = chats.find((c) => c.id === currentChatId);

  // 현재 보고 있는 채팅방이 AI 응답이 생성되고 있는 곳인지 판단
  const isProcessingHere = currentChatId === activeChatId;
  // 새로운 대화 시작 여부 판단 (메시지, 로딩, 타이핑 내역이 없을 때)
  const isNewChat = !currentChat?.messages.length && !typing && !loading;

  // 마지막 메시지 중복 표시 방지 로직 (스트리밍 완료 시점 최적화)
  const lastMessage = currentChat?.messages[currentChat.messages.length - 1];
  const isLastMessageStreaming =
    lastMessage?.role === 'assistant' && lastMessage.content === typing;

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  /** * [Performance] 최신 대화 흐름 유지를 위해 최근 메시지 슬라이싱 및
   * 메시지 변화 감지에 따른 스크롤 핸들링
   */
  const displayMessages = currentChat?.messages ? currentChat.messages.slice(-20) : []; // 상향 조정 권장 (기존 -10)
  const { scrollRef, handleScroll } = useChatScroll([displayMessages, typing]);

  /**
   * [Feature] 클립보드 복사 유틸리티
   */
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className={`flex-1 h-full w-full bg-white relative ${
        isNewChat ? 'overflow-hidden' : 'overflow-y-auto sidebar-scroll'
      } px-4 md:px-10`}
    >
      {isNewChat ? (
        /* 초기 진입 시 웰컴 스크린 가이드 */
        <WelcomeScreen onQuickSend={onQuickSend} />
      ) : (
        <div className="max-w-4xl mx-auto space-y-10 py-10">
          {/* 메시지 히스토리 렌더링 */}
          {displayMessages.map((msg, i) => (
            <MessageItem
              key={msg.id || i}
              index={i}
              msg={msg}
              isUser={msg.role === 'user'}
              // 날짜 변경 시점에만 구분선 표시를 위한 로직
              showDate={
                !displayMessages[i - 1] || !isSameDay(displayMessages[i - 1].time, msg.time)
              }
              onCopy={copyToClipboard}
              copiedIndex={copiedIndex}
            />
          ))}

          {/* [Streaming UI] AI 응답 스트리밍 및 로딩 인디케이터 */}
          {isProcessingHere && (loading || typing) && !isLastMessageStreaming && (
            <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* AI 브랜드 아이콘 */}
              <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-900 shadow-sm">
                <Logo className="w-5 h-5 animate-pulse" />
              </div>

              {/* 응답 버블 영역 */}
              <div className="w-fit max-w-[85%] md:max-w-[75%] px-6 py-5 rounded-2xl bg-white border border-zinc-100 shadow-xl rounded-tl-none">
                {/* 1. 생각 중인 상태 (Skeleton 애니메이션) */}
                {loading && !typing && (
                  <div className="flex gap-1.5 items-center h-6">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${d * 0.2}s` }}
                      />
                    ))}
                  </div>
                )}

                {/* 2. 스트리밍 렌더링 상태 (Markdown 연동) */}
                {typing && (
                  <div className="leading-7 text-[14.5px] text-zinc-800">
                    <Streamdown mode="streaming" components={markdownComponents}>
                      {typing}
                    </Streamdown>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

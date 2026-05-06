import { useState, useCallback, memo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
const ChatWindow = memo(function ChatWindow({
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

  /**
   * [Feature] 클립보드 복사 유틸리티
   * [Optimization] useCallback으로 메모이제이션하여 불필요한 재생성 방지
   */
  const copyToClipboard = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }, []);

  /** * [Performance] 가상 스크롤을 위한 메시지 목록
   * @tanstack/react-virtual의 useVirtualizer를 사용하여 대량의 메시지도 효율적으로 렌더링
   */
  const displayMessages = currentChat?.messages || [];
  const { scrollRef, handleScroll } = useChatScroll([displayMessages, typing]);

  /**
   * [Virtual Scroll] 가상 스크롤을 위한 전체 아이템 목록
   * 스트리밍 중인 메시지도 포함하여 가상 스크롤 내에서 위치 계산
   */
  const virtualItems = isProcessingHere && (loading || typing) && !isLastMessageStreaming
    ? [
        ...displayMessages,
        {
          id: 'streaming',
          role: 'assistant' as const,
          content: typing,
          time: new Date().toISOString(),
          isStreaming: true,
        },
      ]
    : displayMessages;

  /**
   * [Virtual Scroll] 가상 스크롤 컨테이너 참조
   */
  const parentRef = useRef<HTMLDivElement>(null);

  /**
   * [Virtual Scroll] 가상 스크롤 설정
   */
  const virtualizer = useVirtualizer({
    count: virtualItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150,
    overscan: 5,
  });


  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className={`flex-1 h-full w-full bg-white relative ${
        isNewChat ? 'overflow-hidden' : 'overflow-hidden'
      } px-4 md:px-10`}
    >
      {isNewChat ? (
        /* 초기 진입 시 웰컴 스크린 가이드 */
        <WelcomeScreen onQuickSend={onQuickSend} />
      ) : (
        <div className="max-w-4xl mx-auto pt-4 h-full flex flex-col">
          {/* [Virtual Scroll] 메시지 히스토리 렌더링 */}
          <div
            ref={parentRef}
            className="overflow-y-auto sidebar-scroll"
            style={{ height: scrollRef.current?.clientHeight || 600 }}
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const msg = virtualItems[virtualItem.index];
                if (!msg) return null;

                // 스트리밍 메시지인 경우 별도 렌더링
                if ('isStreaming' in msg && msg.isStreaming) {
                  return (
                    <div
                      key={virtualItem.key}
                      data-index={virtualItem.index}
                      ref={virtualizer.measureElement}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-900 shadow-sm">
                          <Logo className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="w-fit max-w-[85%] md:max-w-[75%] px-6 py-5 rounded-2xl bg-white border border-zinc-100 shadow-xl rounded-tl-none">
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
                          {typing && (
                            <div className="leading-7 text-[14.5px] text-zinc-800">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                {typing}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <MessageItem
                      index={virtualItem.index}
                      msg={msg}
                      isUser={msg.role === 'user'}
                      showDate={
                        !virtualItems[virtualItem.index - 1] ||
                        !isSameDay((virtualItems[virtualItem.index - 1] as any).time, msg.time)
                      }
                      onCopy={copyToClipboard}
                      copiedIndex={copiedIndex}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';
export default ChatWindow;

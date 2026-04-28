import { useState, memo } from 'react'; // memo 추가
import { Streamdown } from 'streamdown';
import { FiCopy, FiCheck, FiUser } from 'react-icons/fi';

/* Components & Stores */
import { useChatStore } from '../../store/chat.store';
import MarkdownRenderer from '../markdown/MarkdownRenderer';
import { markdownComponents } from '../markdown/markdownComponents';
import Logo from '../common/Logo';

/* Hooks */
import { useChatScroll } from '../../hooks/useChatScroll';

type ChatWindowProps = {
  typing: string;
  loading: boolean;
  activeChatId: string | null;
  onQuickSend: (text: string) => void;
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

/* -------------------------------------------------------------------------- */
/* Helper Functions                                                           */
/* -------------------------------------------------------------------------- */

const formatTime = (time: string) => {
  if (!time) return '';
  const date = new Date(time);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const isSameDay = (a: string, b: string) => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isSame = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (isSame(date, today)) return '오늘';
  if (isSame(date, yesterday)) return '어제';
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
};

/* -------------------------------------------------------------------------- */
/* [Optimization]: Memoized Message Item                                      */
/* -------------------------------------------------------------------------- */
/**
 * @description 개별 메시지 렌더링 최적화를 위한 메모이제이션 컴포넌트
 * 새로운 텍스트(typing)가 들어올 때 기존 메시지들의 불필요한 리렌더링을 방지합니다.
 */
const MessageItem = memo(
  ({
    msg,
    showDate,
    isUser,
    onCopy,
    copiedIndex,
    index,
  }: {
    msg: Message;
    showDate: boolean;
    isUser: boolean;
    onCopy: (text: string, i: number) => void;
    copiedIndex: number | null;
    index: number;
  }) => {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {showDate && (
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-zinc-100" />
            <span className="px-4 py-1.5 bg-zinc-50 text-zinc-500 text-[10px] font-bold rounded-full tracking-widest uppercase">
              {formatDate(msg.time)}
            </span>
            <div className="flex-1 h-px bg-zinc-100" />
          </div>
        )}

        <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
          {!isUser && (
            <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-900">
              <Logo className="w-5 h-5" />
            </div>
          )}
          <div
            className={`flex flex-col max-w-[85%] md:max-w-[75%] ${
              isUser ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`relative px-5 py-3 rounded-2xl text-[14.5px] leading-7 shadow-sm transition-all [will-change:transform] group ${
                isUser
                  ? 'bg-zinc-900 text-white rounded-tr-none'
                  : 'bg-white text-zinc-800 border border-zinc-100 rounded-tl-none'
              }`}
            >
              {!isUser && (
                <button
                  onClick={() => onCopy(msg.content, index)}
                  className="absolute -top-1 -right-10 p-2 text-zinc-400 hover:text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedIndex === index ? (
                    <FiCheck size={16} className="text-emerald-500" />
                  ) : (
                    <FiCopy size={16} />
                  )}
                </button>
              )}
              {isUser ? (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              ) : (
                <div className="[contain:content]">
                  <MarkdownRenderer content={msg.content} />
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold mt-2 text-zinc-400 uppercase tracking-tighter">
              {formatTime(msg.time)}
            </span>
          </div>
          {isUser && (
            <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-900 shadow-lg text-white">
              <FiUser size={20} />
            </div>
          )}
        </div>
      </div>
    );
  }
);

MessageItem.displayName = 'MessageItem';

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function ChatWindow({
  typing,
  loading,
  activeChatId,
  onQuickSend,
}: ChatWindowProps) {
  const { chats, currentChatId } = useChatStore();
  const currentChat = chats.find((c) => c.id === currentChatId);
  const isProcessingHere = currentChatId === activeChatId;

  const isNewChat = !currentChat?.messages.length && !typing && !loading;
  const lastMessage = currentChat?.messages[currentChat.messages.length - 1];
  const isLastMessageStreaming =
    lastMessage?.role === 'assistant' && lastMessage.content === typing;

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const displayMessages = currentChat?.messages ? currentChat.messages.slice(-10) : [];

  const { scrollRef, handleScroll } = useChatScroll([displayMessages, typing]);

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
      {/* 🚀 Welcome Screen */}
      {isNewChat && (
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-700 px-4">
          {/* ... 웰컴 스크린 코드는 동일 (생략) ... */}
          <div className="flex flex-col items-center max-w-lg w-full text-center">
            <div className="flex flex-row md:flex-col items-center justify-center gap-4 md:gap-0 mb-6 md:mb-10 w-full">
              <div className="w-14 h-14 md:w-24 md:h-24 bg-zinc-100 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center shadow-sm shrink-0 ring-1 ring-zinc-200/50">
                <Logo className="w-7 h-7 md:w-12 md:h-12 animate-pulse text-zinc-900" />
              </div>
              <div className="flex flex-col items-start md:items-center text-left md:text-center mt-0 md:mt-8">
                <h1
                  className="font-black text-zinc-900 tracking-tight leading-tight"
                  style={{ fontSize: 'clamp(1.15rem, 5vw, 1.875rem)', margin: 0 }}
                >
                  무엇을 도와드릴까요?
                </h1>
                <p className="hidden md:block text-zinc-500 text-sm mt-3 leading-relaxed">
                  Flow AI와 함께 더 스마트하고 명쾌한 대화를 시작해보세요.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
              {[
                { q: '오늘 점심 메뉴 추천해줘', d: '든든하고 맛있는 한 끼' },
                { q: '주말 여행지 추천해줘', d: '이번 주말 떠나기 좋은 곳' },
                { q: '간단한 스트레칭 방법', d: '집에서 따라하기 쉬운 루틴' },
                { q: '동기부여 명언 알려줘', d: '힘찬 하루를 위한 메시지' },
              ].map((item) => (
                <button
                  key={item.q}
                  onClick={() => onQuickSend(item.q)}
                  className="p-3.5 md:p-5 bg-zinc-50 border border-zinc-100 rounded-xl md:rounded-2xl hover:bg-white hover:border-zinc-300 hover:shadow-xl transition-all text-left group active:scale-[0.98]"
                >
                  <div className="text-[12.5px] md:text-[13.5px] font-bold text-zinc-800 group-hover:text-zinc-950 mb-0.5 transition-colors line-clamp-1">
                    {item.q}
                  </div>
                  <div className="text-[10px] md:text-[11px] text-zinc-400 font-medium transition-colors">
                    {item.d}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 💬 Message List */}
      {!isNewChat && (
        <div className="max-w-4xl mx-auto space-y-10 py-10">
          {displayMessages.map((msg, i) => {
            const prev = displayMessages[i - 1];
            const showDate = !prev || !isSameDay(prev.time, msg.time);

            return (
              <MessageItem
                key={msg.id || i}
                index={i}
                msg={msg}
                isUser={msg.role === 'user'}
                showDate={showDate}
                onCopy={copyToClipboard}
                copiedIndex={copiedIndex}
              />
            );
          })}

          {/* Typing Indicator */}
          {isProcessingHere && (loading || typing) && !isLastMessageStreaming && (
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-900">
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

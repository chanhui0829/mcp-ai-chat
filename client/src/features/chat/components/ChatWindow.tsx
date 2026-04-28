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
  typing: string;
  loading: boolean;
  activeChatId: string | null;
  onQuickSend: (text: string) => void;
}

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
      {isNewChat ? (
        <WelcomeScreen onQuickSend={onQuickSend} />
      ) : (
        <div className="max-w-4xl mx-auto space-y-10 py-10">
          {displayMessages.map((msg, i) => (
            <MessageItem
              key={msg.id || i}
              index={i}
              msg={msg}
              isUser={msg.role === 'user'}
              showDate={
                !displayMessages[i - 1] || !isSameDay(displayMessages[i - 1].time, msg.time)
              }
              onCopy={copyToClipboard}
              copiedIndex={copiedIndex}
            />
          ))}

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

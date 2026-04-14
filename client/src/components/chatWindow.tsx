import { useChatStore } from '../store/chat.store';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState, useEffect, useRef } from 'react';

import type { Components } from 'react-markdown';

/**
 * 🔥 코드 블럭 복사 컴포넌트
 */
function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative">
      <button
        onClick={copy}
        className="absolute top-2 right-2 text-xs bg-gray-800 text-white px-2 py-1 rounded"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>

      <SyntaxHighlighter style={oneLight} language={language} PreTag="div">
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

/**
 * 🔥 Markdown 설정
 */
const markdownComponents: Components = {
  code(props) {
    const { className, children } = props;

    const match = /language-(\w+)/.exec(className || '');
    const code = String(children).replace(/\n$/, '');

    if (match) {
      return <CodeBlock language={match[1]} value={code} />;
    }

    return <code className="bg-gray-200 px-1 rounded">{children}</code>;
  },
};

type ChatWindowProps = {
  typing: string;
  loading: boolean;
};

export default function ChatWindow({ typing, loading }: ChatWindowProps) {
  const { chats, currentChatId } = useChatStore();
  const currentChat = chats.find((c) => c.id === currentChatId);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages, typing, loading]);

  /**
   * 🔥 전체 메시지 복사
   */
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {currentChat?.messages.map((msg, i) => (
        <div
          key={i}
          className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
        >
          {msg.role === 'ai' ? (
            <div className="flex gap-3 max-w-[80%]">
              {/* 🤖 아이콘 */}
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300">
                🤖
              </div>

              {/* 🔥 AI 카드 */}
              <div className="relative group px-5 py-4 rounded-2xl bg-white shadow-sm border border-gray-200">
                {/* 🔥 전체 복사 */}
                <button
                  onClick={() => copyToClipboard(msg.content, i)}
                  className="absolute top-2 right-3 text-xs opacity-0 group-hover:opacity-100"
                >
                  {copiedIndex === i ? '✅' : '📋'}
                </button>

                {/* 🔥 AI 헤더 */}
                <div className="text-xs text-gray-400 mb-2">🤖 AI 답변</div>

                {/* 🔥 본문 */}
                <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed">
                  <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative group max-w-[80%] px-4 py-2 rounded-2xl bg-blue-500 text-white">
              <button
                onClick={() => copyToClipboard(msg.content, i)}
                className="absolute top-1 right-2 text-xs opacity-0 group-hover:opacity-100"
              >
                {copiedIndex === i ? '✅' : '📋'}
              </button>

              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* ⏰ 시간 */}
          <div className="text-[10px] text-gray-400 mt-1 px-1">
            {msg.time &&
              new Date(msg.time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
          </div>
        </div>
      ))}

      {/* 🔥 로딩 */}
      {loading && !typing && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300">
            🤖
          </div>

          <div className="bg-white shadow-sm px-4 py-2 rounded-xl flex gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
          </div>
        </div>
      )}

      {/* 🔥 타이핑 */}
      {typing && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300">
            🤖
          </div>

          <div className="bg-white px-4 py-2 rounded-xl shadow-sm">
            <ReactMarkdown>{typing}</ReactMarkdown>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

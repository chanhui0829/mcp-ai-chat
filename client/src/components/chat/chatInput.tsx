import { FiSend, FiSquare } from 'react-icons/fi';
import { useRef, useEffect, useCallback } from 'react';

type Props = {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onStop?: () => void;
  loading?: boolean;
  typing?: string;
};

/**
 * ChatInput Component
 * [Design Concept]: Minimalist High-End UI with Responsive Interactions
 * [Features]: Auto-growing Textarea, IME Composition Handling, Adaptive Action Button
 */
export default function ChatInput({ input, setInput, onSend, onStop, loading, typing }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 현재 스트리밍(AI 응답 중) 상태 여부 판단
  const isStreaming = loading || (typing && typing.length > 0);

  /**
   * [Optimization] Auto-growing Textarea
   * 입력 내용에 따라 텍스트 영역의 높이를 동적으로 계산하여 유연한 사용자 경험 제공
   */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
  }, [input]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    onSend();
    // 전송 성공 시 텍스트 영역 높이 리셋
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, onSend]);

  return (
    <div className="p-6 bg-transparent">
      <div className="max-w-4xl mx-auto flex items-end gap-3.5">
        {/* Input Container: 입체감 있는 Glassmorphism 스타일 적용 */}
        <div
          className="
          flex-1 flex items-center bg-white border border-zinc-200/60 rounded-3xl px-5 py-2.5 
          min-h-[56px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300
          focus-within:border-zinc-300 focus-within:shadow-[0_8px_40px_rgba(0,0,0,0.08)]
          focus-within:ring-4 focus-within:ring-zinc-100
        "
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="
              w-full resize-none bg-transparent outline-none text-[14.5px] leading-relaxed 
              max-h-[120px] overflow-y-auto py-2.5 text-zinc-800 placeholder:text-zinc-400
              scrollbar-hide
            "
            onKeyDown={(e) => {
              // [UX] 한글 조합 중 엔터 키 전송 방지 (IME Composition Issue)
              if (e.nativeEvent.isComposing) return;

              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        {/* Action Button: 상태에 따라 유동적으로 변화하는 다이내믹 UI */}
        <button
          onClick={isStreaming ? onStop : handleSend}
          disabled={!isStreaming && !input.trim()}
          className={`
            flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 shrink-0 mb-1
            ${
              isStreaming
                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 active:scale-90 shadow-sm'
                : 'bg-zinc-900 hover:bg-black text-white active:scale-95 shadow-xl shadow-zinc-200 disabled:bg-zinc-200 disabled:shadow-none disabled:text-zinc-400'
            }
          `}
          aria-label={isStreaming ? 'Stop generation' : 'Send message'}
        >
          {isStreaming ? (
            <div className="flex items-center gap-1">
              <FiSquare size={18} className="fill-current" />
            </div>
          ) : (
            <FiSend size={19} className="relative left-[-1px] top-[1px]" />
          )}
        </button>
      </div>
    </div>
  );
}

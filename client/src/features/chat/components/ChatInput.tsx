import { FiSend, FiSquare } from 'react-icons/fi';
import { useRef, useEffect, useCallback } from 'react';

/**
 * [Interface 정의]
 * 컴포넌트의 책임을 명확히 하기 위해 부모로부터 주입받는 인터페이스를 정의합니다.
 */
interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  loading?: boolean;
  typing?: string;
}

/**
 * @description 채팅 입력 영역 컴포넌트
 * [UX 기술적 의사결정]
 * 1. IME Composition 대응: 한글 입력 시 엔터 이벤트 중복 발생 문제를 해결하여 전송 오류를 방지함.
 * 2. Dynamic Height: 입력 길이에 따라 높이가 가변적으로 변하는 Textarea를 구현하여 몰입감을 높임.
 * 3. Dynamic Action Button: 스트리밍 상태에 따라 '전송'과 '중단'으로 버튼 역할을 유동적으로 전환.
 */
export default function ChatInput({
  input,
  setInput,
  onSend,
  onStop,
  loading,
  typing,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 현재 스트리밍(AI 응답 중) 상태 여부를 판단하여 UI 모드 전환의 근거로 활용
  const isStreaming = !!(loading || (typing && typing.length > 0));

  /**
   * [UX] Auto-growing Textarea Logic
   * 입력된 내용의 scrollHeight를 추적하여 높이를 동적으로 조절합니다.
   * 최대 높이(100px)를 제한하여 과도한 높이 확장을 방지하고 스크롤을 유도합니다.
   */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto'; // 높이 초기화 후 재계산 (필수)
    el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
  }, [input]);

  /**
   * [Performance] useCallback을 활용한 메모이제이션
   * 불필요한 함수 재생성을 방지하고, 전송 후 텍스트 영역 높이를 명시적으로 리셋합니다.
   */
  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    onSend();

    // 전송 후 UI 초기화 로직
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, onSend]);

  return (
    <div className="p-6 bg-transparent">
      <div className="max-w-4xl mx-auto flex items-end gap-3.5">
        {/* Input Container: Glassmorphism 디자인 및 Focus 시각적 피드백 강화 */}
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
            placeholder="AI에게 무엇이든 물어보세요..."
            className="
              w-full resize-none bg-transparent outline-none text-[14.5px] leading-relaxed 
              max-h-[120px] overflow-y-auto py-2.5 text-zinc-800 placeholder:text-zinc-400
              scrollbar-hide
            "
            onKeyDown={(e) => {
              /**
               * [Troubleshooting] IME(Input Method Editor) 대응
               * 한글/일어 등 조합 문자 입력 시 Enter 키를 누를 때 이벤트가 두 번 발생하는
               * 'isComposing' 현상을 방지하여 중복 전송을 차단합니다.
               */
              if (e.nativeEvent.isComposing) return;

              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        {/* Action Button: 상태 전이(State Transition)를 시각적으로 명확히 표현 */}
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
          aria-label={isStreaming ? '응답 중지' : '메시지 전송'}
        >
          {isStreaming ? (
            <div className="flex items-center gap-1">
              <FiSquare size={18} className="fill-current text-zinc-900" />
            </div>
          ) : (
            <FiSend size={19} className="relative left-[-1px] top-[1px]" />
          )}
        </button>
      </div>
    </div>
  );
}

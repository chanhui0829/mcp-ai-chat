import { FiSend } from 'react-icons/fi';
import { useRef, useEffect } from 'react';

type Props = {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
};

export default function ChatInput({ input, setInput, onSend }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
  }, [input]);

  const handleSend = () => {
    onSend();
    const el = textareaRef.current;
    if (el) el.style.height = 'auto';
  };

  return (
    <div className="p-4 border-t bg-white">
      <div className="flex items-center gap-3">
        {/* INPUT */}
        <div className="flex-1 flex items-center bg-gray-100 rounded-full focus-within:rounded-2xl px-5 py-2 min-h-[44px] shadow-smtransition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="
              w-full
              resize-none
              bg-transparent
              outline-none
              text-sm
              leading-6
              max-h-[100px]
              overflow-y-auto
            "
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;

              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleSend}
          className="
            flex items-center justify-center
            w-11 h-11
            rounded-full
            bg-blue-500 hover:bg-blue-400
            text-white
            shadow-md
            transition
            shrink-0
          "
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
}

import type { Components } from 'react-markdown';
import { CopyButton } from './CopyButton';

/**
 * @description 프리미엄 마크다운 렌더링 UI 컴포넌트
 * @author 찬희 (REACT-CHANWEB)
 * @features
 * 1. 고급스러운 테두리와 백드롭 블러가 적용된 테이블 시스템
 * 2. 코드 블록 내 지능형 주석 하이라이팅
 * 3. 반응형 타이포그래피 및 가독성 최적화된 줄 간격
 * 4. 포트폴리오 최적화: Zinc 테마 기반의 세련된 다크/라이트 모드 대응 스타일
 */

export const markdownComponents: Components = {
  /**
   * 타이포그래피: 계층 구조 명확화
   */
  h1: ({ children }) => (
    <h1 className="text-2xl md:text-3xl font-black mt-10 mb-6 tracking-tight text-slate-900 border-b pb-2 border-slate-200">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl md:text-2xl font-bold mt-8 mb-4 tracking-tight text-slate-800 flex items-center gap-2">
      <span className="w-1 h-6 bg-blue-500 rounded-full inline-block" />
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg md:text-xl font-semibold mt-6 mb-3 text-slate-800">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="leading-7 mb-5 last:mb-0 text-slate-700 text-[15px] break-keep">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-extrabold text-blue-700 bg-blue-50/80 px-1.5 py-0.5 rounded-md mix-blend-multiply transition-all underline-offset-2">
      {children}
    </strong>
  ),
  hr: () => <hr className="my-8 border-slate-200" />,

  /**
   * 리스트 및 인용구 스타일
   */
  ul: ({ children }) => (
    <ul className="list-disc pl-6 space-y-2.5 my-5 text-slate-700">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 space-y-2.5 my-5 text-slate-700">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed marker:text-blue-500">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-slate-300 pl-4 py-1 my-6 italic text-slate-600 bg-slate-50/50 rounded-r-lg">
      {children}
    </blockquote>
  ),

  /**
   * 테이블
   * - 부드러운 라운드 처리와 헤더 강조 적용
   */
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-semibold">
      {children}
    </thead>
  ),
  th: ({ children }) => <th className="px-4 py-3 font-bold">{children}</th>,
  td: ({ children }) => (
    <td className="px-4 py-3 border-t border-slate-100 text-slate-600 leading-relaxed">
      {children}
    </td>
  ),

  /**
   * 코드 렌더링 컴포넌트
   */
  code({ className, children }) {
    const match = /language-(\w+)/.exec(className || '');
    const codeContent = String(children).replace(/\n$/, '');
    const isInline = !className;

    if (isInline) {
      return (
        <code className="bg-slate-100 text-[#e11d48] px-1.5 py-0.5 rounded-md text-[0.85em] font-mono font-semibold">
          {children}
        </code>
      );
    }

    const renderCodeWithComments = (text: string) => {
      const parts = text.split(/(\/\/.*|\/\*[\s\S]*?\*\/)/g);
      return parts.map((part, i) => {
        if (part.startsWith('//') || part.startsWith('/*')) {
          return (
            <span key={i} className="text-slate-500 italic opacity-70">
              {part}
            </span>
          );
        }
        return part;
      });
    };

    return (
      <div className="relative group my-8 overflow-hidden rounded-2xl border border-slate-800 bg-[#0f172a] shadow-xl">
        {/* 맥 스타일 상단 윈도우 컨트롤러 */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-900/90 border-b border-white/5">
          <div className="flex gap-2.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-inner" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-mono text-slate-400 font-medium tracking-tighter">
              {match ? match[1].toUpperCase() : 'TEXT'}
            </span>
            <CopyButton text={codeContent} />
          </div>
        </div>

        {/* 코드 본문 영역 */}
        <pre className="p-6 overflow-x-auto text-[14px] leading-7 font-mono text-slate-200 scrollbar-hide">
          <code className="block whitespace-pre-wrap break-all">
            {renderCodeWithComments(codeContent)}
          </code>
        </pre>
      </div>
    );
  },
};

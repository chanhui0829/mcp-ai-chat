import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from './markdownComponents';

type Props = {
  content: string;
};

/**
 * @description 마크다운 렌더러 최적화 컴포넌트
 * [Optimization]: memo를 통해 부모 컴포넌트의 빈번한 리렌더링으로부터 보호합니다.
 */
const MarkdownRenderer = memo(({ content }: Props) => {
  // 따옴표와 강조 표시(**) 순서 보정 로직
  const processedContent = content?.replace(/\*\*'/g, "'**")?.replace(/'\*\*/g, "**'");

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {processedContent || content}
    </ReactMarkdown>
  );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;

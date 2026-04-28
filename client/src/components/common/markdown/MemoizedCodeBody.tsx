// src/components/markdown/MemoizedCodeBody.tsx
import { memo } from 'react';

const MemoizedCodeBody = memo(({ codeContent }: { codeContent: string }) => {
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
    <code className="block whitespace-pre-wrap break-all">
      {renderCodeWithComments(codeContent)}
    </code>
  );
});

MemoizedCodeBody.displayName = 'MemoizedCodeBody';
export default MemoizedCodeBody;

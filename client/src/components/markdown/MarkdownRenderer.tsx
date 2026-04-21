import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from './markdownComponents';

type Props = {
  content: string;
};

export default function MarkdownRenderer({ content }: Props) {
  const processedContent = content?.replace(/\*\*'/g, "'**")?.replace(/'\*\*/g, "**'");
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {processedContent || content}
    </ReactMarkdown>
  );
}

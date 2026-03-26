import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MessageContentProps {
  content: string;
  className?: string;
}

export const MessageContent: React.FC<MessageContentProps> = ({ content, className = '' }) => {
  return (
    <div className={`message-content prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            return !inline && language ? (
              <div className="relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                    }}
                    className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded"
                  >
                    Copy
                  </button>
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={language}
                  PreTag="div"
                  className="rounded-md !mt-0"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={`${className} px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm`} {...props}>
                {children}
                </code>
            );
          },
          a({ node, children, href, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline"
                {...props}
              >
                {children}
              </a>
            );
          },
          blockquote({ node, children, ...props }) {
            return (
              <blockquote
                className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2"
                {...props}
              >
                {children}
              </blockquote>
            );
          },
          table({ node, children, ...props }) {
            return (
              <div className="overflow-x-auto my-2">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          th({ node, children, ...props }) {
            return (
              <th className="px-3 py-2 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium uppercase tracking-wider" {...props}>
                {children}
              </th>
            );
          },
          td({ node, children, ...props }) {
            return (
              <td className="px-3 py-2 whitespace-nowrap text-sm" {...props}>
                {children}
              </td>
            );
          },
          ul({ node, children, ...props }) {
            return (
              <ul className="list-disc list-inside my-2 space-y-1" {...props}>
                {children}
              </ul>
            );
          },
          ol({ node, children, ...props }) {
            return (
              <ol className="list-decimal list-inside my-2 space-y-1" {...props}>
                {children}
              </ol>
            );
          },
          h1({ node, children, ...props }) {
            return (
              <h1 className="text-2xl font-bold mt-4 mb-2" {...props}>
                {children}
              </h1>
            );
          },
          h2({ node, children, ...props }) {
            return (
              <h2 className="text-xl font-bold mt-3 mb-2" {...props}>
                {children}
              </h2>
            );
          },
          h3({ node, children, ...props }) {
            return (
              <h3 className="text-lg font-bold mt-2 mb-1" {...props}>
                {children}
              </h3>
            );
          },
          p({ node, children, ...props }) {
            return (
              <p className="my-1 leading-relaxed" {...props}>
                {children}
              </p>
            );
          },
          hr({ node, ...props }) {
            return (
              <hr className="my-4 border-gray-300 dark:border-gray-600" {...props} />
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MessageContent;

import ReactMarkdown from 'react-markdown';

export default function ChatMessage({ role, content }) {
  const isUser = role === 'user';

  return (
    <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
      <span className="text-xs font-medium tracking-widest text-gray-400">
        {isUser ? 'YOU' : 'ASSISTANT'}
      </span>
      <div
        className="max-w-[90%] rounded-lg px-4 py-3 text-sm leading-relaxed break-words"
        style={{
          backgroundColor: isUser ? 'transparent' : '#2D6A4F',
          color: isUser ? '#1A1A1A' : '#FFFFFF',
          border: isUser ? '1.5px solid #2D6A4F' : 'none',
        }}
      >
        {isUser ? content : (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-sm">{children}</li>,
              h1: ({ children }) => <h1 className="font-bold text-base mb-1">{children}</h1>,
              h2: ({ children }) => <h2 className="font-bold text-sm mb-1">{children}</h2>,
              h3: ({ children }) => <h3 className="font-semibold text-sm mb-1">{children}</h3>,
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
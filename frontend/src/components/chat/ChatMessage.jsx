export default function ChatMessage({ role, content }) {
  const isUser = role === 'user';

  return (
    <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
      <span className="text-xs font-medium tracking-widest text-gray-400">
        {isUser ? 'YOU' : 'ASSISTANT'}
      </span>
      <div
        className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
        style={{
          backgroundColor: isUser ? '#F0F0F0' : '#2D6A4F',
          color: isUser ? '#1A1A1A' : '#FFFFFF',
        }}
      >
        {content}
      </div>
    </div>
  );
}
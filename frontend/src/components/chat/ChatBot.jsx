'use client';
import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

export default function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo! Saya Freya. Mau masak apa hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('freedge_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ message: input }),
});

const data = await res.json();

const reply = data?.data?.reply || data?.message || 'Maaf, tidak ada respons.';
setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, terjadi kesalahan. Coba lagi ya!' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200" style={{ backgroundColor: '#FBF9F8', height: '520px' }}>
      
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: '#2D6A4F' }}>
        <div>
          <p className="text-white font-semibold text-base">Freedge Assistant</p>
          <p className="text-green-200 text-xs">Culinary Expert</p>
        </div>
        <button onClick={onClose} className="text-white hover:text-green-200 transition">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
        {loading && (
          <div className="flex items-start gap-2">
            <div className="px-4 py-3 rounded-2xl text-sm" style={{ backgroundColor: '#2D6A4F', color: 'white' }}>
              <span className="animate-pulse">Mengetik...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 text-sm px-4 py-2 rounded-full border border-gray-200 outline-none focus:border-green-600"
            style={{ backgroundColor: '#FBF9F8' }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40"
            style={{ backgroundColor: '#2D6A4F' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
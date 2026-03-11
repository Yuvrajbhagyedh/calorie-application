import { useState, useRef, useEffect } from 'react';
import api from '../api/client';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  time: Date;
}

const WELCOME = "Hi! I'm your Calorie IQ assistant. Ask me about calories, meal ideas, or how to use the tracker.";

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: '0', role: 'bot', text: WELCOME, time: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    try {
      const { data } = await api.post<{ reply: string }>('/api/chat', { message: text });
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: data.reply || "I didn't get that. Try asking about calories or meal ideas.",
        time: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'bot', text: "Sorry, I couldn't reach the server. Check your connection and try again.", time: new Date() },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          background: 'var(--accent-strong)',
          color: 'var(--bg-primary)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          zIndex: 9998,
        }}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Panel - desktop: card bottom-right; mobile: full screen */}
      {open && (
        <div
          className="chatbot-panel"
          style={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: 'calc(100vw - 48px)',
            maxWidth: 400,
            maxHeight: 'calc(100vh - 120px)',
            minHeight: 320,
            background: 'var(--bg-secondary)',
            borderRadius: 16,
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-tertiary)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontSize: '1rem',
            }}
          >
            Calorie IQ assistant
          </div>
          <div
            ref={listRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: 14,
                  background: msg.role === 'user' ? 'var(--accent-strong)' : 'var(--bg-tertiary)',
                  color: msg.role === 'user' ? 'var(--bg-primary)' : 'var(--text-primary)',
                  fontSize: '0.95rem',
                  lineHeight: 1.4,
                }}
              >
                {msg.text}
              </div>
            ))}
            {sending && (
              <div style={{ alignSelf: 'flex-start', padding: '10px 14px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                ...
              </div>
            )}
          </div>
          <div
            style={{
              padding: 12,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask about calories or meals..."
              disabled={sending}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: 12,
                border: '1px solid var(--border)',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
              }}
            />
            <button
              type="button"
              onClick={send}
              disabled={sending || !input.trim()}
              className="btn btn-primary"
              style={{ padding: '12px 18px', flexShrink: 0 }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;

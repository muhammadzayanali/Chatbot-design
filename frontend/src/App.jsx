import { useState, useEffect, useRef } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000'

function formatTime(date = new Date()) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function AttachmentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function BraeloLogo() {
  return (
    // <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    //   <circle cx="18" cy="18" r="18" fill="url(#logoGrad)" />
    //   <path d="M11 11h8a4.5 4.5 0 0 1 0 9h-8V11z" fill="white" opacity="0.92"/>
    //   <path d="M11 20h9a4.5 4.5 0 0 1 0 9h-9V20z" fill="white" opacity="0.65"/>
    //   <defs>
    //     <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
    //       <stop offset="0%" stopColor="#4f8ef7"/>
    //       <stop offset="100%" stopColor="#1d4ed8"/>
    //     </linearGradient>
    //   </defs>
    // </svg>
    <img src="/public/BraeloLogo.png" alt="Braelo Logo" width="36" height="36" style={{ borderRadius: '50%' }} />
  )
}

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--page-bg);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.4s ease;
  }

  [data-theme="light"] {
    --page-bg: #e8eef8;
    --window-bg: #ffffff;
    --header-bg: #ffffff;
    --header-border: rgba(37,99,235,0.09);
    --title-color: #0f172a;
    --subtitle-color: #64748b;
    --messages-bg: #f5f8ff;
    --incoming-bubble: #ffffff;
    --incoming-text: #1e293b;
    --incoming-border: rgba(37,99,235,0.10);
    --outgoing-bubble: linear-gradient(135deg,#2563eb 0%,#4f8ef7 100%);
    --outgoing-text: #ffffff;
    --avatar-bot-bg: #ebe7e7;
    --avatar-user-bg: linear-gradient(135deg,#64748b,#94a3b8);
    --avatar-text: #ffffff;
    --ts-color: #94a3b8;
    --input-wrap-bg: #ffffff;
    --input-wrap-border: rgba(37,99,235,0.09);
    --input-bg: #f0f4ff;
    --input-text: #0f172a;
    --input-placeholder: #94a3b8;
    --input-border: rgba(37,99,235,0.14);
    --input-focus-border: #2563eb;
    --input-focus-shadow: rgba(37,99,235,0.12);
    --send-bg: linear-gradient(135deg,#2563eb 0%,#4f8ef7 100%);
    --send-disabled: #cbd5e1;
    --attach-color: #94a3b8;
    --attach-hover: #2563eb;
    --toggle-bg: #f0f4ff;
    --toggle-border: rgba(37,99,235,0.13);
    --toggle-color: #64748b;
    --toggle-hover-bg: #dbeafe;
    --status-dot: #22c55e;
    --window-shadow: 0 12px 56px rgba(37,99,235,0.13), 0 2px 10px rgba(0,0,0,0.05);
    --bubble-shadow: 0 2px 10px rgba(37,99,235,0.07);
    --dot-color: rgba(37,99,235,0.07);
    --scrollbar: rgba(37,99,235,0.16);
  }

  [data-theme="dark"] {
    --page-bg: #090d14;
    --window-bg: #131920;
    --header-bg: #131920;
    --header-border: rgba(79,142,247,0.09);
    --title-color: #e2e8f0;
    --subtitle-color: #64748b;
    --messages-bg: #0d1219;
    --incoming-bubble: #1a2233;
    --incoming-text: #dde4f0;
    --incoming-border: rgba(79,142,247,0.10);
    --outgoing-bubble: linear-gradient(135deg,#1d4ed8 0%,#2563eb 100%);
    --outgoing-text: #ffffff;
    --avatar-bot-bg: #ebe7e7;
    --avatar-user-bg: linear-gradient(135deg,#2d3a4f,#475569);
    --avatar-text: #e2e8f0;
    --ts-color: #3f5068;
    --input-wrap-bg: #131920;
    --input-wrap-border: rgba(79,142,247,0.09);
    --input-bg: #1a2233;
    --input-text: #e2e8f0;
    --input-placeholder: #3f5068;
    --input-border: rgba(79,142,247,0.13);
    --input-focus-border: #4f8ef7;
    --input-focus-shadow: rgba(79,142,247,0.13);
    --send-bg: linear-gradient(135deg,#1d4ed8 0%,#2563eb 100%);
    --send-disabled: #1e2d3d;
    --attach-color: #3f5068;
    --attach-hover: #4f8ef7;
    --toggle-bg: #1a2233;
    --toggle-border: rgba(79,142,247,0.13);
    --toggle-color: #94a3b8;
    --toggle-hover-bg: #1a2a45;
    --status-dot: #22c55e;
    --window-shadow: 0 12px 56px rgba(0,0,0,0.45), 0 2px 10px rgba(0,0,0,0.3);
    --bubble-shadow: 0 2px 10px rgba(0,0,0,0.18);
    --dot-color: rgba(79,142,247,0.045);
    --scrollbar: rgba(79,142,247,0.16);
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  @keyframes dotBounce {
    0%,80%,100% { transform:translateY(0);    opacity:0.35; }
    40%          { transform:translateY(-7px); opacity:1;    }
  }
  @keyframes statusPulse {
    0%   { box-shadow:0 0 0 0   rgba(34,197,94,0.45); }
    70%  { box-shadow:0 0 0 8px rgba(34,197,94,0);    }
    100% { box-shadow:0 0 0 0   rgba(34,197,94,0);    }
  }
`

export default function App() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm Braelo. Ask me about living in the USA or finding local businesses.", timestamp: formatTime() },
  ])
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    return 'light'
  })
  const [inputFocused, setInputFocused] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const el = document.createElement('style')
    el.innerHTML = GLOBAL_CSS
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [])

  const messagesEndRef = useRef(null)
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (e) => {
    e?.preventDefault()
    const text = message.trim()
    if (!text || loading) return
    const now = formatTime()
    setMessage('')
    setMessages((prev) => [...prev, { role: 'user', text, timestamp: now }])
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/chatbot/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json().catch(() => ({}))
      const reply = data.response ?? data.error ?? 'Sorry, something went wrong.'
      setMessages((prev) => [...prev, { role: 'assistant', text: reply, timestamp: formatTime() }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Network error. Is the Braelo backend running?', timestamp: formatTime() }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const canSend = message.trim() && !loading

  return (
    <div data-theme={theme} style={{
      width: '100%', maxWidth: 500, height: '99vh', maxHeight: 760, minHeight: 500,
      background: 'var(--window-bg)', borderRadius: 26, boxShadow: 'var(--window-shadow)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      transition: 'background 0.4s ease, box-shadow 0.4s ease', position: 'relative',
    }}>

      {/* Dot-grid texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(circle, var(--dot-color) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
      }} />

      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 22px', background: 'var(--header-bg)',
        borderBottom: '1px solid var(--header-border)', position: 'relative', zIndex: 2, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <BraeloLogo />
            <span style={{
              position: 'absolute', bottom: 1, right: 1, width: 10, height: 10,
              background: 'var(--status-dot)', borderRadius: '50%',
              border: '2px solid var(--header-bg)', animation: 'statusPulse 2.5s ease-out infinite',
            }} />
          </div>
          <div>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700,
              color: 'var(--title-color)', letterSpacing: '-0.4px', lineHeight: 1.2,
            }}>Braelo</div>
            <div style={{ fontSize: 11.5, color: 'var(--subtitle-color)', marginTop: 2, letterSpacing: '0.1px' }}>
              Your USA local guide · <span style={{ color: 'var(--status-dot)' }}>Online</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', background: 'var(--toggle-bg)',
            border: '1px solid var(--toggle-border)', borderRadius: 50,
            color: 'var(--toggle-color)', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
            transition: 'all 0.2s ease', outline: 'none',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--toggle-hover-bg)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--toggle-bg)' }}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>
      </header>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '22px 18px',
        display: 'flex', flexDirection: 'column', gap: 16,
        background: 'var(--messages-bg)', position: 'relative', zIndex: 1,
        scrollbarWidth: 'thin', scrollbarColor: 'var(--scrollbar) transparent',
      }}>
        {messages.map((m, i) => {
          const isUser = m.role === 'user'
          return (
            <div key={i} style={{
              display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row',
              alignItems: 'flex-end', gap: 9,
              animation: 'fadeUp 0.28s ease both',
            }}>
              {/* Avatar */}
              {!isUser && (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: isUser ? 'var(--avatar-user-bg)' : 'var(--avatar-bot-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12.5, letterSpacing: '-0.2px',
                }}>
                {!isUser && <img src="/public/ChatBot.svg" alt="User Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />}
              </div>)
              }

              {/* Bubble + timestamp */}
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                maxWidth: 'calc(100% - 50px)',
              }}>
                <div style={{
                  padding: '10px 15px',
                  borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isUser ? 'var(--outgoing-bubble)' : 'var(--incoming-bubble)',
                  color: isUser ? 'var(--outgoing-text)' : 'var(--incoming-text)',
                  border: isUser ? 'none' : '1px solid var(--incoming-border)',
                  boxShadow: isUser ? 'none' : 'var(--bubble-shadow)',
                  fontSize: 14.5, lineHeight: 1.56, wordBreak: 'break-word', fontWeight: 400,
                  transition: 'background 0.35s ease',
                }}>
                  {m.text}
                </div>
                {m.timestamp && (
                  <span style={{ fontSize: 10.5, color: 'var(--ts-color)', marginTop: 5, letterSpacing: '0.1px' }}>
                    {m.timestamp}
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9, animation: 'fadeUp 0.28s ease both' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'var(--avatar-bot-bg)', color: 'var(--avatar-text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12.5,
            }}>B</div>
            <div style={{
              padding: '12px 16px', borderRadius: '18px 18px 18px 4px',
              background: 'var(--incoming-bubble)', border: '1px solid var(--incoming-border)',
              boxShadow: 'var(--bubble-shadow)', display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                  background: 'var(--input-focus-border)',
                  animation: `dotBounce 1.2s ease-in-out ${i * 0.16}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* ── Input area ── */}
      <div style={{
        padding: '12px 16px 14px', background: 'var(--input-wrap-bg)',
        borderTop: '1px solid var(--input-wrap-border)', position: 'relative', zIndex: 2, flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--input-bg)', borderRadius: 50,
          border: `1.5px solid ${inputFocused ? 'var(--input-focus-border)' : 'var(--input-border)'}`,
          boxShadow: inputFocused ? '0 0 0 3.5px var(--input-focus-shadow)' : 'none',
          padding: '5px 5px 5px 14px',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        }}>
          {/* <button
            type="button"
            aria-label="Attach file"
            style={{
              background: 'none', border: 'none', color: 'var(--attach-color)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 4, borderRadius: '50%', transition: 'color 0.2s ease', flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--attach-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--attach-color)' }}
          >
            <AttachmentIcon />
          </button> */}

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Message Braelo…"
            disabled={loading}
            aria-label="Message"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 14.5, color: 'var(--input-text)', fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
            }}
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={!canSend}
            aria-label="Send"
            style={{
              width: 37, height: 37, borderRadius: '50%',
              background: canSend ? 'var(--send-bg)' : 'var(--send-disabled)',
              border: 'none', color: '#fff',
              cursor: canSend ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: canSend ? 1 : 0.45,
              transition: 'background 0.25s ease, transform 0.15s ease, opacity 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { if (canSend) e.currentTarget.style.transform = 'scale(1.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            <SendIcon />
          </button>
        </div>

        <p style={{
          textAlign: 'center', fontSize: 11, color: 'var(--ts-color)',
          marginTop: 9, letterSpacing: '0.1px',
        }}>
          Braelo may make mistakes. Verify important info.
        </p>
      </div>
    </div>
  )
}
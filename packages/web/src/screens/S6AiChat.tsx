import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BonsightShell from '../components/BonsightShell'
import PhotoPlaceholder from '../components/PhotoPlaceholder'
import { STUB_CHAT_MESSAGES, STUB_CONTEXT, type ChatMessage } from '../stubs/stubChat'

function SparkleIconGold() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#D9A94E" aria-hidden="true">
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
    </svg>
  )
}

function SendArrowIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 19V5M5 12L12 5L19 12" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CameraSmallIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="#9A938A" strokeWidth="1.6" />
      <circle cx="12" cy="14" r="3.5" stroke="#9A938A" strokeWidth="1.5" />
      <path d="M8 7l1.5-3h5L16 7" stroke="#9A938A" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function AiBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div style={{ display: 'flex', maxWidth: '82%' }}>
      <div style={{
        background: '#fff', border: '1px solid var(--color-border)',
        borderRadius: '14px 14px 14px 4px',
        padding: '12px 14px',
        fontSize: 13, lineHeight: 1.65, color: 'var(--color-ink)',
        whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

function UserBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{
        background: '#5C7A52', color: '#fff',
        borderRadius: '14px 14px 4px 14px',
        padding: '12px 14px', maxWidth: '82%',
        fontSize: 13, lineHeight: 1.65,
        whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <>
      <style>{`
        @keyframes typing-dot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: '#EDEBE6', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <SparkleIconGold />
        </div>
        <div style={{
          background: '#fff', border: '1px solid #EDEBE6',
          borderRadius: '14px 14px 14px 4px',
          padding: '12px 14px',
          display: 'flex', gap: 4, alignItems: 'center',
        }}>
          {([0, 0.2, 0.4] as const).map((delay, i) => (
            <span
              key={i}
              style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#B0B0A8', display: 'inline-block',
                animation: 'typing-dot 1.4s ease-in-out infinite',
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  )
}

export default function S6AiChat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>(STUB_CHAT_MESSAGES)
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const ctx = STUB_CONTEXT

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = () => {
    if (!inputText.trim()) return
    const userContent = inputText.trim()
    const userMsg: ChatMessage = {
      id: `u${Date.now()}`,
      role: 'user',
      content: userContent,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const aiMsg: ChatMessage = {
        id: `a${Date.now()}`,
        role: 'ai',
        content: `承知しました。${userContent.substring(0, 10)}について、詳しくお答えします。\n（※ AI応答はスタブ表示です。後続cmdでBedrock結線後に差替えます。）`,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, aiMsg])
    }, 1500)
  }

  return (
    <BonsightShell
      screen="S6"
      showTabBar={true}
      activeTab="ai"
      leftAction="back"
      onBack={() => navigate(-1)}
      title="AI相談"
      titleIcon="sparkle"
      showAvatar={false}
    >
      <div className="s6-chat" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* 文脈チップ行 */}
        <div
          className="s6-context-bar"
          style={{
            background: '#FAF9F6',
            borderBottom: '1px solid #EDEBE6',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div style={{ width: 30, height: 30, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
            <PhotoPlaceholder label={ctx.speciesJa} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>
            {ctx.bonsaiName}
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            · {ctx.speciesJa} · {ctx.region} · {ctx.season}
          </span>
        </div>

        {/* メッセージ列 */}
        <div
          className="s6-messages"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {messages.map(msg =>
            msg.role === 'ai'
              ? <AiBubble key={msg.id} msg={msg} />
              : <UserBubble key={msg.id} msg={msg} />
          )}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* 入力バー */}
        <div
          className="s6-input-bar"
          style={{
            background: '#fff',
            borderTop: '1px solid #EDEBE6',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <button
            className="s6-attach-btn"
            style={{
              width: 36, height: 36, borderRadius: 18,
              border: '1px solid #E5E3DD',
              background: '#fff',
              flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label="写真を添付"
          >
            <CameraSmallIcon />
          </button>
          <div style={{
            flex: 1, background: '#F5F4F1',
            border: '1px solid #E5E3DD',
            borderRadius: 999, padding: '10px 16px',
          }}>
            <input
              placeholder="メッセージを入力…"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              style={{
                width: '100%', border: 'none', outline: 'none',
                background: 'transparent', fontSize: 15,
                fontFamily: 'var(--font-family)',
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            style={{
              width: 38, height: 38, borderRadius: 19,
              background: inputText.trim() ? '#5C7A52' : '#D6D3CB',
              border: 'none', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: inputText.trim() ? 'pointer' : 'default',
            }}
            aria-label="送信"
          >
            <SendArrowIcon color="#fff" />
          </button>
        </div>
      </div>
    </BonsightShell>
  )
}

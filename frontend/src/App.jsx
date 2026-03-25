import { useState, useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// ─── Asset imports (processed by Vite's build pipeline) ──────────────────────
import lightLogo from '../Public/logo_black.svg'
import darkLogo  from '../Public/logo_white.svg'
import imgChatBot    from '../Public/ChatBot.svg'
import imgBot1       from './assets/bot1.png'
import imgBot2       from './assets/bot2.png'
import imgBot3       from './assets/bot3.png'
import imgBot4       from './assets/bot4.png'
import imgBot5       from './assets/bot5.png'
import imgChatIcon   from './assets/chat_icon.png'
import imgGirl1      from './assets/girl1.png'
import imgGirl2      from './assets/girl2.png'
import imgGirl3      from './assets/girl3.png'
import imgGirl4      from './assets/girl4.png'
import imgMen1       from './assets/men1.png'
import imgSleepyMen  from './assets/sleepy_men.png'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://braelo-v1-bdaqhdc4c7d9fdb7.canadacentral-01.azurewebsites.net'

const THEME_STORAGE_KEY = 'braelo-theme'
/** Default theme when nothing is saved (must match index.html inline script DEFAULT_THEME). */
const DEFAULT_THEME = 'dark'

function readStoredTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch (_) { /* private mode */ }
  return DEFAULT_THEME
}

function fmt(date = new Date()) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

// ─── Global styles live in global-app.css (imported in main.jsx — no inject delay / FOUC) ───

// ─── SVG Icons ───────────────────────────────────────────────────────────────
function IconSend()     { return <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/></svg> }
function IconSun()      { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> }
function IconMoon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> }
function IconChevron()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg> }
function IconCopy()     { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> }
function IconCheck()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> }
function IconSparkles() { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15z"/><path d="M5 6l.5 1.5L7 8l-1.5.5L5 10l-.5-1.5L3 8l1.5-.5L5 6z"/></svg> }
function IconArrowRight(){ return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg> }
function IconMap()      { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg> }
function IconZap()      { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> }
function IconShield()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }
function IconX()        { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
function IconLinkedIn() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> }
function IconMoon2()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> }

// ─── Reusable image with fallback ────────────────────────────────────────────
function Img({ src, alt, className, style, fallback = null }) {
  const [err, setErr] = useState(false)
  if (err && fallback) return fallback
  if (err) return null
  return <img src={src} alt={alt || ''} className={className} style={style} onError={() => setErr(true)} />
}

// ─── Site Header ─────────────────────────────────────────────────────────────
function SiteHeader({ theme, onToggleTheme, onTryNow }) {
  return (
    <header className="site-header">
      <div className="site-container">
        <div className="site-header-inner">
          <a className="site-logo" href="#" onClick={(e) => e.preventDefault()}>
            <Img src={ theme === 'light' ? lightLogo : darkLogo} alt="Braelo" className="site-logo-img"/>
          </a>

          <nav className="site-nav">
            <button className="nav-link" onClick={onTryNow}>Chat</button>
            <button className="nav-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</button>
            <a className="nav-link" href="#about">About</a>
          </nav>

          <div className="site-header-actions">
            <button className="theme-btn" onClick={onToggleTheme} aria-label={theme === 'light' ? 'Dark mode' : 'Light mode'}>
              {theme === 'light' ? <IconMoon /> : <IconSun />}
              <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
            <button className="site-cta-btn" onClick={onTryNow}>
              Try Now <IconArrowRight />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

// ─── Hero Section ────────────────────────────────────────────────────────────
function HeroSection({ onTryNow }) {
  const [botErr, setBotErr] = useState(false)
  const [bot2Err, setBot2Err] = useState(false)
  return (
    <section className="hero-section">
      <div className="hero-bg-shape hero-bg-shape-1" />
      <div className="hero-bg-shape hero-bg-shape-2" />

      <div className="site-container">
        <div className="hero-grid">

          {/* ── Left: copy ── */}
          <div className="hero-left">
            <span className="hero-badge">
              <span className="badge-pulse" />
              AI-Powered · Always Online
            </span>

            <h1 className="hero-title">
              Your Personal<br />
              <span className="hero-title-accent">USA Local Guide</span>
            </h1>

            <p className="hero-subtitle">
              Get instant answers about local businesses, community resources, and neighbourhood insights — all tailored to your exact ZIP code.
            </p>

            <div className="hero-actions">
              <button className="btn-hero-primary" onClick={onTryNow}>
                <Img src={imgChatIcon} alt="" style={{ width: 20, height: 20, borderRadius: 4 }}
                  fallback={<IconSparkles style={{ width: 18, height: 18 }} />} />
                Try Now
                <IconArrowRight />
              </button>
              <button className="btn-hero-ghost" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                See how it works
              </button>
            </div>

            <div className="hero-proof">
              <div className="proof-avatars">
                {[imgGirl1, imgGirl2, imgMen1, imgGirl3, imgGirl4].map((src, i) => (
                  <Img key={i} src={src} alt="" className="proof-avatar"
                    fallback={<div className="proof-avatar" style={{ background:'var(--bg-ghost)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'var(--text-sub)' }}>{i+1}</div>} />
                ))}
              </div>
              <p className="proof-text"><strong>500+</strong> locals already guided</p>
            </div>
          </div>

          {/* ── Right: visual ── */}
          <div className="hero-right">
            <div className="hero-visual-wrap">

              {/* Floating stat card — top right */}
              <div className="hero-float hero-float-1">
                <div className="float-stat">
                  <span className="float-stat-num">2.5K+</span>
                  <span className="float-stat-label">Queries answered</span>
                </div>
              </div>

              {/* Floating location card — bottom left */}
              <div className="hero-float hero-float-2">
                <div className="float-loc">
                  <span className="float-loc-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                  </span>
                  <div className="float-loc-text">
                    <strong>Los Angeles, CA</strong>
                    12 businesses found nearby
                  </div>
                </div>
              </div>

              {/* Main chat preview card */}
              <div className="hero-chat-card">
                {/* Card header */}
                <div className="hero-card-header">
                  {botErr
                    ? <div className="hero-bot-avatar-fallback">B</div>
                    : <img src={imgBot1} alt="Braelo AI" className="hero-bot-avatar" onError={() => setBotErr(true)} />
                  }
                  <div>
                    <div className="hero-card-name">Braelo AI</div>
                    <div className="hero-card-status">
                      <span className="hero-card-status-dot" />Online
                    </div>
                  </div>
                </div>

                {/* Sample messages */}
                <div className="hero-messages">
                  <div className="hero-msg">
                    {botErr
                      ? <div className="hero-msg-avatar-fallback">B</div>
                      : <img src={imgBot2} alt="" className="hero-msg-avatar" onError={() => setBotErr(true)} />
                    }
                    <div className="hero-bubble bot">
                      Hi! I&apos;m Braelo 👋 What can I help you find in your area?
                    </div>
                  </div>

                  <div className="hero-msg user-msg">
                    <Img src={imgGirl2} alt="" className="hero-msg-avatar"
                      fallback={<div className="hero-msg-avatar-fallback">U</div>} />
                    <div className="hero-bubble user">Find pizza places near 90210</div>
                  </div>

                  <div className="hero-msg">
                    {bot2Err
                      ? <div className="hero-msg-avatar-fallback">B</div>
                      : <img src={imgBot3} alt="" className="hero-msg-avatar" onError={() => setBot2Err(true)} />
                    }
                    <div className="hero-bubble bot" style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span className="hero-typing-dot" style={{ animationDelay:'0s' }} />
                      <span className="hero-typing-dot" style={{ animationDelay:'.16s' }} />
                      <span className="hero-typing-dot" style={{ animationDelay:'.32s' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Person cards row */}
              <div className="hero-persons">
                {[
                  { img:imgGirl3, name:'Sarah M.', loc:'San Jose, CA' },
                  { img:imgMen1,  name:'James T.', loc:'Austin, TX' },
                  { img:imgGirl4, name:'Lisa R.', loc:'New York, NY' },
                ].map((p) => (
                  <div className="hero-person" key={p.name}>
                    <Img src={p.img} alt={p.name}
                      fallback={<div style={{ width:44, height:44, borderRadius:'50%', background:'var(--bg-ghost)' }} />} />
                    <span className="hero-person-name">{p.name}</span>
                    <span className="hero-person-loc">{p.loc}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Features Section ────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    { icon: <IconMap />, title: 'Hyper-Local Results', desc: 'Get answers specific to your state, county, and ZIP code — not generic nationwide info.' },
    { icon: <IconZap />, title: 'Instant Answers', desc: 'Ask anything in plain English and get a clear, conversational response in seconds.' },
    { icon: <IconShield />, title: 'Privacy First', desc: 'Your location and personal details are only used to personalise your experience.' },
  ]
  return (
    <section id="features" className="features-section">
      <div className="site-container">
        <p className="features-label">Why Braelo</p>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Site Footer ─────────────────────────────────────────────────────────────
function SiteFooter({ onTryNow }) {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="site-footer-inner">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <Img src={darkLogo} alt="Braelo" className="footer-logo-img"
                fallback={<div className="site-logo-fallback" style={{ width:100,height:32,fontSize:12 }}>B</div>} />
            </div>
            <p className="footer-desc">Your AI-powered USA local guide — helping you discover businesses, services, and community resources right where you live.</p>
            <div className="footer-social">
              <a className="footer-social-btn" href="#" aria-label="X / Twitter"><IconX /></a>
              <a className="footer-social-btn" href="#" aria-label="LinkedIn"><IconLinkedIn /></a>
            </div>
          </div>

          {/* Product */}
          <div className="footer-col">
            <div className="footer-col-title">Product</div>
            <div className="footer-links">
              <button className="footer-link" onClick={onTryNow}>Try the Chat</button>
              <button className="footer-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior:'smooth' })}>Features</button>
              <a className="footer-link" href="#">Pricing</a>
              <a className="footer-link" href="#">Changelog</a>
            </div>
          </div>

          {/* Company */}
          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <div className="footer-links">
              <a className="footer-link" href="#">About</a>
              <a className="footer-link" href="#">Blog</a>
              <a className="footer-link" href="#">Careers</a>
              <a className="footer-link" href="#">Contact</a>
            </div>
          </div>

          {/* Legal */}
          <div className="footer-col">
            <div className="footer-col-title">Legal</div>
            <div className="footer-links">
              <a className="footer-link" href="#">Privacy Policy</a>
              <a className="footer-link" href="#">Terms of Service</a>
              <a className="footer-link" href="#">Cookie Policy</a>
            </div>
          </div>
        </div>

        <div className="site-footer-bottom">
          <p className="footer-copy">© {new Date().getFullYear()} <span>Braelo</span>. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a className="footer-bottom-link" href="#">Privacy</a>
            <a className="footer-bottom-link" href="#">Terms</a>
            <a className="footer-bottom-link" href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Always-On Section ───────────────────────────────────────────────────────
function AlwaysOnSection({ onTryNow }) {
  const stars = [
    { w:2, h:2, top:'12%', left:'8%',  delay:'0s'   },
    { w:3, h:3, top:'22%', left:'72%', delay:'.8s'  },
    { w:2, h:2, top:'65%', left:'15%', delay:'1.4s' },
    { w:3, h:3, top:'75%', left:'60%', delay:'.4s'  },
    { w:2, h:2, top:'40%', left:'90%', delay:'2s'   },
    { w:2, h:2, top:'88%', left:'38%', delay:'1s'   },
    { w:3, h:3, top:'50%', left:'3%',  delay:'1.7s' },
    { w:2, h:2, top:'8%',  left:'50%', delay:'.6s'  },
  ]
  return (
    <section className="always-on-section">
      <div className="always-on-stars">
        {stars.map((s, i) => (
          <span key={i} className="always-on-star"
            style={{ width:s.w, height:s.h, top:s.top, left:s.left, animationDelay:s.delay, animationDuration:`${2+i*.3}s` }} />
        ))}
      </div>
      <div className="always-on-glow always-on-glow-1" />
      <div className="always-on-glow always-on-glow-2" />

      <div className="site-container">
        <div className="always-on-grid">

          {/* ── Left copy ── */}
          <div className="always-on-left">
            <span className="always-on-badge">
              <span className="always-on-badge-dot" />
              24 / 7 · Never offline
            </span>

            <h2 className="always-on-title">
              While you sleep,<br />
              <span style={{ color: '#FFC300' }}>Braelo</span> never does.
            </h2>

            <p className="always-on-sub">
              Whether it&apos;s 3 AM or a holiday, Braelo is always awake, always ready. Get instant local answers the moment you need them — no waiting, no downtime, no excuses.
            </p>

            <div className="always-on-stats">
              <div className="always-on-stat">
                <span style={{ color: '#FFC300' }} className="always-on-stat-num">99.9%</span>
                <span className="always-on-stat-label">Uptime guaranteed</span>
              </div>
              <div className="always-on-stat">
                <span style={{ color: '#FFC300' }} className="always-on-stat-num">&lt; 2s</span>
                <span className="always-on-stat-label">Average response</span>
              </div>
              <div className="always-on-stat">
                <span style={{ color: '#FFC300' }} className="always-on-stat-num">24/7</span>
                <span className="always-on-stat-label">Always available</span>
              </div>
            </div>

            <button className="always-on-cta" onClick={onTryNow}>
              <IconMoon2 />
              Try Braelo now
            </button>
          </div>

          {/* ── Right visual ── */}
          <div className="always-on-right">
            <div className="always-on-img-wrap">
              {/* Floating time card */}
              <div className="always-on-float always-on-time-card">
                <div className="time-card-row">
                  <div className="time-card-clock">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className="time-card-text">
                    <span className="time-card-time">3:47 AM</span>
                    <span className="time-card-status">● Braelo online</span>
                  </div>
                </div>
              </div>

              {/* Sleepy man image */}
              <Img src={imgSleepyMen} alt="Sleeping while Braelo works" className="always-on-img"
                fallback={
                  <div style={{ width:'100%', height:320, borderRadius:24, background:'#22272C',
                    display:'flex', alignItems:'center', justifyContent:'center', color:'#4A5260', fontSize:14 }}>
                    Image
                  </div>
                } />
              <div className="always-on-img-overlay" />

              {/* Floating chat bubble card */}
              <div className="always-on-float always-on-chat-card">
                <div className="chat-card-row">
                  <div className="chat-card-bot">B</div>
                  <div className="chat-card-bubble">
                    Found 8 pharmacies near you open right now 💊
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

// ─── Contact Modal ────────────────────────────────────────────────────────────
function ContactModal({ message, email, phone, onEmail, onPhone, onSubmit, onClose }) {
  const canSubmit = email.trim() && phone.trim()
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">One more thing</div>
        <p className="modal-sub">{message || 'Please share your contact details to continue.'}</p>
        <div className="form-fields">
          <div className="form-field">
            <label className="field-label">Email <span style={{ color:'var(--color-error)' }}>*</span></label>
            <input type="email" className="field-input" value={email} onChange={(e) => onEmail(e.target.value)} placeholder="you@example.com" autoFocus />
          </div>
          <div className="form-field">
            <label className="field-label">Phone <span style={{ color:'var(--color-error)' }}>*</span></label>
            <input type="tel" className="field-input" value={phone} onChange={(e) => onPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ flex:'none', padding:'12px 24px' }} onClick={onSubmit} disabled={!canSubmit}>Continue</button>
        </div>
      </div>
    </div>
  )
}

// ─── Onboarding View (disabled for now — uncomment block to restore pre-chat form) ───
/*
const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
  'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
  'District of Columbia',
]

const INIT_FORM = { name:'', email:'', phone:'', state:'', county:'', zipCode:'' }

function OnboardingView({ theme, onToggleTheme, onComplete }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(INIT_FORM)
  const [errors, setErrors] = useState({})

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const v1 = () => { const e={}; if (!form.name.trim()) e.name='Name is required'; return e }
  const v2 = () => {
    const e={}
    if (!form.state.trim())   e.state='State is required'
    if (!form.county.trim())  e.county='County is required'
    if (!form.zipCode.trim()) e.zipCode='ZIP is required'
    return e
  }

  const goNext = () => { const e=v1(); if (Object.keys(e).length){setErrors(e);return}; setErrors({}); setStep(2) }
  const submit = () => { const e=v2(); if (Object.keys(e).length){setErrors(e);return}; setErrors({}); onComplete(form) }
  const onKey  = (e, fn) => { if (e.key==='Enter'){e.preventDefault();fn()} }

  return (
    <div className="app-window">
      <div className="dot-pattern" />
      <header className="app-header">
        <div className="header-left">
          <div className="logo-wrap" style={{ width:100,height:36 }}>
            <Img src={theme === 'light' ? lightLogo : darkLogo} alt="Braelo" className="logo-img" style={{ width:100,height:36 }}
              fallback={<div className="logo-fallback" style={{ width:36,height:36,fontSize:14 }}>B</div>} />
          </div>
        </div>
        <button className="theme-btn" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme==='light' ? <IconMoon /> : <IconSun />}
          <span>{theme==='light' ? 'Dark' : 'Light'}</span>
        </button>
      </header>

      <div className="onboard-body">
        <div className="step-progress">
          <div className={`step-dot ${step===1?'active':'done'}`} />
          <div className={`step-line ${step===2?'done':''}`} />
          <div className={`step-dot ${step===2?'active':''}`} />
        </div>

        {step === 1 ? (
          <>
            <div className="step-title">Let&apos;s get to know you</div>
            <p className="step-sub">Your name personalises the experience. Email and phone are optional.</p>
            <div className="form-fields">
              <div className="form-field">
                <label className="field-label">Full name <span style={{ color:'var(--color-error)' }}>*</span></label>
                <input type="text" className={`field-input${errors.name?' has-error':''}`} value={form.name} onChange={set('name')} placeholder="Your name" onKeyDown={(e)=>onKey(e,goNext)} autoFocus />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className="form-field">
                <label className="field-label">Email <span className="field-optional">(optional)</span></label>
                <input type="email" className="field-input" value={form.email} onChange={set('email')} placeholder="you@example.com" onKeyDown={(e)=>onKey(e,goNext)} />
              </div>
              <div className="form-field">
                <label className="field-label">Phone <span className="field-optional">(optional)</span></label>
                <input type="tel" className="field-input" value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" onKeyDown={(e)=>onKey(e,goNext)} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="step-title">Where are you located?</div>
            <p className="step-sub">We use your location to surface relevant local info just for you.</p>
            <div className="form-fields">
              <div className="form-field">
                <label className="field-label">State <span style={{ color:'var(--color-error)' }}>*</span></label>
                <select className={`field-select${errors.state?' has-error':''}`} value={form.state} onChange={set('state')} autoFocus>
                  <option value="">Select your state…</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <span className="field-error">{errors.state}</span>}
              </div>
              <div className="two-col">
                <div className="form-field">
                  <label className="field-label">County <span style={{ color:'var(--color-error)' }}>*</span></label>
                  <input type="text" className={`field-input${errors.county?' has-error':''}`} value={form.county} onChange={set('county')} placeholder="e.g. Los Angeles" onKeyDown={(e)=>onKey(e,submit)} />
                  {errors.county && <span className="field-error">{errors.county}</span>}
                </div>
                <div className="form-field">
                  <label className="field-label">ZIP code <span style={{ color:'var(--color-error)' }}>*</span></label>
                  <input type="text" className={`field-input${errors.zipCode?' has-error':''}`} value={form.zipCode} onChange={set('zipCode')} placeholder="90210" maxLength={10} onKeyDown={(e)=>onKey(e,submit)} />
                  {errors.zipCode && <span className="field-error">{errors.zipCode}</span>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <footer className="onboard-footer">
        <div className="btn-row">
          {step===2 && <button className="btn-secondary" onClick={()=>{setErrors({});setStep(1)}}>← Back</button>}
          <button className="btn-primary" onClick={step===1?goNext:submit}>
            {step===1 ? 'Continue →' : 'Start chatting'}
          </button>
        </div>
      </footer>
    </div>
  )
}
*/

// ─── Quick replies ────────────────────────────────────────────────────────────
const QUICK_REPLIES = [
  'What local businesses are near me?',
  'Tell me about my county',
  'Healthcare resources nearby',
  'Best restaurants in my area',
]

// ─── Main App ─────────────────────────────────────────────────────────────────
const INITIAL_PROFILE = { name:'', email:'', phone:'', state:'', county:'', zipCode:'' }

export default function App() {
  const [messages,           setMessages]           = useState([])
  const [message,            setMessage]            = useState('')
  const [loading,            setLoading]            = useState(false)
  const [theme,              setTheme]              = useState(readStoredTheme)
  const [inputFocused,       setInputFocused]       = useState(false)
  const [userProfile,        setUserProfile]        = useState(INITIAL_PROFILE)
  const [showContactModal,   setShowContactModal]   = useState(false)
  const [contactModalMsg,    setContactModalMsg]    = useState('')
  const [contactEmail,       setContactEmail]       = useState('')
  const [contactPhone,       setContactPhone]       = useState('')
  const [showScrollBtn,      setShowScrollBtn]      = useState(false)
  const [copiedId,           setCopiedId]           = useState(null)
  /** Browser GPS for backend reverse-geocode (city/state when user does not type a place). */
  const [deviceGeo, setDeviceGeo] = useState({
    latitude: null,
    longitude: null,
    status: 'pending', // pending | ok | denied | unsupported
  })
  const [locationContext, setLocationContext] = useState(null)

  const messagesEndRef   = useRef(null)
  const messagesAreaRef  = useRef(null)
  const textareaRef      = useRef(null)
  const chatSectionRef   = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.body.setAttribute('data-theme', theme)
    document.documentElement.style.backgroundColor = theme === 'dark' ? '#0F1113' : '#E6E9ED'
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light'
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch (_) { /* private mode */ }
  }, [theme])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setDeviceGeo({ latitude: null, longitude: null, status: 'unsupported' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDeviceGeo({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          status: 'ok',
        })
      },
      () => setDeviceGeo({ latitude: null, longitude: null, status: 'denied' }),
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 12000 },
    )
  }, [])

  useEffect(() => {
    const el = messagesAreaRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const handleScroll = useCallback(() => {
    const el = messagesAreaRef.current
    if (!el) return
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100)
  }, [])

  const scrollToChat = () => chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const scrollToBottom = () => {
    const el = messagesAreaRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  const adjustTextarea = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  const buildPayload = (text) => {
    const p = {
      message: text,
      name:     userProfile.name     || undefined,
      email:    userProfile.email    || undefined,
      phone:    userProfile.phone    || undefined,
      state:    userProfile.state    || undefined,
      county:   userProfile.county   || undefined,
      zip_code: userProfile.zipCode  || undefined,
    }
    if (deviceGeo.status === 'ok' && deviceGeo.latitude != null && deviceGeo.longitude != null) {
      p.latitude = deviceGeo.latitude
      p.longitude = deviceGeo.longitude
      p.location_enabled = true
    } else if (deviceGeo.status === 'denied') {
      p.location_enabled = false
    }
    return p
  }

  const sendMessage = async (e) => {
    e?.preventDefault()
    const text = message.trim()
    if (!text || loading) return
    const now = fmt()
    setMessage('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setMessages((p) => [...p, { id: Date.now(), role: 'user', text, timestamp: now }])
    setLoading(true)
    try {
      const res  = await fetch(`${API_BASE}/chatbot/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(text)),
      })
      const data  = await res.json().catch(() => ({}))
      const reply = data.response ?? data.error ?? 'Sorry, something went wrong.'
      const lc = data.location_context
      if (lc && (lc.city || lc.state)) {
        const parts = [lc.city, lc.state].filter(Boolean)
        setLocationContext({ label: parts.join(', '), fromGps: !!lc.from_device_gps })
      }
      setMessages((p) => [...p, { id: Date.now()+1, role: 'assistant', text: reply, timestamp: fmt() }])
      if (data.require_contact_details) {
        setContactModalMsg(data.contact_details_message || 'Please share your contact details to continue.')
        setContactEmail(userProfile.email || '')
        setContactPhone(userProfile.phone || '')
        setShowContactModal(true)
      }
    } catch {
      setMessages((p) => [...p, { id: Date.now()+1, role:'assistant', isError:true,
        text: 'Unable to connect. Please check your network and try again.', timestamp: fmt() }])
    } finally {
      setLoading(false)
    }
  }

  const submitContactDetails = async () => {
    const email = contactEmail.trim(), phone = contactPhone.trim()
    if (!email || !phone) return
    setUserProfile((p) => ({ ...p, email, phone }))
    setShowContactModal(false)
    try {
      await fetch(`${API_BASE}/chatbot/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buildPayload('Contact details updated.'), email, phone }),
      })
    } catch (_) {}
  }

  /* Pre-chat onboarding (restore with US_STATES / OnboardingView block below):
  const handleOnboardingComplete = (form) => {
    setUserProfile(form)
    setOnboardingDone(true)
    const greeting =
      `Hi **${form.name}**! 👋 I'm Braelo, your personal USA local guide.\n\n` +
      `I can help you with:\n` +
      `- **Local businesses** in ${form.county}, ${form.state}\n` +
      `- **Community resources** and services\n` +
      `- **Area insights** for ZIP code ${form.zipCode}\n\n` +
      `What would you like to explore today?`
    setMessages([{ id: Date.now(), role: 'assistant', text: greeting, timestamp: fmt() }])
  }
  */

  const copyMessage = async (id, text) => {
    try { await navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 1800) }
    catch (_) {}
  }

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }
  const canSend   = message.trim().length > 0 && !loading

  // Group consecutive messages by role
  const groups = []
  messages.forEach((m) => {
    const last = groups[groups.length - 1]
    if (!last || last.role !== m.role) groups.push({ role: m.role, msgs: [m] })
    else last.msgs.push(m)
  })

  // ─── Chat widget (rendered inside chat section) — pre-chat form temporarily disabled ───
  const ChatWidget = (
    <div className="app-window" data-theme={theme}>
      <div className="dot-pattern" />

      {showContactModal && (
        <ContactModal message={contactModalMsg} email={contactEmail} phone={contactPhone}
          onEmail={setContactEmail} onPhone={setContactPhone}
          onSubmit={submitContactDetails} onClose={() => setShowContactModal(false)} />
      )}

      <header className="app-header">
        <div className="header-left">
          <div className="logo-wrap">
            <Img src={theme === 'light' ? lightLogo : darkLogo} alt="Braelo" className="logo-img"
              fallback={<div className="logo-fallback">B</div>} />
            <span className="status-dot" aria-hidden="true" />
          </div>
        </div>
        <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme==='light' ? <IconMoon /> : <IconSun />}
          <span>{theme==='light' ? 'Dark' : 'Light'}</span>
        </button>
      </header>

      <div ref={messagesAreaRef} className="messages-area" onScroll={handleScroll} aria-live="polite">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-ring"><IconSparkles /></div>
            <div className="empty-title">Ask me anything</div>
            <p className="empty-sub">Local businesses, community resources, and area insights — tailored to you.</p>
            <div className="quick-replies">
              {QUICK_REPLIES.map((q) => (
                <button key={q} className="qr-chip" onClick={() => { setMessage(q); textareaRef.current?.focus() }}>{q}</button>
              ))}
            </div>
          </div>
        ) : (
          groups.map((group, gi) => (
            <div key={gi} className={`msg-group ${group.role==='user'?'is-user':'is-bot'}`}>
              {group.msgs.map((m, mi) => (
                <div key={m.id??mi} className="msg-row">
                  {group.role === 'assistant' && (
                    mi === 0
                      ? <div className="bot-avatar"><Img src={imgBot4} alt="Bot"
                            fallback={<span style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,color:'var(--text-avatar)' }}>B</span>} /></div>
                      : <div className="avatar-spacer" />
                  )}
                  <div className="bubble-wrap">
                    <div className={`bubble ${group.role==='user'?'user':'bot'}`}>
                      {group.role === 'assistant'
                        ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                        : m.text}
                    </div>
                  </div>
                  <div className="copy-action">
                    <button className="copy-btn" onClick={() => copyMessage(m.id??mi, m.text)} title="Copy" aria-label="Copy">
                      {copiedId===(m.id??mi) ? <IconCheck /> : <IconCopy />}
                    </button>
                  </div>
                </div>
              ))}
              <div className="msg-ts">{group.msgs[group.msgs.length-1].timestamp}</div>
            </div>
          ))
        )}

        {loading && (
          <div className="typing-row">
            <div className="bot-avatar">
              <Img src={imgBot4} alt="Bot" fallback={<span style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,color:'var(--text-avatar)' }}>B</span>} />
            </div>
            <div className="typing-bubble">
              {[0,1,2].map((i) => <span key={i} className="typing-dot" style={{ animationDelay:`${i*.16}s` }} />)}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {showScrollBtn && (
        <div className="scroll-btn-wrap">
          <button className="scroll-btn" onClick={scrollToBottom}>
            <IconChevron /><span>Scroll to bottom</span>
          </button>
        </div>
      )}

      <div className="input-area">
        <div className={`input-row${inputFocused?' is-focused':''}`}>
          <textarea ref={textareaRef} className="msg-textarea" value={message}
            onChange={(e) => { setMessage(e.target.value); adjustTextarea() }}
            onKeyDown={handleKey} onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)}
            placeholder="Message Braelo…" disabled={loading} rows={1} aria-label="Type a message" />
          <button className="send-btn" onClick={sendMessage} disabled={!canSend} aria-label="Send">
            <IconSend />
          </button>
        </div>
        {locationContext?.label && (
          <p className="input-hint geo-context-hint" style={{ marginBottom: 4 }}>
            {locationContext.fromGps
              ? <>Using your area: <strong>{locationContext.label}</strong> (from device location)</>
              : <>Personalized for: <strong>{locationContext.label}</strong></>}
          </p>
        )}
        <p className="input-hint">Braelo may make mistakes. Verify important information.</p>
      </div>
    </div>
  )

  return (
    <div className="site-page" data-theme={theme}>
      <SiteHeader theme={theme} onToggleTheme={toggleTheme} onTryNow={scrollToChat} />

      <main>
        <HeroSection onTryNow={scrollToChat} />
        <FeaturesSection />
        <AlwaysOnSection onTryNow={scrollToChat} />

        <section id="chat" ref={chatSectionRef} className="chat-section">
          <div className="chat-section-bg" />
          <div className="site-container">
            <p className="chat-section-label">Try it free</p>
            <h2 className="chat-section-title">Chat with Braelo</h2>
            <p className="chat-section-sub">Ask about local businesses, resources, and services — personalised to your location.</p>
            <div className="chat-widget-wrap">
              {ChatWidget}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter onTryNow={scrollToChat} />
    </div>
  )
}

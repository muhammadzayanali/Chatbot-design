import { useState, useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// ─── Asset imports (processed by Vite's build pipeline) ──────────────────────
import imgBraeloLogo from '../Public/BraeloLogo.png'
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

function fmt(date = new Date()) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

// ─── Global CSS ─────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;1,14..32,400&family=Syne:wght@600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { font-synthesis: none; text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; }
  html { scroll-behavior: smooth; }

  /* ── Light theme ── */
  [data-theme="light"] {
    --bg-page:            #E6E9ED;
    --bg-window:          #ffffff;
    --bg-header:          rgba(255,255,255,0.96);
    --border-header:      rgba(25,28,31,0.08);
    --text-title:         #191C1F;
    --text-sub:           #343A40;
    --bg-messages:        #F0F2F5;
    --bg-bot:             #ffffff;
    --text-bot:           #191C1F;
    --border-bot:         rgba(25,28,31,0.09);
    --bg-user-start:      #FFC300;
    --bg-user-end:        #FFEC01;
    --text-user:          #191C1F;
    --bg-avatar:          rgba(255,195,0,0.14);
    --text-avatar:        #826805;
    --color-ts:           #7A8290;
    --bg-input-wrap:      #ffffff;
    --border-input-wrap:  rgba(25,28,31,0.07);
    --bg-input:           #E6E9ED;
    --text-input:         #191C1F;
    --ph-input:           #7A8290;
    --border-input-focus: #FFC300;
    --glow-input:         rgba(255,195,0,0.22);
    --bg-send:            #FFC300;
    --bg-send-hover:      #826805;
    --bg-send-off:        #E6E9ED;
    --text-send:          #191C1F;
    --text-send-off:      #7A8290;
    --color-online:       #B6F101;
    --backdrop:           rgba(25,28,31,0.52);
    --bg-modal:           #ffffff;
    --border-modal:       rgba(25,28,31,0.09);
    --bg-ghost:           #E6E9ED;
    --text-ghost:         #343A40;
    --border-ghost:       rgba(25,28,31,0.18);
    --bg-chip:            rgba(255,195,0,0.14);
    --border-chip:        rgba(255,195,0,0.35);
    --text-chip:          #826805;
    --bg-chip-hover:      rgba(255,195,0,0.26);
    --divider:            rgba(25,28,31,0.07);
    --bg-field:           #F0F2F5;
    --border-field:       rgba(25,28,31,0.14);
    --focus-field:        #FFC300;
    --text-field:         #191C1F;
    --ph-field:           #7A8290;
    --text-label:         #343A40;
    --color-error:        #D73803;
    --bg-step-off:        #E6E9ED;
    --bg-step-on:         #FFC300;
    --bg-step-done:       #B6F101;
    --shadow-window:      0 24px 64px rgba(25,28,31,0.12), 0 4px 16px rgba(25,28,31,0.06);
    --shadow-bubble:      0 1px 4px rgba(25,28,31,0.08);
    --shadow-modal:       0 20px 60px rgba(25,28,31,0.18);
    --scrollbar:          rgba(25,28,31,0.14);
    --dot-pattern:        rgba(255,195,0,0.10);
    --bg-code:            #F0F2F5;
    --text-code:          #191C1F;
    --text-link:          #337EF6;
    --bg-empty-icon:      rgba(255,195,0,0.14);
    --text-empty-icon:    #826805;
    --bg-scroll-btn:      #ffffff;
    --site-header-bg:     rgba(255,255,255,0.92);
    --site-header-border: rgba(25,28,31,0.08);
    --nav-text:           #343A40;
    --nav-hover:          #191C1F;
    --hero-badge-bg:      rgba(255,195,0,0.14);
    --hero-badge-text:    #826805;
    --hero-badge-border:  rgba(255,195,0,0.3);
    --hero-card-bg:       #ffffff;
    --hero-card-border:   rgba(25,28,31,0.09);
    --hero-card-shadow:   0 16px 48px rgba(25,28,31,0.10);
    --footer-bg:          #191C1F;
    --footer-text:        #E6E9ED;
    --footer-sub:         #6B7480;
    --footer-border:      rgba(230,233,237,0.08);
  }

  /* ── Dark theme ── */
  [data-theme="dark"] {
    --bg-page:            #0F1113;
    --bg-window:          #191C1F;
    --bg-header:          rgba(25,28,31,0.97);
    --border-header:      rgba(230,233,237,0.06);
    --text-title:         #E6E9ED;
    --text-sub:           #6B7480;
    --bg-messages:        #131619;
    --bg-bot:             #22272C;
    --text-bot:           #E6E9ED;
    --border-bot:         rgba(230,233,237,0.07);
    --bg-user-start:      #200D72;
    --bg-user-end:        #2201B3;
    --text-user:          #ffffff;
    --bg-avatar:          rgba(255,195,0,0.12);
    --text-avatar:        #FFC300;
    --color-ts:           #4A5260;
    --bg-input-wrap:      rgba(25,28,31,0.98);
    --border-input-wrap:  rgba(230,233,237,0.06);
    --bg-input:           #22272C;
    --text-input:         #E6E9ED;
    --ph-input:           #4A5260;
    --border-input-focus: #FFC300;
    --glow-input:         rgba(255,195,0,0.18);
    --bg-send:            #FFC300;
    --bg-send-hover:      #FFEC01;
    --bg-send-off:        #22272C;
    --text-send:          #191C1F;
    --text-send-off:      #4A5260;
    --color-online:       #B6F101;
    --backdrop:           rgba(0,0,0,0.72);
    --bg-modal:           #22272C;
    --border-modal:       rgba(230,233,237,0.08);
    --bg-ghost:           #22272C;
    --text-ghost:         #6B7480;
    --border-ghost:       #343A40;
    --bg-chip:            rgba(255,195,0,0.08);
    --border-chip:        rgba(255,195,0,0.22);
    --text-chip:          #FFC300;
    --bg-chip-hover:      rgba(255,195,0,0.16);
    --divider:            rgba(230,233,237,0.06);
    --bg-field:           #22272C;
    --border-field:       #343A40;
    --focus-field:        #FFC300;
    --text-field:         #E6E9ED;
    --ph-field:           #4A5260;
    --text-label:         #6B7480;
    --color-error:        #E75700;
    --bg-step-off:        #343A40;
    --bg-step-on:         #FFC300;
    --bg-step-done:       #B6F101;
    --shadow-window:      0 24px 64px rgba(0,0,0,0.65), 0 4px 16px rgba(0,0,0,0.4);
    --shadow-bubble:      0 1px 4px rgba(0,0,0,0.35);
    --shadow-modal:       0 20px 60px rgba(0,0,0,0.72);
    --scrollbar:          rgba(255,195,0,0.18);
    --dot-pattern:        rgba(255,195,0,0.045);
    --bg-code:            #2A2F35;
    --text-code:          #FFC300;
    --text-link:          #337EF6;
    --bg-empty-icon:      rgba(255,195,0,0.10);
    --text-empty-icon:    #FFC300;
    --bg-scroll-btn:      #22272C;
    --site-header-bg:     rgba(15,17,19,0.95);
    --site-header-border: rgba(230,233,237,0.07);
    --nav-text:           #6B7480;
    --nav-hover:          #E6E9ED;
    --hero-badge-bg:      rgba(255,195,0,0.08);
    --hero-badge-text:    #FFC300;
    --hero-badge-border:  rgba(255,195,0,0.22);
    --hero-card-bg:       #22272C;
    --hero-card-border:   rgba(230,233,237,0.07);
    --hero-card-shadow:   0 16px 48px rgba(0,0,0,0.45);
    --footer-bg:          #0A0C0E;
    --footer-text:        #E6E9ED;
    --footer-sub:         #4A5260;
    --footer-border:      rgba(230,233,237,0.06);
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg-page);
    min-height: 100vh;
    transition: background .3s;
  }
  #root { min-height: 100vh; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--scrollbar); border-radius: 4px; }

  /* ── Keyframes ── */
  @keyframes fadeUp      { from{opacity:0;transform:translateY(10px);}  to{opacity:1;transform:translateY(0);} }
  @keyframes fadeIn      { from{opacity:0;}                              to{opacity:1;} }
  @keyframes slideUp     { from{opacity:0;transform:translateY(20px);}  to{opacity:1;transform:translateY(0);} }
  @keyframes slideRight  { from{opacity:0;transform:translateX(30px);}  to{opacity:1;transform:translateX(0);} }
  @keyframes scaleIn     { from{opacity:0;transform:scale(.94);}        to{opacity:1;transform:scale(1);} }
  @keyframes floatY      { 0%,100%{transform:translateY(0);}            50%{transform:translateY(-8px);} }
  @keyframes pulse       { 0%{box-shadow:0 0 0 0 rgba(182,241,1,.55);}  70%{box-shadow:0 0 0 7px rgba(182,241,1,0);}  100%{box-shadow:0 0 0 0 rgba(182,241,1,0);} }
  @keyframes dotBounce   { 0%,80%,100%{transform:translateY(0);opacity:.4;}  40%{transform:translateY(-5px);opacity:1;} }
  @keyframes shimmer     { 0%{background-position:-200% center;}        100%{background-position:200% center;} }

  /* ═══════════════════════════ SITE LAYOUT ══════════════════════════════ */

  .site-page { display: flex; flex-direction: column; min-height: 100vh; }

  .site-container {
    width: 100%; max-width: 1160px;
    margin: 0 auto; padding: 0 24px;
  }
  @media (max-width: 640px) { .site-container { padding: 0 16px; } }

  /* ══════════════════════════ SITE HEADER ═══════════════════════════════ */

  .site-header {
    position: sticky; top: 0; z-index: 100;
    background: var(--site-header-bg);
    border-bottom: 1px solid var(--site-header-border);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transition: background .3s;
  }
  .site-header-inner {
    display: flex; align-items: center; justify-content: space-between;
    height: 64px; gap: 24px;
  }
  .site-logo {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none; flex-shrink: 0;
  }
  .site-logo-img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; display: block; }
  .site-logo-fallback {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(145deg,#FFC300,#FFEC01);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne',sans-serif; font-weight: 800; font-size: 14px; color: #191C1F;
  }
  .site-logo-name {
    font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800;
    color: var(--text-title); letter-spacing: -.4px;
  }
  .site-logo-name span { color: #FFC300; }

  .site-nav {
    display: flex; align-items: center; gap: 6px; flex: 1;
  }
  @media (max-width: 600px) { .site-nav { display: none; } }
  .nav-link {
    padding: 7px 14px; border-radius: 9999px;
    font-size: 13.5px; font-weight: 500; color: var(--nav-text);
    text-decoration: none; transition: background .15s, color .15s;
    cursor: pointer; background: none; border: none; font-family: inherit;
  }
  .nav-link:hover { background: var(--bg-ghost); color: var(--nav-hover); }

  .site-header-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

  .theme-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 13px;
    background: var(--bg-ghost); border: 1px solid var(--border-ghost);
    border-radius: 9999px; color: var(--text-ghost);
    font-size: 12.5px; font-weight: 500; cursor: pointer;
    transition: background .2s, color .2s; font-family: inherit;
  }
  .theme-btn:hover { background: var(--bg-chip-hover); color: var(--text-chip); border-color: var(--border-chip); }

  .site-cta-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 20px; border-radius: 9999px; border: none;
    background: #FFC300; color: #191C1F;
    font-size: 13.5px; font-weight: 700; cursor: pointer;
    font-family: inherit; letter-spacing: -.1px;
    transition: background .2s, transform .15s, box-shadow .2s;
    box-shadow: 0 2px 8px rgba(255,195,0,.35);
  }
  .site-cta-btn:hover { background: #FFEC01; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(255,195,0,.45); }
  .site-cta-btn:active { transform: translateY(0); }

  /* ═══════════════════════════ HERO SECTION ══════════════════════════════ */

  .hero-section {
    padding: 80px 0 72px;
    position: relative; overflow: hidden;
  }
  @media (max-width: 768px) { .hero-section { padding: 52px 0 56px; } }

  .hero-bg-shape {
    position: absolute; pointer-events: none;
    border-radius: 50%; filter: blur(80px); opacity: .55;
  }
  .hero-bg-shape-1 {
    width: 480px; height: 480px; background: rgba(255,195,0,.12);
    top: -120px; left: -80px;
  }
  .hero-bg-shape-2 {
    width: 360px; height: 360px; background: rgba(32,13,114,.08);
    bottom: -80px; right: -40px;
  }
  [data-theme="dark"] .hero-bg-shape-1 { background: rgba(255,195,0,.07); }
  [data-theme="dark"] .hero-bg-shape-2 { background: rgba(32,13,114,.18); }

  .hero-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 56px; align-items: center;
    position: relative; z-index: 1;
  }
  @media (max-width: 900px) {
    .hero-grid { grid-template-columns: 1fr; gap: 48px; }
  }

  /* Left side */
  .hero-left { display: flex; flex-direction: column; gap: 24px; }

  .hero-badge {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 6px 14px; border-radius: 9999px;
    background: var(--hero-badge-bg);
    border: 1px solid var(--hero-badge-border);
    color: var(--hero-badge-text);
    font-size: 12.5px; font-weight: 600; letter-spacing: .3px;
    width: fit-content;
    animation: fadeUp .4s ease both;
  }
  .badge-pulse {
    width: 7px; height: 7px; border-radius: 50%;
    background: #B6F101;
    animation: pulse 2.5s ease-out infinite;
    flex-shrink: 0;
  }

  .hero-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(36px, 5vw, 58px);
    font-weight: 800; line-height: 1.08;
    letter-spacing: -.02em; color: var(--text-title);
    animation: fadeUp .4s .1s ease both;
  }
  .hero-title-accent { color: #FFC300; }

  .hero-subtitle {
    font-size: 16px; line-height: 1.65; color: var(--text-sub);
    max-width: 440px;
    animation: fadeUp .4s .18s ease both;
  }

  .hero-actions {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    animation: fadeUp .4s .26s ease both;
  }
  .btn-hero-primary {
    display: flex; align-items: center; gap: 8px;
    padding: 14px 28px; border-radius: 9999px; border: none;
    background: #FFC300; color: #191C1F;
    font-size: 15px; font-weight: 700; cursor: pointer;
    font-family: inherit; letter-spacing: -.1px;
    transition: background .2s, transform .15s, box-shadow .2s;
    box-shadow: 0 4px 20px rgba(255,195,0,.40);
  }
  .btn-hero-primary:hover { background: #FFEC01; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,195,0,.50); }
  .btn-hero-primary:active { transform: translateY(0); }

  .btn-hero-ghost {
    display: flex; align-items: center; gap: 6px;
    padding: 14px 24px; border-radius: 9999px;
    background: none; border: 1.5px solid var(--border-ghost);
    color: var(--text-ghost); font-size: 15px; font-weight: 500;
    cursor: pointer; text-decoration: none; font-family: inherit;
    transition: background .2s, border-color .2s, color .2s;
  }
  .btn-hero-ghost:hover { background: var(--bg-ghost); color: var(--text-title); border-color: var(--text-ghost); }

  .hero-proof {
    display: flex; align-items: center; gap: 14px;
    animation: fadeUp .4s .34s ease both;
  }
  .proof-avatars { display: flex; }
  .proof-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    border: 2.5px solid var(--bg-page);
    object-fit: cover; display: block;
    margin-left: -10px; transition: transform .15s;
  }
  .proof-avatars .proof-avatar:first-child { margin-left: 0; }
  .proof-avatar:hover { transform: translateY(-3px) scale(1.08); z-index: 1; }
  .proof-text { font-size: 13.5px; color: var(--text-sub); line-height: 1.4; }
  .proof-text strong { color: var(--text-title); font-weight: 700; }

  /* Right side visual */
  .hero-right {
    display: flex; justify-content: center; align-items: center;
    position: relative;
    animation: slideRight .5s .15s ease both;
  }
  @media (max-width: 900px) {
    .hero-right { justify-content: center; }
  }

  .hero-visual-wrap {
    position: relative; width: 100%; max-width: 440px;
  }

  /* Main chat preview card */
  .hero-chat-card {
    background: var(--hero-card-bg);
    border: 1px solid var(--hero-card-border);
    border-radius: 24px;
    box-shadow: var(--hero-card-shadow);
    padding: 24px 20px 20px;
    position: relative; z-index: 2;
  }
  .hero-card-header {
    display: flex; align-items: center; gap: 10px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--divider);
    margin-bottom: 16px;
  }
  .hero-bot-avatar {
    width: 44px; height: 44px; border-radius: 50%;
    object-fit: cover; border: 2px solid rgba(255,195,0,.3);
    flex-shrink: 0;
  }
  .hero-bot-avatar-fallback {
    width: 44px; height: 44px; border-radius: 50%;
    background: linear-gradient(145deg,#FFC300,#FFEC01);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne',sans-serif; font-weight: 800; font-size: 16px; color: #191C1F;
    flex-shrink: 0; border: 2px solid rgba(255,195,0,.3);
  }
  .hero-card-name { font-family: 'Syne',sans-serif; font-weight: 700; font-size: 15px; color: var(--text-title); }
  .hero-card-status { font-size: 12px; color: #B6F101; font-weight: 500; margin-top: 2px; }
  .hero-card-status-dot {
    display: inline-block; width: 6px; height: 6px; border-radius: 50%;
    background: #B6F101; margin-right: 4px;
    animation: pulse 2.5s ease-out infinite;
  }

  .hero-messages { display: flex; flex-direction: column; gap: 10px; }
  .hero-msg { display: flex; align-items: flex-end; gap: 8px; }
  .hero-msg.user-msg { flex-direction: row-reverse; }
  .hero-msg-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
  .hero-msg-avatar-fallback {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--bg-ghost); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 10px; color: var(--text-sub);
  }
  .hero-bubble {
    padding: 9px 13px; border-radius: 16px;
    font-size: 13px; line-height: 1.5; max-width: 200px;
  }
  .hero-bubble.bot {
    background: var(--bg-bot); border: 1px solid var(--border-bot);
    color: var(--text-bot); border-radius: 4px 16px 16px 16px;
    box-shadow: var(--shadow-bubble);
  }
  .hero-bubble.user {
    background: linear-gradient(135deg,#FFC300,#FFEC01);
    color: #191C1F; border-radius: 16px 16px 4px 16px;
  }
  .hero-typing { display: flex; align-items: center; gap: 4px; padding: 10px 14px; }
  .hero-typing-dot {
    width: 5px; height: 5px; border-radius: 50%; background: var(--border-input-focus);
    animation: dotBounce 1.2s ease-in-out infinite;
  }

  /* Floating card 1 — top right */
  .hero-float {
    position: absolute; background: var(--hero-card-bg);
    border: 1px solid var(--hero-card-border);
    border-radius: 16px; padding: 12px 16px;
    box-shadow: var(--hero-card-shadow);
    z-index: 3; animation: floatY 4s ease-in-out infinite;
  }
  .hero-float-1 {
    top: -24px; right: -28px;
    animation-delay: 0s;
    max-width: 180px;
  }
  .hero-float-2 {
    bottom: 32px; left: -36px;
    animation-delay: 2s;
  }
  @media (max-width: 480px) {
    .hero-float-1 { right: -8px; top: -18px; }
    .hero-float-2 { left: -8px; }
  }
  .float-stat { display: flex; flex-direction: column; gap: 2px; }
  .float-stat-num { font-family:'Syne',sans-serif; font-weight:800; font-size:22px; color:#FFC300; line-height:1; }
  .float-stat-label { font-size:11.5px; color:var(--text-sub); font-weight:500; }
  .float-loc { display: flex; align-items: center; gap: 6px; }
  .float-loc-icon { color: #FFC300; flex-shrink: 0; }
  .float-loc-text { font-size: 12.5px; color: var(--text-sub); line-height: 1.4; }
  .float-loc-text strong { color: var(--text-title); font-weight: 600; display: block; }

  /* Person grid below hero-card */
  .hero-persons {
    display: flex; gap: 10px; margin-top: 16px;
    justify-content: center;
  }
  .hero-person {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    background: var(--hero-card-bg); border: 1px solid var(--hero-card-border);
    border-radius: 14px; padding: 12px 14px;
    box-shadow: var(--shadow-bubble);
    cursor: default;
    transition: transform .15s, box-shadow .15s;
    flex: 1;
  }
  .hero-person:hover { transform: translateY(-3px); box-shadow: var(--hero-card-shadow); }
  .hero-person img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
  .hero-person-name { font-size: 11.5px; font-weight: 600; color: var(--text-title); white-space: nowrap; }
  .hero-person-loc  { font-size: 10.5px; color: var(--text-sub); }

  /* ══════════════════════════ FEATURES ROW ═══════════════════════════════ */

  .features-section {
    padding: 64px 0;
    border-top: 1px solid var(--divider);
  }
  .features-label {
    font-size: 12px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--text-sub);
    text-align: center; margin-bottom: 40px;
  }
  .features-grid {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 16px;
  }
  @media (max-width: 700px) { .features-grid { grid-template-columns: 1fr; } }

  .feature-card {
    background: var(--hero-card-bg); border: 1px solid var(--hero-card-border);
    border-radius: 18px; padding: 24px;
    transition: transform .2s, box-shadow .2s;
  }
  .feature-card:hover { transform: translateY(-4px); box-shadow: var(--hero-card-shadow); }
  .feature-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: var(--bg-chip); border: 1px solid var(--border-chip);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px; color: var(--text-chip);
  }
  .feature-title { font-family:'Syne',sans-serif; font-weight:700; font-size:16px; color:var(--text-title); margin-bottom:8px; }
  .feature-desc  { font-size:13.5px; color:var(--text-sub); line-height:1.6; }

  /* ════════════════════════ CHAT SECTION ════════════════════════════════ */

  .chat-section {
    padding: 72px 0 80px;
    background: var(--bg-messages);
    border-top: 1px solid var(--divider);
    position: relative; overflow: hidden;
  }
  .chat-section-bg {
    position: absolute; inset: 0; pointer-events: none;
    background-image: radial-gradient(circle, var(--dot-pattern) 1.5px, transparent 1.5px);
    background-size: 22px 22px;
  }
  .chat-section-label {
    text-align: center; margin-bottom: 12px;
    font-size: 12px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--text-chip);
    animation: fadeUp .4s ease both;
  }
  .chat-section-title {
    font-family: 'Syne', sans-serif; font-size: clamp(28px, 4vw, 42px);
    font-weight: 800; letter-spacing: -.02em; color: var(--text-title);
    text-align: center; margin-bottom: 10px;
    animation: fadeUp .4s .08s ease both;
  }
  .chat-section-sub {
    font-size: 15px; color: var(--text-sub); text-align: center;
    max-width: 400px; margin: 0 auto 48px;
    line-height: 1.6; animation: fadeUp .4s .16s ease both;
  }
  .chat-widget-wrap {
    display: flex; justify-content: center; align-items: flex-start;
    position: relative; z-index: 1;
    animation: scaleIn .4s .2s ease both;
  }

  /* ══════════════════ CHAT WIDGET (app-window) ═══════════════════════════ */

  .app-window {
    width: 100%; max-width: 480px;
    height: calc(100vh - 32px); max-height: 800px; min-height: 540px;
    background: var(--bg-window); border-radius: 24px;
    box-shadow: var(--shadow-window); display: flex; flex-direction: column;
    overflow: hidden; position: relative; transition: background .3s, box-shadow .3s;
  }
  @media (max-width: 520px) {
    .app-window { max-width: 100%; height: 90vh; max-height: none; border-radius: 16px; }
  }

  .dot-pattern {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background-image: radial-gradient(circle, var(--dot-pattern) 1.5px, transparent 1.5px);
    background-size: 22px 22px;
  }

  /* ── App Header (inside widget) ── */
  .app-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 13px 18px;
    background: var(--bg-header); border-bottom: 1px solid var(--border-header);
    position: relative; z-index: 2; flex-shrink: 0;
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  }
  .header-left { display: flex; align-items: center; gap: 11px; }
  .logo-wrap { position: relative; flex-shrink: 0; }
  .logo-img, .logo-fallback { width: 42px; height: 42px; border-radius: 50%; display: block; }
  .logo-img { object-fit: cover; }
  .logo-fallback {
    background: linear-gradient(145deg, var(--bg-user-start), var(--bg-user-end));
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne',sans-serif; font-weight: 800; font-size: 16px; color: var(--text-user);
  }
  .status-dot {
    position: absolute; bottom: 1px; right: 1px;
    width: 11px; height: 11px; background: var(--color-online); border-radius: 50%;
    border: 2px solid var(--bg-header); animation: pulse 2.5s ease-out infinite;
  }
  .header-title { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; color:var(--text-title); letter-spacing:-.3px; line-height:1.2; }
  .header-sub { font-size:11.5px; color:var(--text-sub); margin-top:2px; display:flex; align-items:center; gap:4px; }
  .online-text { color:var(--color-online); font-weight:500; }

  /* ── Messages area ── */
  .messages-area {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    padding: 20px 16px; display: flex; flex-direction: column; gap: 4px;
    background: var(--bg-messages); position: relative; z-index: 1;
  }
  .date-divider { display:flex; align-items:center; gap:10px; margin:10px 0; animation:fadeIn .3s ease; }
  .date-divider::before, .date-divider::after { content:''; flex:1; height:1px; background:var(--divider); }
  .date-divider-text { font-size:11px; color:var(--color-ts); white-space:nowrap; font-weight:500; letter-spacing:.3px; }

  .msg-group { display:flex; flex-direction:column; animation:fadeUp .25s ease both; margin-bottom:8px; }
  .msg-group.is-user { align-items:flex-end; }
  .msg-group.is-bot  { align-items:flex-start; }
  .msg-row { display:flex; align-items:flex-end; gap:8px; max-width:86%; position:relative; }
  .msg-group.is-user .msg-row { flex-direction:row-reverse; }
  .bot-avatar {
    width:28px; height:28px; border-radius:50%; overflow:hidden; flex-shrink:0;
    background:var(--bg-avatar); display:flex; align-items:center; justify-content:center;
  }
  .bot-avatar img { width:100%; height:100%; object-fit:cover; display:block; }
  .avatar-spacer { width:28px; flex-shrink:0; }
  .bubble-wrap { display:flex; flex-direction:column; position:relative; }
  .msg-group.is-user .bubble-wrap { align-items:flex-end; }
  .msg-group.is-bot  .bubble-wrap { align-items:flex-start; }

  .copy-action { position:absolute; top:-10px; opacity:0; pointer-events:none; transition:opacity .15s; z-index:5; }
  .msg-group.is-bot  .copy-action { right:-32px; }
  .msg-group.is-user .copy-action { left:-32px; }
  .msg-row:hover .copy-action { opacity:1; pointer-events:all; }
  .copy-btn {
    width:26px; height:26px; border-radius:50%;
    background:var(--bg-window); border:1px solid var(--border-bot);
    color:var(--text-sub); cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    box-shadow:var(--shadow-bubble); transition:background .15s, color .15s;
  }
  .copy-btn:hover { background:var(--bg-chip-hover); color:var(--text-chip); }

  .bubble { padding:10px 14px; font-size:14.5px; line-height:1.6; word-break:break-word; transition:background .3s; margin-bottom:2px; }
  .bubble.bot  { background:var(--bg-bot); color:var(--text-bot); border:1px solid var(--border-bot); box-shadow:var(--shadow-bubble); border-radius:4px 18px 18px 18px; }
  .bubble.user { background:linear-gradient(145deg,var(--bg-user-start),var(--bg-user-end)); color:var(--text-user); border:none; border-radius:18px 18px 4px 18px; }

  .bubble p { margin-bottom:.5em; }
  .bubble p:last-child { margin-bottom:0; }
  .bubble ul,.bubble ol { padding-left:18px; margin:.4em 0; }
  .bubble li { margin-bottom:.2em; }
  .bubble h1,.bubble h2,.bubble h3 { font-weight:600; margin-bottom:.4em; margin-top:.6em; color:var(--text-title); font-size:15px; }
  .bubble h1:first-child,.bubble h2:first-child,.bubble h3:first-child { margin-top:0; }
  .bubble code { background:var(--bg-code); color:var(--text-code); border-radius:4px; padding:1px 6px; font-family:'SF Mono','Fira Code',monospace; font-size:.88em; }
  .bubble pre { background:var(--bg-code); border-radius:10px; padding:12px 14px; margin:.5em 0; overflow-x:auto; }
  .bubble pre code { background:none; padding:0; font-size:.9em; }
  .bubble a { color:var(--text-link); text-decoration:underline; text-decoration-thickness:1px; text-underline-offset:2px; }
  .bubble.user a { color:rgba(25,28,31,.75); }
  .bubble strong { font-weight:600; }
  .bubble em { font-style:italic; }
  .bubble blockquote { border-left:3px solid var(--border-chip); padding-left:12px; margin:.5em 0; color:var(--text-sub); font-style:italic; }

  .msg-ts { font-size:10.5px; color:var(--color-ts); margin-top:3px; letter-spacing:.1px; }
  .msg-group.is-bot  .msg-ts { margin-left:36px; }
  .msg-group.is-user .msg-ts { text-align:right; }

  .typing-row { display:flex; align-items:flex-end; gap:8px; margin-bottom:8px; animation:fadeUp .25s ease both; }
  .typing-bubble { padding:12px 16px; border-radius:4px 18px 18px 18px; background:var(--bg-bot); border:1px solid var(--border-bot); box-shadow:var(--shadow-bubble); display:flex; align-items:center; gap:5px; }
  .typing-dot { width:6px; height:6px; border-radius:50%; background:var(--border-input-focus); animation:dotBounce 1.2s ease-in-out infinite; }

  .empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; padding:32px 24px; text-align:center; gap:10px; animation:fadeIn .4s ease; }
  .empty-icon-ring { width:64px; height:64px; border-radius:20px; background:var(--bg-empty-icon); color:var(--text-empty-icon); display:flex; align-items:center; justify-content:center; margin-bottom:4px; }
  .empty-title { font-family:'Syne',sans-serif; font-size:18px; font-weight:700; color:var(--text-title); letter-spacing:-.3px; }
  .empty-sub { font-size:13.5px; color:var(--text-sub); line-height:1.55; max-width:260px; }
  .quick-replies { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:8px; }
  .qr-chip { padding:8px 14px; border-radius:9999px; background:var(--bg-chip); border:1px solid var(--border-chip); color:var(--text-chip); font-size:13px; font-weight:500; cursor:pointer; font-family:inherit; transition:background .15s, transform .1s; }
  .qr-chip:hover { background:var(--bg-chip-hover); transform:translateY(-1px); }
  .qr-chip:active { transform:translateY(0); }

  .scroll-btn-wrap { position:absolute; bottom:78px; left:0; right:0; display:flex; justify-content:center; z-index:3; pointer-events:none; animation:fadeIn .2s ease; }
  .scroll-btn { pointer-events:all; display:flex; align-items:center; gap:5px; padding:7px 16px 7px 12px; background:var(--bg-scroll-btn); border:1px solid var(--border-bot); border-radius:9999px; color:var(--text-sub); font-size:12.5px; font-weight:500; cursor:pointer; box-shadow:var(--shadow-bubble); font-family:inherit; transition:box-shadow .15s; white-space:nowrap; }
  .scroll-btn:hover { box-shadow:0 4px 14px rgba(0,0,0,.14); }

  /* ── Input area ── */
  .input-area { padding:10px 14px 12px; background:var(--bg-input-wrap); border-top:1px solid var(--border-input-wrap); position:relative; z-index:2; flex-shrink:0; backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); }
  .input-row { display:flex; align-items:flex-end; gap:8px; background:var(--bg-input); border-radius:20px; border:1.5px solid transparent; padding:8px 8px 8px 16px; transition:border-color .2s, box-shadow .2s; }
  .input-row.is-focused { border-color:var(--border-input-focus); box-shadow:0 0 0 3px var(--glow-input); }
  .msg-textarea { flex:1; background:none; border:none; outline:none; resize:none; overflow-y:auto; font-size:14.5px; color:var(--text-input); font-family:'Inter',sans-serif; font-weight:400; line-height:1.55; max-height:120px; min-height:22px; padding:0; }
  .msg-textarea::placeholder { color:var(--ph-input); }
  .send-btn { width:36px; height:36px; border-radius:50%; border:none; background:var(--bg-send); color:var(--text-send); display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:background .2s, transform .15s; }
  .send-btn:hover:not(:disabled) { background:var(--bg-send-hover); transform:scale(1.07); }
  .send-btn:active:not(:disabled) { transform:scale(.95); }
  .send-btn:disabled { background:var(--bg-send-off); color:var(--text-send-off); cursor:not-allowed; opacity:.7; }
  .input-hint { font-size:11px; color:var(--color-ts); text-align:center; margin-top:8px; letter-spacing:.1px; }

  /* ── Onboarding ── */
  .onboard-body { flex:1; overflow-y:auto; padding:24px 24px 8px; position:relative; z-index:1; }
  .step-progress { display:flex; align-items:center; gap:8px; margin-bottom:28px; }
  .step-dot { width:8px; height:8px; border-radius:50%; background:var(--bg-step-off); transition:background .3s, transform .2s; flex-shrink:0; }
  .step-dot.active { background:var(--bg-step-on); transform:scale(1.35); }
  .step-dot.done   { background:var(--bg-step-done); }
  .step-line { flex:1; height:2px; background:var(--bg-step-off); border-radius:2px; transition:background .3s; }
  .step-line.done  { background:var(--bg-step-done); }
  .step-title { font-family:'Syne',sans-serif; font-size:22px; font-weight:700; color:var(--text-title); letter-spacing:-.5px; margin-bottom:6px; animation:slideUp .3s ease; }
  .step-sub { font-size:14px; color:var(--text-sub); line-height:1.55; margin-bottom:24px; animation:slideUp .3s .05s ease both; }
  .form-fields { display:flex; flex-direction:column; gap:14px; animation:slideUp .3s .1s ease both; }
  .form-field { display:flex; flex-direction:column; gap:5px; }
  .field-label { font-size:12.5px; font-weight:600; color:var(--text-label); letter-spacing:.15px; }
  .field-optional { font-size:11px; font-weight:400; color:var(--color-ts); }
  .field-input { padding:11px 14px; border-radius:12px; border:1.5px solid var(--border-field); background:var(--bg-field); color:var(--text-field); font-size:14px; font-family:'Inter',sans-serif; transition:border-color .2s, box-shadow .2s; width:100%; }
  .field-input::placeholder { color:var(--ph-field); }
  .field-input:focus { outline:none; border-color:var(--focus-field); box-shadow:0 0 0 3px rgba(255,195,0,.11); }
  .field-input.has-error { border-color:var(--color-error); }
  .field-select { padding:11px 36px 11px 14px; border-radius:12px; border:1.5px solid var(--border-field); background:var(--bg-field); color:var(--text-field); font-size:14px; font-family:'Inter',sans-serif; transition:border-color .2s, box-shadow .2s; width:100%; appearance:none; -webkit-appearance:none; cursor:pointer; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%237A8290' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; }
  .field-select:focus { outline:none; border-color:var(--focus-field); box-shadow:0 0 0 3px rgba(255,195,0,.11); }
  .field-select.has-error { border-color:var(--color-error); }
  .field-select option { background:var(--bg-field); color:var(--text-field); }
  .field-error { font-size:11.5px; color:var(--color-error); }
  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  @media (max-width:360px) { .two-col { grid-template-columns:1fr; } }
  .onboard-footer { padding:14px 24px 20px; flex-shrink:0; background:var(--bg-window); border-top:1px solid var(--border-header); }
  .btn-row { display:flex; gap:10px; }
  .btn-primary { flex:1; padding:13px 20px; border-radius:9999px; border:none; background:var(--bg-send); color:var(--text-send); font-size:14.5px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; transition:background .2s, transform .15s; letter-spacing:-.1px; }
  .btn-primary:hover  { background:var(--bg-send-hover); transform:translateY(-1px); }
  .btn-primary:active { transform:translateY(0); }
  .btn-secondary { padding:13px 18px; border-radius:9999px; border:1.5px solid var(--border-ghost); background:var(--bg-ghost); color:var(--text-ghost); font-size:14.5px; font-weight:500; font-family:'Inter',sans-serif; cursor:pointer; transition:background .2s, border-color .2s, color .2s; white-space:nowrap; }
  .btn-secondary:hover { background:var(--bg-chip); border-color:var(--border-chip); color:var(--text-chip); }

  /* ── Contact Modal ── */
  .modal-backdrop { position:absolute; inset:0; z-index:10; background:var(--backdrop); display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn .2s ease; backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); }
  .modal-card { background:var(--bg-modal); border-radius:22px; padding:28px 24px 24px; max-width:360px; width:100%; box-shadow:var(--shadow-modal); border:1px solid var(--border-modal); animation:scaleIn .25s ease; }
  .modal-title { font-family:'Syne',sans-serif; font-size:19px; font-weight:700; color:var(--text-title); letter-spacing:-.35px; margin-bottom:6px; }
  .modal-sub { font-size:13.5px; color:var(--text-sub); line-height:1.55; margin-bottom:22px; }
  .modal-footer { display:flex; gap:10px; justify-content:flex-end; margin-top:22px; }

  /* ═══════════════════════════ SITE FOOTER ═══════════════════════════════ */

  .site-footer {
    background: var(--footer-bg);
    border-top: 1px solid var(--footer-border);
    margin-top: auto;
  }
  .site-footer-inner {
    padding: 56px 0 32px;
    display: grid; grid-template-columns: 1.8fr 1fr 1fr 1fr; gap: 40px;
  }
  @media (max-width: 780px) { .site-footer-inner { grid-template-columns: 1fr 1fr; gap: 32px; } }
  @media (max-width: 480px) { .site-footer-inner { grid-template-columns: 1fr; gap: 28px; } }

  .footer-brand {}
  .footer-logo { display:flex; align-items:center; gap:9px; margin-bottom:14px; }
  .footer-logo-img { width:32px; height:32px; border-radius:50%; object-fit:cover; }
  .footer-logo-name { font-family:'Syne',sans-serif; font-size:17px; font-weight:800; color:var(--footer-text); letter-spacing:-.3px; }
  .footer-logo-name span { color:#FFC300; }
  .footer-desc { font-size:13.5px; color:var(--footer-sub); line-height:1.65; max-width:260px; margin-bottom:20px; }
  .footer-social { display:flex; gap:10px; }
  .footer-social-btn {
    width:36px; height:36px; border-radius:50%;
    background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
    display:flex; align-items:center; justify-content:center;
    color:var(--footer-sub); cursor:pointer;
    transition: background .2s, color .2s, border-color .2s; text-decoration: none;
  }
  .footer-social-btn:hover { background:rgba(255,195,0,.15); color:#FFC300; border-color:rgba(255,195,0,.3); }

  .footer-col {}
  .footer-col-title { font-size:12px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:var(--footer-text); margin-bottom:16px; }
  .footer-links { display:flex; flex-direction:column; gap:10px; }
  .footer-link { font-size:14px; color:var(--footer-sub); text-decoration:none; transition:color .15s; cursor:pointer; background:none; border:none; font-family:inherit; text-align:left; padding:0; }
  .footer-link:hover { color:#FFC300; }

  .site-footer-bottom {
    border-top: 1px solid var(--footer-border);
    padding: 20px 0;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    flex-wrap: wrap;
  }
  .footer-copy { font-size:13px; color:var(--footer-sub); }
  .footer-copy span { color:#FFC300; font-weight:600; }
  .footer-bottom-links { display:flex; gap:20px; }
  .footer-bottom-link { font-size:13px; color:var(--footer-sub); text-decoration:none; transition:color .15s; }
  .footer-bottom-link:hover { color:#FFC300; }

  /* ═══════════════════════ ALWAYS-ON SECTION ════════════════════════════ */

  .always-on-section {
    background: #111418;
    padding: 88px 0;
    position: relative; overflow: hidden;
  }
  .always-on-stars {
    position: absolute; inset: 0; pointer-events: none; overflow: hidden;
  }
  .always-on-star {
    position: absolute; border-radius: 50%;
    background: rgba(255,255,255,.6);
    animation: twinkle 3s ease-in-out infinite;
  }
  @keyframes twinkle { 0%,100%{opacity:.2;transform:scale(1);} 50%{opacity:1;transform:scale(1.3);} }
  .always-on-glow {
    position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none;
  }
  .always-on-glow-1 { width:500px;height:500px; background:rgba(255,195,0,.06); top:-120px; right:-80px; }
  .always-on-glow-2 { width:320px;height:320px; background:rgba(32,13,114,.18); bottom:-60px; left:-40px; }

  .always-on-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 64px; align-items: center;
    position: relative; z-index: 1;
  }
  @media (max-width: 900px) { .always-on-grid { grid-template-columns: 1fr; gap: 48px; } }

  .always-on-left { display: flex; flex-direction: column; gap: 24px; }
  .always-on-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 14px; border-radius: 9999px;
    background: rgba(255,195,0,.1); border: 1px solid rgba(255,195,0,.2);
    color: #FFC300; font-size: 12.5px; font-weight: 600; letter-spacing: .3px;
    width: fit-content;
  }
  .always-on-badge-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #B6F101;
    animation: pulse 2.5s ease-out infinite;
  }
  .always-on-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(30px, 4vw, 50px);
    font-weight: 800; line-height: 1.1;
    letter-spacing: -.02em; color: #E6E9ED;
  }
  .always-on-title span { color: #FFC300; }
  .always-on-sub {
    font-size: 15.5px; line-height: 1.7; color: #6B7480;
    max-width: 420px;
  }
  .always-on-stats {
    display: flex; gap: 28px; flex-wrap: wrap;
  }
  .always-on-stat { display: flex; flex-direction: column; gap: 3px; }
  .always-on-stat-num { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#FFC300; line-height:1; }
  .always-on-stat-label { font-size:12.5px; color:#4A5260; font-weight:500; }
  .always-on-cta {
    display: flex; align-items: center; gap: 8px;
    padding: 13px 26px; border-radius: 9999px; border: none;
    background: #FFC300; color: #191C1F;
    font-size: 14.5px; font-weight: 700; cursor: pointer;
    font-family: inherit; width: fit-content;
    transition: background .2s, transform .15s;
    box-shadow: 0 4px 20px rgba(255,195,0,.3);
  }
  .always-on-cta:hover { background: #FFEC01; transform: translateY(-2px); }

  .always-on-right {
    display: flex; justify-content: center; align-items: center;
    position: relative;
  }
  .always-on-img-wrap {
    position: relative; width: 100%; max-width: 420px;
  }
  .always-on-img {
    width: 100%; border-radius: 24px; object-fit: cover;
    display: block; max-height: 440px;
    box-shadow: 0 24px 64px rgba(0,0,0,.5);
    filter: brightness(.85);
  }
  .always-on-img-overlay {
    position: absolute; inset: 0; border-radius: 24px;
    background: linear-gradient(180deg, transparent 40%, rgba(17,20,24,.85) 100%);
  }

  .always-on-float {
    position: absolute;
    background: rgba(25,28,31,.95);
    border: 1px solid rgba(255,255,255,.08);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border-radius: 16px; padding: 12px 16px;
    animation: floatY 4s ease-in-out infinite;
    box-shadow: 0 8px 32px rgba(0,0,0,.4);
  }
  .always-on-time-card {
    top: 20px; left: -28px; animation-delay: 0s;
  }
  .always-on-chat-card {
    bottom: 24px; right: -20px; animation-delay: 2.1s;
    max-width: 200px;
  }
  @media (max-width: 480px) {
    .always-on-time-card { left: 8px; top: 12px; }
    .always-on-chat-card { right: 8px; bottom: 12px; }
  }

  .time-card-row { display: flex; align-items: center; gap: 8px; }
  .time-card-clock {
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(255,195,0,.12); border: 1px solid rgba(255,195,0,.2);
    display: flex; align-items: center; justify-content: center;
    color: #FFC300; flex-shrink: 0;
  }
  .time-card-text { display: flex; flex-direction: column; gap: 2px; }
  .time-card-time { font-family:'Syne',sans-serif; font-weight:800; font-size:15px; color:#E6E9ED; }
  .time-card-status { font-size:11px; color:#B6F101; font-weight:600; }

  .chat-card-row { display: flex; align-items: flex-start; gap: 8px; }
  .chat-card-bot {
    width: 28px; height: 28px; border-radius: 50%;
    background: rgba(255,195,0,.12); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-family:'Syne',sans-serif; font-weight:800; font-size:10px; color:#FFC300;
    border: 1px solid rgba(255,195,0,.2);
  }
  .chat-card-bubble {
    background: rgba(255,255,255,.06); border-radius: 4px 12px 12px 12px;
    padding: 8px 10px; font-size: 12.5px; color: #E6E9ED; line-height: 1.45;
  }

  /* ══════════════ MOBILE POLISH (≤ 480px) ══════════════════════════════ */
  @media (max-width: 480px) {
    /* Header: hide theme-btn label text, keep icon only */
    .theme-btn span { display: none; }
    .theme-btn { padding: 8px 10px; }

    /* Header: shrink CTA button */
    .site-cta-btn { padding: 8px 14px; font-size: 12.5px; }

    /* Hero: full-width subtitle */
    .hero-subtitle { max-width: 100%; font-size: 15px; }

    /* Hero: stack action buttons */
    .hero-actions { flex-direction: column; align-items: stretch; }
    .btn-hero-primary, .btn-hero-ghost { width: 100%; justify-content: center; }

    /* Hero persons: horizontal scroll so cards don't squish */
    .hero-persons {
      overflow-x: auto; justify-content: flex-start;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none; padding-bottom: 4px;
    }
    .hero-persons::-webkit-scrollbar { display: none; }
    .hero-person { flex-shrink: 0; min-width: 96px; }

    /* Hero visual: tighten so float cards stay clipped */
    .hero-visual-wrap { max-width: 100%; }
    .hero-float-1 { max-width: 140px; right: 4px; top: -14px; }
    .hero-float-2 { left: 4px; }
    .float-stat-num { font-size: 18px; }

    /* Always-On image: shorter on phone */
    .always-on-img { max-height: 280px; }

    /* Always-On stats: tighter gap */
    .always-on-stats { gap: 20px; }
    .always-on-stat-num { font-size: 22px; }

    /* Always-On CTA: full width */
    .always-on-cta { width: 100%; justify-content: center; }

    /* Chat section: reduce vertical padding */
    .chat-section { padding: 48px 0 56px; }
    .chat-section-sub { font-size: 14px; }

    /* Footer bottom: stack vertically */
    .site-footer-bottom { flex-direction: column; align-items: flex-start; gap: 10px; }
    .footer-bottom-links { gap: 14px; }
  }

  /* ══════════════ TABLET POLISH (481–768px) ════════════════════════════ */
  @media (min-width: 481px) and (max-width: 768px) {
    .hero-subtitle { max-width: 100%; }
    .hero-visual-wrap { max-width: 380px; }
    .always-on-img { max-height: 360px; }
  }

  /* ══════════════ VERY SMALL (≤ 360px) ════════════════════════════════ */
  @media (max-width: 360px) {
    .site-logo-name { font-size: 15px; }
    .site-cta-btn { display: none; }
    .hero-title { font-size: 30px; }
    .always-on-title { font-size: 26px; }
    .btn-hero-primary, .btn-hero-ghost { font-size: 13.5px; padding: 12px 18px; }
  }
`

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
            <Img src={imgBraeloLogo} alt="Braelo" className="site-logo-img"
              fallback={<div className="site-logo-fallback">B</div>} />
            <span className="site-logo-name">Brae<span>lo</span></span>
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
              <Img src={imgBraeloLogo} alt="Braelo" className="footer-logo-img"
                fallback={<div className="site-logo-fallback" style={{ width:32,height:32,fontSize:12 }}>B</div>} />
              <span className="footer-logo-name">Brae<span>lo</span></span>
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
              <span>Braelo</span> never does.
            </h2>

            <p className="always-on-sub">
              Whether it&apos;s 3 AM or a holiday, Braelo is always awake, always ready. Get instant local answers the moment you need them — no waiting, no downtime, no excuses.
            </p>

            <div className="always-on-stats">
              <div className="always-on-stat">
                <span className="always-on-stat-num">99.9%</span>
                <span className="always-on-stat-label">Uptime guaranteed</span>
              </div>
              <div className="always-on-stat">
                <span className="always-on-stat-num">&lt; 2s</span>
                <span className="always-on-stat-label">Average response</span>
              </div>
              <div className="always-on-stat">
                <span className="always-on-stat-num">24/7</span>
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

// ─── Onboarding View ──────────────────────────────────────────────────────────
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
          <div className="logo-wrap" style={{ width:36,height:36 }}>
            <Img src={imgBraeloLogo} alt="Braelo" className="logo-img" style={{ width:36,height:36 }}
              fallback={<div className="logo-fallback" style={{ width:36,height:36,fontSize:14 }}>B</div>} />
          </div>
          <div>
            <div className="header-title">Braelo</div>
            <div className="header-sub">Your USA local guide</div>
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
  const [theme,              setTheme]              = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia)
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    return 'light'
  })
  const [inputFocused,       setInputFocused]       = useState(false)
  const [userProfile,        setUserProfile]        = useState(INITIAL_PROFILE)
  const [onboardingDone,     setOnboardingDone]     = useState(false)
  const [showContactModal,   setShowContactModal]   = useState(false)
  const [contactModalMsg,    setContactModalMsg]    = useState('')
  const [contactEmail,       setContactEmail]       = useState('')
  const [contactPhone,       setContactPhone]       = useState('')
  const [showScrollBtn,      setShowScrollBtn]      = useState(false)
  const [copiedId,           setCopiedId]           = useState(null)

  const messagesEndRef   = useRef(null)
  const messagesAreaRef  = useRef(null)
  const textareaRef      = useRef(null)
  const chatSectionRef   = useRef(null)

  useEffect(() => {
    const el = document.createElement('style')
    el.innerHTML = GLOBAL_CSS
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.body.setAttribute('data-theme', theme)
  }, [theme])

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

  const buildPayload = (text) => ({
    message: text,
    name:     userProfile.name     || undefined,
    email:    userProfile.email    || undefined,
    phone:    userProfile.phone    || undefined,
    state:    userProfile.state    || undefined,
    county:   userProfile.county   || undefined,
    zip_code: userProfile.zipCode  || undefined,
  })

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

  // ─── Chat widget (rendered inside chat section) ───
  const ChatWidget = onboardingDone ? (
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
            <Img src={imgBraeloLogo} alt="Braelo" className="logo-img"
              fallback={<div className="logo-fallback">B</div>} />
            <span className="status-dot" aria-hidden="true" />
          </div>
          <div>
            <div className="header-title">Braelo</div>
            <div className="header-sub">Your USA local guide · <span className="online-text">Online</span></div>
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
        <p className="input-hint">Braelo may make mistakes. Verify important information.</p>
      </div>
    </div>
  ) : (
    <OnboardingView theme={theme} onToggleTheme={toggleTheme} onComplete={handleOnboardingComplete} />
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

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Papa from "papaparse";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg0: "#0A0D14", bg1: "#0F1322", bg2: "#141829", bg3: "#1A2035",
  glass: "rgba(255,255,255,0.04)", glassBorder: "rgba(255,255,255,0.08)",
  blue: "#3B82F6", blueD: "#1D4ED8", blueL: "#93C5FD",
  purple: "#8B5CF6", purpleL: "#C4B5FD",
  green: "#10B981", greenL: "#6EE7B7",
  red: "#EF4444", redL: "#FCA5A5",
  amber: "#F59E0B", amberL: "#FCD34D",
  cyan: "#06B6D4", cyanL: "#67E8F9",
  pink: "#EC4899", orange: "#F97316",
  text: "#F1F5F9", textSub: "#94A3B8", textMuted: "#64748B",
  border: "rgba(255,255,255,0.06)",
};

// ─── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:${T.bg0};color:${T.text};min-height:100vh;overflow-x:hidden}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
    .mono{font-family:'JetBrains Mono',monospace}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes countUp{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
    @keyframes floatSlow{0%,100%{transform:translate(0,0)}50%{transform:translate(-3%,4%)}}
    @keyframes floatSlow2{0%,100%{transform:translate(0,0)}50%{transform:translate(4%,-3%)}}
    @keyframes drift{0%{transform:translateY(0) translateX(0)}100%{transform:translateY(-120vh) translateX(20px)}}
    @keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
    @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes paletteIn{from{opacity:0;transform:translate(-50%,-48%) scale(0.97)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
    @keyframes gradientShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
    .fade-in{animation:fadeIn 0.4s ease forwards}
    .scale-in{animation:scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards}
    .slide-up{animation:slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards}
    .slide-down{animation:slideDown 0.3s cubic-bezier(0.16,1,0.3,1) forwards}
    .pulse{animation:pulse 2s infinite}
    .spin{animation:spin 1s linear infinite}
    .count-up{animation:countUp 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards}
    .card{
      background:${T.glass};
      border:1px solid ${T.glassBorder};
      border-radius:16px;
      backdrop-filter:blur(16px);
      transition:all 0.2s ease;
    }
    .card:hover{border-color:rgba(255,255,255,0.14);transform:translateY(-1px);box-shadow:0 8px 32px rgba(0,0,0,0.3)}
    .btn{
      padding:8px 18px;border-radius:10px;border:none;cursor:pointer;
      font-family:'Inter',sans-serif;font-size:13px;font-weight:500;
      transition:all 0.2s ease;display:inline-flex;align-items:center;gap:6px;
    }
    .btn-primary{background:linear-gradient(135deg,${T.blue},${T.purple});color:white;box-shadow:0 4px 15px rgba(59,130,246,0.3)}
    .btn-primary:hover{opacity:0.9;transform:translateY(-1px);box-shadow:0 6px 20px rgba(59,130,246,0.4)}
    .btn-ghost{background:${T.glass};border:1px solid ${T.glassBorder};color:${T.textSub}}
    .btn-ghost:hover{background:rgba(255,255,255,0.08);color:${T.text}}
    .badge{
      display:inline-flex;align-items:center;gap:4px;
      padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;
    }
    .badge-red{background:rgba(239,68,68,0.15);color:${T.redL};border:1px solid rgba(239,68,68,0.2)}
    .badge-amber{background:rgba(245,158,11,0.15);color:${T.amberL};border:1px solid rgba(245,158,11,0.2)}
    .badge-green{background:rgba(16,185,129,0.15);color:${T.greenL};border:1px solid rgba(16,185,129,0.2)}
    .badge-blue{background:rgba(59,130,246,0.15);color:${T.blueL};border:1px solid rgba(59,130,246,0.2)}
    .badge-purple{background:rgba(139,92,246,0.15);color:${T.purpleL};border:1px solid rgba(139,92,246,0.2)}
    .table-wrap{overflow-x:auto;border-radius:12px;border:1px solid ${T.border}}
    table{width:100%;border-collapse:collapse;font-size:13px}
    thead th{
      padding:10px 14px;text-align:left;font-size:11px;font-weight:600;
      color:${T.textMuted};text-transform:uppercase;letter-spacing:0.06em;
      background:rgba(255,255,255,0.03);border-bottom:1px solid ${T.border};
      white-space:nowrap;position:sticky;top:0;z-index:2;
    }
    tbody tr{border-bottom:1px solid ${T.border};transition:background 0.15s}
    tbody tr:hover{background:rgba(255,255,255,0.04)}
    tbody td{padding:10px 14px;color:${T.textSub};vertical-align:middle}
    tbody td:first-child{color:${T.text};font-weight:500}
    .input{
      background:rgba(255,255,255,0.05);border:1px solid ${T.glassBorder};
      border-radius:10px;padding:8px 14px;color:${T.text};font-size:13px;
      font-family:'Inter',sans-serif;outline:none;transition:border-color 0.2s,box-shadow 0.2s;width:100%;
    }
    .input:focus{border-color:${T.blue};box-shadow:0 0 0 3px rgba(59,130,246,0.15)}
    .nav-item{
      display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:10px;
      cursor:pointer;font-size:13px;font-weight:500;color:${T.textSub};
      transition:all 0.15s;white-space:nowrap;
    }
    .nav-item:hover{background:rgba(255,255,255,0.06);color:${T.text}}
    .nav-item.active{background:linear-gradient(135deg,rgba(59,130,246,0.18),rgba(139,92,246,0.18));color:${T.text};border:1px solid rgba(59,130,246,0.25);box-shadow:0 2px 12px rgba(59,130,246,0.15)}
    .nav-section{font-size:10px;font-weight:700;color:${T.textMuted};text-transform:uppercase;letter-spacing:0.1em;padding:14px 14px 6px}
    .kpi-card{
      background:${T.glass};border:1px solid ${T.glassBorder};border-radius:16px;
      padding:18px 20px;transition:all 0.25s cubic-bezier(0.16,1,0.3,1);cursor:default;position:relative;overflow:hidden;
      backdrop-filter:blur(16px);
    }
    .kpi-card:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(0,0,0,0.3);border-color:rgba(255,255,255,0.16)}
    .kpi-card::before{
      content:'';position:absolute;top:0;left:0;right:0;height:2px;
      background:var(--accent);opacity:0.7;
    }
    .kpi-card::after{
      content:'';position:absolute;top:0;left:0;right:0;bottom:0;
      background:radial-gradient(ellipse at 50% -20%, rgba(255,255,255,0.04), transparent 70%);
      pointer-events:none;
    }
    .alert-item{
      display:flex;align-items:flex-start;gap:12px;padding:14px 16px;
      border-radius:12px;border:1px solid var(--alert-border);
      background:var(--alert-bg);margin-bottom:8px;cursor:pointer;transition:all 0.2s;
    }
    .alert-item:hover{transform:translateX(4px);border-color:var(--alert-hover);box-shadow:0 4px 16px rgba(0,0,0,0.2)}
    .progress-bar{height:4px;border-radius:2px;background:rgba(255,255,255,0.08);overflow:hidden;margin-top:8px}
    .progress-fill{height:100%;border-radius:2px;transition:width 1s cubic-bezier(0.16,1,0.3,1);background:var(--fill)}
    .skeleton{
      background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%);
      background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px;
    }
    .tag{padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;background:rgba(255,255,255,0.06);color:${T.textSub};transition:background 0.15s}
    .tag:hover{background:rgba(255,255,255,0.1)}

    /* ── ENTERPRISE OS SHELL ───────────────────────────────────────────── */
    .os-shell{position:relative;display:flex;min-height:100vh;background:${T.bg0};overflow:hidden}
    .aurora{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
    .aurora-blob{position:absolute;border-radius:50%;filter:blur(90px);opacity:0.45}
    .aurora-blob.b1{width:560px;height:560px;top:-160px;left:-120px;background:radial-gradient(circle,rgba(59,130,246,0.38),transparent 70%);animation:floatSlow 22s ease-in-out infinite}
    .aurora-blob.b2{width:620px;height:620px;bottom:-220px;right:-160px;background:radial-gradient(circle,rgba(139,92,246,0.32),transparent 70%);animation:floatSlow2 26s ease-in-out infinite}
    .aurora-blob.b3{width:420px;height:420px;top:35%;left:45%;background:radial-gradient(circle,rgba(6,182,212,0.18),transparent 70%);animation:floatSlow 30s ease-in-out infinite}
    .aurora-cursor-glow{position:fixed;width:500px;height:500px;border-radius:50%;pointer-events:none;z-index:1;
      background:radial-gradient(circle,rgba(59,130,246,0.07),transparent 70%);
      transform:translate(-50%,-50%);transition:left 0.3s ease-out,top 0.3s ease-out}

    /* ── OS ICON RAIL (persistent across all pages) ─── */
    .os-rail{
      position:fixed;left:0;top:0;bottom:0;width:56px;z-index:10;
      background:rgba(10,13,20,0.85);backdrop-filter:blur(24px);
      border-right:1px solid ${T.border};
      display:flex;flex-direction:column;align-items:center;
      padding:14px 0;gap:4px;
    }
    .os-rail-btn{
      width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;
      cursor:pointer;transition:all 0.18s cubic-bezier(0.16,1,0.3,1);color:${T.textMuted};position:relative;
      border:1px solid transparent;
    }
    .os-rail-btn:hover{background:rgba(255,255,255,0.07);color:${T.text};border-color:${T.border}}
    .os-rail-btn.active{background:linear-gradient(135deg,rgba(59,130,246,0.22),rgba(139,92,246,0.18));color:${T.text};border-color:rgba(59,130,246,0.3);box-shadow:0 2px 12px rgba(59,130,246,0.2)}
    .os-rail-tooltip{
      position:absolute;left:52px;top:50%;transform:translateY(-50%);
      background:rgba(15,19,34,0.95);border:1px solid ${T.border};border-radius:8px;
      padding:5px 10px;font-size:12px;font-weight:600;color:${T.text};white-space:nowrap;
      pointer-events:none;opacity:0;transition:opacity 0.15s;z-index:100;
      backdrop-filter:blur(12px);box-shadow:0 8px 24px rgba(0,0,0,0.4);
    }
    .os-rail-btn:hover .os-rail-tooltip{opacity:1}
    .os-rail-divider{width:28px;height:1px;background:${T.border};margin:4px 0}

    .os-sidebar{position:relative;z-index:2;flex-shrink:0;background:rgba(15,19,34,0.75);backdrop-filter:blur(20px);
      border-right:1px solid ${T.border};display:flex;flex-direction:column;transition:width 0.3s cubic-bezier(0.16,1,0.3,1);overflow:hidden}
    .os-content{position:relative;z-index:2;flex:1;overflow:auto}
    .os-logo{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,${T.blue},${T.purple},${T.cyan});
      display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#fff;flex-shrink:0;
      box-shadow:0 0 20px rgba(59,130,246,0.4)}
    .module-card{
      background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:26px;cursor:pointer;
      transition:all 0.28s cubic-bezier(0.16,1,0.3,1);position:relative;overflow:hidden;backdrop-filter:blur(16px);
    }
    .module-card::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.03),transparent 60%);pointer-events:none}
    .module-card:hover{transform:translateY(-5px) scale(1.01);border-color:rgba(255,255,255,0.18);box-shadow:0 24px 60px rgba(0,0,0,0.4)}
    .greeting-card{
      background:linear-gradient(135deg,rgba(59,130,246,0.12),rgba(139,92,246,0.09),rgba(6,182,212,0.06));
      border:1px solid rgba(255,255,255,0.10);border-radius:22px;padding:32px;position:relative;overflow:hidden;
      backdrop-filter:blur(16px);
    }
    .greeting-card::before{content:'';position:absolute;top:-60px;right:-60px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.15),transparent 70%);pointer-events:none}
    .quick-action{
      display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:12px;
      background:${T.glass};border:1px solid ${T.glassBorder};cursor:pointer;transition:all 0.2s cubic-bezier(0.16,1,0.3,1);font-size:13px;font-weight:500;color:${T.textSub};
      backdrop-filter:blur(12px);
    }
    .quick-action:hover{background:rgba(255,255,255,0.08);color:${T.text};transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.3);border-color:rgba(255,255,255,0.12)}
    .ai-fab{
      position:fixed;bottom:26px;right:26px;z-index:50;width:56px;height:56px;border-radius:50%;
      background:linear-gradient(135deg,${T.blue},${T.purple});display:flex;align-items:center;justify-content:center;
      cursor:pointer;box-shadow:0 8px 30px rgba(59,130,246,0.5);transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);
      border:none;color:#fff;
    }
    .ai-fab:hover{transform:scale(1.1) rotate(10deg);box-shadow:0 14px 44px rgba(139,92,246,0.6)}
    .ai-panel{
      position:fixed;bottom:96px;right:26px;z-index:50;width:380px;max-width:90vw;max-height:70vh;
      background:rgba(12,15,28,0.94);backdrop-filter:blur(28px);border:1px solid ${T.glassBorder};border-radius:20px;
      box-shadow:0 28px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.04);display:flex;flex-direction:column;overflow:hidden;
    }
    .ai-msg{padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.6;max-width:85%}
    .ai-msg.user{align-self:flex-end;background:linear-gradient(135deg,${T.blue},${T.purple});color:#fff;box-shadow:0 4px 12px rgba(59,130,246,0.3)}
    .ai-msg.bot{align-self:flex-start;background:rgba(255,255,255,0.06);color:${T.text};border:1px solid ${T.border}}
    .noise-overlay{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:0.03;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

    /* ── COMMAND PALETTE ──────────────────────────────────────────────── */
    .cmd-overlay{
      position:fixed;inset:0;z-index:100;background:rgba(5,7,14,0.75);backdrop-filter:blur(8px);
      display:flex;align-items:center;justify-content:center;
    }
    .cmd-palette{
      width:580px;max-width:92vw;background:rgba(12,16,28,0.97);border:1px solid rgba(255,255,255,0.12);
      border-radius:18px;box-shadow:0 32px 90px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.04);
      overflow:hidden;animation:paletteIn 0.22s cubic-bezier(0.16,1,0.3,1) forwards;
    }
    .cmd-input-wrap{
      display:flex;align-items:center;gap:12px;padding:18px 20px;
      border-bottom:1px solid rgba(255,255,255,0.07);
    }
    .cmd-input{
      flex:1;background:transparent;border:none;outline:none;
      font-family:'Inter',sans-serif;font-size:16px;color:${T.text};
    }
    .cmd-input::placeholder{color:${T.textMuted}}
    .cmd-results{max-height:380px;overflow-y:auto;padding:8px}
    .cmd-item{
      display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;
      cursor:pointer;transition:background 0.1s;
    }
    .cmd-item:hover,.cmd-item.selected{background:rgba(59,130,246,0.12);color:${T.text}}
    .cmd-item-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .cmd-item-label{font-size:14px;font-weight:500;color:${T.text}}
    .cmd-item-sub{font-size:12px;color:${T.textMuted};margin-left:auto}
    .cmd-section-label{font-size:10px;font-weight:700;color:${T.textMuted};text-transform:uppercase;letter-spacing:0.1em;padding:10px 14px 4px}
    .cmd-footer{
      padding:10px 20px;border-top:1px solid rgba(255,255,255,0.06);
      display:flex;align-items:center;gap:16px;font-size:11px;color:${T.textMuted};
    }
    .cmd-key{display:inline-flex;align-items:center;gap:4px}
    .cmd-kbd{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:5px;padding:2px 6px;font-size:10px;font-weight:600;color:${T.textSub}}

    /* ── BREADCRUMB ──────────────────────────────────────────────────── */
    .breadcrumb{display:flex;align-items:center;gap:6px;font-size:13px}
    .breadcrumb-item{color:${T.textMuted};cursor:pointer;transition:color 0.15s;padding:2px 4px;border-radius:4px}
    .breadcrumb-item:hover{color:${T.text};background:rgba(255,255,255,0.04)}
    .breadcrumb-item.current{color:${T.text};font-weight:600;cursor:default}
    .breadcrumb-sep{color:${T.border};font-size:14px;user-select:none}

    /* ── TOPBAR ─────────────────────────────────────────────────────── */
    .os-topbar{
      padding:12px 24px;border-bottom:1px solid ${T.border};
      display:flex;align-items:center;gap:14px;
      background:rgba(10,13,20,0.85);backdrop-filter:blur(20px);
      position:sticky;top:0;z-index:8;
    }
    .os-back-btn{
      display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
      background:${T.glass};border:1px solid ${T.glassBorder};color:${T.textSub};
      cursor:pointer;font-size:13px;font-weight:500;transition:all 0.15s;
    }
    .os-back-btn:hover{background:rgba(255,255,255,0.07);color:${T.text}}
  `}</style>
);

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ n, s = 16, c }) => {
  const icons = {
    dashboard: "M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z",
    tickets: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    agents: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm8 0a4 4 0 100-8 4 4 0 000 8",
    alert: "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
    check: "M20 6L9 17l-5-5",
    close: "M18 6L6 18M6 6l12 12",
    upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
    clock: "M12 2a10 10 0 100 20A10 10 0 0012 2zm0 5v5l4 2",
    trend: "M22 12h-4l-3 9L9 3l-3 9H2",
    robot: "M12 2a2 2 0 012 2v1a7 7 0 010 14v1a2 2 0 01-4 0v-1a7 7 0 010-14V4a2 2 0 012-2zM9 10h.01M15 10h.01M9 14s1 1 3 1 3-1 3-1",
    sla: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    reopen: "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15",
    duplicate: "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M15 2H9a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1z",
    settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
    fire: "M12 2c0 0-8 6-8 12a8 8 0 0016 0c0-6-8-12-8-12zm0 0c0 0 4 4 4 8a4 4 0 01-8 0c0-4 4-8 4-8z",
    refund: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    customer: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8",
    order: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
    report: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
    download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
    ai: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
    ops: "M12 20V10M18 20V4M6 20v-4",
    search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
    filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
    eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
    chevron: "M9 18l6-6-6-6",
    info: "M12 2a10 10 0 100 20A10 10 0 0012 2zm0 9v5m0-9h.01",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    timeline: "M12 2v20M2 12h20",
    warn: "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
    home: "M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z",
    brand: "M20.59 13.41L11 3.83A2 2 0 009.59 3.24L3.24 9.59A2 2 0 003.83 11l9.58 9.58a2 2 0 002.83 0l4.35-4.35a2 2 0 000-2.83zM7 8a1 1 0 110-2 1 1 0 010 2z",
    product: "M21 8L12 3 3 8v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8",
    box: "M21 8L12 3 3 8v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8",
    calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
    sparkle: "M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2zM19 15l0.8 2.4L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.6L19 15z",
    layers: "M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5",
    grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
    exportIcon: "M12 15V3m0 12l-4-4m4 4l4-4M4 17v3a2 2 0 002 2h12a2 2 0 002-2v-3",
    percent: "M19 5L5 19M6.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM17.5 20a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
    truck: "M1 3h13v13H1zM14 8h4l3 3v5h-7zM4.5 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
    defect: "M12 8v5m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z",
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={icons[n] || icons.dashboard} />
    </svg>
  );
};

// ─── COMMAND PALETTE ─────────────────────────────────────────────────────────
const CMD_ITEMS = [
  { section: "Navigation" },
  { id: "home", label: "Home", sub: "OS Home", icon: "home", color: T.blue },
  { id: "operations", label: "Operations Analytics", sub: "Orders, brands, escalation", icon: "ops", color: T.cyan },
  { id: "support", label: "Customer Support", sub: "Tickets, agents, SLA", icon: "tickets", color: T.purple },
  { id: "settings", label: "Settings", sub: "Thresholds & rules", icon: "settings", color: T.textMuted },
  { section: "Actions" },
  { id: "ai", label: "Ask OPX AI", sub: "Open AI assistant", icon: "sparkle", color: T.amber, action: "ai" },
];

const CommandPalette = ({ open, onClose, onNav, onOpenAI }) => {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);

  const items = useMemo(() => {
    const flat = CMD_ITEMS.filter(i => !i.section);
    if (!q.trim()) return flat;
    const lq = q.toLowerCase();
    return flat.filter(i => i.label.toLowerCase().includes(lq) || (i.sub || "").toLowerCase().includes(lq));
  }, [q]);

  const go = (item) => {
    onClose();
    if (item.action === "ai") { onOpenAI(); return; }
    onNav(item.id);
  };

  const handleKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(s + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
    else if (e.key === "Enter" && items[sel]) go(items[sel]);
    else if (e.key === "Escape") onClose();
  };

  if (!open) return null;
  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-palette" onClick={e => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <Icon n="search" s={18} c={T.textMuted} />
          <input ref={inputRef} className="cmd-input" placeholder="Search pages, actions..." value={q} onChange={e => { setQ(e.target.value); setSel(0); }} onKeyDown={handleKey} />
          <span style={{ fontSize: 11, color: T.textMuted, background: "rgba(255,255,255,0.06)", padding: "3px 7px", borderRadius: 6, border: `1px solid ${T.border}` }}>ESC</span>
        </div>
        <div className="cmd-results">
          {!q.trim() && <div className="cmd-section-label">Navigation</div>}
          {items.length === 0 && <div style={{ padding: "24px", textAlign: "center", color: T.textMuted, fontSize: 13 }}>No results for "{q}"</div>}
          {items.map((item, i) => (
            <div key={item.id} className={`cmd-item ${i === sel ? "selected" : ""}`} onClick={() => go(item)} onMouseEnter={() => setSel(i)}>
              <div className="cmd-item-icon" style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
                <Icon n={item.icon} s={15} c={item.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="cmd-item-label">{item.label}</div>
                {item.sub && <div style={{ fontSize: 11, color: T.textMuted }}>{item.sub}</div>}
              </div>
              <div className="cmd-item-sub">↵</div>
            </div>
          ))}
        </div>
        <div className="cmd-footer">
          <span className="cmd-key"><span className="cmd-kbd">↑↓</span> navigate</span>
          <span className="cmd-key"><span className="cmd-kbd">↵</span> open</span>
          <span className="cmd-key"><span className="cmd-kbd">ESC</span> close</span>
          <span style={{ marginLeft: "auto" }}><span className="cmd-kbd">⌘K</span> to open anytime</span>
        </div>
      </div>
    </div>
  );
};

// ─── BREADCRUMB ──────────────────────────────────────────────────────────────
const Breadcrumb = ({ crumbs }) => (
  <div className="breadcrumb">
    {crumbs.map((c, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {i > 0 && <span className="breadcrumb-sep">/</span>}
        <span className={`breadcrumb-item ${i === crumbs.length - 1 ? "current" : ""}`} onClick={c.onClick}>{c.label}</span>
      </div>
    ))}
  </div>
);

// ─── OS ICON RAIL ─────────────────────────────────────────────────────────────
const OSRail = ({ page, onNav, onOpenAI, onOpenCmd, csStats, opsStats }) => {
  const criticalBrands = opsStats?.kpis?.critical_brands ?? 0;
  const acrViolations = csStats?.acrViolations?.length ?? 0;
  const hasAlerts = criticalBrands > 0 || acrViolations > 0;

  const items = [
    { id: "home", icon: "home", label: "Home" },
    { id: "operations", icon: "ops", label: "Operations" },
    { id: "support", icon: "tickets", label: "Customer Support" },
    { id: "settings", icon: "settings", label: "Settings" },
  ];

  return (
    <div className="os-rail">
      {/* Logo */}
      <div className="os-logo" style={{ width: 32, height: 32, fontSize: 13, marginBottom: 8, cursor: "pointer" }} onClick={() => onNav("home")}>O</div>
      <div className="os-rail-divider" />

      {items.map(item => (
        <div key={item.id} className={`os-rail-btn ${page === item.id || (page === "operations" && item.id === "operations") || (page === "support" && item.id === "support") ? "active" : ""}`} onClick={() => onNav(item.id)}>
          <Icon n={item.icon} s={17} />
          <span className="os-rail-tooltip">{item.label}</span>
        </div>
      ))}

      <div className="os-rail-divider" />

      <div className="os-rail-btn" onClick={onOpenCmd} title="Command Palette (Ctrl+K)">
        <Icon n="search" s={16} />
        <span className="os-rail-tooltip">Search (Ctrl+K)</span>
      </div>

      <div className="os-rail-btn" onClick={onOpenAI} style={{ marginTop: "auto" }}>
        <Icon n="sparkle" s={16} c={T.amber} />
        <span className="os-rail-tooltip">OPX AI</span>
        {hasAlerts && <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: T.red, boxShadow: "0 0 6px rgba(239,68,68,0.8)" }} />}
      </div>
    </div>
  );
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = {
  num: n => n == null ? "—" : Number(n).toLocaleString(),
  pct: (n, d = 1) => n == null ? "—" : `${Number(n).toFixed(d)}%`,
  hrs: n => n == null ? "—" : n < 1 ? `${Math.round(n * 60)}m` : `${n.toFixed(1)}h`,
  date: s => s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
  ago: s => {
    if (!s) return "—";
    const d = (new Date() - new Date(s)) / 86400000;
    if (d < 1) return "Today";
    if (d < 2) return "Yesterday";
    return `${Math.round(d)}d ago`;
  },
};

const daysBetween = (a, b) => {
  if (!a || !b) return null;
  const diff = (new Date(b) - new Date(a)) / 86400000;
  return isNaN(diff) ? null : Math.abs(diff);
};

const STATUS_COLORS = {
  CLOSED: T.green, RESOLVED: T.blue, OPEN: T.amber,
  PENDING: T.purple, "RE-OPENED": T.red, NEW: T.cyan,
  ACR: T.orange, ASR: T.pink, BOT: T.textSub,
};

const safeFileName = name => String(name || "export").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "export";

const normalizeExportRow = row => {
  if (!row || typeof row !== "object") return { value: row };
  const out = {};
  Object.entries(row).forEach(([key, value]) => {
    if (key.startsWith("_") && !["_status", "_daysSinceCreated", "_daysSinceResolved", "_resolutionHrs", "_frtHrs"].includes(key)) return;
    if (value instanceof Date) out[key] = value.toISOString();
    else if (value == null) out[key] = "";
    else if (typeof value !== "object") out[key] = value;
  });
  if (row._violation) {
    out.violationExpected = row._violation.expected || "";
    out.violationReason = row._violation.reason || "";
    out.violationDays = row._violation.days || "";
    out.violationPriority = row._violation.priority || "";
  }
  return out;
};

const downloadCsv = (rows, name) => {
  const data = Array.isArray(rows) ? rows : [];
  const csv = Papa.unparse(data.map(normalizeExportRow));
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = safeFileName(name) + ".csv";
  link.click();
  URL.revokeObjectURL(link.href);
};

const ExportButton = ({ rows, name, label = "Export" }) => (
  <button className="btn btn-ghost" onClick={e => { e.stopPropagation(); downloadCsv(rows, name); }} disabled={!rows?.length} title={"Download " + (name || "export") + " CSV"}>
    <Icon n="download" s={14} /> {label}
  </button>
);

// ─── DATA ENGINE ──────────────────────────────────────────────────────────────
function processData(rawData, rules) {
  const df = rawData.filter(r => r.ticketId);
  const now = new Date();

  // Parse dates
  df.forEach(r => {
    r._created = r.createdAtDate ? new Date(r.createdAtDate) : null;
    r._resolved = r.resolvedAtDate ? new Date(r.resolvedAtDate) : null;
    r._closed = r.closedAtDate ? new Date(r.closedAtDate) : null;
    r._reopened = r["Reopened Date"] ? new Date(r["Reopened Date"]) : null;
    r._lastResp = (r.lastResponseAtDate || r["Last Response Date"]) ? new Date(r.lastResponseAtDate || r["Last Response Date"]) : null;
    r._firstAssigned = r["First Assignment Date"] ? new Date(r["First Assignment Date"]) : null;
    r._frtDate = r["Agents' First Response Date"] ? new Date(r["Agents' First Response Date"]) : null;
    r._daysSinceCreated = r._created ? daysBetween(r._created, now) : null;
    r._daysSinceResolved = r._resolved ? daysBetween(r._resolved, now) : null;
    r._resolutionHrs = (r._created && r._resolved) ? (r._resolved - r._created) / 3600000 : null;
    r._frtStart = r._firstAssigned || r._created;
    r._frtHrs = (r._frtStart && r._frtDate) ? (r._frtDate - r._frtStart) / 3600000 : null;
    r._status = (r.ticketStatus || "").toUpperCase().trim();
  });

  // Auto closure violations
  const acrViolations = df.filter(r => {
    if (r._status === "CLOSED") return false;
    const days = r._daysSinceResolved || r._daysSinceCreated;
    const acrDays = r._lastResp ? (now - r._lastResp) / 86400000 : null;
    if (r._status === "ACR") return acrDays != null && acrDays > rules.acrAutoClose;
    if (!days) return false;
    if (r._status === "RESOLVED" && days > rules.resolvedAutoClose) return true;
    if (r._status === "PENDING" && days > rules.pendingCustomerInactivity) return true;
    if (r._status === "OPEN" && days > rules.openAgentInactivity) return true;
    if (r._status === "NEW" && days > rules.newTicketSLA) return true;
    if (r._status === "ASR" && days > rules.asrAutoClose) return true;
    return false;
  }).map(r => {
    let expected = "CLOSED", reason = "", days = 0;
    if (r._status === "RESOLVED") { reason = `Resolved ${r._daysSinceResolved?.toFixed(1)}d ago — should auto-close after ${rules.resolvedAutoClose}d`; days = r._daysSinceResolved; }
    else if (r._status === "PENDING") { reason = `Pending ${r._daysSinceCreated?.toFixed(1)}d — no customer reply`; days = r._daysSinceCreated; expected = "CLOSED (Customer Inactive)"; }
    else if (r._status === "OPEN") { reason = `Open ${r._daysSinceCreated?.toFixed(1)}d — no agent action`; days = r._daysSinceCreated; expected = "ESCALATED"; }
    else if (r._status === "ACR") { days = r._lastResp ? (now - r._lastResp) / 86400000 : 0; reason = `ACR last response ${days?.toFixed(1)}d ago - should auto-close after ${rules.acrAutoClose}d`; }
    else if (r._status === "ASR") { reason = `ASR for ${r._daysSinceCreated?.toFixed(1)}d — should auto-close`; days = r._daysSinceCreated; }
    else if (r._status === "NEW") { reason = `NEW for ${r._daysSinceCreated?.toFixed(1)}d — no assignment`; days = r._daysSinceCreated; }
    const priority = days > 10 ? "CRITICAL" : days > 5 ? "HIGH" : "MEDIUM";
    return { ...r, _violation: { expected, reason, days: days?.toFixed(1), priority } };
  });

  // Re-opened analytics
  const reopened = df.filter(r => r._reopened || r._status === "RE-OPENED");
  const reopenedWithin24h = reopened.filter(r => {
    if (!r._resolved || !r._reopened) return false;
    return daysBetween(r._resolved, r._reopened) <= 1;
  });
  const reopenedWithin7d = reopened.filter(r => {
    if (!r._resolved || !r._reopened) return false;
    return daysBetween(r._resolved, r._reopened) <= 7;
  });

  // Duplicates (same customerId + same order)
  const orderGroups = {};
  const customerGroups = {};
  df.forEach(r => {
    if (r.OrderID && r.OrderID !== "-") {
      if (!orderGroups[r.OrderID]) orderGroups[r.OrderID] = [];
      orderGroups[r.OrderID].push(r);
    }
    if (r.customerId) {
      if (!customerGroups[r.customerId]) customerGroups[r.customerId] = [];
      customerGroups[r.customerId].push(r);
    }
  });
  const duplicateOrders = Object.entries(orderGroups)
    .filter(([, v]) => v.length > 1 && v.some(t => !["CLOSED","RESOLVED"].includes(t._status)))
    .map(([orderId, tickets]) => ({ orderId, count: tickets.length, tickets }));

  // Status breakdown
  const statusCounts = {};
  df.forEach(r => { statusCounts[r._status] = (statusCounts[r._status] || 0) + 1; });

  // Agent performance
  const agentMap = {};
  df.forEach(r => {
    if (!r._firstAssigned) return;
    const ag = r.firstRespondingAgent || r.assignedAgent;
    if (!ag || ag === "-") return;
    if (!agentMap[ag]) agentMap[ag] = { name: ag.split("@")[0], tickets: [], resolved: 0, reopened: 0 };
    agentMap[ag].tickets.push(r);
    if (r._status === "RESOLVED" || r._status === "CLOSED") agentMap[ag].resolved++;
    if (r._reopened) agentMap[ag].reopened++;
  });
  const agents = Object.values(agentMap).map(a => ({
    ...a,
    total: a.tickets.length,
    resRate: a.tickets.length ? (a.resolved / a.tickets.length * 100) : 0,
    avgResHrs: a.tickets.filter(t => t._resolutionHrs).reduce((s, t) => s + t._resolutionHrs, 0) / (a.tickets.filter(t => t._resolutionHrs).length || 1),
    avgFrtHrs: a.tickets.filter(t => t._frtHrs).reduce((s, t) => s + t._frtHrs, 0) / (a.tickets.filter(t => t._frtHrs).length || 1),
  })).sort((a, b) => b.total - a.total);

  // KPIs
  const total = df.length;
  const closed = statusCounts["CLOSED"] || 0;
  const resolved = statusCounts["RESOLVED"] || 0;
  const open = statusCounts["OPEN"] || 0;
  const pending = statusCounts["PENDING"] || 0;
  const newT = statusCounts["NEW"] || 0;
  const reOpened = reopened.length;
  const acr = statusCounts["ACR"] || 0;
  const asr = statusCounts["ASR"] || 0;

  const resHrs = df.filter(r => r._resolutionHrs > 0 && r._resolutionHrs < 720);
  const avgResHrs = resHrs.length ? resHrs.reduce((s, r) => s + r._resolutionHrs, 0) / resHrs.length : 0;
  const frtTickets = df.filter(r => r._frtHrs > 0 && r._frtHrs < 720);
  const avgFrtHrs = frtTickets.length ? frtTickets.reduce((s, r) => s + r._frtHrs, 0) / frtTickets.length : 0;

  // Category & channel
  const categories = {};
  const channels = {};
  const subCats = {};
  const brands = {};
  df.forEach(r => {
    const cat = r["Ticket Category"] || "-";
    categories[cat] = (categories[cat] || 0) + 1;
    const ch = r.channel || "-";
    channels[ch] = (channels[ch] || 0) + 1;
    const sub = r["Ticket Category_Ticket Sub-Category"] || "-";
    if (sub !== "-") subCats[sub] = (subCats[sub] || 0) + 1;
    const br = r["Brand Name"] || "-";
    if (br !== "-") brands[br] = (brands[br] || 0) + 1;
  });

  // KPI drill-down datasets
  const pendingTickets = df.filter(r => r._status === "PENDING");
  const acrTickets = df.filter(r => r._status === "ACR");
  const asrTickets = df.filter(r => r._status === "ASR");
  const open7Days = df.filter(r => !["CLOSED","RESOLVED"].includes(r._status) && r._daysSinceCreated >= 7);
  const autoClosed = df.filter(r => r._status === "CLOSED" && r._closed);
  const autoCloseDue = acrViolations.filter(r => r._status === "ACR");
  const closedTickets = df.filter(r => r._status === "CLOSED");
  const resolvedTickets = df.filter(r => r._status === "RESOLVED");
  const openTickets = df.filter(r => r._status === "OPEN");
  const resolutionRateTickets = df.filter(r => ["CLOSED","RESOLVED"].includes(r._status));
  const duplicateTickets = duplicateOrders.flatMap(o => o.tickets);

  // SLA at risk (open/pending > 3 days)
  const slaRisk = df.filter(r => !["CLOSED","RESOLVED"].includes(r._status) && r._daysSinceCreated > 3);

  // Status mismatch — resolved but resolve date > X days ago and still not closed
  const statusMismatch = df.filter(r =>
    r._status === "RESOLVED" && r._daysSinceResolved > rules.resolvedAutoClose
  );

  return {
    df, total, closed, resolved, open, pending, newT, reOpened, acr, asr,
    pendingTickets, acrTickets, asrTickets, open7Days, autoClosed, autoCloseDue,
    closedTickets, resolvedTickets, openTickets, resolutionRateTickets, duplicateTickets,
    statusCounts, acrViolations, reopened, reopenedWithin24h, reopenedWithin7d,
    duplicateOrders, agents, avgResHrs, avgFrtHrs, resHrs, frtTickets,
    categories, channels, subCats, brands, slaRisk, statusMismatch,
    resolutionRate: total ? ((closed + resolved) / total * 100) : 0,
    agentMap, orderGroups, customerGroups,
  };
}

// ─── MINI BAR ─────────────────────────────────────────────────────────────────
const MiniBar = ({ data, colorFn }) => {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 120, fontSize: 11, color: T.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.k}</div>
          <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${(d.v / max) * 100}%`, height: "100%", borderRadius: 3, background: colorFn ? colorFn(i) : T.blue, transition: "width 0.8s ease" }} />
          </div>
          <div style={{ width: 40, fontSize: 11, color: T.text, textAlign: "right" }}>{fmt.num(d.v)}</div>
        </div>
      ))}
    </div>
  );
};

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, accent, icon, badge, onClick, onDoubleClick, exportRows }) => (
  <div role={onClick || onDoubleClick ? "button" : undefined} tabIndex={onClick || onDoubleClick ? 0 : undefined} className="kpi-card fade-in" style={{ "--accent": accent || T.blue, cursor: (onClick || onDoubleClick) ? "pointer" : "default", textAlign: "left", width: "100%", color: "inherit", font: "inherit" }} onClick={onClick} onDoubleClick={onDoubleClick} onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && onClick) onClick(e); }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {exportRows && <ExportButton rows={exportRows} name={label} label="CSV" />}
        {icon && <div style={{ color: accent || T.blue, opacity: 0.7 }}><Icon n={icon} s={16} /></div>}
      </div>
    </div>
    <div className="count-up" style={{ fontSize: 28, fontWeight: 700, color: T.text, lineHeight: 1, marginBottom: 6 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: T.textSub }}>{sub}</div>}
    {badge && <span className={`badge badge-${badge.type}`} style={{ marginTop: 8 }}>{badge.label}</span>}
  </div>
);

const KpiDrilldown = ({ title, tickets, onClose }) => {
  const [selected, setSelected] = useState(null);
  const rows = tickets || [];

  return (
    <div className="card fade-in" style={{ padding: 20, marginBottom: 20, borderColor: "rgba(59,130,246,0.3)" }}>
      <SectionHeader title={title} sub={`${fmt.num(rows.length)} matching tickets`} action={<div style={{ display: "flex", gap: 8 }}><ExportButton rows={rows} name={title} /><button className="btn btn-ghost" onClick={onClose}><Icon n="close" s={14} /> Close</button></div>} />

      {selected && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8, padding: 12, marginBottom: 12, background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
          {[
            ["Ticket ID", selected.ticketId], ["Order ID", selected.OrderID], ["Customer", selected.customerName],
            ["Company", selected["Brand Name"] || selected.companyName], ["Current Status", selected._status],
            ["Assigned Agent", selected.assignedAgent], ["First Assignment", fmt.date(selected["First Assignment Date"])],
            ["Last Response", fmt.date(selected.lastResponseAtDate || selected["Last Response Date"])],
            ["Created", fmt.date(selected.createdAtDate)], ["Resolved", fmt.date(selected.resolvedAtDate)],
            ["Closed", fmt.date(selected.closedAtDate)], ["Reopened", fmt.date(selected["Reopened Date"])]
          ].map(([l, v]) => (
            <div key={l} style={{ fontSize: 11 }}>
              <span style={{ color: T.textMuted }}>{l}: </span>
              <span style={{ color: T.text }}>{v || "-"}</span>
            </div>
          ))}
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr>
            {["Ticket ID","Order ID","Customer","Company","Current Status","Assigned Agent","Created","First Assignment","Last Response","Reopened"].map(h => <th key={h}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ cursor: "pointer" }} onClick={() => setSelected(r)}>
                <td><span className="mono" style={{ color: T.blue }}>#{r.ticketId}</span></td>
                <td><span className="mono" style={{ fontSize: 11 }}>{r.OrderID && r.OrderID !== "-" ? r.OrderID : "-"}</span></td>
                <td>{r.customerName || "-"}</td>
                <td>{r["Brand Name"] || r.companyName || "-"}</td>
                <td><span className="badge" style={{ background: `${STATUS_COLORS[r._status] || T.textMuted}22`, color: STATUS_COLORS[r._status] || T.textMuted, border: `1px solid ${STATUS_COLORS[r._status] || T.textMuted}44` }}>{r._status}</span></td>
                <td style={{ fontSize: 11 }}>{r.assignedAgent ? r.assignedAgent.split("@")[0] : "-"}</td>
                <td style={{ fontSize: 11 }}>{fmt.date(r.createdAtDate)}</td>
                <td style={{ fontSize: 11 }}>{fmt.date(r["First Assignment Date"])}</td>
                <td style={{ fontSize: 11 }}>{fmt.date(r.lastResponseAtDate || r["Last Response Date"])}</td>
                <td style={{ fontSize: 11 }}>{fmt.date(r["Reopened Date"])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, sub, action }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
    {action}
  </div>
);

// ─── UPLOAD SCREEN ────────────────────────────────────────────────────────────
const TicketUploadScreen = ({ onData }) => {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const parseFile = file => {
    setLoading(true); setError("");
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: res => { setLoading(false); if (res.data.length) onData(res.data); else setError("No data found in file."); },
      error: e => { setLoading(false); setError(e.message); },
    });
  };

  const onDrop = e => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) parseFile(f);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, background: `radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.08) 0%, transparent 60%), ${T.bg0}` }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", color: T.blue, textTransform: "uppercase", marginBottom: 8 }}>WOW CS</div>
        <div style={{ fontSize: 40, fontWeight: 800, background: `linear-gradient(135deg, ${T.text}, ${T.blueL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>OPX Intelligence</div>
        <div style={{ fontSize: 15, color: T.textSub }}>Operations Control Tower · Upload your daily ticket dump to begin</div>
      </div>

      <div
        className="card"
        onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        style={{ width: "100%", maxWidth: 520, padding: 48, textAlign: "center", border: `2px dashed ${dragging ? T.blue : T.glassBorder}`, transition: "all 0.2s", cursor: "pointer", background: dragging ? "rgba(59,130,246,0.06)" : T.glass }}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={e => e.target.files[0] && parseFile(e.target.files[0])} />
        {loading
          ? <><div className="spin" style={{ width: 40, height: 40, border: `3px solid ${T.glassBorder}`, borderTopColor: T.blue, borderRadius: "50%", margin: "0 auto 16px" }} /><div style={{ color: T.textSub }}>Parsing data...</div></>
          : <><div style={{ color: T.blue, marginBottom: 16 }}><Icon n="upload" s={40} /></div>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 6 }}>Drop your CSV file here</div>
            <div style={{ fontSize: 13, color: T.textMuted }}>or click to browse · CSV format</div></>
        }
      </div>
      {error && <div style={{ marginTop: 16, color: T.red, fontSize: 13 }}>{error}</div>}

      <div style={{ display: "flex", gap: 24, marginTop: 40, color: T.textMuted, fontSize: 12 }}>
        {["Auto-detects column schema", "Rule-based violation engine", "AI-powered insights"].map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon n="check" s={12} c={T.green} /> {f}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── ACTION CENTER ────────────────────────────────────────────────────────────
const ActionCenter = ({ stats, onTicketClick }) => {
  const alerts = [
    { type: "critical", icon: "🔥", label: "Auto Closure Failures", count: stats.acrViolations.length, desc: `${stats.acrViolations.length} tickets stuck — should have been auto-closed`, items: stats.acrViolations },
    { type: "high", icon: "⏱️", label: "SLA At Risk", count: stats.slaRisk.length, desc: `${stats.slaRisk.length} tickets pending > 3 days without resolution`, items: stats.slaRisk },
    { type: "high", icon: "🔄", label: "Reopened Tickets", count: stats.reopened.length, desc: `${stats.reopened.length} reopens · ${stats.reopenedWithin24h.length} within 24h of closing`, items: stats.reopened },
    { type: "medium", icon: "⚠️", label: "Status Mismatch", count: stats.statusMismatch.length, desc: `${stats.statusMismatch.length} tickets show Resolved but should have auto-closed`, items: stats.statusMismatch },
    { type: "medium", icon: "📋", label: "Duplicate Orders", count: stats.duplicateOrders.length, desc: `${stats.duplicateOrders.length} orders with multiple open tickets`, items: stats.duplicateTickets },
  ];

  const colorMap = { critical: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", hover: "rgba(239,68,68,0.35)", dot: T.red }, high: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", hover: "rgba(245,158,11,0.35)", dot: T.amber }, medium: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", hover: "rgba(59,130,246,0.35)", dot: T.blue } };

  return (
    <div className="fade-in">
      <SectionHeader title="Action Center" sub="What to do today — prioritised by severity" action={<ExportButton rows={[...stats.acrViolations, ...stats.slaRisk, ...stats.statusMismatch]} name="flagged-action-center-tickets" />} />
      <div style={{ display: "grid", gap: 8 }}>
        {alerts.map((a, i) => {
          const cm = colorMap[a.type];
          return (
            <div key={i} className="alert-item" style={{ "--alert-bg": cm.bg, "--alert-border": cm.border, "--alert-hover": cm.hover }} onClick={() => a.items?.[0] && onTicketClick && onTicketClick(a.items[0])}>
              <div style={{ fontSize: 22, lineHeight: 1, paddingTop: 2 }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{a.label}</span>
                  <span className={`badge badge-${a.type === "critical" ? "red" : a.type === "high" ? "amber" : "blue"}`}>{fmt.num(a.count)}</span>
                </div>
                <div style={{ fontSize: 12, color: T.textSub }}>{a.desc}</div>
              </div>
              <div style={{ color: T.textMuted }}><Icon n="chevron" s={16} /></div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24 }}>
        <SectionHeader title="Top Violations (Auto-Closure Audit)" sub="Tickets that should have been auto-closed" action={<ExportButton rows={stats.acrViolations} name="auto-closure-violations" />} />
        {stats.acrViolations.length === 0
          ? <div style={{ padding: "32px 0", textAlign: "center", color: T.textMuted }}>✅ No auto-closure violations found</div>
          : <div className="table-wrap">
            <table>
              <thead><tr>
                {["Ticket ID","Status","Expected","Days Overdue","Reason","Priority"].map(h => <th key={h}>{h}</th>)}
              </tr></thead>
              <tbody>
                {stats.acrViolations.slice(0, 50).map((r, i) => (
                  <tr key={i} style={{ cursor: "pointer" }} onClick={() => onTicketClick && onTicketClick(r)}>
                    <td><span className="mono" style={{ color: T.blue }}>#{r.ticketId}</span></td>
                    <td><span className="badge" style={{ background: `${STATUS_COLORS[r._status] || T.textMuted}22`, color: STATUS_COLORS[r._status] || T.textMuted, border: `1px solid ${STATUS_COLORS[r._status] || T.textMuted}44` }}>{r._status}</span></td>
                    <td style={{ color: T.amber }}>{r._violation.expected}</td>
                    <td style={{ color: r._violation.days > 10 ? T.red : T.amber }}>{r._violation.days}d</td>
                    <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r._violation.reason}</td>
                    <td><span className={`badge badge-${r._violation.priority === "CRITICAL" ? "red" : r._violation.priority === "HIGH" ? "amber" : "blue"}`}>{r._violation.priority}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  );
};

// ─── DASHBOARD HOME ───────────────────────────────────────────────────────────
const CSHome = ({ stats, onNav }) => {
  const [drilldown, setDrilldown] = useState(null);
  const openDrilldown = (title, tickets) => setDrilldown({ title, tickets });

  const kpis = [
    { label: "Total Tickets", value: fmt.num(stats.total), sub: "All statuses", accent: T.blue, icon: "tickets", onClick: () => openDrilldown("Total Tickets", stats.df), exportRows: stats.df },
    { label: "Closed", value: fmt.num(stats.closed), sub: `${fmt.pct(stats.closed / stats.total * 100)} of total`, accent: T.green, icon: "check", onClick: () => openDrilldown("Closed Tickets", stats.closedTickets), exportRows: stats.closedTickets },
    { label: "Resolved", value: fmt.num(stats.resolved), sub: "Awaiting auto-close", accent: T.cyan, icon: "star", onClick: () => openDrilldown("Resolved Tickets", stats.resolvedTickets), exportRows: stats.resolvedTickets },
    { label: "Open", value: fmt.num(stats.open), sub: "Needs agent action", accent: T.amber, icon: "clock", onClick: () => openDrilldown("Open Tickets", stats.openTickets), exportRows: stats.openTickets },
    { label: "Pending Tickets", value: fmt.num(stats.pending), sub: "Waiting on customer", accent: T.purple, icon: "customer", onClick: () => openDrilldown("Pending Tickets", stats.pendingTickets), exportRows: stats.pendingTickets },
    { label: "Reopened Tickets", value: fmt.num(stats.reOpened), sub: `${fmt.pct(stats.reopenedWithin24h.length / (stats.reOpened || 1) * 100)} within 24h`, accent: T.red, icon: "reopen", badge: stats.reOpened > 10 ? { type: "red", label: "Needs attention" } : null, onClick: () => openDrilldown("Reopened Tickets", stats.reopened), exportRows: stats.reopened },
    { label: "ACR Tickets", value: fmt.num(stats.acr), sub: "Awaiting auto-close", accent: T.red, icon: "alert", onClick: () => openDrilldown("ACR Tickets", stats.acrTickets), exportRows: stats.acrTickets },
    { label: "ASR Tickets", value: fmt.num(stats.asr), sub: "Awaiting auto-close", accent: T.pink, icon: "alert", onClick: () => openDrilldown("ASR Tickets", stats.asrTickets), exportRows: stats.asrTickets },
    { label: "Open for 7+ Days", value: fmt.num(stats.open7Days.length), sub: "Open age threshold", accent: T.amber, icon: "clock", onClick: () => openDrilldown("Open for 7+ Days", stats.open7Days), exportRows: stats.open7Days },
    { label: "Auto-Close Errors", value: fmt.num(stats.acrViolations.length), sub: "Should have been closed", accent: T.red, icon: "alert", onClick: () => openDrilldown("Should Auto Close", stats.acrViolations), onDoubleClick: () => onNav("action"), exportRows: stats.acrViolations },
    { label: "Auto Close Due", value: fmt.num(stats.autoCloseDue.length), sub: "ACR past 48h", accent: T.red, icon: "alert", onClick: () => openDrilldown("Auto Close Due", stats.autoCloseDue), exportRows: stats.autoCloseDue },
    { label: "Auto Closed", value: fmt.num(stats.autoClosed.length), sub: "Closed with date", accent: T.green, icon: "check", onClick: () => openDrilldown("Auto Closed", stats.autoClosed), exportRows: stats.autoClosed },
    { label: "SLA At Risk", value: fmt.num(stats.slaRisk.length), sub: "Pending > 3 days", accent: T.amber, icon: "warn", onClick: () => openDrilldown("SLA At Risk", stats.slaRisk), exportRows: stats.slaRisk },
    { label: "Resolution Rate", value: fmt.pct(stats.resolutionRate), sub: "Closed + Resolved", accent: T.green, icon: "trend", onClick: () => openDrilldown("Closed + Resolved Tickets", stats.resolutionRateTickets), exportRows: stats.resolutionRateTickets },
    { label: "Avg Resolution", value: fmt.hrs(stats.avgResHrs), sub: "From created to resolved", accent: T.cyan, icon: "clock", onClick: () => openDrilldown("Tickets Used for Avg Resolution", stats.resHrs), exportRows: stats.resHrs },
    { label: "Avg First Response", value: fmt.hrs(stats.avgFrtHrs), sub: "From first assignment to first agent reply", accent: T.blue, icon: "agents", onClick: () => openDrilldown("Tickets Used for Avg First Response", stats.frtTickets), exportRows: stats.frtTickets },
    { label: "Duplicate Orders", value: fmt.num(stats.duplicateOrders.length), sub: "Multiple tickets per order", accent: T.pink, icon: "duplicate", onClick: () => openDrilldown("Duplicate Order Tickets", stats.duplicateTickets), exportRows: stats.duplicateTickets },
  ];

  const topSubcats = Object.entries(stats.subCats).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => ({ k, v }));
  const topBrands = Object.entries(stats.brands).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => ({ k, v }));
  const channelData = Object.entries(stats.channels).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ k, v }));
  const statusData = Object.entries(stats.statusCounts).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ k, v }));

  const ACCENT_PALETTE = [T.blue, T.purple, T.green, T.cyan, T.amber, T.red, T.pink, T.blueL];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 4 }}>Operations Dashboard</div>
        <div style={{ fontSize: 13, color: T.textMuted }}>Real-time analysis from uploaded dump · {fmt.num(stats.total)} tickets loaded</div>
      </div>

      {stats.acrViolations.length > 0 && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => onNav("action")}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 600, color: T.red }}>Critical: </span>
            <span style={{ color: T.textSub, fontSize: 13 }}>{stats.acrViolations.length} auto-closure failures detected · {stats.statusMismatch.length} status mismatches · {stats.slaRisk.length} SLA risks</span>
          </div>
          <span style={{ color: T.red, fontSize: 12, fontWeight: 600 }}>VIEW ACTION CENTER →</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 28 }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {drilldown && <KpiDrilldown title={drilldown.title} tickets={drilldown.tickets} onClose={() => setDrilldown(null)} />}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <SectionHeader title="Top Issues" sub="By ticket count" action={<ExportButton rows={topSubcats} name="top-issues" />} />
          <MiniBar data={topSubcats} colorFn={i => ACCENT_PALETTE[i % ACCENT_PALETTE.length]} />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <SectionHeader title="Status Breakdown" sub="Current distribution" action={<ExportButton rows={statusData} name="status-breakdown" />} />
          <MiniBar data={statusData} colorFn={i => STATUS_COLORS[statusData[i]?.k] || T.textSub} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <SectionHeader title="Channel Distribution" sub="By volume" action={<ExportButton rows={channelData} name="channel-distribution" />} />
          <MiniBar data={channelData} colorFn={i => [T.green, T.blue, T.pink, T.amber][i] || T.textSub} />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <SectionHeader title="Top Brands" sub="By ticket count" action={<ExportButton rows={topBrands} name="top-brands" />} />
          <MiniBar data={topBrands} colorFn={i => ACCENT_PALETTE[i % ACCENT_PALETTE.length]} />
        </div>
      </div>
    </div>
  );
};

// ─── TICKETS VIEW ─────────────────────────────────────────────────────────────
const TicketsView = ({ stats }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    return stats.df.filter(r => {
      const matchStatus = statusFilter === "ALL" || r._status === statusFilter;
      const matchSearch = !search || String(r.ticketId).includes(search) || (r.customerName || "").toLowerCase().includes(search.toLowerCase()) || (r.OrderID || "").toLowerCase().includes(search.toLowerCase()) || (r.assignedAgent || "").toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    }).slice(0, 200);
  }, [stats.df, search, statusFilter]);

  const statuses = ["ALL", ...Object.keys(stats.statusCounts)];

  return (
    <div className="fade-in">
      <SectionHeader title="All Tickets" sub={`${fmt.num(filtered.length)} of ${fmt.num(stats.total)} shown`} action={<ExportButton rows={filtered} name="filtered-tickets" />} />
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input className="input" placeholder="Search ticket ID, customer, order..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {statuses.map(s => (
            <button key={s} className="btn btn-ghost" style={{ fontSize: 11, padding: "5px 12px", background: statusFilter === s ? "rgba(59,130,246,0.15)" : undefined, borderColor: statusFilter === s ? T.blue : undefined, color: statusFilter === s ? T.blueL : undefined }} onClick={() => setStatusFilter(s)}>
              {s} {s !== "ALL" && <span style={{ color: T.textMuted }}>({stats.statusCounts[s] || 0})</span>}
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="card fade-in" style={{ padding: 20, marginBottom: 16, borderColor: "rgba(59,130,246,0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <span className="mono" style={{ color: T.blue, fontSize: 16, fontWeight: 700 }}>#{selected.ticketId}</span>
              <span className="badge" style={{ marginLeft: 10, background: `${STATUS_COLORS[selected._status] || T.textMuted}22`, color: STATUS_COLORS[selected._status] || T.textMuted, border: `1px solid ${STATUS_COLORS[selected._status] || T.textMuted}44` }}>{selected._status}</span>
            </div>
            <button className="btn btn-ghost" onClick={() => setSelected(null)}><Icon n="close" s={14} /> Close</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {[
              ["Customer", selected.customerName], ["Order ID", selected.OrderID], ["Channel", selected.channel],
              ["Category", selected["Ticket Category"]], ["Sub-Category", selected["Ticket Category_Ticket Sub-Category"]],
              ["Assigned To", selected.assignedAgent], ["Created", fmt.date(selected.createdAtDate)],
              ["Resolved", fmt.date(selected.resolvedAtDate)], ["Closed", fmt.date(selected.closedAtDate)],
              ["Reopened", fmt.date(selected["Reopened Date"])], ["Resolution Time", fmt.hrs(selected._resolutionHrs)],
              ["First Response", fmt.hrs(selected._frtHrs)], ["Brand", selected["Brand Name"]], ["Type", selected.ticketType],
            ].map(([label, val]) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, color: T.text }}>{val || "—"}</div>
              </div>
            ))}
          </div>
          {selected.tags && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>TAGS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {selected.tags.split(",").map((t, i) => <span key={i} className="tag">{t.trim()}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr>
            {["ID","Status","Customer","Order","Category","Sub-Category","Agent","Created","Resolution","FRT","Type"].map(h => <th key={h}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} style={{ cursor: "pointer" }} onClick={() => setSelected(r)}>
                <td><span className="mono" style={{ color: T.blue }}>#{r.ticketId}</span></td>
                <td><span className="badge" style={{ background: `${STATUS_COLORS[r._status] || T.textMuted}22`, color: STATUS_COLORS[r._status] || T.textMuted, border: `1px solid ${STATUS_COLORS[r._status] || T.textMuted}44` }}>{r._status}</span></td>
                <td>{r.customerName || "—"}</td>
                <td><span className="mono" style={{ fontSize: 11 }}>{r.OrderID !== "-" ? r.OrderID : "—"}</span></td>
                <td>{r["Ticket Category"] || "—"}</td>
                <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r["Ticket Category_Ticket Sub-Category"] !== "-" ? r["Ticket Category_Ticket Sub-Category"] : "—"}</td>
                <td style={{ fontSize: 11 }}>{r.assignedAgent ? r.assignedAgent.split("@")[0] : "—"}</td>
                <td style={{ fontSize: 11 }}>{fmt.date(r.createdAtDate)}</td>
                <td style={{ fontSize: 11, color: r._resolutionHrs > 48 ? T.amber : T.textSub }}>{fmt.hrs(r._resolutionHrs)}</td>
                <td style={{ fontSize: 11, color: r._frtHrs > 24 ? T.red : T.textSub }}>{fmt.hrs(r._frtHrs)}</td>
                <td><span className="tag">{r.ticketType}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── AGENTS VIEW ──────────────────────────────────────────────────────────────
const AgentsView = ({ stats }) => (
  <div className="fade-in">
    <SectionHeader title="Agent Performance" sub="Based on assigned / first responding agent" action={<ExportButton rows={stats.agents} name="agent-performance" />} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, marginBottom: 20 }}>
      {stats.agents.slice(0, 12).map((a, i) => (
        <div key={i} className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${T.blue},${T.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0 }}>{a.name[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{a.name}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{fmt.num(a.total)} tickets</div>
            </div>
          </div>
          {[
            ["Total", fmt.num(a.total), T.blue],
            ["Resolved/Closed", fmt.num(a.resolved), T.green],
            ["Reopened", fmt.num(a.reopened), T.red],
            ["Res Rate", fmt.pct(a.resRate), a.resRate > 80 ? T.green : a.resRate > 60 ? T.amber : T.red],
            ["Avg Res Time", fmt.hrs(a.avgResHrs), T.cyan],
            ["Avg FRT", fmt.hrs(a.avgFrtHrs), T.purple],
          ].map(([l, v, c]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 12, color: T.textMuted }}>{l}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: c }}>{v}</span>
            </div>
          ))}
          <div className="progress-bar" style={{ marginTop: 10 }}>
            <div className="progress-fill" style={{ "--fill": a.resRate > 80 ? T.green : a.resRate > 60 ? T.amber : T.red, width: `${Math.min(a.resRate, 100)}%` }} />
          </div>
          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4, textAlign: "right" }}>Resolution rate</div>
        </div>
      ))}
    </div>

    <div className="table-wrap">
      <table>
        <thead><tr>
          {["Agent","Total","Resolved","Reopened","Res Rate","Avg Res","Avg FRT","WOW Score"].map(h => <th key={h}>{h}</th>)}
        </tr></thead>
        <tbody>
          {stats.agents.map((a, i) => {
            const wow = Math.min(100, Math.round((a.resRate * 0.5) + ((1 - Math.min(a.reopened / a.total, 0.3) / 0.3) * 30) + (a.avgFrtHrs < 4 ? 20 : a.avgFrtHrs < 12 ? 10 : 0)));
            return (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{a.name}</td>
                <td>{fmt.num(a.total)}</td>
                <td style={{ color: T.green }}>{fmt.num(a.resolved)}</td>
                <td style={{ color: a.reopened > 5 ? T.red : T.textSub }}>{fmt.num(a.reopened)}</td>
                <td><span className={`badge badge-${a.resRate > 80 ? "green" : a.resRate > 60 ? "amber" : "red"}`}>{fmt.pct(a.resRate)}</span></td>
                <td>{fmt.hrs(a.avgResHrs)}</td>
                <td style={{ color: a.avgFrtHrs > 24 ? T.red : T.textSub }}>{fmt.hrs(a.avgFrtHrs)}</td>
                <td><span className={`badge badge-${wow >= 75 ? "green" : wow >= 50 ? "amber" : "red"}`}>{wow}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── REOPEN ANALYTICS ────────────────────────────────────────────────────────
const ReopenAnalytics = ({ stats }) => {
  const total = stats.total;
  const reOpened = stats.reopened;
  const within24h = stats.reopenedWithin24h;
  const within7d = stats.reopenedWithin7d;

  // Same customer reopened
  const custReopen = {};
  reOpened.forEach(r => { const c = r.customerId; if (c) custReopen[c] = (custReopen[c] || 0) + 1; });
  const multiCustReopen = Object.entries(custReopen).filter(([, v]) => v > 1).length;

  const orderReopen = {};
  reOpened.forEach(r => { const o = r.OrderID; if (o && o !== "-") orderReopen[o] = (orderReopen[o] || 0) + 1; });
  const multiOrderReopen = Object.entries(orderReopen).filter(([, v]) => v > 1).length;

  const agentReopen = {};
  reOpened.forEach(r => { const a = r.assignedAgent; if (a && a !== "-") agentReopen[a] = (agentReopen[a] || 0) + 1; });
  const topAgentReopens = Object.entries(agentReopen).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="fade-in">
      <SectionHeader title="Reopen Analytics" sub="Tracking resolution quality and customer escalations" action={<ExportButton rows={reOpened} name="reopen-analytics" />} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Reopened", value: fmt.num(reOpened.length), accent: T.red, exportRows: reOpened },
          { label: "Reopen Rate", value: fmt.pct(reOpened.length / total * 100), accent: T.red, exportRows: reOpened },
          { label: "Within 24h", value: fmt.num(within24h.length), accent: T.amber, exportRows: within24h },
          { label: "Within 7 Days", value: fmt.num(within7d.length), accent: T.amber, exportRows: within7d },
          { label: "Same Customer", value: fmt.num(multiCustReopen), accent: T.purple, exportRows: reOpened.filter(r => r.customerId && custReopen[r.customerId] > 1) },
          { label: "Same Order", value: fmt.num(multiOrderReopen), accent: T.purple, exportRows: reOpened.filter(r => r.OrderID && r.OrderID !== "-" && orderReopen[r.OrderID] > 1) },
        ].map((k, i) => <KpiCard key={i} {...k} sub="" icon="reopen" />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <SectionHeader title="Agents with Most Reopens" action={<ExportButton rows={topAgentReopens.map(([agent, count]) => ({ agent, count }))} name="agents-with-most-reopens" />} />
          <MiniBar data={topAgentReopens.map(([k, v]) => ({ k: k.split("@")[0], v }))} colorFn={() => T.red} />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <SectionHeader title="Reopen by Category" action={<ExportButton rows={Object.entries(reOpened.reduce((acc, r) => { const c = r["Ticket Category"] || "-"; acc[c] = (acc[c] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([category, count]) => ({ category, count }))} name="reopen-by-category" />} />
          <MiniBar data={
            Object.entries(
              reOpened.reduce((acc, r) => { const c = r["Ticket Category"] || "-"; acc[c] = (acc[c] || 0) + 1; return acc; }, {})
            ).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => ({ k, v }))
          } colorFn={() => T.amber} />
        </div>
      </div>

      <SectionHeader title="Reopened Ticket List" action={<ExportButton rows={reOpened} name="reopened-ticket-list" />} />
      <div className="table-wrap">
        <table>
          <thead><tr>
            {["Ticket ID","Customer","Order","Category","Resolved On","Reopened On","Days Gap","Agent"].map(h => <th key={h}>{h}</th>)}
          </tr></thead>
          <tbody>
            {reOpened.slice(0, 100).map((r, i) => {
              const gap = (r._resolved && r._reopened) ? daysBetween(r._resolved, r._reopened) : null;
              return (
                <tr key={i}>
                  <td><span className="mono" style={{ color: T.red }}>#{r.ticketId}</span></td>
                  <td>{r.customerName || "—"}</td>
                  <td><span className="mono" style={{ fontSize: 11 }}>{r.OrderID !== "-" ? r.OrderID : "—"}</span></td>
                  <td style={{ fontSize: 11 }}>{r["Ticket Category_Ticket Sub-Category"] !== "-" ? r["Ticket Category_Ticket Sub-Category"] : r["Ticket Category"] || "—"}</td>
                  <td style={{ fontSize: 11 }}>{fmt.date(r.resolvedAtDate)}</td>
                  <td style={{ fontSize: 11 }}>{fmt.date(r["Reopened Date"])}</td>
                  <td><span className={`badge badge-${!gap ? "blue" : gap <= 1 ? "red" : gap <= 7 ? "amber" : "green"}`}>{gap != null ? `${gap.toFixed(1)}d` : "—"}</span></td>
                  <td style={{ fontSize: 11 }}>{r.assignedAgent ? r.assignedAgent.split("@")[0] : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── DUPLICATE DETECTION ─────────────────────────────────────────────────────
const DuplicateDetection = ({ stats }) => (
  <div className="fade-in">
    <SectionHeader title="Duplicate Detection" sub={`${stats.duplicateOrders.length} orders with multiple tickets found`} action={<ExportButton rows={stats.duplicateTickets} name="duplicate-ticket-list" />} />
    {stats.duplicateOrders.length === 0
      ? <div style={{ padding: "40px 0", textAlign: "center", color: T.textMuted }}>✅ No duplicate orders detected</div>
      : stats.duplicateOrders.map((dup, i) => (
        <div key={i} className="card" style={{ padding: 16, marginBottom: 12, borderColor: "rgba(236,72,153,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ color: T.pink }}><Icon n="duplicate" s={16} /></span>
            <span style={{ fontWeight: 600, color: T.text }}>Order: </span>
            <span className="mono" style={{ color: T.pink }}>{dup.orderId}</span>
            <span className={`badge badge-${dup.count > 3 ? "red" : "amber"}`}>{dup.count} tickets</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {dup.tickets.map((t, j) => (
              <div key={j} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "6px 12px", fontSize: 12 }}>
                <span className="mono" style={{ color: T.blue }}>#{t.ticketId}</span>
                <span className={`badge`} style={{ marginLeft: 6, background: `${STATUS_COLORS[t._status] || T.textMuted}22`, color: STATUS_COLORS[t._status] || T.textMuted, border: `1px solid ${STATUS_COLORS[t._status] || T.textMuted}44` }}>{t._status}</span>
                <span style={{ color: T.textMuted, marginLeft: 6 }}>{t["Ticket Category_Ticket Sub-Category"] !== "-" ? t["Ticket Category_Ticket Sub-Category"] : t["Ticket Category"] || ""}</span>
              </div>
            ))}
          </div>
        </div>
      ))
    }
  </div>
);

// ─── SLA MONITOR ─────────────────────────────────────────────────────────────
const SlaMonitor = ({ stats, rules }) => {
  const slaData = [
    { label: "Pending > Customer SLA", count: stats.df.filter(r => r._status === "PENDING" && r._daysSinceCreated > rules.pendingCustomerInactivity).length, color: T.red, icon: "🔴" },
    { label: "Resolved > Auto-close SLA", count: stats.df.filter(r => r._status === "RESOLVED" && r._daysSinceResolved > rules.resolvedAutoClose).length, color: T.amber, icon: "🟡" },
    { label: "Open > Agent SLA", count: stats.df.filter(r => r._status === "OPEN" && r._daysSinceCreated > rules.openAgentInactivity).length, color: T.amber, icon: "🟡" },
    { label: "New > Assignment SLA", count: stats.df.filter(r => r._status === "NEW" && r._daysSinceCreated > rules.newTicketSLA).length, color: T.purple, icon: "🟣" },
    { label: "ACR > Auto-close SLA", count: stats.df.filter(r => r._status === "ACR" && r._daysSinceCreated > rules.acrAutoClose).length, color: T.red, icon: "🔴" },
  ];

  return (
    <div className="fade-in">
      <SectionHeader title="SLA Monitor" sub="Tickets breaching configured time rules" action={<ExportButton rows={stats.slaRisk} name="sla-monitor-flagged-tickets" />} />
      <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
        {slaData.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, background: T.glass, border: `1px solid ${T.glassBorder}` }}>
            <span style={{ fontSize: 18 }}>{s.icon}</span>
            <div style={{ flex: 1, fontSize: 14, color: T.text }}>{s.label}</div>
            <span className={`badge badge-${s.count > 10 ? "red" : s.count > 3 ? "amber" : "green"}`}>{fmt.num(s.count)} tickets</span>
            <div style={{ width: 120, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${Math.min((s.count / stats.total) * 1000, 100)}%`, height: "100%", background: s.color, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
      <SectionHeader title="SLA At Risk Tickets" sub="Open/Pending tickets older than 3 days" action={<ExportButton rows={stats.slaRisk} name="sla-at-risk-tickets" />} />
      <div className="table-wrap">
        <table>
          <thead><tr>
            {["Ticket ID","Status","Customer","Category","Days Old","Agent","Channel"].map(h => <th key={h}>{h}</th>)}
          </tr></thead>
          <tbody>
            {stats.slaRisk.slice(0, 100).map((r, i) => (
              <tr key={i}>
                <td><span className="mono" style={{ color: T.amber }}>#{r.ticketId}</span></td>
                <td><span className="badge" style={{ background: `${STATUS_COLORS[r._status] || T.textMuted}22`, color: STATUS_COLORS[r._status] || T.textMuted, border: `1px solid ${STATUS_COLORS[r._status] || T.textMuted}44` }}>{r._status}</span></td>
                <td>{r.customerName || "—"}</td>
                <td style={{ fontSize: 11 }}>{r["Ticket Category"] || "—"}</td>
                <td style={{ color: r._daysSinceCreated > 7 ? T.red : T.amber, fontWeight: 600 }}>{r._daysSinceCreated?.toFixed(1)}d</td>
                <td style={{ fontSize: 11 }}>{r.assignedAgent ? r.assignedAgent.split("@")[0] : "—"}</td>
                <td><span className="tag">{r.channel || "—"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── SETTINGS / RULE ENGINE ───────────────────────────────────────────────────
const SettingsView = ({ rules, setRules }) => {
  const ruleConfig = [
    { key: "pendingCustomerInactivity", label: "Pending — Customer Inactivity", desc: "Auto-close if no customer reply after X days", unit: "days" },
    { key: "pendingAgentInactivity", label: "Pending — Agent Inactivity", desc: "Flag if no agent action after X days", unit: "days" },
    { key: "resolvedAutoClose", label: "Resolved — Auto-close after", desc: "Move Resolved → Closed after X days", unit: "days" },
    { key: "openAgentInactivity", label: "Open — Agent Inactivity SLA", desc: "Escalate if no agent reply after X days", unit: "days" },
    { key: "newTicketSLA", label: "New — Assignment SLA", desc: "Flag if unassigned after X days", unit: "days" },
    { key: "acrAutoClose", label: "ACR — Auto-close after", desc: "ACR tickets close after X days of inactivity", unit: "days" },
    { key: "asrAutoClose", label: "ASR — Auto-close after", desc: "ASR tickets close after X days of inactivity", unit: "days" },
    { key: "botAutoClose", label: "Bot — Auto-close after", desc: "Bot-only tickets close after X days", unit: "days" },
    { key: "slaRiskThreshold", label: "SLA Risk Threshold", desc: "Flag tickets older than X days as SLA risk", unit: "days" },
  ];

  return (
    <div className="fade-in">
      <SectionHeader title="Rule Engine Settings" sub="Configure all SLA and auto-closure rules — changes apply immediately" />
      <div style={{ maxWidth: 640 }}>
        {ruleConfig.map(rc => (
          <div key={rc.key} className="card" style={{ padding: 18, marginBottom: 10, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>{rc.label}</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>{rc.desc}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 16 }} onClick={() => setRules(r => ({ ...r, [rc.key]: Math.max(1, (r[rc.key] || 1) - 1) }))}>−</button>
              <div style={{ minWidth: 50, textAlign: "center", background: "rgba(59,130,246,0.1)", borderRadius: 8, padding: "6px 12px", fontWeight: 700, color: T.blueL, fontSize: 16 }}>{rules[rc.key]}</div>
              <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 16 }} onClick={() => setRules(r => ({ ...r, [rc.key]: (r[rc.key] || 1) + 1 }))}>+</button>
              <span style={{ fontSize: 12, color: T.textMuted }}>{rc.unit}</span>
            </div>
          </div>
        ))}
        <div className="card" style={{ padding: 16, marginTop: 16, borderColor: "rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.05)" }}>
          <div style={{ fontSize: 13, color: T.greenL }}>✅ Rules are applied live — all violation counts update instantly when you change a value.</div>
        </div>
      </div>
    </div>
  );
};

// ─── AI INSIGHTS ──────────────────────────────────────────────────────────────
const AIInsights = ({ stats, rules }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState("");

  const generateInsights = async () => {
    setLoading(true); setError(""); setInsights(null);
    const summary = {
      total: stats.total, closed: stats.closed, resolved: stats.resolved,
      open: stats.open, pending: stats.pending, reOpened: stats.reOpened,
      resolutionRate: stats.resolutionRate.toFixed(1),
      avgResHrs: stats.avgResHrs.toFixed(1), avgFrtHrs: stats.avgFrtHrs.toFixed(1),
      acrViolations: stats.acrViolations.length, slaRisk: stats.slaRisk.length,
      duplicates: stats.duplicateOrders.length,
      topIssues: Object.entries(stats.subCats).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>`${k}:${v}`).join(", "),
      topBrands: Object.entries(stats.brands).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k}:${v}`).join(", "),
      channels: Object.entries(stats.channels).map(([k,v])=>`${k}:${v}`).join(", "),
      agents: stats.agents.slice(0,5).map(a=>`${a.name}(${a.total}tkts,${a.resRate.toFixed(0)}%res)`).join(", "),
      statusMismatch: stats.statusMismatch.length,
      reopenedWithin24h: stats.reopenedWithin24h.length,
    };
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          messages: [{ role: "user", content: `You are a Customer Support Operations AI Analyst for WOW CS. Analyze this ticket data and provide EXACTLY 8 actionable insights in JSON format.\n\nData: ${JSON.stringify(summary)}\nRules: Resolved auto-close after ${rules.resolvedAutoClose} days, Pending customer inactivity ${rules.pendingCustomerInactivity} days.\n\nRespond ONLY with a JSON array of 8 objects, each with: {\"priority\":\"CRITICAL|HIGH|MEDIUM\",\"icon\":\"emoji\",\"title\":\"short title\",\"insight\":\"one sentence finding\",\"action\":\"one sentence recommendation\"}\n\nNo markdown, no explanation, just the JSON array.` }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const cleaned = text.replace(/```json|```/g,"").trim();
      setInsights(JSON.parse(cleaned));
    } catch(e) { setError("Could not generate insights. Check API connection."); }
    setLoading(false);
  };

  const colorMap = { CRITICAL: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", badge: "red" }, HIGH: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", badge: "amber" }, MEDIUM: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", badge: "blue" } };

  return (
    <div className="fade-in">
      <SectionHeader title="AI Insights" sub="Powered by Claude AI — auto-analysis of your ticket dump"
        action={<div style={{ display: "flex", gap: 8 }}>{insights && <ExportButton rows={insights} name="ai-insights" />}<button className="btn btn-primary" onClick={generateInsights} disabled={loading}>{loading ? <><span className="spin" style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block" }} /> Analyzing...</> : <><Icon n="ai" s={14} /> Generate Insights</>}</button></div>} />

      {error && <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.1)", color: T.red, marginBottom: 16 }}>{error}</div>}

      {!insights && !loading && (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ color: T.textMuted, marginBottom: 16 }}><Icon n="ai" s={40} /></div>
          <div style={{ fontSize: 16, color: T.textSub, marginBottom: 8 }}>Click "Generate Insights" to run AI analysis</div>
          <div style={{ fontSize: 13, color: T.textMuted }}>Claude AI will analyse your {fmt.num(stats.total)} tickets and generate actionable recommendations</div>
        </div>
      )}

      {insights && (
        <div style={{ display: "grid", gap: 10 }}>
          {insights.map((ins, i) => {
            const cm = colorMap[ins.priority] || colorMap.MEDIUM;
            return (
              <div key={i} style={{ padding: "16px 18px", borderRadius: 12, background: cm.bg, border: `1px solid ${cm.border}` }} className="fade-in">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ fontSize: 22, lineHeight: 1 }}>{ins.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{ins.title}</span>
                      <span className={`badge badge-${cm.badge}`}>{ins.priority}</span>
                    </div>
                    <div style={{ fontSize: 13, color: T.textSub, marginBottom: 6, lineHeight: 1.5 }}>{ins.insight}</div>
                    <div style={{ fontSize: 12, color: T.blueL, background: "rgba(59,130,246,0.08)", borderRadius: 6, padding: "5px 10px", display: "inline-block" }}>💡 {ins.action}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── CUSTOMER HEALTH ──────────────────────────────────────────────────────────
const CustomerHealth = ({ stats }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const topCustomers = useMemo(() => {
    const cmap = {};
    stats.df.forEach(r => {
      const id = r.customerId; if (!id) return;
      if (!cmap[id]) cmap[id] = { id, name: r.customerName || id, tickets: [], reopens: 0 };
      cmap[id].tickets.push(r);
      if (r._reopened) cmap[id].reopens++;
    });
    return Object.values(cmap).sort((a, b) => b.tickets.length - a.tickets.length).slice(0, 100);
  }, [stats.df]);

  const filtered = topCustomers.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search));

  const getCustomerDetails = c => {
    const tickets = c.tickets;
    const resolved = tickets.filter(t => ["RESOLVED","CLOSED"].includes(t._status)).length;
    const refunds = tickets.filter(t => ["Refund Cancellation","RTO Refund","Refund Post Delivery"].includes(t["Ticket Category_Ticket Sub-Category"])).length;
    const score = Math.max(0, 100 - (c.reopens * 15) - (tickets.length > 5 ? 20 : 0) - ((tickets.length - resolved) / tickets.length * 20));
    return { resolved, refunds, riskScore: Math.round(score) };
  };

  const customerExport = filtered.map(c => {
    const det = getCustomerDetails(c);
    return { customerId: c.id, customerName: c.name, totalTickets: c.tickets.length, resolved: det.resolved, reopens: c.reopens, refundTickets: det.refunds, riskScore: det.riskScore, lastTicket: c.tickets[0]?.createdAtDate || "" };
  });

  return (
    <div className="fade-in">
      <SectionHeader title="Customer Health" sub="Per-customer ticket patterns and risk assessment" action={<ExportButton rows={customerExport} name="customer-health" />} />
      <input className="input" placeholder="Search customer name or ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360, marginBottom: 16 }} />
      <div className="table-wrap">
        <table>
          <thead><tr>
            {["Customer","Total Tickets","Resolved","Reopens","Refund Tickets","Risk Score","Last Ticket"].map(h => <th key={h}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((c, i) => {
              const det = getCustomerDetails(c);
              return (
                <tr key={i} style={{ cursor: "pointer" }} onClick={() => setSelected(c)}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.tickets.length}</td>
                  <td style={{ color: T.green }}>{det.resolved}</td>
                  <td style={{ color: c.reopens > 0 ? T.red : T.textSub }}>{c.reopens}</td>
                  <td style={{ color: det.refunds > 0 ? T.amber : T.textSub }}>{det.refunds}</td>
                  <td><span className={`badge badge-${det.riskScore >= 75 ? "green" : det.riskScore >= 50 ? "amber" : "red"}`}>{det.riskScore}</span></td>
                  <td style={{ fontSize: 11 }}>{fmt.date(c.tickets[0]?.createdAtDate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── ORDER HEALTH ─────────────────────────────────────────────────────────────
const OrderHealth = ({ stats }) => {
  const [search, setSearch] = useState("");
  const [result, setResult] = useState(null);

  const searchOrder = () => {
    const tickets = stats.df.filter(r => (r.OrderID || "").toLowerCase().includes(search.toLowerCase()) || (r.Order || "").toLowerCase().includes(search.toLowerCase()));
    setResult(tickets.length ? tickets : []);
  };

  return (
    <div className="fade-in">
      <SectionHeader title="Order Health" sub="Full ticket timeline per order" />
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input className="input" placeholder="Enter Order ID (e.g. ZOP#123456)..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360 }} onKeyDown={e => e.key === "Enter" && searchOrder()} />
        <button className="btn btn-primary" onClick={searchOrder}><Icon n="search" s={14} /> Search</button>
      </div>
      {result !== null && (
        result.length === 0
          ? <div style={{ padding: "40px 0", textAlign: "center", color: T.textMuted }}>No tickets found for this order ID</div>
          : <div>
            <div style={{ marginBottom: 12 }}>
              <span className="badge badge-blue">{result.length} tickets</span>
              <span style={{ marginLeft: 8 }}><ExportButton rows={result} name={`order-${search || "tickets"}`} /></span>
              {result.length > 1 && <span className="badge badge-amber" style={{ marginLeft: 8 }}>⚠️ Multiple tickets — possible duplicate</span>}
            </div>
            {result.map((r, i) => (
              <div key={i} className="card" style={{ padding: 18, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="mono" style={{ color: T.blue, fontSize: 15, fontWeight: 700 }}>#{r.ticketId}</span>
                    <span className="badge" style={{ background: `${STATUS_COLORS[r._status] || T.textMuted}22`, color: STATUS_COLORS[r._status] || T.textMuted, border: `1px solid ${STATUS_COLORS[r._status] || T.textMuted}44` }}>{r._status}</span>
                  </div>
                  <span style={{ fontSize: 12, color: T.textMuted }}>{r.channel} · {r.ticketType}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                  {[["Customer", r.customerName], ["Category", r["Ticket Category"]], ["Sub-Category", r["Ticket Category_Ticket Sub-Category"]], ["Agent", r.assignedAgent?.split("@")[0]], ["Created", fmt.date(r.createdAtDate)], ["Resolved", fmt.date(r.resolvedAtDate)], ["Closed", fmt.date(r.closedAtDate)], ["Brand", r["Brand Name"]]].map(([l, v]) => (
                    <div key={l} style={{ fontSize: 11 }}>
                      <span style={{ color: T.textMuted }}>{l}: </span>
                      <span style={{ color: T.text }}>{v || "—"}</span>
                    </div>
                  ))}
                </div>
                {r.tags && <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>{r.tags.split(",").slice(0, 8).map((t, j) => <span key={j} className="tag">{t.trim()}</span>)}</div>}
              </div>
            ))}
          </div>
      )}
    </div>
  );
};

function CustomerSupportApp({ onBackHome, rawData, setRawData, onOpenCmd }) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [rules, setRules] = useState({
    pendingCustomerInactivity: 10,
    pendingAgentInactivity: 4,
    resolvedAutoClose: 2,
    openAgentInactivity: 5,
    newTicketSLA: 5,
    acrAutoClose: 2,
    asrAutoClose: 2,
    botAutoClose: 1,
    slaRiskThreshold: 3,
  });

  const stats = useMemo(() => rawData ? processData(rawData, rules) : null, [rawData, rules]);

  const NAV = [
    { section: "MAIN" },
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "action", label: "Action Center", icon: "fire", badge: stats?.acrViolations?.length },
    { section: "OPERATIONS" },
    { id: "tickets", label: "Tickets", icon: "tickets" },
    { id: "agents", label: "Agents", icon: "agents" },
    { id: "customers", label: "Customers", icon: "customer" },
    { id: "orders", label: "Order Health", icon: "order" },
    { section: "INTELLIGENCE" },
    { id: "sla", label: "SLA Monitor", icon: "sla" },
    { id: "reopen", label: "Reopen Analytics", icon: "reopen" },
    { id: "autoclosure", label: "Auto Closure Audit", icon: "alert" },
    { id: "duplicates", label: "Duplicate Detection", icon: "duplicate" },
    { section: "TOOLS" },
    { id: "ai", label: "AI Insights", icon: "ai" },
    { id: "settings", label: "Settings / Rules", icon: "settings" },
  ];

  const renderContent = () => {
    if (!stats) return null;
    switch (activeNav) {
      case "dashboard": return <CSHome stats={stats} onNav={setActiveNav} />;
      case "action": return <ActionCenter stats={stats} />;
      case "tickets": return <TicketsView stats={stats} />;
      case "agents": return <AgentsView stats={stats} />;
      case "customers": return <CustomerHealth stats={stats} />;
      case "orders": return <OrderHealth stats={stats} />;
      case "sla": return <SlaMonitor stats={stats} rules={rules} />;
      case "reopen": return <ReopenAnalytics stats={stats} />;
      case "autoclosure": return <ActionCenter stats={stats} />;
      case "duplicates": return <DuplicateDetection stats={stats} />;
      case "ai": return <AIInsights stats={stats} rules={rules} />;
      case "settings": return <SettingsView rules={rules} setRules={setRules} />;
      default: return <CSHome stats={stats} onNav={setActiveNav} />;
    }
  };

  if (!rawData) return <TicketUploadScreen onData={setRawData} />;

  return (
    <>
      <div style={{ display: "flex", minHeight: "100vh", background: T.bg0 }}>

        {/* SIDEBAR */}
        <div style={{ width: sidebarOpen ? 210 : 52, flexShrink: 0, background: "rgba(15,19,34,0.75)", backdropFilter: "blur(20px)", borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", transition: "width 0.3s cubic-bezier(0.16,1,0.3,1)", overflow: "hidden" }}>
          <div style={{ padding: "14px 10px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8 }}>
            {sidebarOpen && <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Customer Support</div>}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
            {NAV.map((item, i) => {
              if (item.section) return sidebarOpen ? <div key={i} className="nav-section">{item.section}</div> : <div key={i} style={{ height: 10 }} />;
              return (
                <div key={i} className={`nav-item ${activeNav === item.id ? "active" : ""}`} onClick={() => setActiveNav(item.id)}>
                  <Icon n={item.icon} s={16} />
                  {sidebarOpen && <><span style={{ flex: 1 }}>{item.label}</span>{item.badge > 0 && <span style={{ background: T.red, color: "white", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{item.badge > 99 ? "99+" : item.badge}</span>}</>}
                </div>
              );
            })}
          </div>

          <div style={{ padding: "10px 8px", borderTop: `1px solid ${T.border}` }}>
            <div className="nav-item" onClick={() => { setRawData(null); setActiveNav("dashboard"); }}>
              <Icon n="upload" s={16} />
              {sidebarOpen && <span>Upload New Dump</span>}
            </div>
            <div className="nav-item" onClick={() => setSidebarOpen(o => !o)}>
              <Icon n="chevron" s={16} />
              {sidebarOpen && <span>Collapse</span>}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, overflow: "auto", background: `radial-gradient(ellipse at 20% 0%, rgba(59,130,246,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(139,92,246,0.04) 0%, transparent 50%), ${T.bg0}` }}>
          {/* TOPBAR */}
          <div className="os-topbar">
            <Breadcrumb crumbs={[
              { label: "Home", onClick: onBackHome },
              { label: "Customer Support", onClick: () => setActiveNav("dashboard") },
              ...(activeNav !== "dashboard" ? [{ label: NAV.find(n => n.id === activeNav)?.label || activeNav }] : []),
            ]} />
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              {stats.acrViolations.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", fontSize: 12 }} onClick={() => setActiveNav("action")}>
                  <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: T.red, display: "inline-block" }} />
                  <span style={{ color: T.red, fontWeight: 600 }}>{stats.acrViolations.length} violations</span>
                </div>
              )}
              <div style={{ fontSize: 11, color: T.textMuted, background: "rgba(255,255,255,0.04)", padding: "4px 10px", borderRadius: 7, border: `1px solid ${T.border}`, cursor: "pointer" }} onClick={onOpenCmd}>⌘K</div>
              <span style={{ fontSize: 12, color: T.textMuted }}>{fmt.num(stats.total)} tickets</span>
            </div>
          </div>

          <div style={{ padding: "24px 28px" }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}
// ══════════════════════════════════════════════════════════════════════════════
// OPERATIONS ENGINE — ported from engine_normalize.py / engine_loader.py /
// engine_analytics.py / engine_redistribute.py. Runs 100% client-side on the
// CSV files the user uploads (no backend / SQLite — this is the React target).
// Business logic, thresholds and category lists are kept identical to the
// Python source. Product de-duplication uses normalized exact-match grouping
// instead of rapidfuzz token scoring (browser-safe, no fuzzy-match library).
// ══════════════════════════════════════════════════════════════════════════════

const BRAND_ALIASES = {
  "zivx": "ZivX", "ziv-x": "ZivX", "ziv x": "ZivX",
  "go5": "Go5 Incorporation", "go5 incorporation": "Go5 Incorporation",
  "mavinclub": "Mavinclub", "mavin club": "Mavinclub",
  "crazybee": "Crazybee", "crazy bee": "Crazybee", "crazy-bee": "Crazybee",
  "tecsox": "TecSox", "tec sox": "TecSox",
  "texovera": "TexoVera", "texo vera": "TexoVera",
  "shopeeq": "ShopeeQ", "shopeeq.com": "ShopeeQ",
  "shopzone": "Shopzone", "shop zone": "Shopzone",
  "getsetwear": "GetsetWear", "getset wear": "GetsetWear",
  "getsetwear clothing": "GetsetWear",
  "alphawalk services llp": "ALPHAWALK SERVICES LLP",
  "digimate": "DIGIMATE",
  "heganwalk": "Heganwalk",
  "urban owl": "Urban Owl",
  "urban style": "Urban Style",
  "noyomi": "NOYOMI", "noymi": "NOYOMI",
  "werox": "Werox",
  "woggles": "Woggles",
  "beyoung": "Beyoung",
  "beyoung folks private limited": "Beyoung",
  "zyntrix lifestyle llp": "ZYNTRIX LIFESTYLE LLP",
  "trending youth technologies private limited": "TRENDING YOUTH",
  "super clone enterprises (opc) private limited": "Super Clone Enterprises",
  "super clone enterprises": "Super Clone Enterprises",
  "campussutra retail private limited": "CampusSutra",
  "dealcliq technology private limited": "DEALCLIQ",
  "aeloria trillion partners llp": "AELORIA",
  "geekverse ventures llp": "GEEKVERSE",
  "alluvium retail llp": "Alluvium Retail",
  "lili origin private limited": "Lili Origin",
  "the hatke": "THE HATKE",
  "apic inc.": "APIC Inc", "apic inc": "APIC Inc",
  "hichkie": "Hichkie",
  "boenjoy gifts": "Boenjoy Gifts",
  "vivek": "VIVEK",
  "yoga bar": "Yoga Bar",
  "dabster international private limited": "DABSTER",
  "kunsh cosmetics": "KUNSH COSMETICS",
  "haritu": "Haritu",
  "auxa": "Auxa",
  "deodap": "DeoDap",
  "dynamic marketting solution": "DYNAMIC MARKETING",
  "mayank kwatra": "MAYANK KWATRA",
  "sunmoon organics": "Sunmoon Organics",
  "by naked fact": "By Naked Fact",
  "dhanta wellness private limited": "DHANTA WELLNESS",
  "sproutlife foods pvt ltd": "Sproutlife Foods",
  "belogical wellness private limited": "Belogical Wellness",
  "savani dayaben": "SAVANI",
  "arogyasiddhi": "Arogyasiddhi",
  "beatfus products private limited": "BEATFUS",
  "nuts delish private limited": "NUTS DELISH",
  "gemies consumer private limited": "GEMIES",
  "almondzo": "Almondzo",
  "poptopia foods private ltd": "Poptopia Foods",
  "visage lines personal care pvt ltd": "Visage Lines",
  "manor rama care private limited": "Manor Rama Care",
  "bombay shaving company": "Bombay Shaving Company",
  "inlief": "In'lief", "in'lief": "In'lief",
  "branta": "Branta",
  "zibri india private limited": "ZIBRI INDIA",
  "lakshita gupta": "Lakshita Gupta",
  "jugal kant sharma": "JUGAL KANT",
  "mumma's life": "Mumma's Life",
  "hirolas": "Hirolas",
  "sneakare": "Sneakare",
  "bevzilla": "Bevzilla",
  "vrd spice private limited": "VRD SPICE",
  "kyari": "Kyari",
  "oleyy lifestyle": "Oleyy Lifestyle",
  "sanfe": "Sanfe",
  "redroomtechnology private limited": "Redroom Technology",
  "sanatan santaram gupta": "SANATAN SANTARAM GUPTA",
  "order status": null,
};

const OPS_STOPWORDS = new Set([
  "wireless", "bluetooth", "bt", "tws", "earbuds", "headphone", "headphones",
  "portable", "smart", "series", "edition", "black", "white", "blue", "red",
  "pro", "plus", "gen", "generation", "original", "premium", "latest", "version"
]);

const HIGH_SUBCATS = ["Defective Product", "Damaged Product", "Low Quality Product", "Order Delay", "Order Not Shipped"];
const MEDIUM_SUBCATS = ["Wrong Product Delivered", "Missing Items", "Refund Post Delivery", "Cancellation Request", "Tracking Query"];
const LOW_SUBCATS = ["Colour Issue", "Size issue", "Quantity Mismatch", "Order Modification", "Address Change", "Payment Issue", "Order Confirmation Issue"];

function normalizeBrandName(raw) {
  if (typeof raw !== "string") return "Unmapped Brand";
  const cleaned = raw.trim().replace(/^["']|["']$/g, "");
  const low = cleaned.toLowerCase();
  if (!cleaned || ["not found", "nan", "none", "", "n/a", "order status"].includes(low)) return "Unmapped Brand";
  if (low.includes("zivx") || low.includes("ziv-x") || (low.includes("ziv") && low.includes("x"))) return "ZivX";
  if (low in BRAND_ALIASES) {
    const result = BRAND_ALIASES[low];
    return result || "Unmapped Brand";
  }
  // light fuzzy fallback: closest alias by shared-token overlap (browser-safe, no external lib)
  let best = null, bestScore = 0;
  const lowTokens = new Set(low.split(/\s+/).filter(Boolean));
  for (const key of Object.keys(BRAND_ALIASES)) {
    const kTokens = new Set(key.split(/\s+/).filter(Boolean));
    const overlap = [...lowTokens].filter(t => kTokens.has(t)).length;
    const score = overlap / Math.max(lowTokens.size, kTokens.size, 1);
    if (score > bestScore && score >= 0.85) { bestScore = score; best = key; }
  }
  if (best) return BRAND_ALIASES[best] || "Unmapped Brand";
  return cleaned;
}

function cleanProductName(name) {
  if (typeof name !== "string") return "";
  let s = name.toLowerCase();
  s = s.replace(/[()\[\]{}]/g, " ").replace(/[^\w\s]/g, " ");
  const tokens = s.split(/\s+/).filter(t => t && !OPS_STOPWORDS.has(t));
  return tokens.join(" ");
}

function titleCase(s) {
  return String(s || "").replace(/\b\w/g, c => c.toUpperCase());
}

// ── Column auto-detection (mirrors engine_loader._detect_*) ──
function detectCol(headers, keywords, exclude = [], fallbackIdx = 0) {
  const lowMap = headers.map(h => [String(h).toLowerCase().trim(), h]);
  for (const kw of keywords) {
    for (const [lh, h] of lowMap) {
      if (exclude.some(ex => lh.includes(ex))) continue;
      if (lh.includes(kw)) return h;
    }
  }
  return headers[Math.min(fallbackIdx, headers.length - 1)] || headers[0];
}

function detectDateCol(headers) {
  const kws = ["order_delivered_at", "order_created_at", "delivered_at", "createdatdate", "created_at", "date", "time", "created", "timestamp", "day", "delivered"];
  for (const kw of kws) for (const h of headers) if (String(h).toLowerCase().trim().includes(kw)) return h;
  return headers[0];
}

// ── Date parsing (dd-mm-yyyy safe, Excel serial safe) ──
function safeParseDate(val) {
  if (val == null || val === "") return null;
  if (val instanceof Date) return isNaN(val) ? null : val;
  const num = Number(val);
  if (!isNaN(num) && num > 25000 && num < 60000) {
    // Excel serial date, epoch 1899-12-30
    const d = new Date(Date.UTC(1899, 11, 30));
    d.setUTCDate(d.getUTCDate() + num);
    return d;
  }
  const s = String(val).trim();
  let m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) {
    const [, dd, mm, yyyy, hh = "0", min = "0", sec = "0"] = m;
    const d = new Date(+yyyy, +mm - 1, +dd, +hh, +min, +sec);
    if (!isNaN(d)) return d;
  }
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) {
    const [, yyyy, mm, dd] = m;
    const d = new Date(+yyyy, +mm - 1, +dd);
    if (!isNaN(d)) return d;
  }
  const generic = new Date(s);
  if (!isNaN(generic)) return generic;
  return null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function dateHierarchy(d) {
  if (!d || isNaN(d) || d.getFullYear() < 1975) {
    return { date: "Unknown Date", year: "Unknown Year", quarter: "Unknown Quarter", month: "Unknown Month", monthSort: "0000-00", week: "Unknown Week" };
  }
  const y = d.getFullYear(), mo = d.getMonth(), day = d.getDate();
  const q = Math.floor(mo / 3) + 1;
  const wk = Math.min(Math.floor((day - 1) / 7) + 1, 4);
  return {
    date: d.toISOString().slice(0, 10),
    year: y,
    quarter: `${y}-Q${q}`,
    month: `${MONTHS_FULL[mo]} ${y}`,
    monthSort: `${y}-${String(mo + 1).padStart(2, "0")}`,
    week: `${MONTHS[mo]} ${y} Wk${wk}`,
  };
}

function normalizeTicketCategory(raw) {
  const l = String(raw || "").toLowerCase();
  if (l.includes("pre")) return "PRE_DELIVERY";
  return "POST_DELIVERY";
}

// ── Loaders: raw CSV rows -> normalized row objects ──
function loadDeliveredRows(rows) {
  if (!rows.length) return [];
  const headers = Object.keys(rows[0]);
  const orderCol = detectCol(headers, ["zop_id", "orderid", "order_id", "order id", "id"], [], 1);
  const dateCol = detectDateCol(headers);
  const brandCol = detectCol(headers, ["company_name", "company name", "company", "brand", "seller"], ["customer"], 3);
  const prodCol = detectCol(headers, ["product name", "product_name", "product", "item"], [], 4);
  const statusCol = detectCol(headers, ["order_status", "order status", "status", "state"], [], -1);
  const hasStatus = headers.includes(statusCol);

  return rows.map(r => {
    const d = safeParseDate(r[dateCol]);
    const h = dateHierarchy(d);
    return {
      order_id: String(r[orderCol] ?? "").trim(),
      raw_date: r[dateCol],
      raw_brand: String(r[brandCol] ?? "").trim().replace(/^["']|["']$/g, ""),
      raw_product: String(r[prodCol] ?? "").trim().replace(/^["']|["']$/g, ""),
      order_status: hasStatus ? String(r[statusCol] ?? "").trim() : "",
      "Delivery Date": h.date, "Delivery Year": h.year, "Delivery Quarter": h.quarter,
      "Delivery Month": h.month, "Delivery Month Sort": h.monthSort, "Delivery Week": h.week,
    };
  });
}

function loadTicketRows(rows) {
  if (!rows.length) return [];
  const headers = Object.keys(rows[0]);
  const orderCol = detectCol(headers, ["zop_id", "orderid", "order_id", "order id", "id"], [], 1);
  const dateCol = detectDateCol(headers);
  const brandCol = detectCol(headers, ["company_name", "company name", "company", "brand", "seller"], ["customer"], 3);
  const prodCol = detectCol(headers, ["product name", "product_name", "product", "item"], [], 4);
  const subcatCol = detectCol(headers, ["sub-category", "sub category", "subcategory", "sub_category"], [], headers.length - 1);
  const catCol = headers.find(h => {
    const l = String(h).toLowerCase();
    return l.includes("category") && !l.includes("sub");
  });

  return rows.map(r => {
    const d = safeParseDate(r[dateCol]);
    const h = dateHierarchy(d);
    const rawCat = catCol ? String(r[catCol] ?? "NULL").trim() : "NULL";
    return {
      order_id: String(r[orderCol] ?? "").trim(),
      raw_date: r[dateCol],
      raw_brand: String(r[brandCol] ?? "").trim().replace(/^["']|["']$/g, ""),
      raw_product: String(r[prodCol] ?? "").trim().replace(/^["']|["']$/g, ""),
      raw_subcat: String(r[subcatCol] ?? "").trim(),
      raw_category: rawCat,
      ticket_category: normalizeTicketCategory(rawCat),
      "Ticket Date": h.date, "Ticket Year": h.year, "Ticket Quarter": h.quarter,
      "Ticket Month": h.month, "Ticket Month Sort": h.monthSort, "Ticket Week": h.week,
      "Delivery Date": h.date, "Delivery Year": h.year, "Delivery Quarter": h.quarter,
      "Delivery Month": h.month, "Delivery Month Sort": h.monthSort, "Delivery Week": h.week,
    };
  });
}

// ── Escalation math (identical thresholds to engine_analytics.py) ──
function confidenceFactor(delivered) {
  if (delivered >= 500) return 1.00;
  if (delivered >= 300) return 0.90;
  if (delivered >= 200) return 0.80;
  if (delivered >= 100) return 0.65;
  if (delivered >= 50) return 0.45;
  if (delivered >= 20) return 0.25;
  return 0.10;
}
function rawEsc(tickets, delivered) { return delivered > 0 ? Math.round((tickets / delivered) * 10000) / 100 : 0; }
function weightedEsc(tickets, delivered) {
  if (delivered <= 0) return 0;
  return Math.round(rawEsc(tickets, delivered) * confidenceFactor(delivered) * 100) / 100;
}
function impactTier(delivered, escPct, tickets) {
  if (delivered >= 300 && escPct >= 7.0 && tickets >= 25) return "CRITICAL";
  if (delivered >= 200 && escPct >= 5.0) return "HIGH";
  if (delivered >= 100 && escPct >= 3.0) return "MEDIUM";
  return "LOW";
}

// ── Redistribution (mirrors engine_redistribute.py) ──
function computeBrandWeights(brandSummary, validTicks) {
  const eligible = brandSummary.filter(b => b.delivered > 0);
  if (!eligible.length) return {};
  const medDel = median(eligible.map(b => b.delivered));
  const medEsc = median(eligible.map(b => b.esc_pct));
  let pool = eligible.filter(b => b.delivered >= Math.max(100, medDel) && b.esc_pct >= Math.max(1.5, medEsc));
  if (pool.length < 2) pool = [...eligible].sort((a, b) => b.delivered - a.delivered).slice(0, Math.min(5, eligible.length));

  const trend = {};
  for (const b of pool) {
    const bTix = validTicks.filter(t => t.brand === b.brand);
    const byWeek = {};
    bTix.forEach(t => { byWeek[t["Delivery Week"]] = (byWeek[t["Delivery Week"]] || 0) + 1; });
    const weeks = Object.keys(byWeek).sort();
    trend[b.brand] = weeks.length >= 2 ? Math.max(0, byWeek[weeks[weeks.length - 1]] - byWeek[weeks[weeks.length - 2]]) : 0;
  }
  const maxEsc = Math.max(...pool.map(b => b.esc_pct), 0.01);
  const maxDel = Math.max(...pool.map(b => b.delivered), 1);
  const maxTix = Math.max(...pool.map(b => b.tickets), 1);
  const maxTrend = Math.max(...pool.map(b => trend[b.brand]), 1);

  let scores = pool.map(b => {
    const s = 0.40 * (b.esc_pct / maxEsc) + 0.30 * (b.delivered / maxDel) + 0.20 * (b.tickets / maxTix) + 0.10 * (trend[b.brand] / maxTrend);
    return { brand: b.brand, score: Math.max(s, 0.001) };
  });
  const total = scores.reduce((s, x) => s + x.score, 0);
  let weights = {};
  scores.forEach(x => { weights[x.brand] = x.score / total; });
  return applyBalancingCaps(weights, 0.02, 0.35);
}

function applyBalancingCaps(weights, minPct, maxPct) {
  let w = { ...weights };
  for (let iter = 0; iter < 30; iter++) {
    let changed = false;
    const keys = Object.keys(w);
    const over = keys.filter(k => w[k] > maxPct);
    if (over.length) {
      const excess = over.reduce((s, k) => s + (w[k] - maxPct), 0);
      over.forEach(k => { w[k] = maxPct; });
      const rest = keys.filter(k => !over.includes(k));
      const restSum = rest.reduce((s, k) => s + w[k], 0) || 1;
      rest.forEach(k => { w[k] += excess * (w[k] / restSum); });
      changed = true;
    }
    const under = keys.filter(k => w[k] < minPct);
    if (under.length) {
      const shortfall = under.reduce((s, k) => s + (minPct - w[k]), 0);
      under.forEach(k => { w[k] = minPct; });
      const above = keys.filter(k => w[k] > minPct);
      const aboveSum = above.reduce((s, k) => s + w[k], 0) || 1;
      above.forEach(k => { w[k] = Math.max(0, w[k] - shortfall * (w[k] / aboveSum)); });
      changed = true;
    }
    if (!changed) break;
  }
  const total = Object.values(w).reduce((s, v) => s + v, 0) || 1;
  Object.keys(w).forEach(k => { w[k] = w[k] / total; });
  return w;
}

function weightedChoice(rng, options, weights) {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = rng() * total;
  for (let i = 0; i < options.length; i++) { r -= weights[i]; if (r <= 0) return options[i]; }
  return options[options.length - 1];
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isApparelBrandOrProduct(brand, product) {
  const b = String(brand || "").toLowerCase(), p = String(product || "").toLowerCase();
  const apparel = ["wear", "clothing", "lifestyle", "apparel", "shirt", "tshirt", "jeans", "dress", "fashion", "shoes", "socks", "bag", "glasses", "woggles", "beyoung", "sutra", "campussutra", "hatke", "hirolas", "sneakare", "suit", "pant", "jacket", "hoodie", "sole", "sneaker", "ring", "watch", "pendant", "wallet", "belt", "cap", "hat", "tee"];
  const tech = ["tech", "clon", "geek", "verse", "zivx", "go5", "tecsox", "digimate", "clone", "bluetooth", "wireless", "earphone", "headphone", "speaker", "charger", "cable", "powerbank", "device", "smartwatch", "electronics"];
  if (tech.some(k => b.includes(k) || p.includes(k))) return false;
  return apparel.some(k => b.includes(k) || p.includes(k));
}

function redistributeSubcat(rawSubcat, brand, product, ticketCategory, rng) {
  if (rawSubcat !== "Not Found" && rawSubcat !== "Need Details") return rawSubcat;
  let cats, weightMap;
  if (String(ticketCategory).toUpperCase() === "PRE_DELIVERY") {
    cats = ["Order Delay", "Order Modification", "Cancellation Request", "Address Change", "Tracking Query", "Payment Issue", "Order Not Shipped", "Order Confirmation Issue"];
    weightMap = { "Order Delay": 5, "Order Not Shipped": 4, "Tracking Query": 3, "Cancellation Request": 2, "Order Modification": 1, "Address Change": 1, "Payment Issue": 1, "Order Confirmation Issue": 1 };
  } else {
    cats = ["Defective Product", "Damaged Product", "Low Quality Product", "Size issue", "Wrong Product Delivered", "Missing Items", "Refund Post Delivery", "Colour Issue", "Quantity Mismatch"];
    weightMap = { "Defective Product": 5, "Damaged Product": 4, "Low Quality Product": 3, "Size issue": 2, "Wrong Product Delivered": 0.8, "Missing Items": 0.8, "Refund Post Delivery": 0.8, "Colour Issue": 0.8, "Quantity Mismatch": 0.8 };
    if (!isApparelBrandOrProduct(brand, product)) weightMap["Size issue"] = 0;
  }
  const weights = cats.map(c => weightMap[c]);
  return weightedChoice(rng, cats, weights);
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// ── Main pipeline: mirrors engine_loader.process_pipeline ──
function processOpsData(delRowsRaw, tickRowsRaw) {
  const rng = mulberry32(42);
  const delRaw = loadDeliveredRows(delRowsRaw);
  const tickRaw = loadTicketRows(tickRowsRaw);
  const originalTicketCount = tickRaw.length;

  const allBrands = new Set([...delRaw.map(r => r.raw_brand), ...tickRaw.map(r => r.raw_brand)]);
  const brandMap = {};
  allBrands.forEach(b => { brandMap[b] = normalizeBrandName(b); });

  delRaw.forEach(r => { r.brand = brandMap[r.raw_brand] ?? "Unmapped Brand"; });
  tickRaw.forEach(r => { r.brand = brandMap[r.raw_brand] ?? "Unmapped Brand"; r._redistributed = false; });

  // cohort join: fill ticket delivery date fields from matching order if found
  const delLookup = {};
  delRaw.forEach(r => { if (r.order_id && r.order_id.length > 3) delLookup[r.order_id] = r; });
  tickRaw.forEach(t => {
    const match = delLookup[t.order_id];
    if (match) {
      t["Delivery Date"] = match["Delivery Date"]; t["Delivery Week"] = match["Delivery Week"];
      t["Delivery Month"] = match["Delivery Month"]; t["Delivery Quarter"] = match["Delivery Quarter"];
      t["Delivery Year"] = match["Delivery Year"]; t["Delivery Month Sort"] = match["Delivery Month Sort"];
    }
  });

  const validTicks = tickRaw.filter(t => t.brand !== "Unmapped Brand");
  const brandUnmapped = tickRaw.filter(t => t.brand === "Unmapped Brand");

  // canonical product = normalized/cleaned name, grouped per brand (simplified vs. rapidfuzz registry)
  const productMap = {}; // brand -> normKey -> {display, delivered}
  delRaw.forEach(r => {
    const norm = cleanProductName(r.raw_product) || r.raw_product.toLowerCase();
    productMap[r.brand] = productMap[r.brand] || {};
    if (!productMap[r.brand][norm]) productMap[r.brand][norm] = { display: titleCase(norm) || r.raw_product, delivered: 0 };
    productMap[r.brand][norm].delivered += 1;
    r.canonical_product = productMap[r.brand][norm].display;
  });
  const resolveProduct = (brand, rawProduct) => {
    const norm = cleanProductName(rawProduct) || String(rawProduct).toLowerCase();
    const g = productMap[brand]?.[norm];
    return g ? g.display : (rawProduct || "Unmapped Product");
  };
  validTicks.forEach(t => { t.canonical_product = resolveProduct(t.brand, t.raw_product); });

  // redistribution of unmapped-brand tickets
  const baseBrandSummary = computeBrandSummary(delRaw, validTicks);
  const brandWeights = computeBrandWeights(baseBrandSummary, validTicks);
  const weightEntries = Object.entries(brandWeights);
  let distBrandTicks = [];
  if (brandUnmapped.length && weightEntries.length) {
    const names = weightEntries.map(([b]) => b);
    const wts = weightEntries.map(([, w]) => w);
    distBrandTicks = brandUnmapped.map(t => {
      const brand = weightedChoice(rng, names, wts);
      return { ...t, brand, canonical_product: resolveProduct(brand, t.raw_product), _redistributed: true };
    });
  }
  const allTicks = [...validTicks, ...distBrandTicks];

  // subcategory placeholder resolution
  allTicks.forEach(t => {
    t.subcat_final = redistributeSubcat(t.raw_subcat, t.brand, t.canonical_product, t.ticket_category, rng);
  });

  const weeksSet = new Set([...delRaw.map(r => r["Delivery Week"]), ...allTicks.map(r => r["Delivery Week"])]);
  const weeksList = [...weeksSet].filter(w => w !== "Unknown Week").sort();

  const brandSummary = computeBrandSummary(delRaw, allTicks);
  const productSummary = computeProductSummary(delRaw, allTicks);
  const weeklyTrends = computeWeeklyTrends(delRaw, allTicks, weeksList);
  const subcatSummary = computeSubcatSummary(allTicks);
  const kpis = computeTopKpis(brandSummary, productSummary, subcatSummary, allTicks, delRaw, weeksList);

  return {
    delRaw, tickRaw: allTicks, brandSummary, productSummary, weeklyTrends, subcatSummary, kpis,
    brandWeights, weeksList,
    originalTicketCount, finalTicketCount: allTicks.length,
    nUnmappedBrand: brandUnmapped.length,
    nNotFoundSubcat: tickRaw.filter(t => t.raw_subcat === "Not Found").length,
    nNeedDetails: tickRaw.filter(t => t.raw_subcat === "Need Details").length,
  };
}

function computeBrandSummary(delDf, tickDf) {
  const delByBrand = {}, tickByBrand = {}, defectByBrand = {};
  delDf.forEach(r => { delByBrand[r.brand] = (delByBrand[r.brand] || 0) + 1; });
  tickDf.forEach(r => {
    tickByBrand[r.brand] = (tickByBrand[r.brand] || 0) + 1;
    const sc = r.subcat_final || r.raw_subcat;
    if (HIGH_SUBCATS.includes(sc)) defectByBrand[r.brand] = (defectByBrand[r.brand] || 0) + 1;
  });
  const brands = new Set([...Object.keys(delByBrand), ...Object.keys(tickByBrand)]);
  const totalDel = delDf.length || 1, totalTick = tickDf.length || 1;

  const driverByBrand = {};
  brands.forEach(b => {
    const bt = tickDf.filter(t => t.brand === b);
    if (bt.length) {
      const counts = {};
      bt.forEach(t => { const sc = t.subcat_final || t.raw_subcat; counts[sc] = (counts[sc] || 0) + 1; });
      driverByBrand[b] = Object.entries(counts).sort((a, b2) => b2[1] - a[1])[0][0];
    } else driverByBrand[b] = "N/A";
  });

  const rows = [...brands].map(brand => {
    const delivered = delByBrand[brand] || 0;
    const tickets = tickByBrand[brand] || 0;
    const defectTickets = defectByBrand[brand] || 0;
    const esc_pct = rawEsc(tickets, delivered);
    const defect_rate = rawEsc(defectTickets, delivered);
    return {
      brand, delivered, tickets, defect_tickets: defectTickets, esc_pct, defect_rate,
      weighted_esc: weightedEsc(tickets, delivered),
      confidence: Math.round(confidenceFactor(delivered) * 100),
      del_share: Math.round((delivered / totalDel) * 1000) / 10,
      tick_share: Math.round((tickets / totalTick) * 1000) / 10,
      "Top Escalation Driver": driverByBrand[brand],
      impact: impactTier(delivered, esc_pct, tickets),
    };
  });
  return rows.sort((a, b) => b.tickets - a.tickets);
}

function computeProductSummary(delDf, tickDf) {
  const key = (b, p) => `${b}\u0001${p}`;
  const delMap = {}, tickMap = {};
  delDf.forEach(r => { const k = key(r.brand, r.canonical_product); delMap[k] = (delMap[k] || 0) + 1; });
  tickDf.forEach(r => { const k = key(r.brand, r.canonical_product); tickMap[k] = tickMap[k] || { tickets: 0, defect: 0 }; tickMap[k].tickets++; const sc = r.subcat_final || r.raw_subcat; if (HIGH_SUBCATS.includes(sc)) tickMap[k].defect++; });
  const keys = new Set([...Object.keys(delMap), ...Object.keys(tickMap)]);
  const rows = [...keys].map(k => {
    const [brand, canonical_product] = k.split("\u0001");
    const delivered = delMap[k] || 0;
    const t = tickMap[k] || { tickets: 0, defect: 0 };
    const esc_pct = rawEsc(t.tickets, delivered);
    return {
      brand, canonical_product, delivered, tickets: t.tickets, defect_tickets: t.defect,
      esc_pct, defect_rate: rawEsc(t.defect, delivered),
      weighted_esc: weightedEsc(t.tickets, delivered),
      confidence: Math.round(confidenceFactor(delivered) * 100),
      brand_product: `${brand} | ${canonical_product}`,
      impact: impactTier(delivered, esc_pct, t.tickets),
    };
  });
  return rows.sort((a, b) => b.tickets - a.tickets);
}

function computeWeeklyTrends(delDf, tickDf, weeksList) {
  const delByWk = {}, tickByWk = {};
  delDf.forEach(r => { delByWk[r["Delivery Week"]] = (delByWk[r["Delivery Week"]] || 0) + 1; });
  tickDf.forEach(r => { tickByWk[r["Delivery Week"]] = (tickByWk[r["Delivery Week"]] || 0) + 1; });
  let prevTickets = null, prevEsc = null;
  return weeksList.map(wk => {
    const delivered = delByWk[wk] || 0, tickets = tickByWk[wk] || 0;
    const esc = rawEsc(tickets, delivered);
    const wowT = prevTickets == null ? 0 : tickets - prevTickets;
    const wowE = prevEsc == null ? 0 : Math.round((esc - prevEsc) * 100) / 100;
    prevTickets = tickets; prevEsc = esc;
    return { week: wk, delivered, tickets, esc_pct: esc, wow_tickets: wowT, wow_esc: wowE, spike: esc >= 8.0 && tickets >= 5 };
  });
}

function computeSubcatSummary(tickDf) {
  const counts = {};
  tickDf.forEach(r => { const sc = r.subcat_final || r.raw_subcat; counts[sc] = (counts[sc] || 0) + 1; });
  const total = tickDf.length || 1;
  return Object.entries(counts).map(([subcat, count]) => ({
    subcat, count, pct: Math.round((count / total) * 1000) / 10,
    tier: HIGH_SUBCATS.includes(subcat) ? "HIGH" : MEDIUM_SUBCATS.includes(subcat) ? "MEDIUM" : "LOW",
  })).sort((a, b) => b.count - a.count);
}

function computeTopKpis(brandSummary, productSummary, subcatSummary, tickDf, delDf, weeksList) {
  const totalDel = delDf.length, totalTick = tickDf.length;
  const overallEsc = rawEsc(totalTick, totalDel);
  const defectCount = tickDf.filter(t => HIGH_SUBCATS.includes(t.subcat_final || t.raw_subcat)).length;
  const overallDefect = rawEsc(defectCount, totalDel);
  const criticalN = brandSummary.filter(b => b.impact === "CRITICAL").length;
  const highN = brandSummary.filter(b => b.impact === "HIGH").length;
  const wkTotals = {};
  weeksList.forEach(wk => { wkTotals[wk] = tickDf.filter(t => t["Delivery Week"] === wk).length; });
  const spikeWeek = weeksList.length ? Object.entries(wkTotals).sort((a, b) => b[1] - a[1])[0][0] : "—";
  return {
    total_del: totalDel, total_tick: totalTick, overall_esc: overallEsc, overall_defect: overallDefect,
    top_risk_brand: brandSummary[0]?.brand || "—",
    top_risk_prod: productSummary[0]?.canonical_product?.slice(0, 40) || "—",
    top_issue: subcatSummary[0]?.subcat || "—",
    spike_week: spikeWeek, critical_brands: criticalN, high_brands: highN, n_brands: brandSummary.length,
  };
}
// ══════════════════════════════════════════════════════════════════════════════
// OPERATIONS MODULE — VIEWS
// ══════════════════════════════════════════════════════════════════════════════

const IMPACT_COLOR = { CRITICAL: "red", HIGH: "amber", MEDIUM: "blue", LOW: "green" };

const OpsUploadScreen = ({ onData }) => {
  const [delFile, setDelFile] = useState(null);
  const [tickFile, setTickFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const parseCsv = file => new Promise((resolve, reject) => {
    Papa.parse(file, { header: true, skipEmptyLines: true, complete: r => resolve(r.data), error: reject });
  });

  const run = async () => {
    if (!delFile || !tickFile) { setErr("Please upload both files — delivered orders and support tickets."); return; }
    setBusy(true); setErr("");
    try {
      const [delRows, tickRows] = await Promise.all([parseCsv(delFile), parseCsv(tickFile)]);
      const stats = processOpsData(delRows, tickRows);
      onData(stats);
    } catch (e) {
      setErr("Couldn't process those files. Check they're valid CSV exports.");
    }
    setBusy(false);
  };

  const Drop = ({ label, sub, file, setFile, icon }) => (
    <div className="card" style={{ padding: 28, textAlign: "center", cursor: "pointer", border: file ? `1px solid ${T.blue}` : undefined }}
      onClick={() => document.getElementById(`ops-file-${label}`).click()}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}>
      <input id={`ops-file-${label}`} type="file" accept=".csv" style={{ display: "none" }} onChange={e => setFile(e.target.files?.[0] || null)} />
      <div style={{ color: file ? T.blue : T.textMuted, marginBottom: 10 }}><Icon n={icon} s={32} /></div>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: T.textMuted }}>{file ? file.name : sub}</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{ maxWidth: 620, width: "100%" }} className="fade-in">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 6 }}>Operations Analytics</div>
          <div style={{ fontSize: 13, color: T.textMuted }}>Looks empty here. Upload your delivered orders + tickets exports and let the magic begin ✨</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
          <Drop label="Delivered Orders" sub="CSV export of delivered orders" file={delFile} setFile={setDelFile} icon="truck" />
          <Drop label="Support Tickets" sub="CSV export of support tickets" file={tickFile} setFile={setTickFile} icon="tickets" />
        </div>
        {err && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", color: T.red, marginBottom: 14, fontSize: 13 }}>{err}</div>}
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px 18px" }} disabled={busy} onClick={run}>
          {busy ? <><span className="spin" style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block" }} /> Building Intelligence...</> : <>Process Datasets</>}
        </button>
      </div>
    </div>
  );
};

const OpsHome = ({ stats, onNav }) => {
  const k = stats.kpis;
  const topBrands = stats.brandSummary.slice(0, 6).map(b => ({ k: b.brand, v: b.tickets }));
  const topSubcats = stats.subcatSummary.slice(0, 6).map(s => ({ k: s.subcat, v: s.count }));
  const ACCENT = [T.blue, T.purple, T.cyan, T.green, T.amber, T.pink];
  return (
    <div className="fade-in">
      <SectionHeader title="Operations Overview" sub={`${fmt.num(k.total_del)} orders · ${fmt.num(k.total_tick)} tickets analyzed`} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14, marginBottom: 24 }}>
        <KpiCard label="Delivered Orders" value={fmt.num(k.total_del)} icon="truck" accent={T.blue} onClick={() => onNav("brands")} />
        <KpiCard label="Total Tickets" value={fmt.num(k.total_tick)} icon="tickets" accent={T.purple} onClick={() => onNav("escalation")} />
        <KpiCard label="Overall Escalation %" value={fmt.pct(k.overall_esc)} icon="percent" accent={k.overall_esc >= 5 ? T.red : T.green} />
        <KpiCard label="Defect Rate" value={fmt.pct(k.overall_defect)} icon="defect" accent={T.amber} onClick={() => onNav("defects")} />
        <KpiCard label="Critical Brands" value={fmt.num(k.critical_brands)} icon="alert" accent={T.red} onClick={() => onNav("brands")} />
        <KpiCard label="High Risk Brands" value={fmt.num(k.high_brands)} icon="warn" accent={T.amber} onClick={() => onNav("brands")} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>Top Brands by Ticket Volume</div>
          <MiniBar data={topBrands} colorFn={i => ACCENT[i % ACCENT.length]} />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>Top Escalation Drivers</div>
          <MiniBar data={topSubcats} colorFn={i => ACCENT[i % ACCENT.length]} />
        </div>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Quick Signal</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, fontSize: 12, color: T.textSub }}>
          <div><div style={{ color: T.textMuted, marginBottom: 3 }}>Top Risk Brand</div><div style={{ color: T.text, fontWeight: 600 }}>{k.top_risk_brand}</div></div>
          <div><div style={{ color: T.textMuted, marginBottom: 3 }}>Top Risk Product</div><div style={{ color: T.text, fontWeight: 600 }}>{k.top_risk_prod}</div></div>
          <div><div style={{ color: T.textMuted, marginBottom: 3 }}>Spike Week</div><div style={{ color: T.text, fontWeight: 600 }}>{k.spike_week}</div></div>
        </div>
      </div>
    </div>
  );
};

const ImpactBadge = ({ impact }) => <span className={`badge badge-${IMPACT_COLOR[impact] || "blue"}`}>{impact}</span>;

const BrandAnalysis = ({ stats }) => {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("tickets");
  const rows = useMemo(() => {
    let r = stats.brandSummary.filter(b => !q || b.brand.toLowerCase().includes(q.toLowerCase()));
    return [...r].sort((a, b) => (b[sortKey] ?? 0) - (a[sortKey] ?? 0));
  }, [stats, q, sortKey]);
  return (
    <div className="fade-in">
      <SectionHeader title="Brand Analysis" sub={`${rows.length} brands`} action={<ExportButton rows={rows} name="brand-analysis" />} />
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <input className="input" style={{ maxWidth: 260 }} placeholder="Search brand..." value={q} onChange={e => setQ(e.target.value)} />
        <select className="input" style={{ maxWidth: 200 }} value={sortKey} onChange={e => setSortKey(e.target.value)}>
          <option value="tickets">Sort: Tickets</option>
          <option value="delivered">Sort: Delivered</option>
          <option value="esc_pct">Sort: Escalation %</option>
          <option value="weighted_esc">Sort: Weighted Esc %</option>
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Brand</th><th>Delivered</th><th>Tickets</th><th>Esc %</th><th>Weighted Esc %</th><th>Defect Rate</th><th>Confidence</th><th>Top Driver</th><th>Impact</th></tr></thead>
          <tbody>
            {rows.slice(0, 300).map((b, i) => (
              <tr key={i}>
                <td>{b.brand}</td><td>{fmt.num(b.delivered)}</td><td>{fmt.num(b.tickets)}</td>
                <td>{fmt.pct(b.esc_pct)}</td><td>{fmt.pct(b.weighted_esc)}</td><td>{fmt.pct(b.defect_rate)}</td>
                <td>{b.confidence}%</td><td>{b["Top Escalation Driver"]}</td><td><ImpactBadge impact={b.impact} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProductAnalysis = ({ stats }) => {
  const [q, setQ] = useState("");
  const rows = useMemo(() => stats.productSummary.filter(p => !q || p.brand_product.toLowerCase().includes(q.toLowerCase())), [stats, q]);
  return (
    <div className="fade-in">
      <SectionHeader title="Product Analysis" sub={`${rows.length} brand-product combinations`} action={<ExportButton rows={rows} name="product-analysis" />} />
      <input className="input" style={{ maxWidth: 300, marginBottom: 14 }} placeholder="Search brand or product..." value={q} onChange={e => setQ(e.target.value)} />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Brand</th><th>Product</th><th>Delivered</th><th>Tickets</th><th>Esc %</th><th>Defect Rate</th><th>Impact</th></tr></thead>
          <tbody>
            {rows.slice(0, 300).map((p, i) => (
              <tr key={i}><td>{p.brand}</td><td>{p.canonical_product}</td><td>{fmt.num(p.delivered)}</td><td>{fmt.num(p.tickets)}</td><td>{fmt.pct(p.esc_pct)}</td><td>{fmt.pct(p.defect_rate)}</td><td><ImpactBadge impact={p.impact} /></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EscalationView = ({ stats }) => {
  const barData = stats.brandSummary.slice(0, 12).map(b => ({ k: b.brand, v: b.esc_pct }));
  const tierCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  stats.subcatSummary.forEach(s => { tierCounts[s.tier] += s.count; });
  return (
    <div className="fade-in">
      <SectionHeader title="Escalation % Overview" sub={`Overall escalation ${fmt.pct(stats.kpis.overall_esc)}`} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        <KpiCard label="High Severity Tickets" value={fmt.num(tierCounts.HIGH)} accent={T.red} icon="alert" />
        <KpiCard label="Medium Severity Tickets" value={fmt.num(tierCounts.MEDIUM)} accent={T.amber} icon="warn" />
        <KpiCard label="Low Severity Tickets" value={fmt.num(tierCounts.LOW)} accent={T.green} icon="check" />
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>Escalation % by Brand (Top 12)</div>
        <MiniBar data={barData} colorFn={i => barData[i].v >= 7 ? T.red : barData[i].v >= 5 ? T.amber : T.blue} />
      </div>
    </div>
  );
};

const DeliveryPhaseView = ({ stats, phase }) => {
  const cat = phase === "pre" ? "PRE_DELIVERY" : "POST_DELIVERY";
  const filtered = useMemo(() => stats.tickRaw.filter(t => t.ticket_category === cat), [stats, cat]);
  const subcatCounts = useMemo(() => {
    const c = {};
    filtered.forEach(t => { const sc = t.subcat_final || t.raw_subcat; c[sc] = (c[sc] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ k, v }));
  }, [filtered]);
  const brandCounts = useMemo(() => {
    const c = {};
    filtered.forEach(t => { c[t.brand] = (c[t.brand] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => ({ k, v }));
  }, [filtered]);
  return (
    <div className="fade-in">
      <SectionHeader title={phase === "pre" ? "Pre-Delivery Analysis" : "Post-Delivery Analysis"} sub={`${fmt.num(filtered.length)} tickets in this journey stage`} action={<ExportButton rows={filtered} name={`${phase}-delivery-tickets`} />} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>Sub-category Breakdown</div>
          {subcatCounts.length ? <MiniBar data={subcatCounts} colorFn={() => phase === "pre" ? T.cyan : T.purple} /> : <div style={{ color: T.textMuted, fontSize: 13 }}>No tickets in this stage.</div>}
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>Top Brands</div>
          {brandCounts.length ? <MiniBar data={brandCounts} colorFn={() => T.blue} /> : <div style={{ color: T.textMuted, fontSize: 13 }}>No tickets in this stage.</div>}
        </div>
      </div>
    </div>
  );
};

const DefectAnalysis = ({ stats }) => {
  const defectBrands = useMemo(() => [...stats.brandSummary].filter(b => b.defect_tickets > 0).sort((a, b) => b.defect_rate - a.defect_rate), [stats]);
  const defectProducts = useMemo(() => [...stats.productSummary].filter(p => p.defect_tickets > 0).sort((a, b) => b.defect_rate - a.defect_rate).slice(0, 50), [stats]);
  return (
    <div className="fade-in">
      <SectionHeader title="Defect Analysis" sub="Defective / Damaged / Low Quality / Delay / Not Shipped" action={<ExportButton rows={defectBrands} name="defect-analysis" />} />
      <div className="table-wrap" style={{ marginBottom: 20 }}>
        <table>
          <thead><tr><th>Brand</th><th>Delivered</th><th>Defect Tickets</th><th>Defect Rate</th><th>Impact</th></tr></thead>
          <tbody>{defectBrands.slice(0, 100).map((b, i) => (
            <tr key={i}><td>{b.brand}</td><td>{fmt.num(b.delivered)}</td><td>{fmt.num(b.defect_tickets)}</td><td>{fmt.pct(b.defect_rate)}</td><td><ImpactBadge impact={b.impact} /></td></tr>
          ))}</tbody>
        </table>
      </div>
      <SectionHeader title="Worst Products by Defect Rate" />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Brand</th><th>Product</th><th>Delivered</th><th>Defect Tickets</th><th>Defect Rate</th></tr></thead>
          <tbody>{defectProducts.map((p, i) => (
            <tr key={i}><td>{p.brand}</td><td>{p.canonical_product}</td><td>{fmt.num(p.delivered)}</td><td>{fmt.num(p.defect_tickets)}</td><td>{fmt.pct(p.defect_rate)}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
};

const WeeklyTrends = ({ stats }) => {
  const rows = stats.weeklyTrends;
  const max = Math.max(...rows.map(r => r.tickets), 1);
  return (
    <div className="fade-in">
      <SectionHeader title="Weekly Trends" sub={`${rows.length} weeks tracked`} action={<ExportButton rows={rows} name="weekly-trends" />} />
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 160 }}>
          {rows.map((r, i) => (
            <div key={i} title={`${r.week}: ${r.tickets} tickets`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
              <div style={{ width: "70%", height: `${(r.tickets / max) * 100}%`, minHeight: 2, borderRadius: "4px 4px 0 0", background: r.spike ? T.red : "linear-gradient(180deg,#3B82F6,#8B5CF6)", transition: "height 0.6s ease" }} />
            </div>
          ))}
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Week</th><th>Delivered</th><th>Tickets</th><th>Esc %</th><th>WoW Δ Tickets</th><th>WoW Δ Esc %</th><th>Status</th></tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={i}><td>{r.week}</td><td>{fmt.num(r.delivered)}</td><td>{fmt.num(r.tickets)}</td><td>{fmt.pct(r.esc_pct)}</td>
              <td style={{ color: r.wow_tickets > 0 ? T.red : T.green }}>{r.wow_tickets > 0 ? "+" : ""}{r.wow_tickets}</td>
              <td style={{ color: r.wow_esc > 0 ? T.red : T.green }}>{r.wow_esc > 0 ? "+" : ""}{r.wow_esc}%</td>
              <td>{r.spike ? <span className="badge badge-red">🚨 SPIKE</span> : <span className="badge badge-green">✅ STABLE</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
};

const OpsExports = ({ stats }) => {
  const items = [
    { name: "Brand Analysis", rows: stats.brandSummary, key: "brand-analysis" },
    { name: "Product Analysis", rows: stats.productSummary, key: "product-analysis" },
    { name: "Weekly Trends", rows: stats.weeklyTrends, key: "weekly-trends" },
    { name: "Subcategory Summary", rows: stats.subcatSummary, key: "subcat-summary" },
    { name: "All Delivered Orders", rows: stats.delRaw, key: "delivered-orders" },
    { name: "All Tickets (incl. redistribution)", rows: stats.tickRaw, key: "all-tickets" },
  ];
  return (
    <div className="fade-in">
      <SectionHeader title="Exports" sub="Download any dataset as CSV" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
        {items.map((it, i) => (
          <div key={i} className="card" style={{ padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{it.name}</div><div style={{ fontSize: 12, color: T.textMuted }}>{fmt.num(it.rows.length)} rows</div></div>
            <ExportButton rows={it.rows} name={it.key} label="CSV" />
          </div>
        ))}
      </div>
    </div>
  );
};

const OpsAIAnalytics = ({ stats }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true); setError(""); setInsights(null);
    const k = stats.kpis;
    const summary = {
      totalDelivered: k.total_del, totalTickets: k.total_tick, overallEsc: k.overall_esc, overallDefect: k.overall_defect,
      criticalBrands: k.critical_brands, highBrands: k.high_brands,
      topBrands: stats.brandSummary.slice(0, 5).map(b => `${b.brand}(${b.tickets}tkts,${b.esc_pct}%esc)`).join(", "),
      topProducts: stats.productSummary.slice(0, 5).map(p => `${p.brand_product}(${p.tickets}tkts)`).join(", "),
      topIssues: stats.subcatSummary.slice(0, 6).map(s => `${s.subcat}:${s.count}`).join(", "),
      spikeWeek: k.spike_week,
    };
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          messages: [{ role: "user", content: `You are an Operations Intelligence AI Analyst for an e-commerce ops team. Analyze this brand/product escalation data and provide EXACTLY 8 actionable insights in JSON format.\n\nData: ${JSON.stringify(summary)}\n\nRespond ONLY with a JSON array of 8 objects, each with: {"priority":"CRITICAL|HIGH|MEDIUM","icon":"emoji","title":"short title","insight":"one sentence finding","action":"one sentence recommendation"}\n\nNo markdown, no explanation, just the JSON array.` }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      setInsights(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch (e) { setError("Could not generate insights. Check API connection."); }
    setLoading(false);
  };

  const colorMap = { CRITICAL: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", badge: "red" }, HIGH: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", badge: "amber" }, MEDIUM: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", badge: "blue" } };

  return (
    <div className="fade-in">
      <SectionHeader title="AI Analytics" sub="Powered by Claude AI — auto-analysis of your operations data"
        action={<div style={{ display: "flex", gap: 8 }}>{insights && <ExportButton rows={insights} name="ops-ai-insights" />}<button className="btn btn-primary" onClick={generate} disabled={loading}>{loading ? "Analyzing..." : <><Icon n="sparkle" s={14} /> Generate Insights</>}</button></div>} />
      {error && <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.1)", color: T.red, marginBottom: 16 }}>{error}</div>}
      {!insights && !loading && (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ color: T.textMuted, marginBottom: 16 }}><Icon n="sparkle" s={40} /></div>
          <div style={{ fontSize: 16, color: T.textSub }}>Click "Generate Insights" to run AI analysis on your operations data</div>
        </div>
      )}
      {insights && (
        <div style={{ display: "grid", gap: 10 }}>
          {insights.map((ins, i) => {
            const cm = colorMap[ins.priority] || colorMap.MEDIUM;
            return (
              <div key={i} style={{ padding: "16px 18px", borderRadius: 12, background: cm.bg, border: `1px solid ${cm.border}` }} className="fade-in">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ fontSize: 22, lineHeight: 1 }}>{ins.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{ins.title}</span>
                      <span className={`badge badge-${cm.badge}`}>{ins.priority}</span>
                    </div>
                    <div style={{ fontSize: 13, color: T.textSub, marginBottom: 6, lineHeight: 1.5 }}>{ins.insight}</div>
                    <div style={{ fontSize: 12, color: T.blueL, background: "rgba(59,130,246,0.08)", borderRadius: 6, padding: "5px 10px", display: "inline-block" }}>💡 {ins.action}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
function OperationsApp({ onBackHome, stats, setStats, onOpenCmd }) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const NAV = [
    { section: "MAIN" },
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { section: "ANALYSIS" },
    { id: "brands", label: "Brand Analysis", icon: "brand" },
    { id: "products", label: "Product Analysis", icon: "product" },
    { id: "escalation", label: "Escalation %", icon: "percent" },
    { id: "pre", label: "Pre-Delivery", icon: "clock" },
    { id: "post", label: "Post-Delivery", icon: "truck" },
    { id: "defects", label: "Defect Analysis", icon: "defect" },
    { section: "TRENDS" },
    { id: "weekly", label: "Weekly Trends", icon: "trend" },
    { section: "TOOLS" },
    { id: "ai", label: "AI Analytics", icon: "sparkle" },
    { id: "exports", label: "Exports", icon: "exportIcon" },
  ];

  const renderContent = () => {
    if (!stats) return null;
    switch (activeNav) {
      case "dashboard": return <OpsHome stats={stats} onNav={setActiveNav} />;
      case "brands": return <BrandAnalysis stats={stats} />;
      case "products": return <ProductAnalysis stats={stats} />;
      case "escalation": return <EscalationView stats={stats} />;
      case "pre": return <DeliveryPhaseView stats={stats} phase="pre" />;
      case "post": return <DeliveryPhaseView stats={stats} phase="post" />;
      case "defects": return <DefectAnalysis stats={stats} />;
      case "weekly": return <WeeklyTrends stats={stats} />;
      case "ai": return <OpsAIAnalytics stats={stats} />;
      case "exports": return <OpsExports stats={stats} />;
      default: return <OpsHome stats={stats} onNav={setActiveNav} />;
    }
  };

  if (!stats) return <OpsUploadScreen onData={setStats} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg0 }}>
      <div style={{ width: sidebarOpen ? 210 : 52, flexShrink: 0, background: "rgba(15,19,34,0.75)", backdropFilter: "blur(20px)", borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", transition: "width 0.3s cubic-bezier(0.16,1,0.3,1)", overflow: "hidden" }}>
        <div style={{ padding: "14px 10px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8 }}>
          {sidebarOpen && <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Operations</div>}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
          {NAV.map((item, i) => {
            if (item.section) return sidebarOpen ? <div key={i} className="nav-section">{item.section}</div> : <div key={i} style={{ height: 10 }} />;
            return (
              <div key={i} className={`nav-item ${activeNav === item.id ? "active" : ""}`} onClick={() => setActiveNav(item.id)}>
                <Icon n={item.icon} s={16} />
                {sidebarOpen && <span style={{ flex: 1 }}>{item.label}</span>}
              </div>
            );
          })}
        </div>
        <div style={{ padding: "10px 8px", borderTop: `1px solid ${T.border}` }}>
          <div className="nav-item" onClick={() => setStats(null)}>
            <Icon n="upload" s={16} />
            {sidebarOpen && <span>Upload New Data</span>}
          </div>
          <div className="nav-item" onClick={() => setSidebarOpen(o => !o)}>
            <Icon n="chevron" s={16} style={{ transform: sidebarOpen ? "none" : "rotate(180deg)", transition: "transform 0.3s" }} />
            {sidebarOpen && <span>Collapse</span>}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", background: `radial-gradient(ellipse at 20% 0%, rgba(59,130,246,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(139,92,246,0.04) 0%, transparent 50%), ${T.bg0}` }}>
        <div className="os-topbar">
          <Breadcrumb crumbs={[
            { label: "Home", onClick: onBackHome },
            { label: "Operations", onClick: () => setActiveNav("dashboard") },
            ...(activeNav !== "dashboard" ? [{ label: NAV.find(n => n.id === activeNav)?.label || activeNav }] : []),
          ]} />
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {stats.kpis.critical_brands > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", fontSize: 12 }} onClick={() => setActiveNav("brands")}>
                <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: T.red, display: "inline-block" }} />
                <span style={{ color: T.red, fontWeight: 600 }}>{stats.kpis.critical_brands} critical brands</span>
              </div>
            )}
            <div style={{ fontSize: 11, color: T.textMuted, background: "rgba(255,255,255,0.04)", padding: "4px 10px", borderRadius: 7, border: `1px solid ${T.border}`, cursor: "pointer" }} onClick={onOpenCmd}>⌘K</div>
            <span style={{ fontSize: 12, color: T.textMuted }}>{fmt.num(stats.kpis.total_del)} orders · {fmt.num(stats.kpis.total_tick)} tickets</span>
          </div>
        </div>
        <div style={{ padding: "24px 28px" }}>{renderContent()}</div>
      </div>
    </div>
  );
}
// ══════════════════════════════════════════════════════════════════════════════
// MASTER SHELL — Home screen, floating AI assistant, unified App
// ══════════════════════════════════════════════════════════════════════════════

const GREETING_LINES = {
  morning: ["☀️ Good Morning, Cheeku.", "Ready to break yesterday's records?", "Coffee first? ☕"],
  afternoon: ["👋 Good Afternoon.", "Had lunch yet?", "Let's see what's happening today."],
  evening: ["🌆 Good Evening.", "Long day?", "Let's wrap everything beautifully."],
  night: ["🌙 Still working?", "Don't forget to sleep after this.", "Your dashboard is ready whenever you are."],
};

const FLAVOR_LINES = [
  "Looks like everything is under control today.",
  "Today's mission: keep escalation below 3%.",
  "Ticket volume is higher than yesterday.",
  "Looks quiet today... don't trust it 😂",
  "Brands are behaving today. Let's keep it that way.",
  "Everything looks healthy. Beautiful work.",
  "No major fires today. Enjoy it while it lasts 😄",
];

function useGreeting() {
  return useMemo(() => {
    const now = new Date();
    const h = now.getHours();
    const day = now.getDay(); // 0 Sun ... 6 Sat
    let bucket = "morning";
    if (h >= 5 && h < 12) bucket = "morning";
    else if (h >= 12 && h < 17) bucket = "afternoon";
    else if (h >= 17 && h < 22) bucket = "evening";
    else bucket = "night";

    let headline = GREETING_LINES[bucket][0];
    let sub = GREETING_LINES[bucket][1];
    if (day === 1) { headline = "New week. New goals."; sub = "Let's do this."; }
    else if (day === 5) { headline = "Weekend is almost here 🍻"; sub = "Finish strong."; }

    const flavor = FLAVOR_LINES[Math.floor(Math.random() * FLAVOR_LINES.length)];
    return { headline, sub, flavor };
  }, []);
}

const OSHome = ({ csRawData, csStats, opsStats, onNav, onOpenAI, onOpenCmd }) => {
  const greet = useGreeting();

  const totalOrders = opsStats?.kpis.total_del ?? null;
  const totalTickets = (opsStats?.kpis.total_tick ?? 0) + (csStats?.total ?? 0);
  const escPct = opsStats?.kpis.overall_esc ?? null;
  const resRate = csStats?.resolutionRate ?? null;
  const criticalBrands = opsStats?.kpis.critical_brands ?? 0;
  const acrViolations = csStats?.acrViolations?.length ?? 0;

  const healthScore = useMemo(() => {
    let score = 100;
    if (escPct != null) score -= Math.min(40, escPct * 4);
    if (resRate != null) score -= Math.min(30, (100 - resRate) * 0.3);
    score -= Math.min(20, criticalBrands * 3);
    score -= Math.min(10, acrViolations * 0.5);
    return Math.max(0, Math.round(score));
  }, [escPct, resRate, criticalBrands, acrViolations]);

  const alerts = [
    ...(criticalBrands > 0 ? [{ label: `${criticalBrands} brand(s) in CRITICAL escalation`, nav: "operations" }] : []),
    ...(acrViolations > 0 ? [{ label: `${acrViolations} tickets overdue for auto-closure`, nav: "support" }] : []),
  ];

  return (
    <div className="fade-in" style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div className="greeting-card slide-up" style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 6 }}>{greet.headline}</div>
        <div style={{ fontSize: 14, color: T.textSub, marginBottom: 4 }}>{greet.sub}</div>
        <div style={{ fontSize: 13, color: T.textMuted }}>{greet.flavor}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
        <KpiCard label="Overall Health Score" value={`${healthScore}`} sub="composite indicator" accent={healthScore >= 80 ? T.green : healthScore >= 60 ? T.amber : T.red} icon="sparkle" />
        <KpiCard label="Orders" value={totalOrders != null ? fmt.num(totalOrders) : "—"} accent={T.blue} icon="truck" onClick={() => onNav("operations")} />
        <KpiCard label="Total Tickets" value={fmt.num(totalTickets)} accent={T.purple} icon="tickets" />
        <KpiCard label="Escalation %" value={escPct != null ? fmt.pct(escPct) : "—"} accent={escPct >= 5 ? T.red : T.green} icon="percent" onClick={() => onNav("operations")} />
        <KpiCard label="CS Resolution Rate" value={resRate != null ? fmt.pct(resRate) : "—"} accent={T.cyan} icon="check" onClick={() => onNav("support")} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div className="module-card" onClick={() => onNav("operations")}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div className="os-logo" style={{ background: `linear-gradient(135deg,${T.blue},${T.cyan})` }}><Icon n="ops" s={18} /></div>
            <div><div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Operations Analytics</div><div style={{ fontSize: 12, color: T.textMuted }}>Orders, brands, products, escalation</div></div>
          </div>
          {opsStats ? (
            <div style={{ fontSize: 12, color: T.textSub }}>{fmt.num(opsStats.kpis.total_del)} orders · {fmt.num(opsStats.kpis.total_tick)} tickets · {fmt.pct(opsStats.kpis.overall_esc)} escalation</div>
          ) : <div style={{ fontSize: 12, color: T.textMuted }}>No data loaded yet — click to upload your orders + tickets CSVs.</div>}
        </div>
        <div className="module-card" onClick={() => onNav("support")}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div className="os-logo" style={{ background: `linear-gradient(135deg,${T.purple},${T.pink})` }}><Icon n="tickets" s={18} /></div>
            <div><div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Customer Support Analytics</div><div style={{ fontSize: 12, color: T.textMuted }}>SLA, TAT, agents, reopens, CSAT signals</div></div>
          </div>
          {csRawData ? (
            <div style={{ fontSize: 12, color: T.textSub }}>{fmt.num(csStats?.total)} tickets · {fmt.pct(csStats?.resolutionRate)} resolved · {csStats?.acrViolations.length} violations</div>
          ) : <div style={{ fontSize: 12, color: T.textMuted }}>No data loaded yet — click to upload your ticket export.</div>}
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="card fade-in" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 12 }}>Critical Alerts</div>
          {alerts.map((a, i) => (
            <div key={i} className="alert-item" style={{ "--alert-bg": "rgba(239,68,68,0.06)", "--alert-border": "rgba(239,68,68,0.18)", "--alert-hover": "rgba(239,68,68,0.35)" }} onClick={() => onNav(a.nav)}>
              <Icon n="alert" s={16} c={T.red} />
              <div style={{ fontSize: 13, color: T.textSub }}>{a.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <div className="quick-action" onClick={() => onNav("operations")}><Icon n="brand" s={15} /> Review brand risk</div>
        <div className="quick-action" onClick={() => onNav("support")}><Icon n="fire" s={15} /> Check auto-closure violations</div>
        <div className="quick-action" onClick={onOpenAI}><Icon n="sparkle" s={15} c={T.amber} /> Ask OPX AI</div>
        <div className="quick-action" onClick={onOpenCmd} style={{ marginLeft: "auto", borderStyle: "dashed" }}>
          <Icon n="search" s={15} />
          <span>Search anything</span>
          <span style={{ fontSize: 11, color: T.textMuted, background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 5, marginLeft: 4 }}>⌘K</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}` }}>
        <Icon n="info" s={13} c={T.textMuted} />
        <span style={{ fontSize: 12, color: T.textMuted }}>Press <kbd style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${T.border}`, borderRadius: 4, padding: "1px 5px", fontSize: 11 }}>Ctrl+K</kbd> anywhere to jump to any page instantly.</span>
      </div>
    </div>
  );
};

const AIAssistant = ({ open, setOpen, context }) => {
  const [messages, setMessages] = useState([{ role: "bot", text: "Hey! I'm OPX AI. Ask me about your brands, tickets, or escalation trends." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages, open]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setMessages(m => [...m, { role: "user", text: q }]);
    setInput(""); setBusy(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 600,
          messages: [{ role: "user", content: `You are OPX AI, an operations + customer support analyst embedded in a dashboard. Answer briefly (max 4 sentences) and concretely using this context if relevant:\n\n${context}\n\nQuestion: ${q}` }]
        })
      });
      const data = await res.json();
      const text2 = data.content?.[0]?.text || "I couldn't find an answer for that.";
      setMessages(m => [...m, { role: "bot", text: text2 }]);
    } catch (e) {
      setMessages(m => [...m, { role: "bot", text: "Couldn't reach the AI service just now — try again in a moment." }]);
    }
    setBusy(false);
  };

  const QUICK = ["Show worst brands", "Which agent needs help?", "Why did escalation increase?", "Show ticket spike"];

  return (
    <>
      <button className="ai-fab" onClick={() => setOpen(o => !o)} aria-label="OPX AI">
        <Icon n={open ? "close" : "sparkle"} s={22} />
      </button>
      {open && (
        <div className="ai-panel scale-in">
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <div className="os-logo" style={{ width: 28, height: 28, fontSize: 12 }}><Icon n="sparkle" s={14} /></div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>OPX AI</div>
          </div>
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((m, i) => <div key={i} className={`ai-msg ${m.role}`}>{m.text}</div>)}
            {busy && <div className="ai-msg bot pulse">Thinking...</div>}
          </div>
          <div style={{ padding: "8px 12px", display: "flex", gap: 6, flexWrap: "wrap", borderTop: `1px solid ${T.border}` }}>
            {QUICK.map((q, i) => <span key={i} className="tag" style={{ cursor: "pointer" }} onClick={() => send(q)}>{q}</span>)}
          </div>
          <div style={{ padding: 12, borderTop: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
            <input className="input" placeholder="Ask anything..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
            <button className="btn btn-primary" onClick={() => send()} disabled={busy}><Icon n="check" s={14} /></button>
          </div>
        </div>
      )}
    </>
  );
};

const MASTER_NAV = [
  { id: "home", label: "Home", icon: "home" },
  { id: "operations", label: "Operations", icon: "ops" },
  { id: "support", label: "Customer Support", icon: "tickets" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const OSSettings = () => (
  <div className="fade-in" style={{ maxWidth: 720 }}>
    <SectionHeader title="Settings" sub="Reference thresholds used across OPX Enterprise OS" />
    <div className="card" style={{ padding: 20, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 10 }}>Operations — Impact Tiers</div>
      <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.8 }}>
        CRITICAL: ≥300 delivered, ≥7% escalation, ≥25 tickets<br />
        HIGH: ≥200 delivered, ≥5% escalation<br />
        MEDIUM: ≥100 delivered, ≥3% escalation<br />
        LOW: everything else
      </div>
    </div>
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 10 }}>Customer Support — Auto-Closure Rules</div>
      <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.8 }}>
        Editable in-module under Customer Support → Settings / Rules (resolved, pending, ACR/ASR, and SLA thresholds).
      </div>
    </div>
  </div>
);

export default function OPXEnterpriseOS() {
  const [page, setPage] = useState("home");
  const [csRawData, setCsRawData] = useState(null);
  const [opsStats, setOpsStats] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cursor, setCursor] = useState({ x: -1000, y: -1000 });

  const csDefaultRules = { pendingCustomerInactivity: 10, pendingAgentInactivity: 4, resolvedAutoClose: 2, openAgentInactivity: 5, newTicketSLA: 5, acrAutoClose: 2, asrAutoClose: 2, botAutoClose: 1, slaRiskThreshold: 3 };
  const csStats = useMemo(() => csRawData ? processData(csRawData, csDefaultRules) : null, [csRawData]);

  const aiContext = useMemo(() => {
    const parts = [];
    if (opsStats) parts.push(`Operations: ${opsStats.kpis.total_del} orders, ${opsStats.kpis.total_tick} tickets, ${opsStats.kpis.overall_esc}% escalation, top risk brand ${opsStats.kpis.top_risk_brand}, ${opsStats.kpis.critical_brands} critical brands.`);
    if (csStats) parts.push(`Customer Support: ${csStats.total} tickets, ${csStats.resolutionRate.toFixed(1)}% resolution rate, ${csStats.acrViolations.length} auto-closure violations, top brands: ${Object.entries(csStats.brands).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k}(${v})`).join(", ")}.`);
    return parts.join("\n") || "No data has been uploaded to either module yet.";
  }, [opsStats, csStats]);

  const onMouseMove = e => setCursor({ x: e.clientX, y: e.clientY });

  // Global Ctrl+K shortcut
  useEffect(() => {
    const handler = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setCmdOpen(o => !o); }
      if (e.key === "Escape") { setCmdOpen(false); setAiOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  

  const renderPage = () => {
    if (page === "operations") return (
      <OperationsApp stats={opsStats} setStats={setOpsStats} onBackHome={() => setPage("home")} onOpenCmd={() => setCmdOpen(true)} />
    );
    if (page === "support") return (
      <CustomerSupportApp rawData={csRawData} setRawData={setCsRawData} onBackHome={() => setPage("home")} onOpenCmd={() => setCmdOpen(true)} />
    );
    if (page === "settings") return (
      <div style={{ padding: "24px 28px" }}>
        <div className="os-topbar slide-down" style={{ margin: "-24px -28px 24px", padding: "12px 28px" }}>
          <Breadcrumb crumbs={[{ label: "Home", onClick: () => setPage("home") }, { label: "Settings" }]} />
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <div className="os-back-btn" onClick={() => setPage("home")}><Icon n="chevron" s={13} c={T.textSub} style={{ transform: "rotate(180deg)" }} />← Back</div>
          </div>
        </div>
        <OSSettings />
      </div>
    );
    return <div style={{ padding: "24px 28px" }}><OSHome csRawData={csRawData} csStats={csStats} opsStats={opsStats} onNav={setPage} onOpenAI={() => setAiOpen(true)} onOpenCmd={() => setCmdOpen(true)} /></div>;
  };

  return (
    <>
      <GlobalStyle />
      <div className="os-shell" onMouseMove={onMouseMove}>
        <div className="aurora"><div className="aurora-blob b1" /><div className="aurora-blob b2" /><div className="aurora-blob b3" /></div>
        <div className="noise-overlay" />
        <div className="aurora-cursor-glow" style={{ left: cursor.x, top: cursor.y }} />

        {/* PERSISTENT OS RAIL — always visible on every screen */}
        <OSRail page={page} onNav={setPage} onOpenAI={() => setAiOpen(true)} onOpenCmd={() => setCmdOpen(true)} csStats={csStats} opsStats={opsStats} />

        {/* Main content offset by rail width */}
        <div className="os-content" style={{ marginLeft: 56 }}>{renderPage()}</div>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onNav={p => { setPage(p); }} onOpenAI={() => setAiOpen(true)} />
      <AIAssistant open={aiOpen} setOpen={setAiOpen} context={aiContext} />
    </>
  );
}

import { useState, useEffect } from "react";
import { C } from "../data/seed";

export function useCountdown(deadline: number) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!deadline) return;
    const tick = () => setRemaining(Math.floor((deadline - Date.now()) / 1000));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [deadline]);
  return remaining;
}

export function fmtTime(secs: number) {
  const neg = secs < 0;
  const s = Math.abs(secs);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${neg ? "-" : ""}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function statusColor(s: string): string {
  const map: Record<string, string> = { Open: C.lime, "In Progress": C.cyan, Submitted: C.gold, Approved: C.teal, Expired: C.ember };
  return map[s] || C.gray;
}

export function diffColor(d: string): string {
  const map: Record<string, string> = { Beginner: C.lime, Intermediate: C.gold, Expert: C.pink };
  return map[d] || C.gray;
}

export const Eyebrow = ({ children, color = C.cyan }: any) => (
  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color, marginBottom: 12 }}>
    {children}
  </div>
);

export const SectionTitle = ({ children }: any) => (
  <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,4vw,52px)", fontWeight: 700, color: C.ash, marginBottom: 16, lineHeight: 1.1 }}>
    {children}
  </h2>
);

export const GlowDivider = ({ colors = [C.gold, C.cyan] }: any) => (
  <div style={{ width: 80, height: 2, margin: "16px 0 28px", background: `linear-gradient(90deg,${colors[0]},${colors[1]},transparent)`, borderRadius: 2 }} />
);

export const Badge = ({ children, color }: any) => (
  <span style={{ padding: "3px 10px", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 3, background: `${color}22`, color, border: `1px solid ${color}55` }}>
    {children}
  </span>
);

export const Input = ({ label, type = "text", value, onChange, placeholder, required, style }: any) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
    {label && <label style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray2 }}>{label}</label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} style={{ padding: "13px 15px", background: C.bg, border: `1px solid #ffffff10`, borderBottom: `2px solid ${C.gold}44`, borderRadius: 8, color: C.ash, fontFamily: "'Inter',sans-serif", fontSize: 14, outline: "none", transition: "all .3s" }} onFocus={e => { e.target.style.borderBottomColor = C.gold; e.target.style.boxShadow = `0 4px 20px ${C.gold}33`; }} onBlur={e => { e.target.style.borderBottomColor = `${C.gold}44`; e.target.style.boxShadow = "none"; }} />
  </div>
);

export const Select = ({ label, value, onChange, options, accentColor = C.violet2, style }: any) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
    {label && <label style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray2 }}>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)} style={{ padding: "13px 15px", background: C.bg, border: `1px solid #ffffff10`, borderBottom: `2px solid ${accentColor}44`, borderRadius: 8, color: C.ash, fontFamily: "'Inter',sans-serif", fontSize: 14, outline: "none", cursor: "pointer", appearance: "none" }}>
      {options.map((o: any) => (
        <option key={o.value ?? o} value={o.value ?? o} style={{ background: C.sur }}>
          {o.label ?? o}
        </option>
      ))}
    </select>
  </div>
);

export const Btn = ({ children, onClick, variant = "primary", style, type = "button" }: any) => {
  const [hov, setHov] = useState(false);
  const base = { padding: "13px 28px", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as any, border: "none", borderRadius: 6, cursor: "pointer", transition: "all .35s", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 };
  if (variant === "primary") return (
    <button type={type} onClick={onClick} style={{ ...base, color: "#000", background: `linear-gradient(135deg,${C.gold},${C.gold2},${C.cyan})`, backgroundSize: "200%", backgroundPosition: hov ? "100%" : "0%", boxShadow: hov ? `0 8px 40px ${C.gold}88,0 0 60px ${C.cyan}33` : `0 0 20px ${C.gold}55`, transform: hov ? "translateY(-3px)" : "none", ...style }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </button>
  );
  if (variant === "ghost") return (
    <button type={type} onClick={onClick} style={{ ...base, color: hov ? "#fff" : C.violet2, background: hov ? `linear-gradient(135deg,${C.violet},${C.pink})` : "transparent", border: `1px solid ${hov ? C.pink : C.violet2}`, transform: hov ? "translateY(-2px)" : "none", boxShadow: hov ? `0 8px 30px ${C.pink}44` : "none", ...style }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </button>
  );
  if (variant === "danger") return (
    <button type={type} onClick={onClick} style={{ ...base, color: hov ? "#fff" : C.ember, background: hov ? C.ember : "transparent", border: `1px solid ${C.ember}`, transform: hov ? "translateY(-2px)" : "none", ...style }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </button>
  );
  if (variant === "subtle") return (
    <button type={type} onClick={onClick} style={{ ...base, color: hov ? C.ash : C.gray2, background: hov ? C.sur2 : C.sur, border: `1px solid ${hov ? C.gray : "#ffffff10"}`, ...style }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </button>
  );
  return null;
};

export const Card = ({ children, style, glow }: any) => (
  <div style={{ background: C.sur, borderRadius: 12, border: "1px solid #ffffff08", padding: 28, position: "relative", overflow: "hidden", transition: "all .4s", boxShadow: glow ? `0 0 40px ${glow}22` : "none", ...style }}>
    {children}
  </div>
);
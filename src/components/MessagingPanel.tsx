import { useState, useEffect, useRef } from "react";
import { C } from "../data/seed";
import type { Job, Message } from "../types";

interface Props {
  job: Job;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: "worker" | "admin";
  onSend: (jobId: string, text: string) => void;
  onClose: () => void;
}

export function MessagingPanel({ job, currentUserId, currentUserName, currentUserRole, onSend, onClose }: Props) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [job.messages?.length]);

  const send = () => {
    if (!text.trim()) return;
    onSend(job.id, text.trim());
    setText("");
  };

  const msgs = job.messages || [];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,.7)", backdropFilter: "blur(6px)",
      animation: "fadeIn .2s ease",
    }} onClick={onClose}>
      <div style={{
        width: "min(520px, 95vw)", maxHeight: "80vh",
        background: "rgba(18,18,24,.99)", border: `1px solid ${C.cyan}33`,
        borderRadius: 16, display: "flex", flexDirection: "column",
        boxShadow: `0 24px 60px #000000cc, 0 0 40px ${C.cyan}11`,
        animation: "slideUp .28s cubic-bezier(.22,.68,0,1.2) both",
        overflow: "hidden",
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "14px 18px", borderBottom: `1px solid #ffffff08`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: C.cyan, marginBottom: 2 }}>Job Chat</div>
            <div style={{ fontSize: 13, color: C.ash, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.title}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.gray, fontSize: 18, cursor: "pointer", lineHeight: 1, padding: "2px 6px" }}>✕</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
          {msgs.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.gray, fontSize: 13 }}>
              No messages yet — start the conversation
            </div>
          )}
          {msgs.map(m => {
            const isMine = m.from === currentUserId;
            return (
              <div key={m.id} style={{ display: "flex", flexDirection: isMine ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: m.fromRole === "admin"
                    ? `linear-gradient(135deg,${C.gold},${C.gold2})`
                    : `linear-gradient(135deg,${C.cyan},${C.teal})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#000",
                }}>{m.fromName[0]}</div>
                <div style={{ maxWidth: "72%" }}>
                  <div style={{ fontSize: 10, color: C.gray, marginBottom: 3, textAlign: isMine ? "right" : "left", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.08em" }}>
                    {m.fromName} · {new Date(m.at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div style={{
                    padding: "9px 13px", borderRadius: isMine ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                    background: isMine
                      ? `linear-gradient(135deg,${C.gold}33,${C.cyan}22)`
                      : C.sur2,
                    border: `1px solid ${isMine ? C.gold + "33" : "#ffffff08"}`,
                    fontSize: 13, color: C.ash, lineHeight: 1.5,
                  }}>{m.text}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid #ffffff08`, display: "flex", gap: 10 }}>
          <input
            value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type a message… (Enter to send)"
            style={{
              flex: 1, padding: "10px 14px", background: C.bg,
              border: `1px solid #ffffff10`, borderBottom: `2px solid ${C.cyan}55`,
              borderRadius: 8, color: C.ash, fontSize: 13, outline: "none",
              fontFamily: "'Inter',sans-serif",
            }}
          />
          <button onClick={send} style={{
            padding: "10px 18px", background: text.trim() ? `linear-gradient(135deg,${C.gold},${C.cyan})` : C.sur2,
            border: "none", borderRadius: 8, cursor: text.trim() ? "pointer" : "default",
            color: text.trim() ? "#000" : C.gray,
            fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700,
            letterSpacing: "0.1em", transition: "all .2s",
          }}>SEND</button>
        </div>
      </div>
    </div>
  );
}

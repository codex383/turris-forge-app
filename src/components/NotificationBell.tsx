import { useState } from "react";
import { C } from "../data/seed";
import type { Notification } from "../types";

export function NotificationBell({ notifications, onMarkRead, onClear }: {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  const typeIcon = (t: Notification["type"]) =>
    ({ job_match: "🎯", approved: "✅", rejected: "❌", message: "💬", submitted: "📨" }[t]);

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(p => !p)} style={{
        position: "relative", background: open ? `${C.gold}18` : "transparent",
        border: `1px solid ${open ? C.gold + "44" : "#ffffff10"}`,
        borderRadius: 8, padding: "5px 10px", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6,
        transition: "all .2s",
      }}>
        <span style={{ fontSize: 16 }}>🔔</span>
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: C.ember, borderRadius: "50%",
            width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, color: "#fff", fontWeight: 700, fontFamily: "'Inter',sans-serif",
            animation: "fadeIn .3s ease",
          }}>{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, width: 320,
          background: "rgba(18,18,24,.98)", border: `1px solid ${C.gold}22`,
          borderRadius: 12, zIndex: 200, overflow: "hidden",
          boxShadow: `0 16px 48px #000000aa, 0 0 0 1px #ffffff06 inset`,
          animation: "slideUp .22s cubic-bezier(.22,.68,0,1.2) both",
        }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid #ffffff08`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold }}>
              Notifications {unread > 0 && <span style={{ color: C.ember }}>({unread})</span>}
            </span>
            {notifications.length > 0 && (
              <button onClick={onClear} style={{ background: "none", border: "none", color: C.gray, fontSize: 11, cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>
                Clear all
              </button>
            )}
          </div>
          <div style={{ maxHeight: 340, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: C.gray, fontSize: 13 }}>No notifications yet</div>
            ) : notifications.map(n => (
              <div key={n.id} onClick={() => onMarkRead(n.id)} style={{
                padding: "11px 16px", display: "flex", gap: 10, alignItems: "flex-start",
                borderBottom: `1px solid #ffffff05`, cursor: "pointer",
                background: n.read ? "transparent" : `${C.gold}07`,
                transition: "background .2s",
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{typeIcon(n.type)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: n.read ? C.gray2 : C.ash, lineHeight: 1.5 }}>{n.text}</div>
                  <div style={{ fontSize: 10, color: C.gray, marginTop: 3, fontFamily: "'Barlow Condensed',sans-serif" }}>
                    {new Date(n.at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })} · {new Date(n.at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                  </div>
                </div>
                {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, flexShrink: 0, marginTop: 5 }} />}
              </div>
            ))}
          </div>
        </div>
      )}
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
    </div>
  );
}

import { useState, useRef } from "react";
import { C } from "../../data/seed";
import { Logo } from "../Logo";
import { Btn } from "../shared";
import { Toast } from "../Toast";
import { NotificationBell } from "../NotificationBell";
import { Leaderboard } from "../Leaderboard";
import { AdminOverview } from "./AdminOverview";
import { AdminPostJob } from "./AdminPostJob";
import { AdminManageJobs } from "./AdminManageJobs";
import { AdminSubmissions } from "./AdminSubmissions";
import { AdminWorkers } from "./AdminWorkers";
import { AdminAnalytics } from "./AdminAnalytics";
import { AdminJobHistory } from "./AdminJobHistory";
import { AdminWithdrawals } from "./AdminWithdrawals";
import { AdminWorkerReport } from "./AdminWorkerReport";
import { AdminAnnouncements } from "./AdminAnnouncements";
import type { Job, Worker, Notification } from "../../types";

interface AdminUser { id: string; name: string; email: string; role: "admin"; balance: number; }

const NAV = [
  { id: "overview",     icon: "◈", label: "Overview"     },
  { id: "post",         icon: "＋", label: "Post Job"     },
  { id: "jobs",         icon: "≡",  label: "Manage Jobs"  },
  { id: "submissions",  icon: "▣",  label: "Submissions"  },
  { id: "workers",      icon: "⬡",  label: "Workers"      },
  { id: "leaderboard",  icon: "🏆", label: "Leaderboard"  },
  { id: "analytics",    icon: "◉", label: "Analytics"    },
  { id: "history",      icon: "📋", label: "Job History"  },
  { id: "withdrawals",    icon: "💸", label: "Withdrawals"    },
  { id: "announcements",  icon: "📣", label: "Announcements"  },
  { id: "report",         icon: "📊", label: "PDF Report"     },
];
const NAV_IDS = NAV.map(n => n.id);

export function AdminDashboard({ user, jobs, setJobs, workers, setWorkers, onLogout, notifications, onMarkNotifRead, onClearNotifs }: {
  user: AdminUser;
  jobs: Job[];
  setJobs: (fn: (p: Job[]) => Job[]) => void;
  workers: Worker[];
  setWorkers: (fn: (p: Worker[]) => Worker[]) => void;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotifRead: (id: string) => void;
  onClearNotifs: () => void;
}) {
  const [view, setView] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const prevIdx = useRef(0);
  const showToast = (msg: string) => setToast(msg);

  const submittedCount = jobs.filter(j => j.status === "Submitted").length;
  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === "Open").length,
    submitted: submittedCount,
    approved: jobs.filter(j => j.status === "Approved").length,
    paidOut: workers.reduce((s, w) => s + w.balance, 0),
  };

  const navigate = (id: string) => {
    const nextIdx = NAV_IDS.indexOf(id);
    setDirection(nextIdx >= prevIdx.current ? "forward" : "back");
    prevIdx.current = nextIdx;
    setView(id);
    setSidebarOpen(false);
  };

  const fromX = direction === "forward" ? "28px" : "-28px";

  return (
    <div style={{ minHeight: "100vh", display: "flex", position: "relative", zIndex: 1 }}>

      {/* ── SIDEBAR ── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 49, backdropFilter: "blur(2px)" }} />
      )}

      <aside style={{
        position: "fixed", left: 0, top: 0, bottom: 0, width: 218,
        background: "rgba(10,10,13,.98)", borderRight: `1px solid ${C.gold}18`,
        backdropFilter: "blur(20px)", zIndex: 50,
        display: "flex", flexDirection: "column",
        boxShadow: `4px 0 40px #00000055`,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform .3s cubic-bezier(.22,.68,0,1.2)",
      }}>
        <div style={{ padding: "20px 18px 16px", borderBottom: `1px solid #ffffff07`, display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={26} />
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 700, letterSpacing: "0.14em", color: C.ash, lineHeight: 1.2 }}>TURRIS FORGE</div>
            <div style={{ fontSize: 9, color: C.gold, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.8 }}>Admin Portal</div>
          </div>
        </div>

        <div style={{ padding: "14px 18px 16px", borderBottom: `1px solid #ffffff07` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg,${C.gold},${C.gold2})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: "#000", flexShrink: 0, boxShadow: `0 0 16px ${C.gold}55` }}>{user.name[0]}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, color: C.ash, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <div style={{ fontSize: 9, color: C.gold, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 1 }}>Studio Admin</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "8px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
          {NAV.map(({ id, icon, label }) => {
            const active = view === id;
            const badge = id === "submissions" && submittedCount > 0 ? submittedCount : 0;
            return (
              <button key={id} onClick={() => navigate(id)} style={{
                padding: "10px 12px", display: "flex", alignItems: "center", gap: 10,
                fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                background: active ? `linear-gradient(90deg,${C.gold}1e,transparent)` : "transparent",
                color: active ? C.gold : C.gray,
                border: "none", borderLeft: active ? `2px solid ${C.gold}` : "2px solid transparent",
                borderRadius: "0 8px 8px 0", cursor: "pointer", transition: "all .22s", textAlign: "left", width: "100%",
              }}>
                <span style={{ fontSize: 15, opacity: active ? 1 : 0.4, transition: "opacity .2s", minWidth: 18, textAlign: "center" }}>{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {badge > 0 && <span style={{ background: C.ember, borderRadius: 10, padding: "1px 7px", fontSize: 10, color: "#fff", fontFamily: "'Inter',sans-serif", fontWeight: 700 }}>{badge}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "10px 14px", borderTop: `1px solid #ffffff07`, display: "flex", justifyContent: "space-between" }}>
          {([["Jobs", stats.total, C.gold], ["Open", stats.open, C.lime], ["Done", stats.approved, C.teal]] as [string,number,string][]).map(([l, v, c]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: c }}>{v}</div>
              <div style={{ fontSize: 9, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: "10px 10px", borderTop: `1px solid #ffffff07` }}>
          <Btn variant="danger" onClick={onLogout} style={{ width: "100%", padding: "8px 12px", fontSize: 11, letterSpacing: "0.1em" }}>← Log Out</Btn>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ marginLeft: 0, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div style={{ height: 50, borderBottom: `1px solid #ffffff07`, display: "flex", alignItems: "center", padding: "0 32px", gap: 16, background: "rgba(10,10,13,.85)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 40 }}>
          <button onClick={() => setSidebarOpen(p => !p)} style={{ background: "none", border: "none", color: C.ash, cursor: "pointer", fontSize: 20, padding: "4px 8px", marginRight: 8, display: "flex", alignItems: "center" }}>☰</button>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: C.ash, fontWeight: 700 }}>
            {NAV.find(n => n.id === view)?.label}
          </span>
          <div style={{ flex: 1 }} />
          <NotificationBell notifications={notifications} onMarkRead={onMarkNotifRead} onClear={onClearNotifs} />
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.lime, boxShadow: `0 0 6px ${C.lime}` }} />
            <span style={{ fontSize: 10, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.15em", textTransform: "uppercase" }}>Studio Live</span>
          </div>
          {submittedCount > 0 && (
            <button onClick={() => navigate("submissions")} style={{ padding: "4px 12px", background: `${C.ember}22`, border: `1px solid ${C.ember}55`, borderRadius: 5, color: C.ember, fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em", cursor: "pointer" }}>
              📥 {submittedCount} pending
            </button>
          )}
        </div>

        <div style={{ flex: 1, padding: "28px 36px" }}>
          <div key={view} style={{ animation: `pageSlideIn .35s cubic-bezier(.22,.68,0,1.2) both`, "--from-x": fromX } as React.CSSProperties}>
            {view === "overview"    && <AdminOverview stats={stats} jobs={jobs} workers={workers} setView={navigate} />}
            {view === "post"        && <AdminPostJob jobs={jobs} setJobs={setJobs} showToast={showToast} setView={navigate} workers={workers} />}
            {view === "jobs"        && <AdminManageJobs jobs={jobs} setJobs={setJobs} showToast={showToast} />}
            {view === "submissions" && <AdminSubmissions jobs={jobs} setJobs={setJobs} workers={workers} setWorkers={setWorkers} showToast={showToast} />}
            {view === "workers"     && <AdminWorkers workers={workers} />}
            {view === "leaderboard" && <Leaderboard workers={workers} />}
            {view === "analytics"   && <AdminAnalytics stats={stats} jobs={jobs} workers={workers} />}
            {view === "history"     && <AdminJobHistory jobs={jobs} workers={workers} />}
            {view === "withdrawals" && <AdminWithdrawals showToast={showToast} />}
            {view === "announcements" && <AdminAnnouncements adminName={user.name} showToast={showToast} />}
            {view === "report" && <AdminWorkerReport workers={workers} jobs={jobs} />}
          </div>
        </div>
      </main>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

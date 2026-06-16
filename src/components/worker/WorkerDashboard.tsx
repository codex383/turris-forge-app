import { useState, useRef, useEffect } from "react";
import { updateJob } from "../../lib/jobs";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { C } from "../../data/seed";
import { Logo } from "../Logo";
import { Btn } from "../shared";
import { Toast } from "../Toast";
import { NotificationBell } from "../NotificationBell";
import { Leaderboard } from "../Leaderboard";
import { WorkerJobBoard } from "./WorkerJobBoard";
import { WorkerMyJobs } from "./WorkerMyJobs";
import { WorkerBalance } from "./WorkerBalance";
import { WorkerSettings } from "./WorkerSettings";
import { WorkerPortfolio } from "./WorkerPortfolio";
import type { Job, ActiveJob, Worker, Notification, UploadedFile } from "../../types";

const NAV = [
  { id: "board",       icon: "◈", label: "Job Board"  },
  { id: "my-jobs",     icon: "⚡", label: "My Jobs"    },
  { id: "balance",     icon: "₦", label: "Balance"    },
  { id: "leaderboard", icon: "🏆", label: "Leaderboard"},
  { id: "portfolio",   icon: "🎨", label: "Portfolio"  },
  { id: "settings",    icon: "⚙", label: "Settings"   },
];
const NAV_IDS = NAV.map(n => n.id);


const getLevel = (jobsDone: number) => {
  if (jobsDone >= 11) return { label: "Expert", color: "#E8912A", icon: "⭐" };
  if (jobsDone >= 5) return { label: "Intermediate", color: "#00E5FF", icon: "🔷" };
  return { label: "Beginner", color: "#A8FF3E", icon: "🌱" };
};

export function WorkerDashboard({ user, setUser, jobs, setJobs, onLogout, notifications, onMarkNotifRead, onClearNotifs, allWorkers }: {
  user: Worker;
  setUser: (fn: (p: Worker) => Worker) => void;
  jobs: Job[];
  setJobs: (fn: (p: Job[]) => Job[]) => void;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotifRead: (id: string) => void;
  onClearNotifs: () => void;
  allWorkers: Worker[];
}) {
  const [view, setView] = useState("board");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Derive activeJobs from jobs state so it persists across refreshes
const workerId = user.id || (user as any).uid;
  const activeJobs: ActiveJob[] = jobs
    .filter(j => j.status === "In Progress" && j.acceptedBy === workerId)
    .map(j => ({ job: j, deadline: j.deadline, startedAt: j.startedAt || Date.now(), pay: j.pay }));
  const [toast, setToast] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<{id:string; text:string; pinned?:boolean; createdAt:number}[]>([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    });
    return () => unsub();
  }, []);

  const visibleAnnouncements = announcements.filter(a => !dismissedAnnouncements.includes(a.id));
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [lastCredited, setLastCredited] = useState<number | null>(null);
  const prevIdx = useRef(0);
  const showToast = (msg: string) => setToast(msg);

  const navigate = (id: string) => {
    const nextIdx = NAV_IDS.indexOf(id);
    setDirection(nextIdx >= prevIdx.current ? "forward" : "back");
    prevIdx.current = nextIdx;
    setView(id);
    setSidebarOpen(false);
  };

  const acceptJob = async (job: Job) => {
    if (activeJobs.find(a => a.job.id === job.id)) { showToast("Already accepted!"); return; }
    const workerId = user.id || (user as any).uid;
    if (!workerId) { showToast("❌ User ID missing — please log out and back in."); return; }
    try {
      await updateJob(job.id, {
        status: "In Progress",
        acceptedBy: workerId,
        startedAt: Date.now(),
      });
      setJobs(p => p.map(j => j.id === job.id ? { ...j, status: "In Progress", acceptedBy: workerId, startedAt: Date.now() } : j));
      showToast("⚡ Job accepted! Countdown started.");
      navigate("my-jobs");
    } catch (err: any) {
      showToast("❌ Failed to accept job: " + err.message);
    }
  };

  const submitJob = async (jobId: string, notes: string, files: UploadedFile[]) => {
    const active = activeJobs.find(a => a.job.id === jobId);
    if (!active) return;
    const now = Date.now();
    const late = now > active.deadline;
    const overSecs = late ? (now - active.deadline) / 1000 : 0;
    const penaltyPct = Math.min(0.8, Math.floor(overSecs / 600) * 0.02);
    const finalPay = late ? Math.max(active.pay * 0.2, active.pay * (1 - penaltyPct)) : active.pay;
    const sub = { workerId: user.id, notes, submittedAt: now, pay: Math.round(finalPay), late, files };
    try {
      const updatedJob = {
        status: "Submitted",
        submissions: [...active.job.submissions, sub],
      };
      await updateJob(jobId, updatedJob);
      setJobs(p => p.map(j => j.id === jobId ? { ...j, ...updatedJob } : j));
      showToast(late
        ? `📨 Submitted late — ₦${Math.round(finalPay)} pending (${Math.round(penaltyPct * 100)}% deduction)`
        : "📨 Submitted on time! Waiting for admin review.");
      navigate("my-jobs");
    } catch (err: any) {
      showToast("❌ Failed to submit: " + err.message);
    }
  };

  const sendMessage = async (jobId: string, text: string) => {
    const msg = { id: "m" + Date.now(), from: user.id, fromName: user.name, fromRole: "worker" as const, text, at: Date.now(), read: false };
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    const updatedMessages = [...(job.messages || []), msg];
    try {
      await updateJob(jobId, { messages: updatedMessages });
      setJobs(p => p.map(j => j.id === jobId ? { ...j, messages: updatedMessages } : j));
    } catch (err: any) {
      showToast("❌ Failed to send message: " + err.message);
    }
  };

  const mySubmitted = jobs.filter(j => j.status === "Submitted" && j.submissions.some(s => s.workerId === user.id));
  const myApproved  = jobs.filter(j => j.status === "Approved"  && j.submissions.some(s => s.workerId === user.id));
  const fromX = direction === "forward" ? "28px" : "-28px";
  const unreadMsgs = jobs.reduce((n, j) => n + (j.messages || []).filter(m => m.fromRole === "admin" && !m.read).length, 0);

  return (
    <div style={{ minHeight: "100vh", display: "flex", position: "relative", zIndex: 1 }}>

      {/* ── SIDEBAR ── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 49, backdropFilter: "blur(2px)" }} />
      )}

      <aside style={{
        position: "fixed", left: 0, top: 0, bottom: 0, width: 218,
        background: "rgba(10,10,13,.98)", borderRight: `1px solid ${C.cyan}18`,
        backdropFilter: "blur(20px)", zIndex: 50,
        display: "flex", flexDirection: "column", boxShadow: `4px 0 40px #00000055`,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform .3s cubic-bezier(.22,.68,0,1.2)",
      }}>
        <div style={{ padding: "20px 18px 16px", borderBottom: `1px solid #ffffff07`, display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={26} />
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 700, letterSpacing: "0.14em", color: C.ash, lineHeight: 1.2 }}>TURRIS FORGE</div>
            <div style={{ fontSize: 9, color: C.cyan, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.8 }}>Creative Portal</div>
          </div>
        </div>

        <div style={{ padding: "14px 18px 14px", borderBottom: `1px solid #ffffff07` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg,${C.cyan},${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#000", flexShrink: 0, boxShadow: `0 0 14px ${C.cyan}44`, overflow: "hidden" }}>
              {(user as any).avatarUrl ? <img src={(user as any).avatarUrl} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.name[0]}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, color: C.ash, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
                {(user as any).isVerified && <span style={{ fontSize: 9, padding: "1px 5px", background: "#00E5FF22", border: "1px solid #00E5FF44", borderRadius: 8, color: "#00E5FF" }}>✓</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <div style={{ fontSize: 9, color: C.cyan, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.15em", textTransform: "uppercase" }}>Creative</div>
                {(() => { const lvl = getLevel(myApproved.length); return <span style={{ fontSize: 9, padding: "1px 6px", background: lvl.color + "22", border: `1px solid ${lvl.color}44`, borderRadius: 10, color: lvl.color, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>{lvl.icon} {lvl.label}</span>; })()}
              </div>
            </div>
          </div>
          <div style={{ background: `${C.gold}0d`, border: `1px solid ${C.gold}22`, borderRadius: 9, padding: "10px 12px" }}>
            <div style={{ fontSize: 9, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 3 }}>Balance</div>
            <div key={user.balance} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: C.gold, animation: lastCredited ? "balancePop .6s ease" : "none" }} onAnimationEnd={() => setLastCredited(null)}>
              ₦{( user.balance ?? 0 ).toLocaleString()}
            </div>
            {lastCredited && <div style={{ fontSize: 11, color: C.lime, fontFamily: "'Barlow Condensed',sans-serif", animation: "fadeSlideIn .4s ease" }}>+₦{(lastCredited ?? 0).toLocaleString()} credited ✓</div>}
          </div>
          {mySubmitted.length > 0 && (
            <div style={{ marginTop: 8, padding: "6px 10px", background: `${C.cyan}0f`, border: `1px solid ${C.cyan}2a`, borderRadius: 6, fontSize: 10, color: C.cyan, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>
              ⏳ {mySubmitted.length} awaiting review
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: "8px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ id, icon, label }) => {
            const active = view === id;
            const badge = id === "my-jobs"
              ? activeJobs.length + (unreadMsgs > 0 ? unreadMsgs : 0)
              : 0;
            return (
              <button key={id} onClick={() => navigate(id)} style={{
                padding: "10px 12px", display: "flex", alignItems: "center", gap: 10,
                fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                background: active ? `linear-gradient(90deg,${C.cyan}1e,transparent)` : "transparent",
                color: active ? C.cyan : C.gray,
                border: "none", borderLeft: active ? `2px solid ${C.cyan}` : "2px solid transparent",
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
          {([["Active", activeJobs.length, C.gold], ["Submitted", mySubmitted.length, C.cyan], ["Done", myApproved.length, C.lime]] as [string,number,string][]).map(([l, v, c]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: c, transition: "color .3s" }}>{v}</div>
              <div style={{ fontSize: 9, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: "8px 12px 10px", borderTop: `1px solid #ffffff07` }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
            {(user.skills || []).slice(0, 3).map(s => (
              <span key={s} style={{ fontSize: 9, background: `${C.cyan}15`, border: `1px solid ${C.cyan}2a`, borderRadius: 3, padding: "2px 6px", color: C.cyan, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s}</span>
            ))}
          </div>
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
          {activeJobs.length > 0 && (
            <button onClick={() => navigate("my-jobs")} style={{ padding: "4px 12px", background: `${C.gold}18`, border: `1px solid ${C.gold}44`, borderRadius: 5, color: C.gold, fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em", cursor: "pointer" }}>
              ⚡ {activeJobs.length} active
            </button>
          )}
        </div>

        {visibleAnnouncements.length > 0 && (
          <div style={{ background: `linear-gradient(90deg,${C.gold}18,${C.ember}10)`, borderBottom: `1px solid ${C.gold}33`, padding: "0 36px" }}>
            {visibleAnnouncements.slice(0, 3).map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.gold}11` }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{a.pinned ? "📌" : "📣"}</span>
                <span style={{ flex: 1, fontSize: 12, color: C.ash, fontFamily: "Inter,sans-serif", lineHeight: 1.5 }}>{a.text}</span>
                <button onClick={() => setDismissedAnnouncements(p => [...p, a.id])}
                  style={{ background: "none", border: "none", color: C.gray, cursor: "pointer", fontSize: 14, padding: "2px 6px", flexShrink: 0 }}>✕</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ flex: 1, padding: "28px 36px" }}>
          <div key={view} style={{ animation: `pageSlideIn .35s cubic-bezier(.22,.68,0,1.2) both`, "--from-x": fromX } as React.CSSProperties}>
            {view === "board"       && <WorkerJobBoard jobs={jobs} user={user} activeJobs={activeJobs} onAccept={acceptJob} />}
            {view === "my-jobs"     && <WorkerMyJobs jobs={jobs} activeJobs={activeJobs} user={user} onSubmit={submitJob} onMessage={sendMessage} />}
            {view === "balance"     && <WorkerBalance user={user} showToast={showToast} />}
            {view === "leaderboard" && <Leaderboard workers={allWorkers} />}
            {view === "portfolio"   && <WorkerPortfolio user={user} jobs={jobs} />}
            {view === "settings"    && <WorkerSettings user={user} setUser={setUser} showToast={showToast} />}
          </div>
        </div>
      </main>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

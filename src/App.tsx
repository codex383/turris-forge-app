import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./lib/firebase";
import { getUserProfile, saveNotifications, loadNotifications } from "./lib/userProfile";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "./lib/firebase";
import { subscribeToJobs } from "./lib/jobs";
import { useState, useCallback, useEffect, useRef } from "react";
import { ParticleCanvas } from "./components/ParticleCanvas";
import { LoadingScreen } from "./components/LoadingScreen";
import { AuthScreen } from "./components/AuthScreen";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { WorkerDashboard } from "./components/worker/WorkerDashboard";
import { C } from "./data/seed";
import type { Job, Worker, Notification } from "./types";

type AdminUser = { id: string; name: string; email: string; role: "admin"; balance: number };
type AnyUser = Worker | AdminUser;

const STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  select option { background: #1A1A1F; }
  textarea { font-family: 'Inter', sans-serif; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #E8912A33; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #E8912A66; }

  @keyframes pageSlideIn {
    from { opacity: 0; transform: translateX(var(--from-x, 30px)); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes balancePop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.18); color: #A8FF3E; text-shadow: 0 0 24px #A8FF3E88; }
    100% { transform: scale(1); }
  }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // 1. Get full profile from Firestore
        const profile = await getUserProfile(firebaseUser.uid);

        if (!profile) {
  console.log("No profile found");
  setUser(null);
  setLoading(false);
  return;
}

        // Check if worker is banned
        if ((profile as any).banned) {
          await signOut(auth);
          alert(`🚫 Your account has been suspended.\n\nReason: ${(profile as any).banReason || "Contact the studio admin for more information."}`);
          setUser(null);
          setLoading(false);
          return;
        }

        console.log("Auto-login success:", profile);

        // 2. Send user into app state
        setUser({ ...profile, id: profile.uid });
        const savedNotifs = await loadNotifications(firebaseUser.uid);
        if (savedNotifs.length > 0) setNotifications(savedNotifs);
      } else {
        console.log("User logged out");
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToJobs((liveJobs) => {
      setJobs(liveJobs);
    });
    return () => unsub();
  }, [user]);
  const [workers, setWorkers] = useState<Worker[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users"), where("role", "==", "worker"));
    const unsub = onSnapshot(q, (snap) => {
      const list: Worker[] = snap.docs.map((d): Worker => {
        const u = { id: d.id, ...d.data() } as any;
        return {
          id: u.id || u.uid,
          name: u.name || "",
          email: u.email || "",
          role: "worker" as const,
          skills: u.skills || [],
          balance: u.balance || 0,
          bio: u.bio || "",
          portfolio: u.portfolio || "",
          history: u.history || [],
          rating: u.rating || 0,
          ratingCount: u.ratingCount || 0,
          joined: u.joined || Date.now(),
          isVerified: u.isVerified || false,
          avatarUrl: u.avatarUrl || "",
          verifiedSkills: u.verifiedSkills || [],
        };
      });
      setWorkers(list);
    });
    return () => unsub();
  }, [user]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const prevJobIds = useRef<Set<string>>(new Set());

  // Restore session

  // Watch jobs for changes to generate notifications
  useEffect(() => {
    if (!user) return;

    // Detect new jobs posted (for workers)
    if (user.role === "worker") {
      const currentWorker = workers.find(w => w.id === user.id);
      if (!currentWorker) return;
      const newJobNotifs: Notification[] = [];

      jobs.forEach(j => {
        if (!prevJobIds.current.has(j.id) && j.status === "Open") {
          const isMatch = currentWorker.skills.includes(j.category);
          newJobNotifs.push({
            id: "n" + Date.now() + Math.random(),
            type: isMatch ? "job_match" : "job_match",
            text: isMatch
              ? `🎯 New job matches your skills: "${j.title}" — ₦${j.pay.toLocaleString()}`
              : `New job posted: "${j.title}" — ₦${j.pay.toLocaleString()}`,
            at: Date.now(),
            read: false,
            jobId: j.id,
          });
        }
        prevJobIds.current.add(j.id);
      });

      // Detect approved submissions
      jobs.forEach(j => {
        if (j.status === "Approved") {
          const mySub = j.submissions.find(s => s.workerId === user.id);
          if (mySub) {
            const already = notifications.find(n => n.type === "approved" && n.jobId === j.id);
            if (!already) {
              newJobNotifs.push({
                id: "nappr" + j.id,
                type: "approved",
                text: `✅ Your submission for "${j.title}" was approved — ₦${mySub.pay.toLocaleString()} credited!`,
                at: Date.now(),
                read: false,
                jobId: j.id,
              });
            }
          }
        }
        // Detect new admin messages
        (j.messages || []).forEach(m => {
          if (m.fromRole === "admin" && !m.read) {
            const already = notifications.find(n => n.id === "msg_" + m.id);
            if (!already) {
              newJobNotifs.push({
                id: "msg_" + m.id,
                type: "message",
                text: `💬 Admin messaged you on "${j.title}"`,
                at: m.at,
                read: false,
                jobId: j.id,
              });
            }
          }
        });
      });

      if (newJobNotifs.length > 0) {
        setNotifications(prev => {
          const updated = [...newJobNotifs, ...prev];
          if (user) saveNotifications(user.uid || user.id, updated);
          return updated;
        });
      }
    }

    // Admin: detect new submissions
    if (user.role === "admin") {
      const newNotifs: Notification[] = [];
      jobs.forEach(j => {
        if (j.status === "Submitted") {
          const already = notifications.find(n => n.type === "submitted" && n.jobId === j.id);
          if (!already) {
            const sub = j.submissions[j.submissions.length - 1];
            newNotifs.push({
              id: "nsub_" + j.id,
              type: "submitted",
              text: `📥 New submission for "${j.title}" — ₦${sub?.pay?.toLocaleString() || j.pay} pending review`,
              at: Date.now(),
              read: false,
              jobId: j.id,
            });
          }
        }
        // Detect worker messages
        (j.messages || []).forEach(m => {
          if (m.fromRole === "worker" && !m.read) {
            const already = notifications.find(n => n.id === "msg_" + m.id);
            if (!already) {
              newNotifs.push({
                id: "msg_" + m.id,
                type: "message",
                text: `💬 ${m.fromName} messaged on "${j.title}"`,
                at: m.at,
                read: false,
                jobId: j.id,
              });
            }
          }
        });
      });
      if (newNotifs.length > 0) {
        setNotifications(prev => {
          const updated = [...newNotifs, ...prev];
          if (user) saveNotifications(user.uid || user.id, updated);
          return updated;
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, user?.id]);

const handleAuth = useCallback((u: AnyUser) => {
  setUser(u);

  if (u.role === "worker") {
    const safeWorker: Worker = {
      ...(u as Worker),
      id:        (u as any).uid || (u as Worker).id,
      skills:    (u as Worker).skills    ?? [],
      balance:   (u as Worker).balance   ?? 0,
      bio:       (u as Worker).bio       ?? "",
      portfolio: (u as Worker).portfolio ?? "",
      history:   (u as Worker).history   ?? [],
    };

    setWorkers(prev => {
      const exists = prev.find(w => w.id === safeWorker.id);
      return exists
        ? prev.map(w => w.id === safeWorker.id ? safeWorker : w)
        : [...prev, safeWorker];
    });
  }
}, []);  

const handleLogout = useCallback(async () => {
  await signOut(auth);
  setUser(null);
  setNotifications([]);
}, []);  
const handleLoaded = useCallback(() => setLoading(false), []);

  const markNotifRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      if (user) saveNotifications(user.uid || user.id, updated);
      return updated;
    });
  }, [user]);
  const clearNotifs = useCallback(() => {
    setNotifications([]);
    if (user) saveNotifications(user.uid || user.id, []);
  }, [user]);

  const currentWorker = user?.role === "worker"
    ? workers.find(w => w.id === user.id) ?? (user as Worker)
    : null;

  return (
    <>
      <style>{STYLES}</style>
      <ParticleCanvas />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: `radial-gradient(ellipse 80% 60% at 50% -5%,${C.gold}08 0%,transparent 65%)` }} />

      {loading && <LoadingScreen onDone={handleLoaded} />}

      {!loading && !user && (
        <div style={{ position: "relative", zIndex: 1, animation: "fadeIn .4s ease" }}>
          <AuthScreen onAuth={handleAuth} />
        </div>
      )}

      {!loading && user?.role === "admin" && (
        <AdminDashboard
          user={user as AdminUser}
          jobs={jobs} setJobs={setJobs}
          workers={workers} setWorkers={setWorkers}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkNotifRead={markNotifRead}
          onClearNotifs={clearNotifs}
        />
      )}

      {!loading && user?.role === "worker" && currentWorker && (
        <WorkerDashboard
          user={currentWorker}
          setUser={(fn) => setWorkers(prev => prev.map(w => w.id === currentWorker.id ? fn(w) : w))}
          jobs={jobs} setJobs={setJobs}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkNotifRead={markNotifRead}
          onClearNotifs={clearNotifs}
          allWorkers={workers}
        />
      )}
    </>
  );
}

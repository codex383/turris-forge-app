import { useState } from "react";
import { updateJob } from "../../lib/jobs";
import { sendEmail } from "../../lib/email";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { C } from "../../data/seed";
import { Eyebrow, SectionTitle, GlowDivider, Badge, Card, Btn, diffColor } from "../shared";
import { MessagingPanel } from "../MessagingPanel";
import type { Job, Worker } from "../../types";

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <button key={i}
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: i <= (hover || value) ? C.gold : C.sur2, transition: "color .1s", padding: 0 }}
        >★</button>
      ))}
    </div>
  );
}

function SubmissionCard({ job, workers, onApprove, onReject, onMessage }: {
  job: Job; workers: Worker[];
  onApprove: (rating: number) => void;
  onReject: () => void;
  onMessage: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rating, setRating] = useState(0);
  const sub = job.submissions[job.submissions.length - 1];
  const worker = workers.find(w => w.id === sub?.workerId);

  return (
    <Card style={{ marginBottom: 16, border: `1px solid ${C.cyan}22`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${C.cyan},${C.teal},transparent)` }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <Badge color={C.violet2}>{job.category}</Badge>
            <Badge color={diffColor(job.difficulty)}>{job.difficulty}</Badge>
            {sub?.late && <Badge color={C.ember}>Late Submit</Badge>}
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: C.ash, fontWeight: 700, lineHeight: 1.3 }}>{job.title}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: sub?.late ? C.ember : C.gold, fontWeight: 700 }}>₦{(sub?.pay || job.pay).toLocaleString()}</div>
          <div style={{ fontSize: 10, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>on approval</div>
        </div>
      </div>

      {worker && (
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12, background: C.bg, borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${C.cyan},${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#000", flexShrink: 0 }}>{worker.name[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: C.ash, fontWeight: 600 }}>{worker.name}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
              {worker.skills.slice(0, 3).map(s => <Badge key={s} color={C.gray2}>{s}</Badge>)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: C.gray }}>Rating</div>
            <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: C.gold }}>{worker.rating > 0 ? worker.rating.toFixed(1) : "—"}</span>
              <span style={{ color: C.gold, fontSize: 13 }}>★</span>
            </div>
          </div>
        </div>
      )}

      {/* Submission Notes + Files */}
      {sub && (
        <div style={{ marginTop: 14 }}>
          <button onClick={() => setExpanded(p => !p)} style={{
            width: "100%", background: C.bg, border: `1px solid #ffffff08`, borderRadius: 8, padding: "10px 14px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            cursor: "pointer", color: C.ash, fontFamily: "'Barlow Condensed',sans-serif",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
          }}>
            <span>📋 Submission Notes & Files {sub.files?.length ? `(${sub.files.length} file${sub.files.length > 1 ? "s" : ""})` : ""}</span>
            <span style={{ color: C.cyan, transition: "transform .3s", display: "inline-block", transform: expanded ? "rotate(90deg)" : "none" }}>›</span>
          </button>
          {expanded && (
            <div style={{ background: C.bg, border: `1px solid #ffffff08`, borderTop: "none", borderRadius: "0 0 8px 8px", padding: "14px 14px" }}>
              <div style={{ fontSize: 13, color: C.gray2, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {sub.notes || <em style={{ color: C.gray }}>No notes provided.</em>}
              </div>
              {/* Attached files */}
              {sub.files && sub.files.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray, marginBottom: 8 }}>Attached Files</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {sub.files.map((f, fi) => (
                      f.type.startsWith("image") ? (
                        <div key={fi} style={{ position: "relative", display: "inline-block" }}>
                          <img src={f.url} alt={f.name} onClick={() => setLightbox({ url: f.url, name: f.name })}
                            style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6, border: `1px solid ${C.cyan}33`, cursor: "pointer", transition: "opacity .2s" }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                          />
                          <a href={f.url} download={f.name} target="_blank" rel="noopener noreferrer"
                            style={{ position: "absolute", bottom: 4, right: 4, background: "rgba(0,0,0,.7)", borderRadius: 4, padding: "2px 5px", fontSize: 10, color: "#fff", textDecoration: "none" }}
                            title="Download">⬇</a>
                        </div>
                      ) : (
                        <a key={fi} href={f.url} download={f.name} target="_blank" rel="noopener noreferrer"
                          style={{ padding: "8px 12px", background: C.sur2, borderRadius: 6, border: `1px solid #ffffff10`, fontSize: 12, color: C.gray2, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                          📎 {f.name} <span style={{ color: C.cyan, fontSize: 11 }}>⬇ Download</span>
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
              {sub.late && (
                <div style={{ marginTop: 12, padding: "10px 14px", background: `${C.ember}18`, border: `1px solid ${C.ember}44`, borderRadius: 6, fontSize: 12, color: C.ember, lineHeight: 1.5 }}>
                  ⚠️ <strong>Late submission.</strong> Pay reduced ₦{job.pay.toLocaleString()} → ₦{sub.pay.toLocaleString()}
                </div>
              )}
              <div style={{ marginTop: 10, fontSize: 11, color: C.gray }}>
                Submitted: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString("en-NG") : "—"} · Final pay: ₦{sub.pay.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat button */}
      <button onClick={onMessage} style={{
        marginTop: 12, padding: "7px 14px",
        background: (job.messages || []).some(m => m.fromRole === "worker" && !m.read) ? `${C.gold}22` : C.sur,
        border: `1px solid ${(job.messages || []).some(m => m.fromRole === "worker" && !m.read) ? C.gold + "55" : "#ffffff10"}`,
        borderRadius: 7, cursor: "pointer",
        color: (job.messages || []).some(m => m.fromRole === "worker" && !m.read) ? C.gold : C.gray2,
        fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700,
        letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 6,
        transition: "all .2s",
      }}>
        💬 Chat with Worker
        {(job.messages || []).length > 0 && <span style={{ fontSize: 10, color: C.gray }}>({(job.messages || []).length} msgs)</span>}
      </button>

      {/* Rating + Actions */}
      <div style={{ marginTop: 14, padding: "12px 14px", background: C.bg, borderRadius: 8, border: `1px solid #ffffff06` }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray, marginBottom: 8 }}>Rate This Worker's Performance</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <StarPicker value={rating} onChange={setRating} />
          {rating > 0 && <span style={{ fontSize: 12, color: C.gold }}>{["","Poor","Fair","Good","Great","Excellent"][rating]}</span>}
        </div>
        <div style={{ fontSize: 11, color: C.gray, marginTop: 6 }}>Rating saves with approval ({rating}/5 stars)</div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <Btn onClick={() => onApprove(rating)} style={{ flex: 2 }}>✅ Approve & Credit ₦{(sub?.pay || job.pay).toLocaleString()}</Btn>
        <Btn variant="danger" onClick={onReject} style={{ flex: 1 }}>✕ Reject</Btn>
      </div>
    </Card>
  );
}

export function AdminSubmissions({ jobs, setJobs, workers, setWorkers, showToast }: {
  jobs: Job[];
  setJobs: (fn: (p: Job[]) => Job[]) => void;
  workers: Worker[];
  setWorkers: (fn: (p: Worker[]) => Worker[]) => void;
  showToast: (m: string) => void;
}) {
  const [filter, setFilter] = useState<"pending" | "approved">("pending");
  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(null);
  const [chatJob, setChatJob] = useState<Job | null>(null);
  const [rejectJob, setRejectJob] = useState<Job | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkRating, setBulkRating] = useState(0);
  const adminUser = { id: "admin1", name: "Admin" };

  const submitted = jobs.filter(j => j.status === "Submitted");
  const approved  = jobs.filter(j => j.status === "Approved" && j.submissions.length > 0);

  const approve = async (job: Job, rating: number) => {
    const sub = job.submissions[job.submissions.length - 1];
    const worker = workers.find(w => w.id === sub?.workerId);

    // Update job in Firestore
    await updateJob(job.id, { status: "Approved" });
    setJobs(p => p.map(j => j.id === job.id ? { ...j, status: "Approved" } : j));

    if (sub && worker) {
      const newCount = (worker.ratingCount || 0) + (rating > 0 ? 1 : 0);
      const newRating = rating > 0
        ? ((worker.rating || 0) * (worker.ratingCount || 0) + rating) / newCount
        : worker.rating;
      const newBalance = worker.balance + sub.pay;
      const newHistory = [...worker.history, { jobId: job.id, title: job.title, amount: sub.pay, date: Date.now(), status: "Approved" }];
      const rounded = Math.round(newRating * 10) / 10;

      // Update worker in Firestore
      await updateDoc(doc(db, "users", worker.id), {
        balance: newBalance,
        rating: rounded,
        ratingCount: newCount,
        history: newHistory,
      });

      // Update local state
      setWorkers(p => p.map(w => w.id === worker.id ? {
        ...w,
        balance: newBalance,
        rating: rounded,
        ratingCount: newCount,
        history: newHistory,
      } : w));
    }

    showToast(`✅ Approved! ₦${(sub?.pay || job.pay).toLocaleString()} credited to ${worker?.name || "worker"}.`);
    if (worker?.email) {
      sendEmail(
        worker.email,
        worker.name,
        "Your submission has been approved! 🎉",
        `Great news! Your submission for "${job.title}" has been approved.\n\n₦${(sub?.pay || job.pay).toLocaleString()} has been credited to your balance.\n\nKeep up the great work!`
      ).catch(() => {});
    }
  };

  const reject = async (job: Job, reason: string) => {
    const rejMsg = { id: "rej_" + Date.now(), from: "admin", fromName: "Admin", fromRole: "admin" as const, text: `❌ Your submission was rejected.\n\nReason: ${reason || "No reason provided."}`, at: Date.now(), read: false };
    const updatedMessages = [...(job.messages || []), rejMsg];
    await updateJob(job.id, { status: "Open", submissions: [], messages: updatedMessages });
    setJobs(p => p.map(j => j.id === job.id ? { ...j, status: "Open", submissions: [], messages: updatedMessages } : j));
    setRejectJob(null);
    setRejectReason("");
    showToast("❌ Submission rejected — reason sent to worker.");
    const rejWorker = workers.find(w => w.id === job.submissions[job.submissions.length - 1]?.workerId);
    if (rejWorker?.email) {
      sendEmail(
        rejWorker.email,
        rejWorker.name,
        "Your submission needs revision",
        `Your submission for "${job.title}" has been reviewed and needs revision.\n\nReason: ${reason || "No reason provided."}\n\nPlease review the feedback and resubmit when ready.`
      ).catch(() => {});
    }
  };

  const toggleSelect = (jobId: string) => {
    setSelected(p => p.includes(jobId) ? p.filter(id => id !== jobId) : [...p, jobId]);
  };

  const selectAll = () => {
    if (selected.length === submitted.length) {
      setSelected([]);
    } else {
      setSelected(submitted.map(j => j.id));
    }
  };

  const bulkApprove = async () => {
    for (const jobId of selected) {
      const job = submitted.find(j => j.id === jobId);
      if (job) await approve(job, bulkRating);
    }
    setSelected([]);
    showToast(`✅ ${selected.length} submissions approved!`);
  };

  const bulkReject = async () => {
    for (const jobId of selected) {
      const job = submitted.find(j => j.id === jobId);
      if (job) await reject(job, "Bulk rejected by admin");
    }
    setSelected([]);
    showToast(`❌ ${selected.length} submissions rejected!`);
  };

  const sendMessage = async (jobId: string, text: string) => {
    const msg = { id: "m" + Date.now(), from: adminUser.id, fromName: adminUser.name, fromRole: "admin" as const, text, at: Date.now(), read: false };
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    const updatedMessages = [...(job.messages || []), msg];
    try {
      await updateJob(jobId, { messages: updatedMessages });
      setJobs(p => p.map(j => j.id === jobId ? { ...j, messages: updatedMessages } : j));
      if (chatJob) setChatJob(prev => prev ? { ...prev, messages: updatedMessages } : prev);
    } catch (err: any) {
      console.error("Failed to send message:", err.message);
    }
  };

  const markRead = (jobId: string) => {
    setJobs(p => p.map(j => j.id === jobId ? { ...j, messages: (j.messages || []).map(m => m.fromRole === "worker" ? { ...m, read: true } : m) } : j));
  };

  const tabs = [
    { key: "pending" as const,  label: "Pending Review", count: submitted.length },
    { key: "approved" as const, label: "Approved",        count: approved.length  },
  ];

  return (
    <div>
      <Eyebrow color={C.cyan}>Admin</Eyebrow>
      <SectionTitle>Submitted Projects</SectionTitle>
      <GlowDivider colors={[C.cyan, C.teal]} />

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {([["Awaiting Review", submitted.length, C.gold], ["Approved", approved.length, C.lime], ["Total Submissions", jobs.filter(j => j.submissions.length > 0).length, C.cyan]] as [string,number,string][]).map(([l, v, c]) => (
          <div key={l} style={{ background: C.sur, border: `1px solid #ffffff08`, borderRadius: 8, padding: "12px 18px", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: c }}>{v}</div>
            <div style={{ fontSize: 11, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 0, background: C.bg, borderRadius: 8, padding: 3, marginBottom: 22, width: "fit-content", border: `1px solid #ffffff08` }}>
        {tabs.map(({ key, label, count }) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding: "7px 20px", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            background: filter === key ? `linear-gradient(135deg,${C.cyan}33,${C.teal}22)` : "transparent",
            color: filter === key ? C.ash : C.gray2,
            border: "none", borderRadius: 6, cursor: "pointer", transition: "all .2s",
            display: "flex", alignItems: "center", gap: 7,
          }}>
            {label}
            {count > 0 && <span style={{ background: filter === key ? C.cyan : C.gray, borderRadius: 10, padding: "1px 7px", fontSize: 10, color: "#000" }}>{count}</span>}
          </button>
        ))}
      </div>

      {filter === "pending" && (
        submitted.length === 0 ? (
          <Card style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>📥</div>
            <div style={{ color: C.gray, fontSize: 14 }}>No pending submissions</div>
          </Card>
        ) : submitted.map(job => (
          <SubmissionCard key={job.id} job={job} workers={workers}
            onApprove={(rating) => { approve(job, rating); }}
            onReject={() => { setRejectJob(job); setRejectReason(""); }}
            onMessage={() => { markRead(job.id); setChatJob(jobs.find(j => j.id === job.id) || job); }}
          />
        ))
      )}

      {filter === "approved" && (
        approved.length === 0 ? (
          <Card style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>🏆</div>
            <div style={{ color: C.gray, fontSize: 14 }}>No approved submissions yet</div>
          </Card>
        ) : approved.map(job => {
          const sub = job.submissions[job.submissions.length - 1];
          const worker = workers.find(w => w.id === sub?.workerId);
          return (
            <Card key={job.id} style={{ marginBottom: 14, border: `1px solid ${C.teal}33`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${C.lime},${C.teal},transparent)` }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: C.ash, marginBottom: 6 }}>{job.title}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <Badge color={C.violet2}>{job.category}</Badge>
                    <Badge color={C.lime}>✓ Approved</Badge>
                    {worker && <span style={{ fontSize: 11, color: C.gray }}>by {worker.name}</span>}
                  </div>
                  {sub?.files && sub.files.length > 0 && (
                    <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                      {sub.files.map((f, fi) => f.type.startsWith("image")
                        ? <img key={fi} src={f.url} alt={f.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4, border: `1px solid #ffffff10` }} />
                        : <span key={fi} style={{ fontSize: 10, color: C.gray }}>📎 {f.name}</span>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: C.lime }}>₦{(sub?.pay || job.pay).toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: C.gray }}>credited</div>
                  {worker && worker.rating > 0 && (
                    <div style={{ fontSize: 12, color: C.gold, marginTop: 4 }}>★ {worker.rating.toFixed(1)}</div>
                  )}
                </div>
              </div>
            </Card>
          );
        })
      )}

      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.92)", backdropFilter: "blur(8px)" }} onClick={() => setLightbox(null)}>
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.name} style={{ maxWidth: "90vw", maxHeight: "80vh", borderRadius: 10, boxShadow: "0 24px 60px #000000cc", objectFit: "contain" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, gap: 12 }}>
              <div style={{ fontSize: 12, color: "#A09890", fontFamily: "'Barlow Condensed',sans-serif" }}>{lightbox.name}</div>
              <div style={{ display: "flex", gap: 10 }}>
                <a href={lightbox.url} download={lightbox.name} target="_blank" rel="noopener noreferrer"
                  style={{ padding: "8px 18px", background: "#E8912A22", border: "1px solid #E8912A55", borderRadius: 8, color: "#E8912A", fontSize: 12, textDecoration: "none", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                  ⬇ Download
                </a>
                <button onClick={() => setLightbox(null)} style={{ padding: "8px 18px", background: "#22222A", border: "1px solid #ffffff10", borderRadius: 8, color: "#A09890", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700 }}>✕ Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {rejectJob && (
        <div style={{ position: "fixed", inset: 0, zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.75)", backdropFilter: "blur(6px)" }} onClick={() => setRejectJob(null)}>
          <div style={{ width: "min(460px,92vw)", background: "rgba(18,18,24,.99)", border: "1px solid #C0392B44", borderRadius: 16, padding: "28px 24px", boxShadow: "0 24px 60px #000000cc", animation: "slideUp .28s cubic-bezier(.22,.68,0,1.2) both" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: "#E8E4DC", fontWeight: 700, marginBottom: 6 }}>Reject Submission</div>
            <div style={{ fontSize: 13, color: "#6B6870", marginBottom: 16, lineHeight: 1.6 }}>Provide a reason so the worker knows what to improve. This will be sent as a message.</div>
            <div style={{ fontSize: 12, color: "#E8912A", marginBottom: 12, fontWeight: 600 }}>{rejectJob.title}</div>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. The animation timing needs work, please review the reference sheets and resubmit..." style={{ width: "100%", padding: "12px 14px", background: "#0D0D0F", border: "1px solid #ffffff10", borderBottom: "2px solid #C0392B66", borderRadius: 8, color: "#E8E4DC", fontFamily: "'Inter',sans-serif", fontSize: 13, outline: "none", resize: "vertical", minHeight: 100, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setRejectJob(null)} style={{ flex: 1, padding: "11px", background: "#22222A", border: "1px solid #ffffff10", borderRadius: 8, color: "#A09890", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em" }}>Cancel</button>
              <button onClick={() => reject(rejectJob, rejectReason)} style={{ flex: 2, padding: "11px", background: "#C0392B22", border: "1px solid #C0392B55", borderRadius: 8, color: "#C0392B", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em" }}>✕ Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      {chatJob && (
        <MessagingPanel
          job={chatJob}
          currentUserId={adminUser.id}
          currentUserName={adminUser.name}
          currentUserRole="admin"
          onSend={sendMessage}
          onClose={() => setChatJob(null)}
        />
      )}
    </div>
  );
}

import { useState } from "react";
import { C, SKILL_CATEGORIES } from "../../data/seed";
import { deleteJob as deleteJobFromDB, updateJob } from "../../lib/jobs";
import { Eyebrow, SectionTitle, GlowDivider, Badge, Card, Btn, statusColor, diffColor, useCountdown, fmtTime } from "../shared";
import type { Job } from "../../types";

function AdminJobRow({ job, onDelete, onExtend, onEdit }: { job: Job; onDelete: (id: string) => void; onExtend: (id: string, hours: number) => void; onEdit: (job: Job) => void }) {
  const [exp, setExp] = useState(false);
  const [extHours, setExtHours] = useState("24");
  const [showExt, setShowExt] = useState(false);
  const rem = useCountdown(job.deadline);
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }} onClick={() => setExp(p => !p)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: C.ash }}>{job.title}</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge color={C.violet2}>{job.category}</Badge>
            <Badge color={diffColor(job.difficulty)}>{job.difficulty}</Badge>
            <Badge color={statusColor(job.status)}>{job.status}</Badge>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: C.gold }}>₦{job.pay.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: rem < 0 ? C.ember : rem < 3600 ? C.gold : C.gray, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>
            {rem < 0 ? "⚠️ EXPIRED" : `⏱ ${fmtTime(rem)}`}
          </div>
        </div>
        <span style={{ color: C.gray, fontSize: 18, transition: "transform .3s", transform: exp ? "rotate(90deg)" : "rotate(0)" }}>›</span>
      </div>
      {exp && (
        <div style={{ padding: "0 20px 20px", borderTop: `1px solid #ffffff08` }}>
          <p style={{ fontSize: 13, color: C.gray2, lineHeight: 1.7, margin: "14px 0" }}>{job.description || "No description."}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Btn variant="danger" onClick={() => onDelete(job.id)} style={{ fontSize: 12, padding: "8px 16px" }}>Delete Job</Btn>
            <Btn variant="subtle" onClick={() => onEdit(job)} style={{ fontSize: 12, padding: "8px 16px" }}>✏️ Edit Job</Btn>
            <Btn variant="subtle" onClick={() => setShowExt(p => !p)} style={{ fontSize: 12, padding: "8px 16px" }}>⏱ Extend Deadline</Btn>
          </div>
          {showExt && (
            <div style={{ marginTop: 12, padding: "14px", background: "#0D0D0F", borderRadius: 8, border: "1px solid #ffffff08", display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6B6870", marginBottom: 6 }}>Add Hours</div>
                <input type="number" value={extHours} onChange={e => setExtHours(e.target.value)} min="1" style={{ width: "100%", padding: "9px 12px", background: "#1A1A1F", border: "1px solid #ffffff10", borderBottom: "2px solid #00E5FF44", borderRadius: 7, color: "#E8E4DC", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <Btn onClick={() => { onExtend(job.id, parseInt(extHours) || 24); setShowExt(false); }} style={{ padding: "9px 20px", fontSize: 12 }}>✅ Confirm</Btn>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export function AdminManageJobs({ jobs, setJobs, showToast }: { jobs: Job[]; setJobs: (fn: (p: Job[]) => Job[]) => void; showToast: (m: string) => void }) {
  const [filter, setFilter] = useState("All");
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPay, setEditPay] = useState("");
  const [editDifficulty, setEditDifficulty] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const statusFilters = ["All","Open","In Progress","Submitted","Approved","Expired"];
  const filtered = filter === "All" ? jobs : jobs.filter(j => j.status === filter);

  const openEdit = (job: Job) => {
    setEditJob(job);
    setEditTitle(job.title);
    setEditDesc(job.description || "");
    setEditPay(job.pay.toString());
    setEditDifficulty(job.difficulty);
    setEditCategory(job.category);
  };

  const saveEdit = async () => {
    if (!editJob) return;
    if (!editTitle.trim() || !editPay) return showToast("⚠️ Title and pay are required");
    const updates = {
      title: editTitle.trim(),
      description: editDesc,
      pay: parseFloat(editPay),
      difficulty: editDifficulty,
      category: editCategory,
    };
    try {
      await updateJob(editJob.id, updates);
      setJobs(p => p.map(j => j.id === editJob.id ? { ...j, ...updates } : j));
      setEditJob(null);
      showToast("✅ Job updated!");
    } catch (err: any) {
      showToast("❌ Failed to update: " + err.message);
    }
  };

  const extendJob = async (id: string, hours: number) => {
    const job = jobs.find(j => j.id === id);
    if (!job) return;
    const newDeadline = Math.max(job.deadline, Date.now()) + hours * 3600 * 1000;
    try {
      await updateJob(id, { deadline: newDeadline });
      setJobs(p => p.map(j => j.id === id ? { ...j, deadline: newDeadline } : j));
      showToast(`⏱ Deadline extended by ${hours} hours!`);
    } catch (err: any) {
      showToast("❌ Failed to extend: " + err.message);
    }
  };

  const deleteJob = async (id: string) => {
    try {
      await deleteJobFromDB(id);
      setJobs(p => p.filter(j => j.id !== id));
      showToast("Job removed.");
    } catch (err: any) {
      showToast("❌ Failed to delete: " + err.message);
    }
  };

  return (
    <div>
      <Eyebrow color={C.gold}>Admin</Eyebrow>
      <SectionTitle>Manage Jobs</SectionTitle>
      <GlowDivider />
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {statusFilters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "7px 16px", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: filter === f ? `${C.gold}22` : C.sur, color: filter === f ? C.gold : C.gray2, border: `1px solid ${filter === f ? C.gold : "#ffffff10"}`, borderRadius: 4, cursor: "pointer", transition: "all .2s" }}>
            {f}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(j => <AdminJobRow key={j.id} job={j} onDelete={deleteJob} onExtend={extendJob} onEdit={openEdit} />)}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.gray }}>No jobs in this category</div>
        )}
      </div>

      {/* Edit Job Modal */}
      {editJob && (
        <div style={{ position: "fixed", inset: 0, zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.75)", backdropFilter: "blur(6px)" }} onClick={() => setEditJob(null)}>
          <div style={{ width: "min(520px,92vw)", maxHeight: "85vh", overflowY: "auto", background: "rgba(18,18,24,.99)", border: `1px solid ${C.gold}33`, borderRadius: 16, padding: "28px 24px", boxShadow: "0 24px 60px #000000cc", animation: "slideUp .28s cubic-bezier(.22,.68,0,1.2) both" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: C.ash, fontWeight: 700, marginBottom: 20 }}>Edit Job</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray2, marginBottom: 6 }}>Job Title</div>
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ width: "100%", padding: "10px 13px", background: C.bg, border: "1px solid #ffffff10", borderBottom: `2px solid ${C.gold}44`, borderRadius: 8, color: C.ash, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray2, marginBottom: 6 }}>Description</div>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{ width: "100%", padding: "10px 13px", background: C.bg, border: "1px solid #ffffff10", borderBottom: `2px solid ${C.cyan}44`, borderRadius: 8, color: C.ash, fontSize: 13, outline: "none", resize: "vertical", minHeight: 90, boxSizing: "border-box", fontFamily: "'Inter',sans-serif" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray2, marginBottom: 6 }}>Pay (₦)</div>
                  <input type="number" value={editPay} onChange={e => setEditPay(e.target.value)} style={{ width: "100%", padding: "10px 13px", background: C.bg, border: "1px solid #ffffff10", borderBottom: `2px solid ${C.gold}44`, borderRadius: 8, color: C.ash, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray2, marginBottom: 6 }}>Difficulty</div>
                  <select value={editDifficulty} onChange={e => setEditDifficulty(e.target.value)} style={{ width: "100%", padding: "10px 13px", background: C.bg, border: "1px solid #ffffff10", borderRadius: 8, color: C.ash, fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                    {["Beginner","Intermediate","Expert"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray2, marginBottom: 6 }}>Category</div>
                <select value={editCategory} onChange={e => setEditCategory(e.target.value)} style={{ width: "100%", padding: "10px 13px", background: C.bg, border: "1px solid #ffffff10", borderRadius: 8, color: C.ash, fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                  {SKILL_CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setEditJob(null)} style={{ flex: 1, padding: "11px", background: C.sur2, border: "1px solid #ffffff10", borderRadius: 8, color: C.gray2, cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700 }}>Cancel</button>
              <button onClick={saveEdit} style={{ flex: 2, padding: "11px", background: `${C.gold}22`, border: `1px solid ${C.gold}55`, borderRadius: 8, color: C.gold, cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700 }}>💾 Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

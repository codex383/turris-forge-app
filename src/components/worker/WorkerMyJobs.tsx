import { useState } from "react";
import { C } from "../../data/seed";
import { Eyebrow, SectionTitle, GlowDivider, Badge, Card, Btn, statusColor, diffColor, useCountdown, fmtTime } from "../shared";
import { FileUpload } from "../FileUpload";
import { MessagingPanel } from "../MessagingPanel";
import type { Job, ActiveJob, Worker, UploadedFile } from "../../types";

function ActiveJobCard({ job, deadline, pay, onSubmit, onOpenMsg, submitting, notes, setNotes, files, setFiles }: {
  job: Job; deadline: number; pay: number;
  onSubmit: () => void; onOpenMsg: () => void;
  submitting: boolean; notes: string; setNotes: (n: string) => void;
  files: UploadedFile[]; setFiles: (f: UploadedFile[]) => void;
}) {
  const rem = useCountdown(deadline);
  const late = rem < 0;
  const overSecs = late ? Math.abs(rem) : 0;
  const penaltyPct = Math.min(0.8, Math.floor(overSecs / 600) * 0.02);
  const currentPay = late ? Math.max(pay * 0.2, pay * (1 - penaltyPct)) : pay;
  const urgentColor = late ? C.ember : rem < 3600 ? C.gold : rem < 3600 * 6 ? C.gold2 : C.cyan;
  const unread = (job.messages || []).filter(m => m.fromRole === "admin" && !m.read).length;

  return (
    <Card style={{ marginBottom: 16, border: `1px solid ${urgentColor}33`, boxShadow: late ? `0 0 30px ${C.ember}22` : rem < 3600 ? `0 0 30px ${C.gold}22` : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: C.ash, marginBottom: 8 }}>{job.title}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge color={C.violet2}>{job.category}</Badge>
            <Badge color={diffColor(job.difficulty)}>{job.difficulty}</Badge>
          </div>
        </div>
        <div style={{ textAlign: "center", background: `${urgentColor}11`, borderRadius: 10, padding: "12px 20px", border: `1px solid ${urgentColor}33` }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 700, color: urgentColor, letterSpacing: "0.1em" }}>
            {fmtTime(rem)}
          </div>
          <div style={{ fontSize: 10, color: C.gray, textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 2 }}>
            {late ? "OVERDUE" : "Time Remaining"}
          </div>
          {late && (
            <div style={{ fontSize: 11, color: C.ember, marginTop: 4 }}>
              Pay dropping: ₦{Math.round(currentPay)} (-{Math.round(penaltyPct * 100)}%)
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, marginBottom: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: C.gray }}>Potential Pay</span>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: late ? C.ember : C.gold }}>
            ₦{Math.round(currentPay).toLocaleString()} / ₦{pay.toLocaleString()}
          </span>
        </div>
        <div style={{ height: 3, background: C.sur2, borderRadius: 2 }}>
          <div style={{ height: "100%", borderRadius: 2, transition: "width .5s", width: `${Math.round(currentPay / pay * 100)}%`, background: `linear-gradient(90deg,${late ? C.ember : C.gold},${C.cyan})` }} />
        </div>
      </div>

      {/* Chat button */}
      <button onClick={onOpenMsg} style={{
        marginTop: 12, padding: "7px 14px",
        background: unread > 0 ? `${C.cyan}22` : C.sur2,
        border: `1px solid ${unread > 0 ? C.cyan + "55" : "#ffffff10"}`,
        borderRadius: 7, cursor: "pointer", color: unread > 0 ? C.cyan : C.gray2,
        fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700,
        letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 6,
        transition: "all .2s",
      }}>
        💬 Chat with Admin
        {unread > 0 && <span style={{ background: C.ember, borderRadius: 10, padding: "1px 6px", fontSize: 10, color: "#fff" }}>{unread}</span>}
        {(job.messages || []).length > 0 && <span style={{ fontSize: 10, color: C.gray }}>({(job.messages || []).length} msgs)</span>}
      </button>

      {submitting ? (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray2 }}>Submission Notes</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Describe your work, any notes for the admin..." style={{ padding: "13px 15px", background: C.bg, border: `1px solid #ffffff10`, borderBottom: `2px solid ${C.cyan}66`, borderRadius: 8, color: C.ash, fontFamily: "'Inter',sans-serif", fontSize: 14, outline: "none", resize: "vertical", minHeight: 90 }} />
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray2 }}>Attach Files</div>
          <FileUpload files={files} setFiles={setFiles} />
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="subtle" onClick={() => { setNotes(""); setFiles([]); onSubmit(); }} style={{ flex: 1 }}>Cancel</Btn>
            <Btn onClick={onSubmit} style={{ flex: 2 }}>📨 Submit for Review</Btn>
          </div>
        </div>
      ) : (
        <Btn onClick={onSubmit} style={{ marginTop: 14, width: "100%" }}>📤 Submit Work</Btn>
      )}
    </Card>
  );
}

export function WorkerMyJobs({ jobs, activeJobs, user, onSubmit, onMessage }: {
  jobs: Job[];
  activeJobs: ActiveJob[];
  user: Worker;
  onSubmit: (jobId: string, notes: string, files: import("../../types").UploadedFile[]) => void;
  onMessage: (jobId: string, text: string) => void;
}) {
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [chatJob, setChatJob] = useState<Job | null>(null);

  console.log("activeJobs passed in:", activeJobs.map(a => ({ id: a.job.id, acceptedBy: (a.job as any).acceptedBy })));
  console.log("user id:", user.id, "uid:", (user as any).uid);
  const mySubmitted = jobs.filter(j =>
    (j.status === "Submitted" || j.status === "Approved") &&
    j.submissions.some(s => s.workerId === user.id));

  const handleSubmitConfirm = (jobId: string) => {
    onSubmit(jobId, notes, files);
    setSubmitting(null); setNotes(""); setFiles([]);
  };

  return (
    <div>
      <Eyebrow color={C.gold}>Creative Portal</Eyebrow>
      <SectionTitle>My Jobs</SectionTitle>
      <GlowDivider />


      {activeJobs.length === 0 && mySubmitted.length === 0 && (
        <Card style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ color: C.gray, marginBottom: 16 }}>No active jobs yet</div>
          <div style={{ fontSize: 13, color: C.gray2 }}>Head to the Job Board to find work</div>
        </Card>
      )}

      {activeJobs.length > 0 && (
        <>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>Active Jobs</div>
          {activeJobs.map(({ job, deadline, pay }) => {
            const liveJob = jobs.find(j => j.id === job.id) || job;
            return (
              <ActiveJobCard key={job.id} job={liveJob} deadline={deadline} pay={pay}
                onOpenMsg={() => setChatJob(liveJob)}
                onSubmit={() => {
                  if (submitting === job.id) { handleSubmitConfirm(job.id); }
                  else { setSubmitting(job.id); }
                }}
                submitting={submitting === job.id} notes={notes} setNotes={setNotes}
                files={files} setFiles={setFiles}
              />
            );
          })}
        </>
      )}

      {mySubmitted.length > 0 && (
        <>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: C.cyan, marginBottom: 12, marginTop: 28 }}>Submitted / Completed</div>
          {mySubmitted.map(j => {
            const sub = j.submissions.find(s => s.workerId === user.id);
            return (
              <Card key={j.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: C.ash }}>{j.title}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <Badge color={statusColor(j.status)}>{j.status}</Badge>
                      {sub?.late && <span style={{ fontSize: 11, color: C.ember }}>Late submission</span>}
                      {sub?.files && sub.files.length > 0 && (
                        <span style={{ fontSize: 11, color: C.gray }}>📂 {sub.files.length} file{sub.files.length > 1 ? "s" : ""} attached</span>
                      )}
                    </div>
                    {sub?.notes && (
                      <div style={{ fontSize: 12, color: C.gray2, marginTop: 8, lineHeight: 1.5 }}>{sub.notes}</div>
                    )}
                    {/* Attached files preview */}
                    {sub?.files && sub.files.length > 0 && (
                      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                        {sub.files.map((f, fi) => (
                          f.type.startsWith("image") ? (
                            <img key={fi} src={f.url} alt={f.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 5, border: `1px solid #ffffff10` }} />
                          ) : (
                            <div key={fi} style={{ padding: "4px 8px", background: C.sur2, borderRadius: 5, fontSize: 11, color: C.gray2 }}>📎 {f.name}</div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: C.gold }}>₦{sub?.pay || j.pay}</div>
                    <button onClick={() => setChatJob(j)} style={{ marginTop: 6, padding: "4px 10px", background: C.sur2, border: `1px solid #ffffff10`, borderRadius: 5, cursor: "pointer", color: C.gray2, fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif" }}>
                      💬 Chat
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </>
      )}

      {chatJob && (
        <MessagingPanel
          job={chatJob}
          currentUserId={user.id}
          currentUserName={user.name}
          currentUserRole="worker"
          onSend={onMessage}
          onClose={() => setChatJob(null)}
        />
      )}
    </div>
  );
}

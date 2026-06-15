import { useState } from "react";
import { C, SKILL_CATEGORIES } from "../../data/seed";
import { Eyebrow, SectionTitle, GlowDivider, Badge, Card, Btn, diffColor, useCountdown, fmtTime } from "../shared";
import type { Job, ActiveJob, Worker } from "../../types";

function JobCard({ job, user, activated, onAccept, featured, hasActiveJob, onLightbox }: { job: Job; user: Worker; activated: boolean; onAccept: () => void; featured?: boolean; hasActiveJob: boolean; onLightbox: (url: string, name: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const rem = useCountdown(job.deadline);
  const skillMatch = user.skills?.some(s => s === job.category);
  const urgentColor = rem < 0 ? C.ember : rem < 3600 ? C.ember : rem < 3600 * 8 ? C.gold : C.gray;

  return (
    <Card style={{
      marginBottom: 14,
      border: `1px solid ${featured ? C.gold + "55" : skillMatch ? C.cyan + "33" : "#ffffff0a"}`,
      boxShadow: featured ? `0 4px 32px ${C.gold}18` : "none",
      transition: "box-shadow .3s",
      position: "relative", overflow: "hidden",
    }}>
      {featured && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${C.gold},${C.cyan},transparent)` }} />
      )}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Left */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            {featured && (
              <span style={{ fontSize: 9, background: `${C.gold}33`, border: `1px solid ${C.gold}55`, color: C.gold, borderRadius: 3, padding: "2px 7px", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.2em", textTransform: "uppercase" }}>★ Recommended</span>
            )}
            <Badge color={C.violet2}>{job.category}</Badge>
            <Badge color={diffColor(job.difficulty)}>{job.difficulty}</Badge>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, color: C.ash, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>{job.title}</div>
          <p style={{ fontSize: 12.5, color: C.gray2, lineHeight: 1.65, margin: 0 }}>
            {expanded ? job.description : `${job.description.slice(0, 120)}${job.description.length > 120 ? "…" : ""}`}
          </p>
          {job.description.length > 120 && (
            <button onClick={() => setExpanded(p => !p)} style={{ background: "none", border: "none", color: C.cyan, fontSize: 11, cursor: "pointer", padding: "4px 0 0", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>
              {expanded ? "Show less ↑" : "Read more ↓"}
            </button>
          )}
          {/* Reference files */}
          {(job as any).refFiles && (job as any).refFiles.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>📎 Reference Files</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(job as any).refFiles.map((rf: any, ri: number) => (
                  rf.type?.startsWith("image") ? (
                    <div key={ri} style={{ position: "relative" }}>
                      <img src={rf.url} alt={rf.name} onClick={() => onLightbox(rf.url, rf.name)}
                        style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, border: `1px solid ${C.gold}33`, cursor: "pointer" }} />
                      <a href={rf.url} download={rf.name} target="_blank" rel="noopener noreferrer"
                        style={{ position: "absolute", bottom: 3, right: 3, background: "rgba(0,0,0,.7)", borderRadius: 3, padding: "1px 4px", fontSize: 9, color: "#fff", textDecoration: "none" }}>⬇</a>
                    </div>
                  ) : (
                    <a key={ri} href={rf.url} download={rf.name} target="_blank" rel="noopener noreferrer"
                      style={{ padding: "6px 10px", background: `${C.gold}0f`, border: `1px solid ${C.gold}22`, borderRadius: 6, fontSize: 11, color: C.gold, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                      📎 {rf.name} <span style={{ fontSize: 10 }}>⬇</span>
                    </a>
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ flexShrink: 0, textAlign: "right", minWidth: 130 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: C.gold, lineHeight: 1 }}>₦{job.pay.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: C.gray, marginBottom: 10, marginTop: 2, fontFamily: "'Barlow Condensed',sans-serif" }}>fixed pay</div>
          <div style={{ fontSize: 11, color: urgentColor, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.08em", marginBottom: 10 }}>
            {rem < 0 ? "⚠ Expired" : `⏱ ${fmtTime(rem)}`}
          </div>
          {activated ? (
            <div style={{ padding: "6px 12px", background: `${C.cyan}18`, border: `1px solid ${C.cyan}44`, borderRadius: 5, fontSize: 11, color: C.cyan, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>IN PROGRESS</div>
          ) : (
            <Btn onClick={onAccept} style={{ fontSize: 11, padding: "7px 16px" }}>⚡ Accept</Btn>
          )}
        </div>
      </div>
    </Card>
  );
}

function FileLightbox({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.92)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
        <img src={url} alt={name} style={{ maxWidth: "90vw", maxHeight: "80vh", borderRadius: 10, boxShadow: "0 24px 60px #000000cc", objectFit: "contain" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, gap: 12 }}>
          <div style={{ fontSize: 12, color: "#A09890" }}>{name}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href={url} download={name} target="_blank" rel="noopener noreferrer" style={{ padding: "8px 18px", background: "#E8912A22", border: "1px solid #E8912A55", borderRadius: 8, color: "#E8912A", fontSize: 12, textDecoration: "none", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700 }}>⬇ Download</a>
            <button onClick={onClose} style={{ padding: "8px 18px", background: "#22222A", border: "1px solid #ffffff10", borderRadius: 8, color: "#A09890", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700 }}>✕ Close</button>
          </div>
        </div>
      </div>
      {lightbox && <FileLightbox url={lightbox.url} name={lightbox.name} onClose={() => setLightbox(null)} />}
    </div>
  );
}

export function WorkerJobBoard({ jobs, user, activeJobs, onAccept }: { jobs: Job[]; user: Worker; activeJobs: ActiveJob[]; onAccept: (job: Job) => void }) {
  const [catFilter, setCatFilter] = useState("All");
  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(null);
  const [diffFilter, setDiffFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("pay-desc");
  const [tab, setTab] = useState<"all" | "recommended">("recommended");

  const mySkills = user.skills || [];
  const activatedIds = activeJobs.map(a => a.job.id);
  const openJobs = jobs.filter(j => {
    if (j.status !== "Open") return false;
    if (j.visibility === "Restricted") {
      return (j.allowedWorkers || []).includes(user.id);
    }
    return true;
  });

  const recommended = openJobs.filter(j => mySkills.includes(j.category));
  const allFiltered = (() => {
    let list = openJobs;
    if (catFilter !== "All") list = list.filter(j => j.category === catFilter);
    if (diffFilter !== "All") list = list.filter(j => j.difficulty === diffFilter);
    if (search) list = list.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.category.toLowerCase().includes(search.toLowerCase()));
    return [...list].sort((a, b) => {
      if (sortBy === "pay-desc") return b.pay - a.pay;
      if (sortBy === "pay-asc") return a.pay - b.pay;
      if (sortBy === "deadline") return a.deadline - b.deadline;
      return b.posted - a.posted;
    });
  })();

  const displayJobs = tab === "recommended" ? recommended : allFiltered;

  return (
    <div>
      <Eyebrow color={C.cyan}>Creative Portal</Eyebrow>
      <SectionTitle>Job Board</SectionTitle>
      <GlowDivider colors={[C.cyan, C.teal]} />

      {/* Skill-match banner */}
      {mySkills.length > 0 && (
        <div style={{ background: `linear-gradient(135deg,${C.gold}0f,${C.cyan}0a)`, border: `1px solid ${C.gold}22`, borderRadius: 10, padding: "14px 18px", marginBottom: 22, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 18 }}>🎯</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, marginBottom: 4 }}>Your Skills Match {recommended.length} Available Job{recommended.length !== 1 ? "s" : ""}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {mySkills.map(s => <Badge key={s} color={C.gold}>{s}</Badge>)}
            </div>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: C.gold }}>₦{recommended.reduce((s, j) => s + j.pay, 0).toLocaleString()}</div>
          <div style={{ fontSize: 11, color: C.gray }}>potential earnings</div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, background: C.bg, borderRadius: 8, padding: 3, marginBottom: 20, width: "fit-content", border: `1px solid #ffffff08` }}>
        {([["recommended", `★ For You (${recommended.length})`], ["all", `All Jobs (${openJobs.length})`]] as const).map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 18px", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            background: tab === t ? `linear-gradient(135deg,${C.gold}33,${C.cyan}22)` : "transparent",
            color: tab === t ? C.ash : C.gray2,
            border: "none", borderRadius: 6, cursor: "pointer", transition: "all .25s",
          }}>{l}</button>
        ))}
      </div>

      {/* Filters — only on "all" tab */}
      {tab === "all" && (
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.gray, fontSize: 13 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..."
              style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: C.sur, border: `1px solid #ffffff10`, borderRadius: 6, color: C.ash, fontFamily: "'Inter',sans-serif", fontSize: 12, outline: "none", minWidth: 180 }} />
          </div>
          {([
            [catFilter, setCatFilter, ["All", ...SKILL_CATEGORIES]],
            [diffFilter, setDiffFilter, ["All", "Beginner", "Intermediate", "Expert"]],
            [sortBy, setSortBy, [["pay-desc","Highest Pay"],["pay-asc","Lowest Pay"],["deadline","Soonest Deadline"],["newest","Newest"]]],
          ] as any[]).map(([val, setter, opts], i) => (
            <select key={i} value={val} onChange={(e: any) => setter(e.target.value)}
              style={{ padding: "8px 12px", background: C.sur, border: `1px solid #ffffff10`, borderRadius: 6, color: C.ash, fontSize: 12, outline: "none", cursor: "pointer" }}>
              {opts.map((o: any) => Array.isArray(o)
                ? <option key={o[0]} value={o[0]}>{o[1]}</option>
                : <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>
      )}

      {/* Count */}
      <div style={{ fontSize: 11, color: C.gray, marginBottom: 14, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {displayJobs.length} job{displayJobs.length !== 1 ? "s" : ""} {tab === "recommended" ? "matched to your profile" : "available"}
      </div>

      {/* Job list */}
      {displayJobs.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "52px 0" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>{tab === "recommended" ? "🎯" : "🔍"}</div>
          <div style={{ color: C.gray, fontSize: 14, marginBottom: 8 }}>
            {tab === "recommended" ? "No jobs match your skills right now" : "No jobs match your filters"}
          </div>
          {tab === "recommended" && <div style={{ fontSize: 12, color: C.gray2 }}>Switch to "All Jobs" or update your skill profile in Settings</div>}
        </Card>
      ) : (
        displayJobs.map(job => (
          <JobCard key={job.id} job={job} user={user}
            activated={activatedIds.includes(job.id)}
            onAccept={() => onAccept(job)}
            featured={tab === "recommended" && mySkills.includes(job.category)}
            hasActiveJob={activeJobs.length > 0 && !activatedIds.includes(job.id)}
            onLightbox={(url, name) => setLightbox({ url, name })}
          />
        ))
      )}
    </div>
  );
}

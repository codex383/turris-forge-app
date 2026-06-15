import { useState } from "react";
import { C } from "../../data/seed";
import { Eyebrow, SectionTitle, GlowDivider, Card } from "../shared";
import type { Job, Worker } from "../../types";

interface Stats { total: number; open: number; submitted: number; approved: number; paidOut: number; }

const TABS = ["Overview", "Category Speed", "Late Submissions"];

export function AdminAnalytics({ stats, jobs, workers }: { stats: Stats; jobs: Job[]; workers: Worker[] }) {
  const [tab, setTab] = useState("Overview");

  const catCounts: Record<string, number> = {};
  jobs.forEach(j => { catCounts[j.category] = (catCounts[j.category] || 0) + 1; });
  const topCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const totalPay = jobs.reduce((s, j) => s + j.pay, 0);

  // Feature 10: category completion speed (avg hours from posted to approved)
  const catSpeed: Record<string, number[]> = {};
  jobs.forEach(j => {
    if (j.status === "Approved" && j.posted) {
      const sub = j.submissions[j.submissions.length - 1];
      if (sub?.submittedAt) {
        const hrs = (sub.submittedAt - j.posted) / 1000 / 3600;
        if (!catSpeed[j.category]) catSpeed[j.category] = [];
        catSpeed[j.category].push(hrs);
      }
    }
  });
  const catSpeedAvg = Object.entries(catSpeed)
    .map(([cat, times]) => ({ cat, avg: times.reduce((a, b) => a + b, 0) / times.length, count: times.length }))
    .sort((a, b) => a.avg - b.avg);

  // Feature 11: late submission tracker per worker
  const lateByWorker = workers.map(w => {
    const lateJobs = jobs.filter(j => j.submissions.some(s => s.workerId === w.id && s.late));
    const history = lateJobs.map(j => {
      const sub = j.submissions.find(s => s.workerId === w.id && s.late)!;
      const minsLate = sub ? Math.round((sub.submittedAt - j.deadline) / 1000 / 60) : 0;
      return { title: j.title, minsLate, date: sub?.submittedAt };
    });
    return { worker: w, lateCount: lateJobs.length, history };
  }).filter(x => x.lateCount > 0).sort((a, b) => b.lateCount - a.lateCount);

  return (
    <div>
      <Eyebrow color={C.violet2}>Admin</Eyebrow>
      <SectionTitle>Studio Analytics</SectionTitle>
      <GlowDivider colors={[C.violet2, C.pink]} />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 18px", fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif",
            letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", borderRadius: 6,
            background: tab === t ? `${C.violet2}22` : "transparent",
            color: tab === t ? C.violet2 : C.gray,
            border: tab === t ? `1px solid ${C.violet2}55` : `1px solid #ffffff10`,
            transition: "all .2s",
          }}>{t}</button>
        ))}
      </div>

      {/* TAB 1: Overview */}
      {tab === "Overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>
            {[
              ["Total Job Value", `₦${totalPay.toLocaleString()}`, C.gold],
              ["Completion Rate", `${stats.total ? Math.round(stats.approved / stats.total * 100) : 0}%`, C.lime],
              ["Avg Pay Per Job", `₦${stats.total ? Math.round(totalPay / stats.total) : 0}`, C.cyan],
              ["Worker Count", workers.length, C.violet2],
            ].map(([l, v, c]) => (
              <Card key={String(l)} glow={String(c)} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 700, background: `linear-gradient(135deg,${c},${C.ash})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{String(v)}</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray, marginTop: 4 }}>{String(l)}</div>
              </Card>
            ))}
          </div>
          <Card>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.violet2, marginBottom: 20 }}>Jobs by Category</div>
            {topCats.length === 0 && <div style={{ color: C.gray, fontSize: 13 }}>No job data yet.</div>}
            {topCats.map(([cat, count]) => {
              const pct = Math.round(count / jobs.length * 100);
              return (
                <div key={cat} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: C.ash }}>{cat}</span>
                    <span style={{ fontSize: 13, color: C.gold }}>{count} job{count > 1 ? "s" : ""}</span>
                  </div>
                  <div style={{ height: 4, background: C.sur2, borderRadius: 2 }}>
                    <div style={{ height: "100%", borderRadius: 2, width: `${pct}%`, background: `linear-gradient(90deg,${C.gold},${C.cyan})`, transition: "width 1s ease" }} />
                  </div>
                </div>
              );
            })}
          </Card>
        </>
      )}

      {/* TAB 2: Category Speed */}
      {tab === "Category Speed" && (
        <Card>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.cyan, marginBottom: 6 }}>Fastest Completed Categories</div>
          <div style={{ fontSize: 11, color: C.gray, marginBottom: 20 }}>Average time from job posted → submission (approved jobs only)</div>
          {catSpeedAvg.length === 0 ? (
            <div style={{ color: C.gray, fontSize: 13, textAlign: "center", padding: "32px 0" }}>No approved jobs with timing data yet.</div>
          ) : (
            catSpeedAvg.map((c, i) => {
              const maxAvg = catSpeedAvg[catSpeedAvg.length - 1].avg || 1;
              const pct = Math.round((c.avg / maxAvg) * 100);
              const hrs = c.avg < 1 ? `${Math.round(c.avg * 60)}m` : `${c.avg.toFixed(1)}h`;
              return (
                <div key={c.cat} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, color: C.gold, fontFamily: "'Barlow Condensed',sans-serif", minWidth: 16 }}>#{i + 1}</span>
                      <span style={{ fontSize: 13, color: C.ash }}>{c.cat}</span>
                      <span style={{ fontSize: 10, color: C.gray }}>({c.count} job{c.count !== 1 ? "s" : ""})</span>
                    </div>
                    <span style={{ fontSize: 13, color: C.cyan, fontFamily: "'Barlow Condensed',sans-serif" }}>{hrs} avg</span>
                  </div>
                  <div style={{ height: 4, background: C.sur2, borderRadius: 2 }}>
                    <div style={{ height: "100%", borderRadius: 2, width: `${pct}%`, background: `linear-gradient(90deg,${C.cyan},${C.teal})`, transition: "width 1s ease" }} />
                  </div>
                </div>
              );
            })
          )}
        </Card>
      )}

      {/* TAB 3: Late Submissions */}
      {tab === "Late Submissions" && (
        <div>
          {lateByWorker.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
              <div style={{ color: C.gray }}>No late submissions recorded yet!</div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {lateByWorker.map(({ worker: w, lateCount, history }) => (
                <Card key={w.id} style={{ borderLeft: `3px solid ${lateCount >= 3 ? "#E74C3C" : C.gold}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${C.ember},${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#000" }}>{w.name[0]}</div>
                      <div>
                        <div style={{ fontSize: 14, color: C.ash, fontWeight: 600 }}>{w.name}</div>
                        <div style={{ fontSize: 10, color: C.gray }}>{w.email}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "center", padding: "6px 14px", background: lateCount >= 3 ? "#E74C3C18" : `${C.gold}18`, border: `1px solid ${lateCount >= 3 ? "#E74C3C" : C.gold}44`, borderRadius: 8 }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: lateCount >= 3 ? "#E74C3C" : C.gold }}>{lateCount}</div>
                      <div style={{ fontSize: 9, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>Late</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {history.map((h, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: C.bg, borderRadius: 6 }}>
                        <span style={{ fontSize: 12, color: C.ash }}>{h.title}</span>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: "#E74C3C", fontFamily: "'Barlow Condensed',sans-serif" }}>+{h.minsLate}m late</span>
                          {h.date && <span style={{ fontSize: 10, color: C.gray }}>{new Date(h.date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

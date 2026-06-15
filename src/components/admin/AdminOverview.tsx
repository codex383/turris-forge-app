import { C } from "../../data/seed";
import { Eyebrow, SectionTitle, GlowDivider, Badge, Card, Btn, statusColor, diffColor } from "../shared";
import type { Job, Worker } from "../../types";

interface Stats { total: number; open: number; submitted: number; approved: number; paidOut: number; }

const PALETTE = [C.gold, C.cyan, C.violet2, C.lime, C.pink, C.teal];

export function AdminOverview({ stats, jobs, workers, setView }: { stats: Stats; jobs: Job[]; workers: Worker[]; setView: (v: string) => void }) {
  const completionRate = stats.total ? Math.round(stats.approved / stats.total * 100) : 0;

  return (
    <div>
      <Eyebrow color={C.gold}>Admin Control Center</Eyebrow>
      <SectionTitle>Studio Overview</SectionTitle>
      <GlowDivider />

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 28 }}>
        {([
          ["Total Jobs", stats.total, C.gold, "📋"],
          ["Open", stats.open, C.lime, "🟢"],
          ["Awaiting Review", stats.submitted, C.cyan, "📥"],
          ["Approved", stats.approved, C.teal, "✓"],
          ["Total Paid Out", `₦${stats.paidOut.toLocaleString()}`, C.violet2, "💰"],
          ["Active Workers", workers.length, C.pink, "👥"],
        ] as [string, string | number, string, string][]).map(([label, val, color, icon]) => (
          <Card key={label} style={{ padding: "16px 18px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, fontSize: 36, opacity: 0.06, lineHeight: 1, pointerEvents: "none" }}>{icon}</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray, marginBottom: 6 }}>{label}</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
          </Card>
        ))}
      </div>

      {/* Completion bar */}
      <Card style={{ marginBottom: 20, padding: "18px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray }}>Studio Completion Rate</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: completionRate >= 60 ? C.lime : completionRate >= 30 ? C.gold : C.ember }}>{completionRate}%</div>
        </div>
        <div style={{ height: 6, background: C.bg, borderRadius: 3 }}>
          <div style={{ height: "100%", borderRadius: 3, width: `${completionRate}%`, background: `linear-gradient(90deg,${C.gold},${C.lime})`, transition: "width 1s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: C.gray }}>
          <span>{stats.approved} approved</span>
          <span>{stats.submitted} pending</span>
          <span>{stats.open} open</span>
        </div>
      </Card>

      {/* 2-col layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

        {/* Recent Jobs */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid #ffffff07`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold }}>Recent Jobs</div>
            <button onClick={() => setView("jobs")} style={{ background: "none", border: "none", color: C.cyan, fontSize: 11, cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>View all →</button>
          </div>
          <div style={{ padding: "4px 0" }}>
            {jobs.slice(0, 5).map(j => (
              <div key={j.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderBottom: `1px solid #ffffff05` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: C.ash, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{j.title}</div>
                  <div style={{ fontSize: 10, color: C.gray, marginTop: 1 }}>{j.category}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: C.gold }}>₦{j.pay.toLocaleString()}</span>
                  <Badge color={statusColor(j.status)}>{j.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Workers */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid #ffffff07`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.cyan }}>Top Workers</div>
            <button onClick={() => setView("workers")} style={{ background: "none", border: "none", color: C.cyan, fontSize: 11, cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>View all →</button>
          </div>
          <div style={{ padding: "4px 0" }}>
            {workers.length === 0 ? (
              <div style={{ padding: "24px 18px", color: C.gray, fontSize: 12, textAlign: "center" }}>No workers yet</div>
            ) : workers.map((w, i) => (
              <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderBottom: `1px solid #ffffff05` }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${PALETTE[i % PALETTE.length]},${C.ash}33)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#000", flexShrink: 0 }}>{w.name[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: C.ash, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.name}</div>
                  <div style={{ fontSize: 10, color: C.gray }}>{w.skills[0]}</div>
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: C.gold, flexShrink: 0 }}>₦{w.balance.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending submissions quick-actions */}
        <Card style={{ padding: 0, overflow: "hidden", gridColumn: "1 / -1" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid #ffffff07`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.teal }}>
              Submitted Projects  <span style={{ color: stats.submitted > 0 ? C.ember : C.gray, fontFamily: "'Cormorant Garamond',serif", fontSize: 18 }}>{stats.submitted}</span>
            </div>
            <Btn variant="subtle" onClick={() => setView("submissions")} style={{ fontSize: 11, padding: "6px 14px" }}>Review Submissions →</Btn>
          </div>
          {jobs.filter(j => j.status === "Submitted").length === 0 ? (
            <div style={{ padding: "20px 18px", color: C.gray, fontSize: 12, textAlign: "center" }}>No pending submissions</div>
          ) : (
            <div style={{ padding: "4px 0" }}>
              {jobs.filter(j => j.status === "Submitted").slice(0, 3).map(j => {
                const sub = j.submissions[j.submissions.length - 1];
                const w = workers.find(wk => wk.id === sub?.workerId);
                return (
                  <div key={j.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: `1px solid #ffffff05` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, color: C.ash }}>{j.title}</div>
                      {w && <div style={{ fontSize: 10, color: C.gray }}>by {w.name}</div>}
                    </div>
                    <Badge color={diffColor(j.difficulty)}>{j.difficulty}</Badge>
                    <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: C.gold }}>₦{(sub?.pay || j.pay).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

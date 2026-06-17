import { C } from "../../data/seed";
import { Eyebrow, SectionTitle, GlowDivider, Badge, Card } from "../shared";
import { RankFrame } from "../RankFrame";
import type { Worker, Job } from "../../types";

const LEVEL_INFO = (count: number) => {
  if (count >= 11) return { label: "Expert", color: C.gold, icon: "⭐" };
  if (count >= 5) return { label: "Intermediate", color: C.cyan, icon: "🔷" };
  return { label: "Beginner", color: C.lime, icon: "🌱" };
};

export function WorkerPortfolio({ user, jobs, allWorkers }: { user: Worker; jobs: Job[]; allWorkers: Worker[] }) {
  const completedJobs = jobs.filter(j =>
    j.status === "Approved" && j.submissions.some(s => s.workerId === user.id)
  );
  const totalEarned = (user.history || []).reduce((s, h) => s + h.amount, 0);
  const level = LEVEL_INFO(completedJobs.length);

  return (
    <div>
      <Eyebrow color={C.violet2}>Creative Portal</Eyebrow>
      <SectionTitle>My Portfolio</SectionTitle>
      <GlowDivider colors={[C.violet2, C.cyan]} />

      {/* Profile Hero */}
      <Card style={{ marginBottom: 20, background: `linear-gradient(135deg,${C.sur},${C.sur2})`, border: `1px solid ${C.violet2}22`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${C.violet2},${C.cyan},transparent)` }} />
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <RankFrame worker={user} allWorkers={allWorkers} size={72} showTitle={true} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: C.ash, fontWeight: 700 }}>{user.name}</div>
              {(user as any).isVerified && <span style={{ fontSize: 11, padding: "3px 10px", background: "#00E5FF22", border: "1px solid #00E5FF55", borderRadius: 12, color: "#00E5FF", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>✓ VERIFIED</span>}
              <div style={{ padding: "3px 10px", background: `${level.color}22`, border: `1px solid ${level.color}44`, borderRadius: 20, fontSize: 11, color: level.color, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>
                {level.icon} {level.label}
              </div>
            </div>
            {user.bio && <div style={{ fontSize: 13, color: C.gray2, marginTop: 6, lineHeight: 1.6 }}>{user.bio}</div>}
            {user.portfolio && (
              <a href={user.portfolio} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: C.cyan, textDecoration: "none", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>
                🔗 View External Portfolio
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 10, marginTop: 20 }}>
          {([
            ["Rating", user.rating > 0 ? `★ ${user.rating.toFixed(1)}` : "—", C.gold],
            ["Jobs Done", completedJobs.length, C.lime],
            ["Total Earned", `₦${totalEarned.toLocaleString()}`, C.cyan],
            ["Skills", (user.skills || []).length, C.violet2],
          ] as [string, string|number, string][]).map(([label, val, color]) => (
            <div key={label} style={{ background: C.bg, borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color }}>{val}</div>
              <div style={{ fontSize: 9, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Skills */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, marginBottom: 14 }}>Skill Categories</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(user.skills || []).map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: `${C.cyan}0f`, border: `1px solid ${C.cyan}2a`, borderRadius: 20 }}>
              <span style={{ fontSize: 11, color: C.cyan, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>{s}</span>
              {(user as any).verifiedSkills?.includes(s) && (
                <span title="Verified by admin" style={{ fontSize: 12, color: C.gold }}>✓</span>
              )}
            </div>
          ))}
          {(user.skills || []).length === 0 && <div style={{ fontSize: 12, color: C.gray }}>No skills listed yet</div>}
        </div>
      </Card>

      {/* Level Progress */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: level.color, marginBottom: 10 }}>
          {level.icon} {level.label} Level
        </div>
        <div style={{ fontSize: 12, color: C.gray2, marginBottom: 10 }}>
          {completedJobs.length < 5
            ? `${5 - completedJobs.length} more jobs to reach Intermediate`
            : completedJobs.length < 11
            ? `${11 - completedJobs.length} more jobs to reach Expert`
            : "You have reached the highest level!"}
        </div>
        <div style={{ height: 6, background: C.bg, borderRadius: 3 }}>
          <div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg,${level.color},${C.cyan})`, width: `${Math.min(100, completedJobs.length < 5 ? (completedJobs.length / 5) * 100 : completedJobs.length < 11 ? ((completedJobs.length - 5) / 6) * 100 : 100)}%`, transition: "width 1s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif" }}>
          <span>🌱 Beginner (0)</span>
          <span>🔷 Intermediate (5)</span>
          <span>⭐ Expert (11+)</span>
        </div>
      </Card>

      {/* Completed Work */}
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.ash, marginBottom: 14 }}>
        Completed Work ({completedJobs.length})
      </div>

      {completedJobs.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "52px 0" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎨</div>
          <div style={{ color: C.gray, fontSize: 14 }}>No completed work yet</div>
          <div style={{ fontSize: 12, color: C.gray2, marginTop: 6 }}>Complete jobs to build your portfolio</div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
          {completedJobs.map(j => {
            const sub = j.submissions.find(s => s.workerId === user.id);
            return (
              <Card key={j.id} style={{ position: "relative", overflow: "hidden", border: `1px solid ${C.teal}22` }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${C.lime},${C.teal},transparent)` }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Badge color={C.violet2}>{j.category}</Badge>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: C.ash, marginTop: 6, marginBottom: 4 }}>{j.title}</div>
                    {sub?.notes && <div style={{ fontSize: 11, color: C.gray2, lineHeight: 1.5 }}>{sub.notes.slice(0, 80)}{sub.notes.length > 80 ? "…" : ""}</div>}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: C.lime }}>₦{(sub?.pay || j.pay).toLocaleString()}</div>
                    <Badge color={C.lime}>✓ Approved</Badge>
                  </div>
                </div>
                {sub?.files && sub.files.length > 0 && (
                  <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    {sub.files.filter((f: any) => f.type?.startsWith("image")).slice(0, 3).map((f: any, fi: number) => (
                      <a key={fi} href={f.url} target="_blank" rel="noopener noreferrer">
                        <img src={f.url} alt={f.name} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, border: `1px solid ${C.teal}33` }} />
                      </a>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 10, color: C.gray, marginTop: 8, fontFamily: "'Barlow Condensed',sans-serif" }}>
                  {sub?.submittedAt ? new Date(sub.submittedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

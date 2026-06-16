import { useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { C, SKILL_CATEGORIES } from "../../data/seed";
import { Eyebrow, SectionTitle, GlowDivider, Badge, Card, Btn } from "../shared";
import type { Worker } from "../../types";

const PALETTE = [C.gold, C.cyan, C.violet2, C.lime, C.pink, C.teal];

const getLevel = (jobsDone: number) => {
  if (jobsDone >= 11) return { label: "Expert", color: "#E8912A", icon: "⭐" };
  if (jobsDone >= 5) return { label: "Intermediate", color: "#00E5FF", icon: "🔷" };
  return { label: "Beginner", color: "#A8FF3E", icon: "🌱" };
};

function StarDisplay({ rating, count }: { rating: number; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ display: "flex", gap: 1 }}>
        {[1,2,3,4,5].map(i => (
          <span key={i} style={{ fontSize: 13, color: i <= Math.round(rating || 0) ? C.gold : C.sur2 }}>★</span>
        ))}
      </div>
      <span style={{ fontSize: 11, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif" }}>
        {rating > 0 ? rating.toFixed(1) : "No ratings"} {count > 0 ? `(${count})` : ""}
      </span>
    </div>
  );
}

export function AdminWorkers({ workers }: { workers: Worker[] }) {
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("All");
  const [banTarget, setBanTarget] = useState<Worker | null>(null);
  const [banReason, setBanReason] = useState("");
  const [showToastMsg, setShowToastMsg] = useState("");
  const [verifyTarget, setVerifyTarget] = useState<Worker | null>(null);

  const toast = (msg: string) => {
    setShowToastMsg(msg);
    setTimeout(() => setShowToastMsg(""), 3000);
  };

  const toggleVerifySkill = async (worker: Worker, skill: string) => {
    const current = (worker as any).verifiedSkills || [];
    const updated = current.includes(skill)
      ? current.filter((s: string) => s !== skill)
      : [...current, skill];
    await updateDoc(doc(db, "users", worker.id), { verifiedSkills: updated });
    toast(`Skill "${skill}" ${current.includes(skill) ? "unverified" : "verified"} for ${worker.name}`);
  };

  const banWorker = async (worker: Worker, reason: string) => {
    await updateDoc(doc(db, "users", worker.id), { banned: true, banReason: reason });
    setBanTarget(null);
    setBanReason("");
    toast(`${worker.name} has been banned.`);
  };

  const unbanWorker = async (worker: Worker) => {
    await updateDoc(doc(db, "users", worker.id), { banned: false, banReason: "" });
    toast(`${worker.name} has been unbanned.`);
  };

  const toggleVerified = async (worker: Worker) => {
    const newStatus = !(worker as any).isVerified;
    await updateDoc(doc(db, "users", worker.id), { isVerified: newStatus });
    toast(`${worker.name} has been ${newStatus ? "verified ✓" : "unverified"}`);
  };

  const filtered = [...workers]
    .filter(w => {
      const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.email.toLowerCase().includes(search.toLowerCase()) ||
        w.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
      const matchSkill = skillFilter === "All" || w.skills.includes(skillFilter);
      return matchSearch && matchSkill;
    })
    .sort((a, b) => b.balance - a.balance);

  return (
    <div>
      <Eyebrow color={C.teal}>Admin</Eyebrow>
      <SectionTitle>Worker Management</SectionTitle>
      <GlowDivider colors={[C.teal, C.cyan]} />

      {/* Search & Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or skill..."
            style={{ width: "100%", padding: "10px 14px 10px 36px", background: C.sur, border: "1px solid #ffffff10", borderBottom: `2px solid ${C.cyan}44`, borderRadius: 8, color: C.ash, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "'Inter',sans-serif" }}
          />
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.gray, fontSize: 14 }}>🔍</span>
        </div>
        <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)}
          style={{ padding: "10px 14px", background: C.sur, border: "1px solid #ffffff10", borderRadius: 8, color: skillFilter === "All" ? C.gray : C.gold, fontSize: 12, outline: "none", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>
          <option value="All">All Skills</option>
          {SKILL_CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {search || skillFilter !== "All" ? (
        <div style={{ fontSize: 11, color: C.gray, marginBottom: 14, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>
          {filtered.length} worker{filtered.length !== 1 ? "s" : ""} found
        </div>
      ) : null}

      {workers.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>👥</div>
          <div style={{ color: C.gray }}>No workers registered yet</div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {filtered.map((w, i) => {
            const col = PALETTE[i % PALETTE.length];
            const jobsDone = w.history.filter(h => h.status === "Approved").length;
            const lvl = getLevel(jobsDone);
            return (
              <Card key={w.id} style={{ position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${col},transparent)` }} />

                <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg,${col},${C.ash}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#000", flexShrink: 0, boxShadow: `0 0 16px ${col}44` }}>{w.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: C.ash }}>{w.name}</div>
                      <span style={{ fontSize: 9, padding: "2px 7px", background: lvl.color + "22", border: `1px solid ${lvl.color}44`, borderRadius: 10, color: lvl.color, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>{lvl.icon} {lvl.label}</span>
                    </div>
                    <div style={{ fontSize: 10, color: col, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>{w.skills[0] || "No specialty"}</div>
                  </div>
                  {i === 0 && <div style={{ fontSize: 22 }} title="Top earner">🥇</div>}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <StarDisplay rating={w.rating || 0} count={w.ratingCount || 0} />
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                  {w.skills.map(s => (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", background: `${C.cyan}0f`, border: `1px solid ${C.cyan}2a`, borderRadius: 12 }}>
                      <span style={{ fontSize: 10, color: C.cyan, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s}</span>
                      {((w as any).verifiedSkills || []).includes(s) && <span style={{ fontSize: 10, color: C.gold }}>✓</span>}
                    </div>
                  ))}
                  {w.skills.length === 0 && <span style={{ fontSize: 12, color: C.gray }}>No skills listed</span>}
                </div>

                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1, background: C.bg, borderRadius: 7, padding: "8px 12px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: C.gold }}>₦{w.balance.toLocaleString()}</div>
                    <div style={{ fontSize: 9, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>Balance</div>
                  </div>
                  <div style={{ flex: 1, background: C.bg, borderRadius: 7, padding: "8px 12px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: C.cyan }}>{jobsDone}</div>
                    <div style={{ fontSize: 9, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>Jobs Done</div>
                  </div>
                </div>

                {w.bio && <div style={{ fontSize: 12, color: C.gray2, lineHeight: 1.6, borderTop: `1px solid #ffffff07`, paddingTop: 10 }}>{w.bio}</div>}

                <div style={{ fontSize: 10, color: C.gray, marginTop: 10, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>
                  Joined {new Date(w.joined).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </div>

                {w.banned && (
                  <div style={{ marginTop: 8, padding: "6px 10px", background: "#C0392B18", border: "1px solid #C0392B44", borderRadius: 6, fontSize: 11, color: "#C0392B" }}>
                    🚫 Banned{w.banReason ? `: ${w.banReason}` : ""}
                  </div>
                )}

                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  <Btn onClick={() => toggleVerified(w)} style={{ width: "100%", fontSize: 11, padding: "8px", background: (w as any).isVerified ? `${C.lime}22` : `${C.cyan}22`, border: `1px solid ${(w as any).isVerified ? C.lime : C.cyan}44`, color: (w as any).isVerified ? C.lime : C.cyan }}>
                    {(w as any).isVerified ? "✓ Verified — Click to Unverify" : "🔍 Verify Worker"}
                  </Btn>
                  <Btn onClick={() => setVerifyTarget(verifyTarget?.id === w.id ? null : w)} style={{ width: "100%", fontSize: 11, padding: "8px", background: `${C.gold}22`, border: `1px solid ${C.gold}44`, color: C.gold }}>
                    {verifyTarget?.id === w.id ? "✕ Close Verify" : "✓ Verify Skills"}
                  </Btn>
                  {verifyTarget?.id === w.id && (
                    <div style={{ background: C.bg, borderRadius: 8, padding: 10 }}>
                      <div style={{ fontSize: 10, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Toggle skill verification</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {w.skills.map(s => {
                          const verified = ((w as any).verifiedSkills || []).includes(s);
                          return (
                            <button key={s} onClick={() => toggleVerifySkill(w, s)} style={{ padding: "4px 8px", fontSize: 10, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", background: verified ? `${C.gold}22` : C.sur2, color: verified ? C.gold : C.gray2, border: `1px solid ${verified ? C.gold : "#ffffff10"}`, borderRadius: 4, cursor: "pointer" }}>
                              {verified ? "✓ " : ""}{s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {w.banned ? (
                    <Btn onClick={() => unbanWorker(w)} style={{ width: "100%", fontSize: 11, padding: "8px", background: `${C.lime}22`, border: `1px solid ${C.lime}44`, color: C.lime }}>✅ Unban Worker</Btn>
                  ) : (
                    <Btn variant="danger" onClick={() => { setBanTarget(w); setBanReason(""); }} style={{ width: "100%", fontSize: 11, padding: "8px" }}>🚫 Ban Worker</Btn>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Toast */}
      {showToastMsg && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: C.sur2, border: `1px solid ${C.cyan}33`, borderRadius: 10, padding: "12px 24px", color: C.ash, fontSize: 13, zIndex: 500, boxShadow: "0 8px 32px #000000aa" }}>
          {showToastMsg}
        </div>
      )}

      {/* Ban Modal */}
      {banTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.75)", backdropFilter: "blur(6px)" }} onClick={() => setBanTarget(null)}>
          <div style={{ width: "min(420px,92vw)", background: "rgba(18,18,24,.99)", border: "1px solid #C0392B44", borderRadius: 16, padding: "28px 24px", boxShadow: "0 24px 60px #000000cc" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: "#E8E4DC", fontWeight: 700, marginBottom: 6 }}>Ban Worker</div>
            <div style={{ fontSize: 13, color: "#6B6870", marginBottom: 16, lineHeight: 1.6 }}>
              You are about to ban <span style={{ color: "#E8912A", fontWeight: 600 }}>{banTarget.name}</span>. They will see this reason when they try to log in.
            </div>
            <textarea value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="e.g. Repeated late submissions, violation of studio policy..." style={{ width: "100%", padding: "12px 14px", background: "#0D0D0F", border: "1px solid #ffffff10", borderBottom: "2px solid #C0392B66", borderRadius: 8, color: "#E8E4DC", fontFamily: "'Inter',sans-serif", fontSize: 13, outline: "none", resize: "vertical", minHeight: 80, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setBanTarget(null)} style={{ flex: 1, padding: "11px", background: "#22222A", border: "1px solid #ffffff10", borderRadius: 8, color: "#A09890", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700 }}>Cancel</button>
              <button onClick={() => banWorker(banTarget, banReason)} style={{ flex: 2, padding: "11px", background: "#C0392B22", border: "1px solid #C0392B55", borderRadius: 8, color: "#C0392B", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700 }}>🚫 Confirm Ban</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

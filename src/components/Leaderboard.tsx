import { C } from "../data/seed";
import { Card, Eyebrow, SectionTitle, GlowDivider } from "./shared";
import type { Worker } from "../types";

const MEDALS = ["🥇", "🥈", "🥉"];
const PALETTE = [C.gold, C.gray2, C.teal, C.cyan, C.violet2, C.lime];

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ display: "flex", gap: 1 }}>
        {[1,2,3,4,5].map(i => (
          <span key={i} style={{ fontSize: 11, color: i <= Math.round(rating) ? C.gold : C.sur2 }}>★</span>
        ))}
      </div>
      <span style={{ fontSize: 10, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif" }}>
        {rating > 0 ? rating.toFixed(1) : "–"} ({count})
      </span>
    </div>
  );
}


const getLevel = (jobsDone: number) => {
  if (jobsDone >= 11) return { label: "Expert", color: "#E8912A", icon: "⭐" };
  if (jobsDone >= 5) return { label: "Intermediate", color: "#00E5FF", icon: "🔷" };
  return { label: "Beginner", color: "#A8FF3E", icon: "🌱" };
};

export function Leaderboard({ workers }: { workers: Worker[] }) {
  const ranked = [...workers].sort((a, b) => b.balance - a.balance);
  const totalPaid = workers.reduce((s, w) => s + w.balance, 0);

  return (
    <div>
      <Eyebrow color={C.gold}>Studio Rankings</Eyebrow>
      <SectionTitle>Worker Leaderboard</SectionTitle>
      <GlowDivider colors={[C.gold, C.violet2]} />

      {ranked.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🏆</div>
          <div style={{ color: C.gray }}>No workers yet</div>
        </Card>
      ) : (
        <>
          {/* Top 3 podium */}
          {ranked.length >= 1 && (
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 12, marginBottom: 28 }}>
              {([1, 0, 2] as const).filter(i => ranked[i]).map((i) => {
                const w = ranked[i];
                const heights = [130, 160, 110];
                const h = heights[i];
                return (
                  <div key={w.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 22 }}>{MEDALS[i]}</div>
                    <div style={{
                      width: 52, height: 52, borderRadius: "50%",
                      background: `linear-gradient(135deg,${PALETTE[i]},${C.ash}33)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, fontWeight: 700, color: "#000",
                      boxShadow: `0 0 20px ${PALETTE[i]}66`,
                    }}>{w.name[0]}</div>
                    <div style={{ fontSize: 12, color: C.ash, fontWeight: 600, textAlign: "center", maxWidth: 90 }}>{w.name.split(" ")[0]}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: PALETTE[i] }}>₦{w.balance.toLocaleString()}</div>
                    <div style={{
                      width: 80, height: h,
                      background: `linear-gradient(180deg,${PALETTE[i]}44,${PALETTE[i]}22)`,
                      border: `1px solid ${PALETTE[i]}44`,
                      borderRadius: "8px 8px 0 0",
                      display: "flex", alignItems: "flex-start", justifyContent: "center",
                      paddingTop: 8,
                    }}>
                      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: PALETTE[i] }}>#{i + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full table */}
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", borderBottom: `1px solid #ffffff07`, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray }}>Rank · Worker</span>
              <div style={{ display: "flex", gap: 40 }}>
                {["Rating","Jobs Done","Earnings"].map(l => (
                  <span key={l} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.gray, minWidth: 70, textAlign: "right" }}>{l}</span>
                ))}
              </div>
            </div>
            {ranked.map((w, i) => (
              <div key={w.id} style={{
                padding: "14px 18px", display: "flex", alignItems: "center", gap: 14,
                borderBottom: `1px solid #ffffff05`,
                background: i < 3 ? `${PALETTE[i]}06` : "transparent",
                transition: "background .2s",
              }}>
                <div style={{ width: 28, fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: i < 3 ? PALETTE[i] : C.gray, fontWeight: 700, textAlign: "center", flexShrink: 0 }}>
                  {i < 3 ? MEDALS[i] : `#${i+1}`}
                </div>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${PALETTE[i % PALETTE.length]},${C.ash}22)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#000", flexShrink: 0, overflow: "hidden" }}>
                  {(w as any).avatarUrl ? <img src={(w as any).avatarUrl} alt={w.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : w.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 13, color: C.ash, fontWeight: 600 }}>{w.name}</div>
                    {(w as any).isVerified && <span style={{ fontSize: 9, padding: "1px 6px", background: "#00E5FF22", border: "1px solid #00E5FF44", borderRadius: 8, color: "#00E5FF" }}>✓</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 11, color: C.gray }}>{w.skills[0]}</div>
                    {(() => { const lvl = getLevel(w.history.filter(h => h.status === "Approved").length); return <span style={{ fontSize: 9, padding: "1px 6px", background: lvl.color + "22", border: `1px solid ${lvl.color}44`, borderRadius: 8, color: lvl.color, fontFamily: "'Barlow Condensed',sans-serif" }}>{lvl.icon} {lvl.label}</span>; })()}
                  </div>
                </div>
                <div style={{ minWidth: 80, textAlign: "right" }}>
                  <StarRating rating={w.rating || 0} count={w.ratingCount || 0} />
                </div>
                <div style={{ minWidth: 70, textAlign: "right", fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: C.cyan }}>
                  {w.history.filter(h => h.status === "Approved").length}
                </div>
                <div style={{ minWidth: 80, textAlign: "right", fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: PALETTE[i < PALETTE.length ? i : 0] }}>
                  ₦{w.balance.toLocaleString()}
                </div>
              </div>
            ))}
            <div style={{ padding: "10px 18px", borderTop: `1px solid #ffffff07`, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: C.gray }}>Studio total paid out</span>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: C.gold }}>₦{totalPaid.toLocaleString()}</span>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

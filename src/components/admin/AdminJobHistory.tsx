import { useState } from "react";
import { C } from "../../data/seed";
import { Eyebrow, SectionTitle, GlowDivider, Badge, Card, statusColor, diffColor } from "../shared";
import type { Job, Worker } from "../../types";

export function AdminJobHistory({ jobs, workers }: { jobs: Job[]; workers: Worker[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const completed = jobs
    .filter(j => j.submissions.length > 0)
    .filter(j => statusFilter === "All" || j.status === statusFilter)
    .filter(j => {
      if (!search) return true;
      const w = workers.find(wk => wk.id === j.submissions[j.submissions.length - 1]?.workerId);
      return j.title.toLowerCase().includes(search.toLowerCase()) ||
        w?.name.toLowerCase().includes(search.toLowerCase()) || false;
    })
    .sort((a, b) => {
      const aDate = a.submissions[a.submissions.length - 1]?.submittedAt || 0;
      const bDate = b.submissions[b.submissions.length - 1]?.submittedAt || 0;
      return bDate - aDate;
    });

  const totalPaid = jobs
    .filter(j => j.status === "Approved")
    .reduce((sum, j) => sum + (j.submissions[j.submissions.length - 1]?.pay || j.pay), 0);

  return (
    <div>
      <Eyebrow color={C.violet2}>Admin</Eyebrow>
      <SectionTitle>Job History</SectionTitle>
      <GlowDivider colors={[C.violet2, C.cyan]} />

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 24 }}>
        {([
          ["Total Submitted", jobs.filter(j => j.submissions.length > 0).length, C.cyan],
          ["Approved", jobs.filter(j => j.status === "Approved").length, C.lime],
          ["Rejected", jobs.filter(j => j.status === "Open" && j.submissions.length === 0 && j.posted < Date.now() - 3600000).length, C.ember],
          ["Total Paid Out", `₦${totalPaid.toLocaleString()}`, C.gold],
        ] as [string, string | number, string][]).map(([label, val, color]) => (
          <Card key={label} style={{ padding: "14px 16px" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray, marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color }}>{val}</div>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by job title or worker name..."
            style={{ width: "100%", padding: "10px 14px 10px 36px", background: C.sur, border: "1px solid #ffffff10", borderBottom: `2px solid ${C.violet2}44`, borderRadius: 8, color: C.ash, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "'Inter',sans-serif" }}
          />
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.gray, fontSize: 14 }}>🔍</span>
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: "10px 14px", background: C.sur, border: "1px solid #ffffff10", borderRadius: 8, color: C.gray, fontSize: 12, outline: "none", fontFamily: "'Barlow Condensed',sans-serif" }}
        >
          {["All", "Approved", "Submitted", "Open"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {completed.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
          <div style={{ color: C.gray }}>No job history yet</div>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ padding: "10px 18px", borderBottom: `1px solid #ffffff07`, display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 8 }}>
            {["Job", "Worker", "Status", "Pay", "Date"].map(h => (
              <div key={h} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray }}>{h}</div>
            ))}
          </div>
          {completed.map(j => {
            const sub = j.submissions[j.submissions.length - 1];
            const worker = workers.find(w => w.id === sub?.workerId);
            return (
              <div key={j.id} style={{ padding: "12px 18px", borderBottom: `1px solid #ffffff05`, display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 8, alignItems: "center" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: C.ash, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{j.title}</div>
                  <div style={{ fontSize: 10, color: C.gray, marginTop: 2 }}>{j.category}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {worker ? (
                    <>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg,${C.cyan},${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#000", flexShrink: 0 }}>{worker.name[0]}</div>
                      <span style={{ fontSize: 12, color: C.ash, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{worker.name.split(" ")[0]}</span>
                    </>
                  ) : <span style={{ fontSize: 11, color: C.gray }}>Unknown</span>}
                </div>
                <div><Badge color={statusColor(j.status)}>{j.status}</Badge></div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: j.status === "Approved" ? C.lime : C.gold }}>
                  ₦{(sub?.pay || j.pay).toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif" }}>
                  {sub?.submittedAt ? new Date(sub.submittedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

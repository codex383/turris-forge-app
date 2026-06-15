import { useState, useEffect } from "react";
import { C } from "../../data/seed";
import { Eyebrow, SectionTitle, GlowDivider, Badge, Card, Btn } from "../shared";
import { subscribeToWithdrawals, updateWithdrawal } from "../../lib/withdrawals";
import { sendEmail } from "../../lib/email";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { WithdrawalRequest } from "../../types";

export function AdminWithdrawals({ showToast }: { showToast: (m: string) => void }) {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [filter, setFilter] = useState<"Pending" | "Paid" | "Rejected" | "All">("Pending");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    const unsub = subscribeToWithdrawals(setWithdrawals);
    return () => unsub();
  }, []);

  const filtered = withdrawals.filter(w => filter === "All" || w.status === filter);
  const totalPending = withdrawals.filter(w => w.status === "Pending").reduce((s, w) => s + w.amount, 0);

  const markPaid = async (w: WithdrawalRequest) => {
    try {
      await updateWithdrawal(w.id, { status: "Paid", resolvedAt: Date.now() });
      // Deduct from worker balance
      await updateDoc(doc(db, "users", w.workerId), {
        balance: 0,
      });
      showToast(`✅ ₦${w.amount.toLocaleString()} marked as paid to ${w.workerName}`);
      sendEmail(
        w.workerId,
        w.workerName,
        "Your withdrawal has been processed! 💸",
        `Good news! Your withdrawal request of ₦${w.amount.toLocaleString()} has been processed.\n\nBank: ${w.bankName}\nAccount: ${w.accountNumber}\n\nThe funds should reflect in your account within 24 hours.`
      ).catch(() => {});
    } catch (err: any) {
      showToast("❌ Failed: " + err.message);
    }
  };

  const rejectWithdrawal = async () => {
    if (!rejectId) return;
    try {
      await updateWithdrawal(rejectId, { status: "Rejected", resolvedAt: Date.now(), note: rejectNote || "Rejected by admin" });
      setRejectId(null);
      setRejectNote("");
      showToast("❌ Withdrawal request rejected.");
    } catch (err: any) {
      showToast("❌ Failed: " + err.message);
    }
  };

  return (
    <div>
      <Eyebrow color={C.gold}>Admin</Eyebrow>
      <SectionTitle>Withdrawal Requests</SectionTitle>
      <GlowDivider colors={[C.gold, C.lime]} />

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 24 }}>
        {([
          ["Pending", withdrawals.filter(w => w.status === "Pending").length, C.gold],
          ["Total Pending", `₦${totalPending.toLocaleString()}`, C.ember],
          ["Paid", withdrawals.filter(w => w.status === "Paid").length, C.lime],
          ["Rejected", withdrawals.filter(w => w.status === "Rejected").length, C.gray],
        ] as [string, string|number, string][]).map(([label, val, color]) => (
          <Card key={label} style={{ padding: "14px 16px" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray, marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color }}>{val}</div>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {(["Pending", "Paid", "Rejected", "All"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "7px 16px", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            background: filter === f ? `${C.gold}22` : C.sur,
            color: filter === f ? C.gold : C.gray2,
            border: `1px solid ${filter === f ? C.gold : "#ffffff10"}`,
            borderRadius: 4, cursor: "pointer", transition: "all .2s",
          }}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>💸</div>
          <div style={{ color: C.gray }}>No {filter.toLowerCase()} withdrawal requests</div>
        </Card>
      ) : filtered.map(w => (
        <Card key={w.id} style={{ marginBottom: 14, border: `1px solid ${w.status === "Pending" ? C.gold + "33" : w.status === "Paid" ? C.lime + "33" : "#ffffff10"}`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${w.status === "Paid" ? C.lime : w.status === "Rejected" ? C.ember : C.gold},transparent)` }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${C.gold},${C.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#000", flexShrink: 0 }}>{w.workerName[0]}</div>
                <div>
                  <div style={{ fontSize: 14, color: C.ash, fontWeight: 600 }}>{w.workerName}</div>
                  <div style={{ fontSize: 11, color: C.gray }}>{new Date(w.requestedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
              <div style={{ background: C.bg, borderRadius: 8, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 12, color: C.gray2 }}>🏦 <span style={{ color: C.ash }}>{w.bankName}</span></div>
                <div style={{ fontSize: 12, color: C.gray2 }}>💳 <span style={{ color: C.ash }}>{w.accountNumber}</span></div>
                <div style={{ fontSize: 12, color: C.gray2 }}>👤 <span style={{ color: C.ash }}>{w.accountName}</span></div>
                {w.note && <div style={{ fontSize: 11, color: C.ember, marginTop: 4 }}>Note: {w.note}</div>}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: w.status === "Paid" ? C.lime : C.gold, fontWeight: 700 }}>₦{w.amount.toLocaleString()}</div>
              <Badge color={w.status === "Paid" ? C.lime : w.status === "Rejected" ? C.ember : C.gold}>{w.status}</Badge>
            </div>
          </div>

          {w.status === "Pending" && (
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <Btn onClick={() => markPaid(w)} style={{ flex: 2 }}>✅ Mark as Paid</Btn>
              <Btn variant="danger" onClick={() => { setRejectId(w.id); setRejectNote(""); }} style={{ flex: 1 }}>✕ Reject</Btn>
            </div>
          )}
        </Card>
      ))}

      {/* Reject Modal */}
      {rejectId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.75)", backdropFilter: "blur(6px)" }} onClick={() => setRejectId(null)}>
          <div style={{ width: "min(420px,92vw)", background: "rgba(18,18,24,.99)", border: "1px solid #C0392B44", borderRadius: 16, padding: "28px 24px", boxShadow: "0 24px 60px #000000cc" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: "#E8E4DC", fontWeight: 700, marginBottom: 12 }}>Reject Withdrawal</div>
            <div style={{ fontSize: 13, color: "#6B6870", marginBottom: 16 }}>Provide a reason for rejecting this withdrawal request.</div>
            <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="e.g. Incorrect account details, please resubmit..." style={{ width: "100%", padding: "12px 14px", background: "#0D0D0F", border: "1px solid #ffffff10", borderBottom: "2px solid #C0392B66", borderRadius: 8, color: "#E8E4DC", fontFamily: "'Inter',sans-serif", fontSize: 13, outline: "none", resize: "vertical", minHeight: 80, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setRejectId(null)} style={{ flex: 1, padding: "11px", background: "#22222A", border: "1px solid #ffffff10", borderRadius: 8, color: "#A09890", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700 }}>Cancel</button>
              <button onClick={rejectWithdrawal} style={{ flex: 2, padding: "11px", background: "#C0392B22", border: "1px solid #C0392B55", borderRadius: 8, color: "#C0392B", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700 }}>✕ Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

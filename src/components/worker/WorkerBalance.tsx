import { useState, useEffect } from "react";
import { C } from "../../data/seed";
import { Eyebrow, SectionTitle, GlowDivider, Badge, Card, Btn, Input, statusColor } from "../shared";
import { createWithdrawal, subscribeToWorkerWithdrawals } from "../../lib/withdrawals";
import type { Worker, WithdrawalRequest } from "../../types";

export function WorkerBalance({ user, showToast }: { user: Worker; showToast: (m: string) => void }) {
  const history = user.history || [];
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const totalEarned = history.reduce((s, h) => s + h.amount, 0);
  const completedCount = history.filter(h => h.status === "Approved").length;
  const avgPay = completedCount ? Math.round(totalEarned / completedCount) : 0;
  const pendingWithdrawals = withdrawals.filter(w => w.status === "Pending").reduce((s, w) => s + w.amount, 0);

  useEffect(() => {
    const unsub = subscribeToWorkerWithdrawals(user.id, setWithdrawals);
    return () => unsub();
  }, [user.id]);

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return showToast("⚠️ Enter a valid amount");
    if (parseFloat(amount) > user.balance) return showToast("⚠️ Amount exceeds your balance");
    if (!bankName.trim()) return showToast("⚠️ Enter bank name");
    if (!accountNumber.trim()) return showToast("⚠️ Enter account number");
    if (!accountName.trim()) return showToast("⚠️ Enter account name");

    setSubmitting(true);
    try {
      const w: WithdrawalRequest = {
        id: "wd_" + Date.now(),
        workerId: user.id,
        workerName: user.name,
        amount: parseFloat(amount),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        status: "Pending",
        requestedAt: Date.now(),
      };
      await createWithdrawal(w);
      showToast("✅ Withdrawal request submitted!");
      setAmount(""); setBankName(""); setAccountNumber(""); setAccountName("");
      setShowForm(false);
    } catch (err: any) {
      showToast("❌ Failed: " + err.message);
    }
    setSubmitting(false);
  };

  return (
    <div>
      <Eyebrow color={C.gold}>Creative Portal</Eyebrow>
      <SectionTitle>My Balance</SectionTitle>
      <GlowDivider />

      {/* Balance hero */}
      <Card style={{ marginBottom: 20, background: `linear-gradient(135deg,${C.sur},${C.sur2})`, border: `1px solid ${C.gold}22`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${C.gold},${C.cyan},transparent)` }} />
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: C.gray, marginBottom: 6 }}>Available Balance</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 52, fontWeight: 700, color: C.gold, lineHeight: 1 }}>
              ₦{user.balance.toLocaleString()}
            </div>
            {pendingWithdrawals > 0 && (
              <div style={{ fontSize: 11, color: C.ember, marginTop: 6, fontFamily: "'Barlow Condensed',sans-serif" }}>
                ⏳ ₦{pendingWithdrawals.toLocaleString()} pending withdrawal
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {([["Total Earned", `₦${totalEarned.toLocaleString()}`, C.cyan], ["Jobs Done", completedCount, C.lime], ["Avg Pay", `₦${avgPay.toLocaleString()}`, C.violet2]] as [string, string|number, string][]).map(([l, v, c]) => (
              <div key={l} style={{ textAlign: "center", background: `${c}0f`, border: `1px solid ${c}22`, borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: c }}>{v}</div>
                <div style={{ fontSize: 9, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <Btn onClick={() => setShowForm(p => !p)} style={{ padding: "11px 28px" }}>
            💸 {showForm ? "Cancel" : "Request Withdrawal"}
          </Btn>
        </div>
      </Card>

      {/* Withdrawal Form */}
      {showForm && (
        <Card style={{ marginBottom: 20, border: `1px solid ${C.gold}33` }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, marginBottom: 16 }}>Withdrawal Request</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label={`Amount (₦) — Max ₦${user.balance.toLocaleString()}`} type="number" value={amount} onChange={setAmount} placeholder="Enter amount" />
            <Input label="Bank Name" value={bankName} onChange={setBankName} placeholder="e.g. GTBank, Access Bank" />
            <Input label="Account Number" value={accountNumber} onChange={setAccountNumber} placeholder="10-digit account number" />
            <Input label="Account Name" value={accountName} onChange={setAccountName} placeholder="Name on the account" />
          </div>
          <div style={{ marginTop: 8, padding: "10px 14px", background: `${C.gold}0f`, border: `1px solid ${C.gold}22`, borderRadius: 6, fontSize: 12, color: C.gray2, lineHeight: 1.6 }}>
            💡 Your request will be reviewed by the studio admin. Payment will be sent via bank transfer within 24–48 hours.
          </div>
          <Btn onClick={handleWithdraw} style={{ marginTop: 14, width: "100%", padding: 14 }}>
            {submitting ? "Submitting..." : "📤 Submit Withdrawal Request"}
          </Btn>
        </Card>
      )}

      {/* Withdrawal History */}
      {withdrawals.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.cyan, marginBottom: 16 }}>Withdrawal Requests</div>
          {withdrawals.map(w => (
            <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid #ffffff06` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: C.ash }}>{w.bankName} — {w.accountNumber}</div>
                <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>
                  {new Date(w.requestedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  {w.note && <span style={{ color: C.ember, marginLeft: 8 }}>· {w.note}</span>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <Badge color={w.status === "Paid" ? C.lime : w.status === "Rejected" ? C.ember : C.gold}>{w.status}</Badge>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: w.status === "Paid" ? C.lime : C.gold }}>
                  ₦{w.amount.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Payment History */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, marginBottom: 16 }}>Payment History</div>
        {history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 0", color: C.gray }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
            <div style={{ fontSize: 13 }}>Complete and get your first job approved to see earnings here</div>
          </div>
        ) : history.map((h, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: `1px solid #ffffff06` }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: `${C.lime}18`, border: `1px solid ${C.lime}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>✓</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: C.ash, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.title}</div>
              <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>
                {new Date(h.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
              <Badge color={statusColor(h.status)}>{h.status}</Badge>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: C.lime, minWidth: 80, textAlign: "right" }}>+₦{h.amount.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

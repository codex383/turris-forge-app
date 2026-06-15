import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { C } from "../../data/seed";
import { Eyebrow, SectionTitle, GlowDivider, Card, Btn } from "../shared";

interface Announcement {
  id: string;
  text: string;
  createdAt: number;
  pinned?: boolean;
}

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [text, setText] = useState("");
  const [pinned, setPinned] = useState(false);
  const [posting, setPosting] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
    });
    return () => unsub();
  }, []);

  const post = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, "announcements"), {
        text: text.trim(),
        createdAt: Date.now(),
        pinned,
      });
      setText("");
      setPinned(false);
      showToast("📣 Announcement broadcast to all workers!");
    } catch (e: any) {
      showToast("❌ Failed: " + e.message);
    }
    setPosting(false);
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(db, "announcements", id));
    showToast("Announcement removed.");
  };

  return (
    <div>
      <Eyebrow color={C.gold}>Admin</Eyebrow>
      <SectionTitle>Studio Announcements</SectionTitle>
      <GlowDivider colors={[C.gold, C.ember]} />

      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>
          Broadcast to all workers
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="e.g. Submissions are paused this weekend. New batch of jobs drops Monday 9AM..."
          rows={4}
          style={{ width: "100%", padding: "12px 14px", background: C.bg, border: "1px solid #ffffff10", borderBottom: `2px solid ${C.gold}44`, borderRadius: 8, color: C.ash, fontFamily: "'Inter',sans-serif", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, flexWrap: "wrap", gap: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: C.gray, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>
            <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)}
              style={{ accentColor: C.gold, width: 14, height: 14 }} />
            📌 Pin this announcement
          </label>
          <Btn onClick={post} disabled={posting || !text.trim()}
            style={{ padding: "10px 24px", fontSize: 12, background: `${C.gold}22`, border: `1px solid ${C.gold}55`, color: C.gold, opacity: (!text.trim() || posting) ? 0.5 : 1 }}>
            {posting ? "Posting..." : "📣 Broadcast"}
          </Btn>
        </div>
      </Card>

      {announcements.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "48px 0", color: C.gray }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📣</div>
          No announcements yet
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {announcements.map(a => (
            <Card key={a.id} style={{ borderLeft: `3px solid ${a.pinned ? C.gold : C.sur2}`, position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  {a.pinned && (
                    <div style={{ fontSize: 9, color: C.gold, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
                      📌 Pinned
                    </div>
                  )}
                  <div style={{ fontSize: 14, color: C.ash, lineHeight: 1.6 }}>{a.text}</div>
                  <div style={{ fontSize: 10, color: C.gray, marginTop: 8, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>
                    {new Date(a.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <button onClick={() => remove(a.id)} style={{ background: "none", border: "none", color: C.gray, cursor: "pointer", fontSize: 16, padding: 4, flexShrink: 0 }}>✕</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: C.sur2, border: `1px solid ${C.gold}33`, borderRadius: 10, padding: "12px 24px", color: C.ash, fontSize: 13, zIndex: 500, boxShadow: "0 8px 32px #000000aa" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

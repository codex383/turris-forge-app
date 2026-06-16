import { useState } from "react";
import { C, SKILL_CATEGORIES } from "../../data/seed";
import { Eyebrow, SectionTitle, GlowDivider, Input, Btn, Card } from "../shared";
import { updateDoc, doc } from "firebase/firestore";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import type { Worker } from "../../types";

export function WorkerSettings({ user, setUser, showToast }: {
  user: Worker;
  setUser: (fn: (p: Worker) => Worker) => void;
  showToast: (m: string) => void;
}) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "");
  const [portfolio, setPortfolio] = useState(user.portfolio || "");
  const [selectedSkills, setSelectedSkills] = useState(user.skills || []);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  const toggleSkill = (s: string) =>
    setSelectedSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return showToast("⚠️ Only image files allowed");
    setUploadingAvatar(true);
    try {
      const uploaded = await uploadToCloudinary(file, "avatars");
      await updateDoc(doc(db, "users", user.id), { avatarUrl: uploaded.url });
      setUser(p => ({ ...p, avatarUrl: uploaded.url } as any));
      showToast("✅ Profile picture updated!");
    } catch (err: any) {
      showToast("❌ Upload failed: " + err.message);
    }
    setUploadingAvatar(false);
  };

  const saveProfile = async () => {
    if (!name.trim()) return showToast("⚠️ Name cannot be empty");
    if (selectedSkills.length === 0) return showToast("⚠️ Select at least one skill");
    setSaving(true);
    try {
      const updates = { name: name.trim(), bio, portfolio, skills: selectedSkills };
      await updateDoc(doc(db, "users", user.id), updates);
      setUser(p => ({ ...p, ...updates }));
      showToast("✅ Profile updated!");
    } catch (err: any) {
      showToast("❌ Failed to save: " + err.message);
    }
    setSaving(false);
  };

  const changePassword = async () => {
    if (!currentPass) return showToast("⚠️ Enter your current password");
    if (newPass.length < 6) return showToast("⚠️ New password must be at least 6 characters");
    if (newPass !== confirmPass) return showToast("⚠️ Passwords do not match");
    setChangingPass(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) throw new Error("Not logged in");
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPass);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, newPass);
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
      showToast("✅ Password changed successfully!");
    } catch (err: any) {
      showToast("❌ " + (err.code === "auth/wrong-password" ? "Current password is incorrect" : err.message));
    }
    setChangingPass(false);
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <Eyebrow color={C.gray2}>Creative Portal</Eyebrow>
      <SectionTitle>Profile & Settings</SectionTitle>
      <GlowDivider colors={[C.gray, C.cyan]} />

      {/* Profile Header */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: `linear-gradient(135deg,${C.cyan},${C.teal})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 700, color: "#000",
              boxShadow: `0 0 20px ${C.cyan}44`, overflow: "hidden",
            }}>
              {(user as any).avatarUrl
                ? <img src={(user as any).avatarUrl} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : user.name[0]}
            </div>
            <label style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 11, boxShadow: "0 2px 6px #000000aa" }} title="Upload photo">
              {uploadingAvatar ? "..." : "C"}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
            </label>
          </div>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: C.ash, fontWeight: 700 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{user.email}</div>
            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
              <span style={{ fontSize: 11, color: C.gold }}>★ {user.rating > 0 ? user.rating.toFixed(1) : "—"}</span>
              <span style={{ fontSize: 11, color: C.gray }}>₦{(user.balance || 0).toLocaleString()} balance</span>
              <span style={{ fontSize: 11, color: C.cyan }}>{(user.skills || []).length} skills</span>
            </div>
          </div>
        </div>

        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: C.violet2, marginBottom: 16 }}>Edit Profile</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Display Name" value={name} onChange={setName} placeholder="Your forge name" />
          <Input label="Bio" value={bio} onChange={setBio} placeholder="Your creative background..." />
          <Input label="Portfolio URL" value={portfolio} onChange={setPortfolio} placeholder="https://artstation.com/you" />
        </div>
      </Card>

      {/* Skills */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: C.gold, marginBottom: 4 }}>My Skill Categories</div>
        <div style={{ fontSize: 11, color: C.gray, marginBottom: 14 }}>{selectedSkills.length} selected</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SKILL_CATEGORIES.map(s => (
            <button key={s} onClick={() => toggleSkill(s)} style={{
              padding: "6px 12px",
              fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
              background: selectedSkills.includes(s) ? `${C.gold}22` : C.sur2,
              color: selectedSkills.includes(s) ? C.gold : C.gray2,
              border: `1px solid ${selectedSkills.includes(s) ? C.gold : "#ffffff10"}`,
              borderRadius: 4, cursor: "pointer", transition: "all .2s",
            }}>
              {selectedSkills.includes(s) ? "✓ " : ""}{s}
            </button>
          ))}
        </div>
      </Card>

      <Btn onClick={saveProfile} style={{ padding: "13px 40px", marginBottom: 24 }}>
        {saving ? "Saving..." : "💾 Save Profile"}
      </Btn>

      {/* Password Change */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: C.cyan, marginBottom: 16 }}>Change Password</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Current Password" type="password" value={currentPass} onChange={setCurrentPass} placeholder="Your current password" />
          <Input label="New Password (min 6 chars)" type="password" value={newPass} onChange={setNewPass} placeholder="New password" />
          <Input label="Confirm New Password" type="password" value={confirmPass} onChange={setConfirmPass} placeholder="Repeat new password" />
        </div>
        <Btn onClick={changePassword} style={{ marginTop: 16, padding: "11px 28px" }}>
          {changingPass ? "Changing..." : "🔒 Change Password"}
        </Btn>
      </Card>
    </div>
  );
}

import { getUserProfile } from "../lib/userProfile";
import { useState } from "react";
import { C, SKILL_CATEGORIES, ADMIN_SECRET } from "../data/seed";
import { Logo } from "./Logo";
import { Toast } from "./Toast";
import { Input, Select, Btn } from "./shared";
import { login, register, resetPassword } from "../lib/authFirebase";
import { createUserProfile } from "../lib/userProfile";
import type { Worker } from "../types";

type AdminUser = { id: string; name: string; email: string; role: "admin"; balance: number };
type AnyUser = Worker | AdminUser;

export function AuthScreen({ onAuth }: { onAuth: (u: AnyUser, stored: StoredUser) => void }) {
  const [mode, setMode] = useState<"login" | "register-worker" | "register-admin">("login");
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [name, setName] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPass, setRPass] = useState("");
  const [rPass2, setRPass2] = useState("");
  const [showRPass, setShowRPass] = useState(false);
  const [secret, setSecret] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [bio, setBio] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [studioRole, setStudioRole] = useState("Studio Director");

  const toggleSkill = (s: string) =>
    setSelectedSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

const handleLogin = async () => {
  try {
    // 1. Firebase login
    const res = await login(email, pass);

    const user = res.user;

    // 2. Load Firestore profile
    const profile = await getUserProfile(user.uid);

    if (!profile) {
      alert("Profile not found in Firestore");
      return;
    }

    console.log("Full user profile:", profile);

    // 3. Send to app
    onAuth(
      {
        id: profile.uid,
        name: profile.name,
        email: profile.email,
        role: profile.role === "admin" ? "admin" : "worker",
        balance: 0
      },
      profile
    );

  } catch (err: any) {
    alert(err.message);
  }
};

const handleRegister = async () => {
  try {
    const res = await register(email, pass);

    // THEN continue your worker/admin flow if needed
    console.log("Created Firebase user:", res.user);

  } catch (err: any) {
    alert(err.message);
  }
};

const handleRegisterWorker = async () => {
  if (step === 1) {
    if (!name.trim()) return setToast("Enter name");
    if (!rEmail.trim()) return setToast("Enter email");
    if (rPass.length < 6) return setToast("Password too short");
    if (rPass !== rPass2) return setToast("Passwords do not match");

    setStep(2);
    return;
  }

  if (selectedSkills.length === 0) {
    return setToast("Select at least one skill");
  }

  try {
  const cred = await register(rEmail.trim(), rPass);

  await createUserProfile({
    uid: cred.user.uid,
    name: name.trim(),
    email: rEmail.trim(),
    role: "worker",
    balance: 0,
    skills: selectedSkills,
    bio,
    portfolio,
  });

  setToast("Account created!");

} catch (err: any) {
  setToast(err.message);
}
};
  
const handleRegisterAdmin = async () => {
  if (!name.trim()) return setToast("Enter name");
  if (!rEmail.trim()) return setToast("Enter email");
  if (rPass.length < 6) return setToast("Password too short");
  if (secret !== ADMIN_SECRET) return setToast("Wrong secret");

  try {
  const cred = await register(rEmail.trim(), rPass);

  await createUserProfile({
    uid: cred.user.uid,
    name: name.trim(),
    email: rEmail.trim(),
    role: "admin",
    balance: 0,
  });

  setToast("Admin account created!");

} catch (err: any) {
  setToast(err.message);
}
};

  const tabLabels = ["Log In", "Join as Creative", "Admin Access"];
  const tabModes = ["login", "register-worker", "register-admin"] as const;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "80px 16px 60px", position: "relative", zIndex: 1,
    }}>
      <div style={{ width: "100%", maxWidth: 500, animation: "slideUp .5s cubic-bezier(.22,.68,0,1.2) both" }}>

        {/* Card */}
        <div style={{
          background: "rgba(22,22,28,.97)",
          backdropFilter: "blur(24px)",
          borderRadius: 18,
          padding: "40px 36px 36px",
          border: "1px solid #ffffff0c",
          position: "relative", overflow: "hidden",
          boxShadow: "0 32px 80px #00000099, 0 0 0 1px #ffffff06 inset",
        }}>
          {/* Rainbow top bar */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg,${C.violet},${C.pink},${C.gold},${C.cyan})`,
            backgroundSize: "200%", animation: "authBar 3s linear infinite",
          }} />

          {/* Logo + Title */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ display: "inline-block", filter: `drop-shadow(0 0 14px ${C.gold})`, marginBottom: 10 }}>
              <Logo size={44} />
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: C.gold }}>
              TURRIS FORGE · STUDIO PLATFORM
            </div>
          </div>

          {/* Mode tabs */}
          <div style={{ display: "flex", gap: 0, background: C.bg, borderRadius: 9, padding: 3, marginBottom: 28, border: "1px solid #ffffff08" }}>
            {tabModes.map((m, i) => (
              <button key={m} onClick={() => { setMode(m); setStep(1); }} style={{
                flex: 1, padding: "8px 4px",
                fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                background: mode === m ? `linear-gradient(135deg,${C.violet}55,${C.cyan}33)` : "none",
                color: mode === m ? C.ash : C.gray,
                border: "none", borderRadius: 7, cursor: "pointer",
                boxShadow: mode === m ? `0 0 20px ${C.violet}44` : "none",
                transition: "all .3s",
              }}>
                {tabLabels[i]}
              </button>
            ))}
          </div>

          {/* ── LOGIN ── */}
          {mode === "login" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeSlideIn .3s ease" }}>
              <Input label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@forge.com" />
              <div style={{ position: "relative" }}>
                <Input label="Password" type={showPass ? "text" : "password"} value={pass} onChange={setPass} placeholder="Your password" />
                <button onClick={() => setShowPass(p => !p)} style={{ position: "absolute", right: 12, bottom: 13, background: "none", border: "none", color: C.gray, cursor: "pointer", fontSize: 12, fontFamily: "'Barlow Condensed',sans-serif" }}>
                  {showPass ? "HIDE" : "SHOW"}
                </button>
              </div>
              <Btn onClick={handleLogin} style={{ width: "100%", padding: 15, marginTop: 2 }}>⚡ Enter the Forge</Btn>
     
<div style={{ textAlign: "center", marginTop: 6 }}>
  <button onClick={() => { setShowReset(true); setResetEmail(email); setResetSent(false); }} style={{ background: "none", border: "none", color: C.gray, cursor: "pointer", fontSize: 12, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em", textDecoration: "underline" }}>
    Forgot Password?
  </button>
</div>

{/* Reset Password Modal */}
{showReset && (
  <div style={{ position: "fixed", inset: 0, zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.7)", backdropFilter: "blur(6px)" }} onClick={() => setShowReset(false)}>
    <div style={{ width: "min(420px,92vw)", background: "rgba(18,18,24,.99)", border: `1px solid ${C.gold}33`, borderRadius: 16, padding: "32px 28px", boxShadow: `0 24px 60px #000000cc`, animation: "slideUp .28s cubic-bezier(.22,.68,0,1.2) both" }} onClick={e => e.stopPropagation()}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: C.ash, fontWeight: 700, marginBottom: 6 }}>Reset Password</div>
      {resetSent ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
          <div style={{ fontSize: 14, color: C.ash, marginBottom: 8 }}>Reset email sent!</div>
          <div style={{ fontSize: 12, color: C.gray, marginBottom: 20 }}>Check your inbox at <span style={{ color: C.gold }}>{resetEmail}</span> and follow the link to reset your password.</div>
          <Btn onClick={() => setShowReset(false)} style={{ width: "100%" }}>← Back to Login</Btn>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, color: C.gray, marginBottom: 20, lineHeight: 1.6 }}>Enter your email and we'll send you a link to reset your password.</div>
          <Input label="Email Address" type="email" value={resetEmail} onChange={setResetEmail} placeholder="you@forge.com" />
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Btn variant="subtle" onClick={() => setShowReset(false)} style={{ flex: 1 }}>Cancel</Btn>
            <Btn onClick={async () => {
              if (!resetEmail.trim()) return setToast("Enter your email");
              try {
                await resetPassword(resetEmail.trim());
                setResetSent(true);
              } catch (err: any) {
                setToast(err.message);
              }
            }} style={{ flex: 2 }}>📧 Send Reset Link</Btn>
          </div>
        </>
      )}
    </div>
  </div>
)}         


            </div>
          )}

          {/* ── REGISTER WORKER ── */}
          {mode === "register-worker" && (
            <div style={{ animation: "fadeSlideIn .3s ease" }}>
              {/* Step indicator */}
              <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
                {[1, 2].map(s => (
                  <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: step >= s ? `linear-gradient(90deg,${C.gold},${C.cyan})` : C.sur2, transition: "background .4s" }} />
                ))}
              </div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: C.gray, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>
                Step {step} of 2 — {step === 1 ? "Your Details" : "Your Skills"}
              </div>

              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeSlideIn .3s ease" }}>
                  <Input label="Display Name" value={name} onChange={setName} placeholder="Your forge name" />
                  <Input label="Email" type="email" value={rEmail} onChange={setREmail} placeholder="you@example.com" />
                  <div style={{ position: "relative" }}>
                    <Input label="Password (min 6 chars)" type={showRPass ? "text" : "password"} value={rPass} onChange={setRPass} placeholder="Strong password" />
                    <button onClick={() => setShowRPass(p => !p)} style={{ position: "absolute", right: 12, bottom: 13, background: "none", border: "none", color: C.gray, cursor: "pointer", fontSize: 12, fontFamily: "'Barlow Condensed',sans-serif" }}>
                      {showRPass ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  <Input label="Confirm Password" type="password" value={rPass2} onChange={setRPass2} placeholder="Repeat password" />
                  <Input label="Bio (optional)" value={bio} onChange={setBio} placeholder="Your creative background..." />
                  <Input label="Portfolio URL (optional)" value={portfolio} onChange={setPortfolio} placeholder="https://artstation.com/you" />
                  <Btn onClick={handleRegisterWorker} style={{ width: "100%", padding: 14, marginTop: 2 }}>Next → Select Skills</Btn>
                </div>
              )}

              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeSlideIn .3s ease" }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gray2 }}>
                    Select Your Skill Categories
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, maxHeight: 240, overflowY: "auto", padding: "2px 0" }}>
  
                  {SKILL_CATEGORIES.map(s => (
                      <button key={s} onClick={() => toggleSkill(s)} style={{
                        padding: "6px 11px",
                        fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
                        background: selectedSkills.includes(s) ? `${C.gold}22` : C.sur2,
                        color: selectedSkills.includes(s) ? C.gold : C.gray2,
                        border: `1px solid ${selectedSkills.includes(s) ? C.gold : "#ffffff10"}`,
                        borderRadius: 4, cursor: "pointer", transition: "all .18s",
                        transform: selectedSkills.includes(s) ? "scale(1.03)" : "scale(1)",
                      }}>
                        {selectedSkills.includes(s) ? "✓ " : ""}{s}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: C.gray }}>{selectedSkills.length} selected</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Btn variant="subtle" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</Btn>
                    <Btn onClick={handleRegisterWorker} style={{ flex: 2, padding: 14 }}>🔥 Join the Forge</Btn>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── REGISTER ADMIN ── */}
          {mode === "register-admin" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeSlideIn .3s ease" }}>
              <Input label="Your Name" value={name} onChange={setName} placeholder="Studio admin name" />
              <Input label="Email" type="email" value={rEmail} onChange={setREmail} placeholder="admin@turrisforge.com" />
              <Input label="Password (min 6 chars)" type="password" value={rPass} onChange={setRPass} placeholder="Strong password" />
              <Select label="Your Studio Role" value={studioRole} onChange={setStudioRole} options={["Studio Director","Executive Producer","Production Manager","Lead Animator","Art Director"]} />
              <div style={{ padding: "12px 14px", background: `${C.gold}0f`, border: `1px solid ${C.gold}22`, borderRadius: 8, fontSize: 12, color: C.gray2, lineHeight: 1.5 }}>
                🔒 Admin accounts require a secret code issued by the studio director. <span style={{ color: C.gold }}>Ask the admin for the secret code.</span>
              </div>
              <Input label="Admin Secret Code" type="password" value={secret} onChange={setSecret} placeholder="Studio-issued access code" />
              <Btn onClick={handleRegisterAdmin} style={{ width: "100%", padding: 14 }}>🏰 Access Admin Portal</Btn>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div style={{ marginTop: 16, background: `linear-gradient(135deg,${C.violet}12,${C.cyan}0a)`, border: `1px solid ${C.violet}22`, borderRadius: 12, padding: "16px 18px", animation: "slideUp .6s .1s cubic-bezier(.22,.68,0,1.2) both" }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: C.violet2, marginBottom: 10 }}>🏆 Why Join Turris Forge?</div>
          {([
            [C.gold,"Real pay for real animation work"],
            [C.cyan,"Africa's first anime studio — Iron Bound & Redmask"],
            [C.violet2,"Build your portfolio with original IPs"],
            [C.lime,"Performance bonuses & priority tasks"],
            [C.pink,"Your name in the credits of our first release"],
          ] as [string, string][]).map(([col, txt]) => (
            <div key={txt} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: col, flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: C.gray2 }}>{txt}</div>
            </div>
          ))}
        </div>
      </div>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

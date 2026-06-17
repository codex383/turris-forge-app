import type { Worker } from "../types";

export function getWorkerRank(worker: Worker, allWorkers: Worker[]): number {
  const ranked = [...allWorkers].sort((a, b) => b.balance - a.balance);
  const idx = ranked.findIndex(w => w.id === worker.id);
  return idx === -1 ? 999 : idx + 1;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function getFrameConfig(rank: number) {
  if (rank === 1) return {
    image: `${BASE}/frames/turris-master.png`,
    label: "Turris Master",
    color: "#A855F7",
    glow: "0 0 24px #A855F788, 0 0 48px #A855F744",
    badge: "👑",
  };
  if (rank === 2) return {
    image: `${BASE}/frames/forge-commander.png`,
    label: "Forge Commander",
    color: "#00BFFF",
    glow: "0 0 20px #00BFFF88, 0 0 40px #00BFFF44",
    badge: "🔵",
  };
  if (rank === 3) return {
    image: `${BASE}/frames/iron-artisan.png`,
    label: "Iron Artisan",
    color: "#FFD700",
    glow: "0 0 18px #FFD70088, 0 0 36px #FFD70044",
    badge: "🥇",
  };
  if (rank === 4) return {
    image: `${BASE}/frames/forge-blade.png`,
    label: "Forge Blade",
    color: "#C0C0C0",
    glow: "0 0 14px #C0C0C088, 0 0 28px #C0C0C044",
    badge: "⚔️",
  };
  if (rank === 5) return {
    image: `${BASE}/frames/studio-initiate.png`,
    label: "Studio Initiate",
    color: "#CD7F32",
    glow: "0 0 12px #CD7F3288, 0 0 24px #CD7F3244",
    badge: "🟤",
  };
  return {
    image: null,
    label: "",
    color: "#ffffff22",
    glow: "none",
    badge: "",
  };
}

interface WorkerAvatarProps {
  worker: Worker;
  allWorkers: Worker[];
  size?: number;
  fontSize?: number;
  showBadge?: boolean;
}

export function WorkerAvatar({
  worker,
  allWorkers,
  size = 48,
  fontSize = 18,
  showBadge = true,
}: WorkerAvatarProps) {
  const rank = allWorkers.length > 0 ? getWorkerRank(worker, allWorkers) : 999;
  const frame = getFrameConfig(rank);

  // Frame image is bigger than avatar to show decorations around it
  const frameSize = size * 1.9;
  const frameOffset = (frameSize - size) / 2;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>

      {/* Avatar circle */}
      <div style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        fontWeight: 700,
        color: "#000",
        background: `linear-gradient(135deg,${frame.color}88,${frame.color}33)`,
        boxShadow: frame.image ? frame.glow : "none",
        position: "relative",
        zIndex: 1,
      }}>
        {(worker as any).avatarUrl
          ? <img src={(worker as any).avatarUrl} alt={worker.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{
              width: "100%", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `linear-gradient(135deg,${frame.color}66,${frame.color}22)`,
              color: "#fff", fontSize, fontWeight: 700,
            }}>{worker.name[0]}</span>
        }
      </div>

      {/* Frame image overlay — centered over avatar, bigger to show decorations */}
      {frame.image && (
        <img
          src={frame.image}
          alt={frame.label}
          style={{
            position: "absolute",
            top: -frameOffset,
            left: -frameOffset,
            width: frameSize,
            height: frameSize,
            objectFit: "contain",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      )}

      {/* Rank badge */}
      {showBadge && frame.badge && (
        <div style={{
          position: "absolute",
          bottom: -4,
          right: -6,
          fontSize: size < 40 ? 9 : size < 55 ? 12 : 15,
          lineHeight: 1,
          zIndex: 3,
          filter: "drop-shadow(0 0 4px rgba(0,0,0,0.9))",
        }}>{frame.badge}</div>
      )}

      {/* Rank label tooltip on hover (only for larger sizes) */}
      {frame.label && size >= 60 && (
        <div style={{
          position: "absolute",
          bottom: -22,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 9,
          color: frame.color,
          fontFamily: "'Barlow Condensed',sans-serif",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          zIndex: 3,
          textShadow: `0 0 8px ${frame.color}`,
        }}>{frame.label}</div>
      )}
    </div>
  );
}

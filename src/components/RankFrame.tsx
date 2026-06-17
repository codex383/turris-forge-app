import type { Worker } from "../types";

export const RANK_FRAMES = [
  {
    rank: 1,
    title: "Turris Master",
    url: "https://res.cloudinary.com/dhbpc2mog/image/upload/v1781686323/100299-removebg-preview_tnp1rh.png",
    color: "#9B59B6",
    glow: "#9B59B644",
  },
  {
    rank: 2,
    title: "Forge Commander",
    url: "https://res.cloudinary.com/dhbpc2mog/image/upload/v1781686322/100302-removebg-preview_icyawj.png",
    color: "#00E5FF",
    glow: "#00E5FF44",
  },
  {
    rank: 3,
    title: "Iron Artisan",
    url: "https://res.cloudinary.com/dhbpc2mog/image/upload/v1781686323/100303-removebg-preview_tzgjay.png",
    color: "#E8912A",
    glow: "#E8912A44",
  },
  {
    rank: 4,
    title: "Forge Blade",
    url: "https://res.cloudinary.com/dhbpc2mog/image/upload/v1781686319/100304-removebg-preview_nm3boz.png",
    color: "#A09890",
    glow: "#A0989044",
  },
  {
    rank: 5,
    title: "Studio Initiate",
    url: "https://res.cloudinary.com/dhbpc2mog/image/upload/v1781686321/100305-removebg-preview_qbvdkr.png",
    color: "#CD7F32",
    glow: "#CD7F3244",
  },
];

export const getWorkerRank = (worker: Worker, allWorkers: Worker[]): number => {
  const sorted = [...allWorkers].sort((a, b) => b.balance - a.balance);
  const index = sorted.findIndex(w => w.id === worker.id);
  return index + 1;
};

export const getRankFrame = (worker: Worker, allWorkers: Worker[]) => {
  const rank = getWorkerRank(worker, allWorkers);
  return RANK_FRAMES.find(f => f.rank === rank) || null;
};

export function RankFrame({
  worker,
  allWorkers,
  size = 52,
  showTitle = false,
}: {
  worker: Worker;
  allWorkers: Worker[];
  size?: number;
  showTitle?: boolean;
}) {
  const frame = getRankFrame(worker, allWorkers);
  const avatarUrl = (worker as any).avatarUrl;
  const initial = worker.name?.[0] || "?";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {/* Avatar */}
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: frame
          ? `radial-gradient(circle, ${frame.color}33, #1A1A1F)`
          : "linear-gradient(135deg,#00E5FF,#00F5CC)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.4, fontWeight: 700, color: "#000",
        boxShadow: frame ? `0 0 ${size * 0.4}px ${frame.glow}` : "none",
        overflow: "hidden",
        position: "relative", zIndex: 1,
      }}>
        {avatarUrl
          ? <img src={avatarUrl} alt={worker.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : initial}
      </div>

      {/* Frame overlay */}
      {frame && (
        <img
          src={frame.url}
          alt={frame.title}
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: size * 1.8,
            height: size * 1.8,
            objectFit: "contain",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Rank title */}
      {showTitle && frame && (
        <div style={{
          position: "absolute", bottom: -18, left: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap",
          fontSize: 9, color: frame.color,
          fontFamily: "'Barlow Condensed',sans-serif",
          fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase",
          textShadow: `0 0 6px ${frame.glow}`,
          zIndex: 3,
        }}>
          {frame.title}
        </div>
      )}
    </div>
  );
}

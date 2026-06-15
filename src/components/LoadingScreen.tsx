import { useState, useEffect, useCallback } from "react";
import { C } from "../data/seed";
import { Logo } from "./Logo";

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);

  const stableDone = useCallback(onDone, [onDone]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => setPhase(3), 1600);
    const t4 = setTimeout(() => setPhase(4), 1900);
    const t5 = setTimeout(() => { setPhase(5); setTimeout(stableDone, 900); }, 3800);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [stableDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999, background: "#000",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 28, transition: "opacity .9s, clipPath .9s",
      opacity: phase === 5 ? 0 : 1,
      clipPath: phase === 5 ? "circle(0% at 50% 50%)" : "circle(100% at 50% 50%)",
      pointerEvents: phase === 5 ? "none" : "all",
    }}>
      <div style={{
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? "scale(1)" : "scale(2)",
        filter: `drop-shadow(0 0 30px ${C.gold})`,
        transition: "all .6s",
      }}>
        <Logo size={70} />
      </div>
      <div style={{
        fontFamily: "'Cormorant Garamond',serif",
        fontSize: "clamp(32px,6vw,64px)",
        fontWeight: 700, letterSpacing: "0.4em", color: C.gold,
        textShadow: `0 0 40px ${C.gold}, 0 0 80px ${C.gold}66`,
        opacity: phase >= 2 ? 1 : 0,
        transform: phase >= 2 ? "scaleX(1)" : "scaleX(0.4)",
        transition: "all .8s cubic-bezier(.4,0,.2,1)",
      }}>
        TURRIS FORGE
      </div>
      <div style={{
        fontFamily: "'Barlow Condensed',sans-serif",
        fontSize: 13, letterSpacing: "0.35em",
        color: C.gold, opacity: phase >= 3 ? 1 : 0,
        transition: "opacity .5s", textTransform: "uppercase",
      }}>
        Forged in Darkness. Animated in Fire.
      </div>
      <div style={{
        width: 240, height: 2, background: `${C.gold}30`,
        borderRadius: 2, overflow: "hidden",
        opacity: phase >= 4 ? 1 : 0, transition: "opacity .3s",
      }}>
        <div style={{
          height: "100%", borderRadius: 2,
          background: `linear-gradient(90deg,${C.gold},${C.cyan},${C.violet2},${C.gold})`,
          backgroundSize: "300%",
          width: phase >= 4 ? "100%" : "0%",
          transition: phase >= 4 ? "width 1.8s cubic-bezier(.4,0,.2,1)" : "none",
          animation: "shimmer 1s linear infinite",
        }} />
      </div>
    </div>
  );
}

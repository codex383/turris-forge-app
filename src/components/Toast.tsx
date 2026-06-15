import { useEffect } from "react";
import { C } from "../data/seed";

export function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 32, right: 32, zIndex: 9999,
      background: C.sur, border: `1px solid ${C.gold}33`,
      borderLeft: `3px solid ${C.gold}`, borderRadius: 8,
      padding: "14px 22px", fontSize: 14, color: C.ash,
      boxShadow: "0 10px 40px #00000080",
      animation: "toastIn .4s cubic-bezier(.4,0,.2,1)",
    }}>
      {msg}
    </div>
  );
}

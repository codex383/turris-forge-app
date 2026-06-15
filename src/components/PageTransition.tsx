import { useEffect, useRef, useState } from "react";

interface Props {
  viewKey: string;
  direction: "forward" | "back";
  children: React.ReactNode;
}

export function PageTransition({ viewKey, direction, children }: Props) {
  const [animClass, setAnimClass] = useState<"in" | "idle">("in");
  const prevKey = useRef(viewKey);

  useEffect(() => {
    if (prevKey.current !== viewKey) {
      prevKey.current = viewKey;
      setAnimClass("in");
      const t = setTimeout(() => setAnimClass("idle"), 380);
      return () => clearTimeout(t);
    }
  }, [viewKey]);

  const fromX = direction === "forward" ? "32px" : "-32px";

  return (
    <div
      key={viewKey}
      style={{
        animation: animClass === "in"
          ? `pageSlideIn .35s cubic-bezier(.22,.68,0,1.2) both`
          : "none",
        "--from-x": fromX,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

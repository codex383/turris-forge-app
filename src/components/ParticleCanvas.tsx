import { useEffect, useRef } from "react";

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const COLORS = [[232,145,42],[0,229,255],[192,84,252],[255,0,110],[168,255,62],[0,245,204]];
    const particles = Array.from({ length: 140 }, () => {
      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.5,
        sy: Math.random() * 1.2 + 0.3,
        sx: (Math.random() - 0.5) * 0.5,
        op: Math.random() * 0.6 + 0.1,
        decay: Math.random() * 0.003 + 0.001,
        color: c,
      };
    });
    let af: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y -= p.sy; p.x += p.sx; p.op -= p.decay;
        if (p.op <= 0 || p.y < -10) {
          p.x = Math.random() * canvas.width; p.y = canvas.height + 10;
          p.op = Math.random() * 0.6 + 0.1;
          const c2 = COLORS[Math.floor(Math.random() * COLORS.length)]; p.color = c2;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.op})`;
        ctx.fill();
      });
      af = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(af); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }} />;
}

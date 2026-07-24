"use client";

import { useEffect, useRef } from "react";
import qrcode from "qrcode";

type MatrixData = { ms: number; data: number[][] };

function buildMatrix(): MatrixData | null {
  try {
    const qrData = qrcode.create("https://amarqr.online", { errorCorrectionLevel: "H", version: 6 });
    const matrix = qrData.modules;
    const ms = matrix.size;
    const data: number[][] = [];
    for (let r = 0; r < ms; r++) {
      data[r] = [];
      for (let c = 0; c < ms; c++) {
        data[r][c] = matrix.get(r, c);
      }
    }
    return { ms, data };
  } catch {
    return null;
  }
}

const EYE_POSITIONS = [
  { r: 0, c: 0 },
  { r: 0, c: -1 },
  { r: -1, c: 0 },
];

function isInEye(r: number, c: number, ms: number) {
  if (r < 7 && c < 7) return true;
  if (r < 7 && c >= ms - 7) return true;
  if (r >= ms - 7 && c < 7) return true;
  return false;
}

type Shape = "circle" | "star";

interface DataParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ox: number;
  oy: number;
  s: number;
  col: number;
  row: number;
  shape: Shape;
}

const SHAPES: Shape[] = ["circle", "circle", "circle", "circle", "circle", "circle", "circle", "circle", "circle", "star"];

function roundedStar(
  c: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  n: number,
  radius: number,
) {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  c.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[(i - 1 + pts.length) % pts.length];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    const v1x = p0.x - p1.x;
    const v1y = p0.y - p1.y;
    const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const v2x = p2.x - p1.x;
    const v2y = p2.y - p1.y;
    const len2 = Math.sqrt(v2x * v2x + v2y * v2y);
    const r = Math.min(radius, len1 * 0.4, len2 * 0.4);
    const sx = p1.x + (v1x / len1) * r;
    const sy = p1.y + (v1y / len1) * r;
    const ex2 = p1.x + (v2x / len2) * r;
    const ey2 = p1.y + (v2y / len2) * r;
    if (i === 0) c.moveTo(sx, sy);
    else c.lineTo(sx, sy);
    c.quadraticCurveTo(p1.x, p1.y, ex2, ey2);
  }
  c.closePath();
}

interface EyeInfo {
  baseR: number;
  baseC: number;
  cx: number;
  cy: number;
}

export default function FloatingQR() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parentRect = canvas.parentElement?.getBoundingClientRect() || { width: 420 };
    const isMobile = window.innerWidth < 768;
    const displaySize = Math.min(parentRect.width, 420);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    ctx.scale(dpr, dpr);

    const mat = buildMatrix();
    if (!mat) return;
    const { ms, data } = mat;
    const pad = 75;
    const qrSize = displaySize - pad * 2;
    const mSize = qrSize / ms;
    const start = pad;

    const style = getComputedStyle(document.documentElement);
    const primary = style.getPropertyValue("--color-primary").trim() || "#08415c";
    const accent = style.getPropertyValue("--color-accent").trim() || "#cc2936";

    // Bounding box for particles
    const padL = 75;
    const padR = 75;
    const padT = 75;
    const padB = 75;
    const bMinX = start - padL;
    const bMinY = start - padT;
    const bMaxX = start + qrSize + padR;
    const bMaxY = start + qrSize + padB;

    const particles: DataParticle[] = [];
    for (let r = 0; r < ms; r++) {
      for (let c = 0; c < ms; c++) {
        if (data[r][c] !== 1) continue;
        if (isInEye(r, c, ms)) continue;
        const ox = Math.round(start + c * mSize);
        const oy = Math.round(start + r * mSize);
        const safeMargin = 63;
        const minP = bMinX + safeMargin;
        const maxP = bMaxX - safeMargin - Math.ceil(mSize);
        particles.push({
          x: minP + Math.random() * (maxP - minP),
          y: minP + Math.random() * (maxP - minP),
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          ox,
          oy,
          s: Math.ceil(mSize),
          col: c,
          row: r,
          shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        });
      }
    }

    const eyes: EyeInfo[] = [];
    for (const ep of EYE_POSITIONS) {
      const baseR = ep.r === -1 ? ms - 7 : ep.r;
      const baseC = ep.c === -1 ? ms - 7 : ep.c;
      eyes.push({
        baseR,
        baseC,
        cx: start + (baseC + 3) * mSize + mSize / 2,
        cy: start + (baseR + 3) * mSize + mSize / 2,
      });
    }

    const halfMs = ms / 2;
    let rafId = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    let isLocked = false;
    const qrCenterX = (bMinX + bMaxX) / 2;
    const qrCenterY = (bMinY + bMaxY) / 2;
    const ATTRACT_RADIUS = 300;
    const LERP_SPEED = 0.12;

    const toCanvasCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    };

    const onPointer = (clientX: number, clientY: number) => {
      const c = toCanvasCoords(clientX, clientY);
      mouseX = c.x;
      mouseY = c.y;
    };

    const onMouse = (e: MouseEvent) => onPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) onPointer(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
      isLocked = false;
    };
    if (!isMobile) {
      window.addEventListener("mousemove", onMouse);
      window.addEventListener("touchmove", onTouch, { passive: true });
      window.addEventListener("touchstart", onTouch, { passive: true });
      window.addEventListener("touchend", onLeave);
      document.addEventListener("mouseleave", onLeave);
    }

    const buildQuadfoilPath = (scaleFactor: number = 1) => {
      const bx = bMinX, by = bMinY;
      const bw = bMaxX - bMinX;
      const sc = bw / 200;
      const cx = (bMinX + bMaxX) / 2;
      const cy = (bMinY + bMaxY) / 2;
      const p2 = (x: number, y: number) => {
        const rawX = bx + x * sc;
        const rawY = by + y * sc;
        return [
          cx + (rawX - cx) * scaleFactor,
          cy + (rawY - cy) * scaleFactor,
        ] as const;
      };

      ctx.beginPath();
      const [sx, sy] = p2(50, 15);
      ctx.moveTo(sx, sy);

      let [c1x, c1y] = p2(80, 35);
      let [c2x, c2y] = p2(120, 35);
      let [ex, ey] = p2(150, 15);
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);

      [c1x, c1y] = p2(185, 20);
      [c2x, c2y] = p2(195, 50);
      [ex, ey] = p2(185, 80);
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);

      [c1x, c1y] = p2(165, 110);
      [c2x, c2y] = p2(165, 130);
      [ex, ey] = p2(185, 150);
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);

      [c1x, c1y] = p2(195, 180);
      [c2x, c2y] = p2(165, 195);
      [ex, ey] = p2(150, 185);
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);

      [c1x, c1y] = p2(120, 165);
      [c2x, c2y] = p2(80, 165);
      [ex, ey] = p2(50, 185);
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);

      [c1x, c1y] = p2(20, 195);
      [c2x, c2y] = p2(5, 165);
      [ex, ey] = p2(15, 150);
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);

      [c1x, c1y] = p2(35, 120);
      [c2x, c2y] = p2(35, 80);
      [ex, ey] = p2(15, 50);
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);

      [c1x, c1y] = p2(5, 20);
      [c2x, c2y] = p2(20, 5);
      [ex, ey] = p2(50, 15);
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);

      ctx.closePath();
    };

    const qfoilCenter = { x: (bMinX + bMaxX) / 2, y: (bMinY + bMaxY) / 2 };

    const drawEyes = (t: number) => {
      for (const eye of eyes) {
        const ecx = start + (eye.baseC + 3.5) * mSize;
        const ecy = start + (eye.baseR + 3.5) * mSize;
        const outerR = 3.5 * mSize - 1;
        const gapR = 2.5 * mSize + 1;

        ctx.fillStyle = primary;
        ctx.beginPath();
        ctx.arc(ecx, ecy, outerR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(ecx, ecy, gapR, 0, Math.PI * 2);
        ctx.fill();

        const starOuterR = mSize * 1.5;
        const starInnerR = mSize * 1.35;
        const starRounded = mSize * 0.55;
        const starAngle = t * 0.8;

        ctx.save();
        ctx.translate(eye.cx, eye.cy);
        ctx.rotate(starAngle);
        ctx.fillStyle = accent;
        roundedStar(ctx, 0, 0, starOuterR, starInnerR, 12, starRounded);
        ctx.fill();
        ctx.restore();
      }
    };

    const drawParticles = () => {
      const starPositions: { x: number; y: number }[] = [];
      for (const p of particles) {
        if (p.shape !== "star") continue;
        drawShape(p.x, p.y, p.s, primary, p.shape);
        starPositions.push({ x: p.x + p.s / 2, y: p.y + p.s / 2 });
      }
      const starClearance = mSize * 1.5;
      for (const p of particles) {
        if (p.shape === "star") continue;
        const cx = p.x + p.s / 2;
        const cy = p.y + p.s / 2;
        let overlapping = false;
        for (const sp of starPositions) {
          const dx = cx - sp.x;
          const dy = cy - sp.y;
          if (dx * dx + dy * dy < starClearance * starClearance) {
            overlapping = true;
            break;
          }
        }
        if (!overlapping) drawShape(p.x, p.y, p.s, primary, p.shape);
      }
    };

    const drawShape = (x: number, y: number, s: number, color: string, shape: Shape) => {
      const c = ctx!;
      c.fillStyle = color;
      const cx = x + s / 2;
      const cy = y + s / 2;
      const r = s / 2;
      switch (shape) {
        case "circle":
          c.beginPath();
          c.arc(cx, cy, r, 0, Math.PI * 2);
          c.fill();
          break;
        case "star":
          c.save();
          c.translate(cx, cy);
          roundedStar(c, 0, 0, r * 2.0, r * 1.6, 12, r * 0.5);
          c.fill();
          c.restore();
          break;
      }
    };

    const animate = (time: number) => {
      const t = time / 1000;
      ctx.clearRect(0, 0, displaySize, displaySize);

      if (isMobile) {
        buildQuadfoilPath(1);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        for (const p of particles) {
          p.x = p.ox;
          p.y = p.oy;
        }
        drawParticles();
        drawEyes(t);
      } else {
        // White background matching the border shape
        buildQuadfoilPath(1);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        buildQuadfoilPath(0.93);
        isLocked = ctx.isPointInPath(mouseX, mouseY);
        buildQuadfoilPath(0.94);

        const cyclePos = (t / 8) % 1;
        const waitRatio = 0.70;
        const breakRatio = 0.20;
        let scale: number;
        if (isLocked) {
          scale = 1;
        } else if (cyclePos < waitRatio) {
          scale = 1;
        } else if (cyclePos < waitRatio + breakRatio) {
          scale = 1 + 3 * ((cyclePos - waitRatio) / breakRatio);
        } else {
          scale = 4 - 3 * ((cyclePos - waitRatio - breakRatio) / (1 - waitRatio - breakRatio));
        }

        const centerQR = { x: qrCenterX, y: qrCenterY };
        for (const p of particles) {
          const tx = centerQR.x + (p.col - halfMs) * mSize * scale;
          const ty = centerQR.y + (p.row - halfMs) * mSize * scale;
          p.vx += (tx - p.x) * LERP_SPEED;
          p.vy += (ty - p.y) * LERP_SPEED;
          p.vx *= 0.98;
          p.vy *= 0.98;
          const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (spd > 1.5) { p.vx = (p.vx / spd) * 1.5; p.vy = (p.vy / spd) * 1.5; }
          p.x += p.vx;
          p.y += p.vy;

          let bx = p.x + p.s / 2;
          let by = p.y + p.s / 2;
          if (!ctx.isPointInPath(bx, by)) {
            let count = 0;
            do {
              const dx = qfoilCenter.x - p.x;
              const dy = qfoilCenter.y - p.y;
              p.x += dx * 0.15;
              p.y += dy * 0.15;
              bx = p.x + p.s / 2;
              by = p.y + p.s / 2;
              count++;
            } while (!ctx.isPointInPath(bx, by) && count < 60);
            if (count >= 60) {
              p.x = Math.max(20, Math.min(p.x, 400));
              p.y = Math.max(20, Math.min(400, p.y));
            }
            p.vx = -p.vx * 0.5;
            p.vy = -p.vy * 0.5;
          }
        }

        buildQuadfoilPath();
        ctx.strokeStyle = primary;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.25;
        ctx.stroke();
        ctx.globalAlpha = 1;

        drawParticles();
        drawEyes(t);
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      if (!isMobile) {
        window.removeEventListener("mousemove", onMouse);
        window.removeEventListener("touchmove", onTouch);
        window.removeEventListener("touchstart", onTouch);
        window.removeEventListener("touchend", onLeave);
        document.removeEventListener("mouseleave", onLeave);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full max-w-[420px] h-auto"
      style={{ aspectRatio: "1/1" }}
    />
  );
}

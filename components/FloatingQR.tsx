"use client";

import { useEffect, useRef } from "react";
import qrcode from "qrcode";

type BezierSeg = { x0: number; y0: number; cx1: number; cy1: number; cx2: number; cy2: number; x1: number; y1: number };

const QUADFOIL_SEGMENTS: BezierSeg[] = [
  { x0: 50, y0: 15, cx1: 80, cy1: 35, cx2: 120, cy2: 35, x1: 150, y1: 15 },
  { x0: 150, y0: 15, cx1: 185, cy1: 20, cx2: 195, cy2: 50, x1: 185, y1: 80 },
  { x0: 185, y0: 80, cx1: 165, cy1: 110, cx2: 165, cy2: 130, x1: 185, y1: 150 },
  { x0: 185, y0: 150, cx1: 195, cy1: 180, cx2: 165, cy2: 195, x1: 150, y1: 185 },
  { x0: 150, y0: 185, cx1: 120, cy1: 165, cx2: 80, cy2: 165, x1: 50, y1: 185 },
  { x0: 50, y0: 185, cx1: 20, cy1: 195, cx2: 5, cy2: 165, x1: 15, y1: 150 },
  { x0: 15, y0: 150, cx1: 35, cy1: 120, cx2: 35, cy2: 80, x1: 15, y1: 50 },
  { x0: 15, y0: 50, cx1: 5, cy1: 20, cx2: 20, cy2: 5, x1: 50, y1: 15 },
];

type MatrixData = { ms: number; data: number[][] };

function buildMatrix(): MatrixData | null {
  try {
    const qrData = qrcode.create("https://amarqr.online", { errorCorrectionLevel: "H", version: 3 });
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

const SHAPES: Shape[] = ["circle", "circle", "circle", "circle", "circle", "circle", "circle", "circle", "circle", "circle", "circle", "circle", "circle", "circle", "circle", "circle", "circle", "circle", "circle", "circle", "circle", "circle", "circle", "star", "star"];

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

    const p2 = (x: number, y: number, scaleFactor: number = 1) => {
      const bx = bMinX, by = bMinY;
      const bw = bMaxX - bMinX;
      const sc = bw / 200;
      const cx = (bMinX + bMaxX) / 2;
      const cy = (bMinY + bMaxY) / 2;
      const rawX = bx + x * sc;
      const rawY = by + y * sc;
      return [
        cx + (rawX - cx) * scaleFactor,
        cy + (rawY - cy) * scaleFactor,
      ] as const;
    };

    const buildQuadfoilPath = (scaleFactor: number = 1) => {
      ctx.beginPath();
      const [sx, sy] = p2(50, 15, scaleFactor);
      ctx.moveTo(sx, sy);

      for (const seg of QUADFOIL_SEGMENTS) {
        const [c1x, c1y] = p2(seg.cx1, seg.cy1, scaleFactor);
        const [c2x, c2y] = p2(seg.cx2, seg.cy2, scaleFactor);
        const [ex, ey] = p2(seg.x1, seg.y1, scaleFactor);
        ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);
      }

      ctx.closePath();
    };

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

    let rafId = 0;

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
        const starRounded = mSize * 0.7;
        const starAngle = t * 0.8;

        ctx.save();
        ctx.translate(eye.cx, eye.cy);
        ctx.rotate(starAngle);
        ctx.fillStyle = accent;
        roundedStar(ctx, 0, 0, starOuterR, starInnerR, 10, starRounded);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(eye.cx, eye.cy, mSize * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawParticles = (t: number) => {
      const starPositions: { x: number; y: number }[] = [];
      for (const p of particles) {
        if (p.shape !== "star") continue;
        drawShape(p.x, p.y, p.s, primary, p.shape, t);
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
        if (!overlapping) drawShape(p.x, p.y, p.s, primary, p.shape, t);
      }
    };

    const drawShape = (x: number, y: number, s: number, color: string, shape: Shape, t: number = 0) => {
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
          c.rotate(t * 0.8);
          roundedStar(c, 0, 0, r * 2.0, r * 1.6, 10, r * 0.65);
          c.fill();
          c.restore();
          break;
      }
    };

    const animate = (time: number) => {
      const t = time / 1000;
      ctx.clearRect(0, 0, displaySize, displaySize);

      buildQuadfoilPath(1);
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fill();

      for (const p of particles) {
        p.x = p.ox;
        p.y = p.oy;
      }
      drawParticles(t);
      drawEyes(t);

      buildQuadfoilPath();
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.25;
      ctx.stroke();
      ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
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

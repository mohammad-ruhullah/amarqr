"use client";

import { useEffect, useRef } from "react";
import qrcode from "qrcode";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  homeX: number;
  homeY: number;
  qrCol: number;
  qrRow: number;
  inEye: boolean;
  size: number;
  drawSize: number;
  baseOpacity: number;
  phase: number;
  isQr: boolean;
}

const ATTRACT_RADIUS = 400;
const REPEL_RADIUS = 500;
const LERP_SPEED = 0.35;
const REPEL_STRENGTH = 0.6;
const MODULE_SIZE = 2;

function isEyeRegion(row: number, col: number, ms: number) {
  const inTop = row < 7;
  const inBottom = row >= ms - 7;
  const inLeft = col < 7;
  const inRight = col >= ms - 7;
  if (inTop && inLeft) return true;
  if (inTop && inRight) return true;
  if (inBottom && inLeft) return true;
  if (inBottom && inRight) return true;
  return false;
}

export default function FloatingQRModules() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const isMobileAnim = window.innerWidth < 768;

    const style = getComputedStyle(document.documentElement);
    const primary = style.getPropertyValue("--color-primary").trim() || "#08415c";
    const r = parseInt(primary.slice(1, 3), 16);
    const g = parseInt(primary.slice(3, 5), 16);
    const b = parseInt(primary.slice(5, 7), 16);

    const qrTargets: { row: number; col: number; inEye: boolean }[] = [];
    let matrixSize = 0;
    try {
      const qrData = qrcode.create("https://amarqr.online", {
        errorCorrectionLevel: "H",
      });
      const matrix = qrData.modules;
      matrixSize = matrix.size;
      const ms = matrixSize;
      for (let row = 0; row < ms; row++) {
        for (let col = 0; col < ms; col++) {
          if (matrix.get(row, col)) {
            qrTargets.push({
              row,
              col,
              inEye: isEyeRegion(row, col, ms),
            });
          }
        }
      }

      if (ms >= 14) {
        const eye = [
          [1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 0, 0, 0, 1],
          [1, 0, 1, 1, 1, 0, 1],
          [1, 0, 1, 1, 1, 0, 1],
          [1, 0, 1, 1, 1, 0, 1],
          [1, 0, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1],
        ];
        for (let dr = 0; dr < 7; dr++) {
          for (let dc = 0; dc < 7; dc++) {
            if (eye[dr][dc]) {
              const br = ms - 7 + dr;
              const bc = ms - 7 + dc;
              if (!qrTargets.some((t) => t.row === br && t.col === bc)) {
                qrTargets.push({ row: br, col: bc, inEye: true });
              }
            }
          }
        }
      }
    } catch {
      for (let i = 0; i < 200; i++) {
        qrTargets.push({ row: i % 25, col: Math.floor(i / 25), inEye: false });
      }
      matrixSize = 25;
    }

    const parent = canvas.parentElement!;
    const rect = parent.getBoundingClientRect();
    const isCompact = rect.width < 640;
    const count = qrTargets.length;
    const halfMs = matrixSize / 2;
    const totalMultiplier = isCompact ? 3 : 8;
    const qrSetCount = isCompact ? 2 : 6;

    const particles: Particle[] = [];

    // QR-forming particles — attracted to mouse
    for (let i = 0; i < count * qrSetCount; i++) {
      const t = qrTargets[i % count];
      const s = t.inEye ? 3 + Math.random() * 3 : 1.5 + Math.random() * 2;
      particles.push({
        x: rect.left + Math.random() * rect.width,
        y: rect.top + Math.random() * rect.height,
        vx: 0,
        vy: 0,
        homeX: rect.left + Math.random() * rect.width,
        homeY: rect.top + Math.random() * rect.height,
        qrCol: t.col,
        qrRow: t.row,
        inEye: t.inEye,
        size: s,
        drawSize: s,
        baseOpacity: 0.18 + Math.random() * 0.22,
        phase: Math.random() * Math.PI * 2,
        isQr: true,
      });
    }

    // Extra particles — repelled from mouse
    for (let i = 0; i < count * (totalMultiplier - qrSetCount); i++) {
      const s = 1.5 + Math.random() * 2;
      particles.push({
        x: rect.left + Math.random() * rect.width,
        y: rect.top + Math.random() * rect.height,
        vx: 0,
        vy: 0,
        homeX: rect.left + Math.random() * rect.width,
        homeY: rect.top + Math.random() * rect.height,
        qrCol: 0,
        qrRow: 0,
        inEye: false,
        size: s,
        drawSize: s,
        baseOpacity: 0.12 + Math.random() * 0.18,
        phase: Math.random() * Math.PI * 2,
        isQr: false,
      });
    }

    let mouseX = -9999;
    let mouseY = -9999;
    let rafId = 0;

    const resize = () => {
      const r2 = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = r2.width * dpr;
      canvas.height = r2.height * dpr;
      canvas.style.width = `${r2.width}px`;
      canvas.style.height = `${r2.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const onLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };
    if (!isMobileAnim) {
      window.addEventListener("mousemove", onMouse);
      document.addEventListener("mouseleave", onLeave);
    }

    const animate = (time: number) => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);
      const now = time / 1000;

      for (const p of particles) {
        if (isMobileAnim) {
          const driftX = p.homeX + Math.sin(now * 0.3 + p.phase) * 40;
          const driftY = p.homeY + Math.cos(now * 0.4 + p.phase) * 40;
          p.vx += (driftX - p.x) * 0.003;
          p.vy += (driftY - p.y) * 0.003;

          const s = p.size;
          const opacity = p.baseOpacity * 0.5;
          ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
          ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        } else {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (p.isQr) {
            // QR particles: attracted to mouse
            if (dist < ATTRACT_RADIUS) {
              const strength = 1 - dist / ATTRACT_RADIUS;
              const tx = mouseX + (p.qrCol - halfMs) * MODULE_SIZE;
              const ty = mouseY + (p.qrRow - halfMs) * MODULE_SIZE;

              p.vx += (tx - p.x) * LERP_SPEED * strength;
              p.vy += (ty - p.y) * LERP_SPEED * strength;

              const opacity = p.baseOpacity * (0.4 + strength * 0.6);
              const eyeBoost = p.inEye ? 1 : 0;
              const s = MODULE_SIZE * 1.2 + eyeBoost;
              p.drawSize = s;
              ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
              ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
            } else {
              const driftX = p.homeX + Math.sin(now * 0.3 + p.phase) * 40;
              const driftY = p.homeY + Math.cos(now * 0.4 + p.phase) * 40;
              p.vx += (driftX - p.x) * 0.003;
              p.vy += (driftY - p.y) * 0.003;

              const s = p.size;
              p.drawSize = s;
              const opacity = p.baseOpacity * 0.5;
              ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
              ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
            }
          } else {
            // Extra particles: repelled from mouse
            if (dist < REPEL_RADIUS) {
              const strength = 1 - dist / REPEL_RADIUS;
              const repelX = p.x - mouseX;
              const repelY = p.y - mouseY;
              const repelDist = Math.sqrt(repelX * repelX + repelY * repelY);
              if (repelDist > 1) {
                p.vx += (repelX / repelDist) * REPEL_STRENGTH * strength;
                p.vy += (repelY / repelDist) * REPEL_STRENGTH * strength;
              }

              p.drawSize = p.size * (1 + strength * 0.3);
              const opacity = p.baseOpacity * (0.3 + strength * 0.4);
              ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
              ctx.fillRect(p.x - p.drawSize / 2, p.y - p.drawSize / 2, p.drawSize, p.drawSize);
            } else {
              const driftX = p.homeX + Math.sin(now * 0.3 + p.phase) * 40;
              const driftY = p.homeY + Math.cos(now * 0.4 + p.phase) * 40;
              p.vx += (driftX - p.x) * 0.003;
              p.vy += (driftY - p.y) * 0.003;

              const s = p.size;
              p.drawSize = s;
              const opacity = p.baseOpacity * 0.5;
              ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
              ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
            }
          }
        }

        p.vx *= 0.92;
        p.vy *= 0.92;
        p.x += p.vx;
        p.y += p.vy;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      if (!isMobileAnim) {
        window.removeEventListener("mousemove", onMouse);
        document.removeEventListener("mouseleave", onLeave);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

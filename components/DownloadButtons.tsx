"use client";

import { useState, useRef, useCallback } from "react";
import { renderQR } from "@/lib/qrUtils";
import type { QRConfig, DownloadFormat } from "@/lib/types";

const CONFETTI_COLORS = ["#cc2936", "#08415c", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"];

const formats: { key: DownloadFormat; label: string; icon: string }[] = [
  { key: "png", label: "PNG", icon: "🖼" },
  { key: "svg", label: "SVG", icon: "◇" },
  { key: "jpg", label: "JPG", icon: "📷" },
];

export default function DownloadButtons({
  config,
  onDownload,
}: {
  config: QRConfig;
  onDownload: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState<DownloadFormat | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (format: DownloadFormat) => {
    if (!config.content) return;
    setDownloading(format);
    setOpen(false);

    const canvas = document.createElement("canvas");
    await renderQR(canvas, { ...config, size: 2048 });

    if (format === "svg") {
      const svgContent = canvasToSvg(canvas);
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `amarqr-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const mime = format === "png" ? "image/png" : "image/jpeg";
      const quality = format === "png" ? 1 : 0.92;
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `amarqr-${Date.now()}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      }, mime, quality);
    }

    setTimeout(() => setDownloading(null), 1500);
    onDownload();
  };

  const selected = formats.find((f) => f.key === downloading);

  return (
    <div className="relative mt-6" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        disabled={!config.content || !!downloading}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-accent/20 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
      >
        {downloading ? (
          <>
            <span className="text-lg">✓</span>
            <span>Downloading {downloading.toUpperCase()}...</span>
          </>
        ) : (
          <>
            <span className="text-lg">↓</span>
            <span>Download QR</span>
            <span className={`ml-1 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-card border border-var rounded-xl shadow-2xl shadow-black/20 overflow-hidden animate-fade-in">
          {formats.map((f) => (
            <button
              key={f.key}
              onClick={() => handleDownload(f.key)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-main hover:bg-accent/10 hover:text-accent transition first:rounded-t-xl last:rounded-b-xl"
            >
              <span className="text-lg">{f.icon}</span>
              <span className="font-medium">{f.label}</span>
              <span className="ml-auto text-xs text-muted">
                {f.key === "png" ? "Best quality" : f.key === "svg" ? "Vector" : "Small file"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function canvasToSvg(canvas: HTMLCanvasElement): string {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;

  const bgColor = getPixelColor(data, 0, 0, w);
  svg += `<rect width="${w}" height="${h}" fill="${bgColor}" rx="${Math.round(w * 0.04)}" />`;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] < 128) continue;
      if (isSameColor(data, idx, bgColor)) continue;

      const color = rgbToHex(data[idx], data[idx + 1], data[idx + 2]);
      let run = 1;
      while (x + run < w && isSameColor(data, (y * w + (x + run)) * 4, [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]])) {
        run++;
      }
      svg += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${color}" />`;
      x += run - 1;
    }
  }

  svg += "</svg>";
  return svg;
}

function getPixelColor(data: Uint8ClampedArray, x: number, y: number, w: number): string {
  const idx = (y * w + x) * 4;
  return rgbToHex(data[idx], data[idx + 1], data[idx + 2]);
}

function isSameColor(data: Uint8ClampedArray, idx: number, color: string | number[]): boolean {
  const c = Array.isArray(color)
    ? color
    : hexToRgb(color);
  return (
    Math.abs(data[idx] - c[0]) < 10 &&
    Math.abs(data[idx + 1] - c[1]) < 10 &&
    Math.abs(data[idx + 2] - c[2]) < 10 &&
    data[idx + 3] > 128
  );
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex: string): number[] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

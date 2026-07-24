import qrcode from "qrcode";
import type { QRConfig, EyeStyle, ErrorLevel } from "./types";

export function getContentString(type: string, data: Record<string, string>): string {
  switch (type) {
    case "url":
      return data.url || "";
    case "text":
      return data.text || "";
    case "email":
      return `mailto:${data.email || ""}?subject=${encodeURIComponent(data.subject || "")}&body=${encodeURIComponent(data.body || "")}`;
    case "phone":
      return `tel:${data.phone || ""}`;
    case "sms":
      return `smsto:${data.phone || ""}:${data.message || ""}`;
    case "wifi": {
      const enc = data.encryption || "WPA";
      return `WIFI:S:${data.ssid || ""};T:${enc};P:${data.password || ""};;`;
    }
    case "vcard":
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${data.name || ""}\nTEL:${data.phone || ""}\nEMAIL:${data.email || ""}\nORG:${data.org || ""}\nEND:VCARD`;
    case "location":
      return `geo:${data.lat || "0"},${data.lng || "0"}`;
    default:
      return "";
  }
}

function getModuleSize(matrixSize: number, canvasSize: number): number {
  return Math.floor(canvasSize / matrixSize);
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  roundedRectPath(ctx, x, y, w, h, r);
  ctx.fill();
}

function isFinderPattern(row: number, col: number, size: number): boolean {
  const tl = row <= 7 && col <= 7;
  const tr = row <= 7 && col >= size - 8;
  const bl = row >= size - 8 && col <= 7;
  return tl || tr || bl;
}

function isFinderInner(row: number, col: number, size: number, boxStart: number, boxEnd: number): boolean {
  const r = row - boxStart;
  const c = col - boxEnd;
  const pattern = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];
  if (r >= 0 && r < 7 && c >= 0 && c < 7) {
    return pattern[r][c] === 1;
  }
  return false;
}

function getFinderBox(row: number, col: number, size: number): { startRow: number; startCol: number } | null {
  if (row <= 7 && col <= 7) return { startRow: 0, startCol: 0 };
  if (row <= 7 && col >= size - 8) return { startRow: 0, startCol: size - 7 };
  if (row >= size - 8 && col <= 7) return { startRow: size - 7, startCol: 0 };
  return null;
}

export async function renderQR(
  canvas: HTMLCanvasElement,
  config: QRConfig,
  cornerRadius?: number
): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = config.size;
  canvas.width = size;
  canvas.height = size;

  const radius = cornerRadius ?? Math.round(size * 0.04);

  try {
    const level = config.logo ? "H" : config.errorLevel;
    const qrData = await qrcode.create(config.content, {
      errorCorrectionLevel: level as ErrorLevel,
    });

    const matrix = qrData.modules;
    const matrixSize = matrix.size;
    const moduleSize = getModuleSize(matrixSize, size);

    ctx.save();
    roundedRectPath(ctx, 0, 0, size, size, radius);
    ctx.clip();

    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, size, size);

    const padding = Math.floor(moduleSize * 4);
    const qrStart = padding;
    const qrSize = size - padding * 2;
    const actualModuleSize = qrSize / matrixSize;

    const clearFraction = (0.25 + 20 / size) * 1.20;
    const logoClearRadius = config.logo ? Math.floor((clearFraction * matrixSize) / 2) + 1 : 0;
    const mid = Math.floor(matrixSize / 2);

    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        if (logoClearRadius) {
          const dr = Math.abs(row - mid);
          const dc = Math.abs(col - mid);
          if (config.logoShape === "circle") {
            if (Math.sqrt(dr * dr + dc * dc) <= logoClearRadius + 1) continue;
          } else if (dr <= logoClearRadius && dc <= logoClearRadius) continue;
        }
        const val = matrix.get(row, col);
        const x = qrStart + col * actualModuleSize;
        const y = qrStart + row * actualModuleSize;

        if (isFinderPattern(row, col, matrixSize)) {
          const fp = getFinderBox(row, col, matrixSize);
          if (!fp) continue;
          if ((row === fp.startRow && col === fp.startCol)) {
            const fx = qrStart + fp.startCol * actualModuleSize;
            const fy = qrStart + fp.startRow * actualModuleSize;
            const fm = Math.ceil(actualModuleSize);
            const fs = fm * 7;

            if (config.eyeStyle === "rounded") {
              const cx = fx + fs / 2;
              const cy = fy + fs / 2;
              const half = fs / 2;
              ctx.fillStyle = config.eyeColor;
              ctx.beginPath();
              ctx.arc(cx, cy, half, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = config.bgColor;
              ctx.beginPath();
              ctx.arc(cx, cy, half - fm, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = config.eyeColor;
              ctx.beginPath();
              ctx.arc(cx, cy, half - fm * 2, 0, Math.PI * 2);
              ctx.fill();
            } else {
              for (let dr = 0; dr < 7; dr++) {
                for (let dc = 0; dc < 7; dc++) {
                  const pattern = [
                    [1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],
                    [1,0,1,1,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]
                  ];
                  const ex = qrStart + (fp.startCol + dc) * actualModuleSize;
                  const ey = qrStart + (fp.startRow + dr) * actualModuleSize;
                  ctx.fillStyle = pattern[dr][dc] ? config.eyeColor : config.bgColor;
                  if (config.eyeStyle === "circle") {
                    ctx.beginPath();
                    ctx.arc(ex + actualModuleSize / 2, ey + actualModuleSize / 2, actualModuleSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                  } else {
                    ctx.fillRect(ex, ey, Math.ceil(actualModuleSize), Math.ceil(actualModuleSize));
                  }
                }
              }
            }
          }
        } else if (val !== 0 && val !== 2) {
          ctx.fillStyle = config.fgColor;
          const ms = Math.ceil(actualModuleSize);
          switch (config.moduleStyle) {
            case "circle":
              ctx.beginPath();
              ctx.arc(x + ms / 2, y + ms / 2, ms / 2, 0, Math.PI * 2);
              ctx.fill();
              break;
            case "diamond":
              ctx.save();
              ctx.translate(x + ms / 2, y + ms / 2);
              ctx.rotate(Math.PI / 4);
              ctx.fillRect(-ms / 2, -ms / 2, ms, ms);
              ctx.restore();
              break;
            default:
              ctx.fillRect(x, y, ms, ms);
              break;
          }
        }
      }
    }

    if (config.logo) {
      const preSize = size * 0.25 + 20;
      const pcx = (size - preSize) / 2;
      const pcy = (size - preSize) / 2;
      ctx.fillStyle = config.badgeColor;
      if (config.logoShape === "circle") {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, preSize / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        drawRoundedRect(ctx, pcx, pcy, preSize, preSize, 10);
        ctx.fill();
      }
      await drawLogo(ctx, size, config.logo, config.badgeColor, config.logoShape);
    }
    ctx.restore();
  } catch (e) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#ef4444";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Invalid content", size / 2, size / 2);
  }
}

function drawLogo(ctx: CanvasRenderingContext2D, size: number, logoDataUrl: string, badgeColor: string, logoShape: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const logoSize = size * 0.25;
      const padding = 10;
      const bgSize = logoSize + padding * 2;
      const cx = size / 2;
      const cy = size / 2;

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = badgeColor;

      if (logoShape === "circle") {
        ctx.beginPath();
        ctx.arc(cx, cy, bgSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, logoSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.shadowColor = "rgba(0,0,0,0.1)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 1;
        ctx.drawImage(img, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize);
        ctx.restore();
      } else {
        const x = (size - bgSize) / 2;
        const y = (size - bgSize) / 2;
        drawRoundedRect(ctx, x, y, bgSize, bgSize, 10);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.1)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 1;
        ctx.drawImage(img, x + padding, y + padding, logoSize, logoSize);
        ctx.restore();
      }

      resolve();
    };
    img.onerror = () => resolve();
    img.src = logoDataUrl;
  });
}

export async function renderQRCodeMatrix(
  config: QRConfig
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  await renderQR(canvas, config);
  return canvas;
}

import qrcode from "qrcode";

function getRgb(cssVar: string): string {
  if (typeof document === "undefined") return "#000";
  const val = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  if (val.startsWith("#")) return val;
  const match = val.match(/\d+/g);
  if (match) return `rgb(${match.slice(0, 3).join(",")})`;
  return val || "#000";
}

export async function renderDemoQR(
  canvas: HTMLCanvasElement,
  size: number
): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = size;
  canvas.height = size;

  const primary = getRgb("--color-primary") || "#08415c";
  const accent = getRgb("--color-accent") || "#cc2936";

  try {
    const qrData = await qrcode.create("https://amarqr.online", {
      errorCorrectionLevel: "H",
    });
    const matrix = qrData.modules;
    const matrixSize = matrix.size;

    const qrSize = size * 0.76;
    const padding = (size - qrSize) / 2;
    const ms = qrSize / matrixSize;
    const qrStart = padding;

    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        const val = matrix.get(row, col);
        if (val !== 1) continue;

        const x = qrStart + col * ms;
        const y = qrStart + row * ms;

        if (row < 7 && col < 7) continue;
        if (row < 7 && col >= matrixSize - 7) continue;
        if (row >= matrixSize - 7 && col < 7) continue;

        const gradient = ctx.createRadialGradient(
          x + ms / 2, y + ms / 2, 0,
          x + ms / 2, y + ms / 2, ms * 0.45
        );
        gradient.addColorStop(0, primary);
        gradient.addColorStop(1, accent);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x + ms / 2, y + ms / 2, ms * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const positions = [
      { r: 0, c: 0 },
      { r: 0, c: matrixSize - 7 },
      { r: matrixSize - 7, c: 0 },
    ];

    for (const fp of positions) {
      const fcx = qrStart + (fp.c + 3) * ms + ms / 2;
      const fcy = qrStart + (fp.r + 3) * ms + ms / 2;

      ctx.strokeStyle = primary;
      ctx.lineWidth = ms * 0.6;
      ctx.beginPath();
      ctx.arc(fcx, fcy, ms * 3.0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(fcx, fcy, ms * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  } catch {
    ctx.fillRect(0, 0, 0, 0);
  }
}

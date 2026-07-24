"use client";

import { useEffect, useRef } from "react";
import { renderQR } from "@/lib/qrUtils";
import type { QRConfig } from "@/lib/types";
import ScanAnimation from "./ScanAnimation";

export default function QRPreview({ config, generated }: { config: QRConfig; generated: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !config.content || !generated) return;
    renderQR(canvasRef.current, config);
  }, [config, generated]);

  const showQR = config.content && generated;

  return (
    <div className="relative inline-flex flex-col items-center gap-4">
      {/* Glass card */}
      <div className="relative p-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-white/10 shadow-xl shadow-accent/10">
        {/* Device frame */}
        <div className="relative mx-auto bg-black dark:bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl shadow-black/30">
          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 w-28 h-6 bg-black rounded-b-2xl flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-700" />
            <div className="w-16 h-1.5 rounded-full bg-gray-800" />
          </div>

          {/* Screen */}
          <div className="relative rounded-[2rem] overflow-hidden bg-white" style={{ width: 288, height: 288 }}>
            {showQR ? (
              <div className="relative w-full h-full">
                <div className="absolute inset-0 rounded-lg bg-accent/20 blur-2xl" />
                <canvas
                  ref={canvasRef}
                  width={config.size}
                  height={config.size}
                  className="rounded-lg absolute inset-0 w-full h-full"
                />
                <ScanAnimation />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted text-sm">
                <div className="flex flex-col items-center gap-3">
                  <span className="text-4xl opacity-30">▄▀█</span>
                  <span>Enter content to generate QR</span>
                </div>
              </div>
            )}
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

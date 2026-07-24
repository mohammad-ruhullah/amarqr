"use client";

import { useEffect, useRef } from "react";
import type { QRConfig } from "@/lib/types";
import { renderQR } from "@/lib/qrUtils";
import QRControls from "./QRControls";
import ScanAnimation from "./ScanAnimation";

export default function CustomizePanel({
  config,
  onChange,
  onApply,
  onClose,
}: {
  config: QRConfig;
  onChange: (c: QRConfig) => void;
  onApply: () => void;
  onClose: () => void;
}) {
  const miniRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!miniRef.current || !config.content) return;
    renderQR(miniRef.current, config);
  }, [config]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-body border border-var rounded-2xl shadow-2xl shadow-black/50 w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-6 py-4 border-b border-var shrink-0">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-accent">✦</span>
              Customize More
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-var text-muted hover:text-main hover:border-accent/30 transition"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-5 gap-0 p-6">
            <div className="md:col-span-3 overflow-y-auto pr-4 max-h-[60vh] hide-scrollbar">
              <QRControls config={config} onConfig={onChange} />
            </div>
            <div className="md:col-span-2 flex flex-col items-center justify-center pt-2">
              <div className="relative inline-flex p-4 bg-card rounded-xl border border-var">
                <canvas
                  ref={miniRef}
                  width={config.size}
                  height={config.size}
                  className="rounded-lg"
                  style={{ width: 200, height: 200 }}
                />
                <ScanAnimation />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-var shrink-0 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-card text-muted rounded-xl text-sm border border-var hover:text-main hover:border-accent/30 transition"
            >
              Cancel
            </button>
            <button
              onClick={onApply}
              className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-accent/20 transition-all active:scale-[0.98]"
            >
              Apply & Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

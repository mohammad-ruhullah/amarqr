"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { QRConfig, ContentType, EyeStyle, ModuleStyle, ErrorLevel } from "@/lib/types";
import { getContentString } from "@/lib/qrUtils";
import ContentTypeSelector from "./ContentTypeSelector";
import ContentInput from "./ContentInput";
import QRPreview from "./QRPreview";
import DownloadButtons from "./DownloadButtons";
import DownloadPopup from "./DownloadPopup";
import CustomizePanel from "./CustomizePanel";

const defaultConfig: QRConfig = {
  content: "",
  contentType: "url" as ContentType,
  fgColor: "#000000",
  bgColor: "#ffffff",
  eyeStyle: "square" as EyeStyle,
  eyeColor: "#000000",
  moduleStyle: "square" as ModuleStyle,
  size: 1024,
  errorLevel: "M" as ErrorLevel,
  logo: null,
  badgeColor: "#ffffff",
  logoShape: "square",
};

export default function QRBuilder() {
  const [config, setConfig] = useState<QRConfig>(defaultConfig);
  const [draftConfig, setDraftConfig] = useState<QRConfig>(defaultConfig);
  const [values, setValues] = useState<Record<string, string>>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [downloadPopup, setDownloadPopup] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleValues = useCallback(
    (key: string, value: string) => {
      const next = { ...values, [key]: value };
      setValues(next);
      const content = getContentString(config.contentType, next);
      setConfig((prev) => ({ ...prev, content }));
      setDraftConfig((prev) => ({ ...prev, content }));
    },
    [values, config.contentType]
  );

  const handleGenerate = () => {
    if (!config.content.trim()) return;
    setGenerated(true);
  };

  const handleDraftConfig = useCallback((c: QRConfig) => {
    setDraftConfig(c);
  }, []);

  const handleApply = useCallback(() => {
    setConfig(draftConfig);
    setPanelOpen(false);
  }, [draftConfig]);

  const handleDownload = useCallback(() => {
    fetch("/api/track", { method: "POST" }).catch(() => {}).finally(() => {
      window.dispatchEvent(new Event("qr-downloaded"));
      setDownloadPopup(true);
    });
  }, []);

  return (
    <>
      <section id="builder" ref={sectionRef} className="max-w-7xl mx-auto px-4 pb-20">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-start transition-all duration-700 ${
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <div className="flex flex-col gap-4 pt-6">
            <h2 className={`text-lg font-semibold flex items-center gap-2 transition-all duration-500 delay-100 ${
              revealed ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
            }`}>
              <span className="w-1.5 h-5 bg-accent rounded-full" />
              Content
            </h2>
            <div className={`bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 p-5 shadow-xl shadow-accent/5 transition-all duration-500 delay-200 ${
              revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}>
              <ContentTypeSelector
                value={config.contentType}
                onChange={(v) => {
                  const c = { ...config, content: "", contentType: v as ContentType };
                  setConfig(c);
                  setDraftConfig(c);
                  setValues({});
                  setGenerated(false);
                }}
              />
              <div className="mt-4">
                <ContentInput type={config.contentType} values={values} onChange={handleValues} />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!config.content.trim()}
              className={`flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-primary bg-gradient-to-r from-primary to-accent text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-accent/20 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100 ${
                revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionProperty: "all", transitionDuration: "500ms", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
            >
              <span className="text-lg">▣</span>
              Generate Your QR
            </button>

            <button
              onClick={() => {
                setDraftConfig(config);
                setPanelOpen(true);
              }}
              disabled={!generated || !config.content}
              className={`flex items-center justify-center gap-2 w-full px-4 py-3 bg-transparent border-2 border-accent text-accent rounded-xl text-sm font-semibold hover:bg-accent/10 hover:shadow-none transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:active:scale-100 ${
                generated ? "animate-attention-pulse" : ""
              } ${
                revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ marginTop: "20px", transitionProperty: "all", transitionDuration: "500ms", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
            >
              <span className="text-lg">✦</span>
              Customize More
            </button>
          </div>

          <div className={`flex flex-col items-center gap-5 transition-all duration-500 delay-300 ${
            revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            <h2 className="text-lg font-semibold flex items-center justify-center gap-2">
              <span className="w-1.5 h-5 bg-accent rounded-full" />
              Preview
            </h2>
            <QRPreview config={config} generated={generated} />

            {generated && config.content && (
              <div className="w-full max-w-[360px]">
                <DownloadButtons config={config} onDownload={handleDownload} />
              </div>
            )}
          </div>
        </div>
      </section>

      {panelOpen && (
        <CustomizePanel
          config={draftConfig}
          onChange={handleDraftConfig}
          onApply={handleApply}
          onClose={() => setPanelOpen(false)}
        />
      )}

      {downloadPopup && (
        <DownloadPopup onClose={() => setDownloadPopup(false)} />
      )}
    </>
  );
}

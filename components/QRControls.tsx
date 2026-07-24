"use client";

import { useState } from "react";
import type { QRConfig, ContentType, EyeStyle, ModuleStyle, ErrorLevel } from "@/lib/types";
import ContentTypeSelector from "./ContentTypeSelector";
import ContentInput from "./ContentInput";
import ColorPicker from "./ColorPicker";
import EyeStyleSelector from "./EyeStyleSelector";
import ModuleStyleSelector from "./ModuleStyleSelector";
import LogoUploader from "./LogoUploader";
import LogoShapeSelector from "./LogoShapeSelector";
import ErrorCorrectionSelect from "./ErrorCorrectionSelect";

function Section({
  title,
  open = true,
  children,
}: {
  title: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(open);
  return (
    <div className="border border-var rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-body/50 hover:bg-body transition text-sm font-medium text-main"
      >
        {title}
        <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {isOpen && <div className="p-4 flex flex-col gap-4">{children}</div>}
    </div>
  );
}

export default function QRControls({
  config,
  onConfig,
  onValues,
  values,
}: {
  config: QRConfig;
  onConfig: (c: QRConfig) => void;
  onValues?: (key: string, value: string) => void;
  values?: Record<string, string>;
}) {
  const update = (partial: Partial<QRConfig>) => {
    onConfig({ ...config, ...partial });
  };

  return (
    <div className="flex flex-col gap-3">
      {onValues && values && (
        <Section title="Content">
          <ContentTypeSelector
            value={config.contentType}
            onChange={(v) => update({ contentType: v as ContentType })}
          />
          <ContentInput type={config.contentType} values={values} onChange={onValues} />
        </Section>
      )}
      <Section title="Colors">
        <ColorPicker
          label="Foreground"
          value={config.fgColor}
          onChange={(v) => update({ fgColor: v })}
        />
        <ColorPicker
          label="Background"
          value={config.bgColor}
          onChange={(v) => update({ bgColor: v })}
        />
        <ColorPicker
          label="Eye Color"
          value={config.eyeColor}
          onChange={(v) => update({ eyeColor: v })}
        />
      </Section>
      <Section title="Style">
        <EyeStyleSelector
          value={config.eyeStyle}
          onChange={(v) => update({ eyeStyle: v as EyeStyle })}
        />
        <ModuleStyleSelector
          value={config.moduleStyle}
          onChange={(v) => update({ moduleStyle: v as ModuleStyle })}
        />
        <LogoUploader
          value={config.logo}
          onChange={(v) => update({ logo: v })}
        />
        {config.logo && (
          <>
            <LogoShapeSelector
              value={config.logoShape}
              onChange={(v) => update({ logoShape: v })}
            />
            <ColorPicker
              label="Badge Color"
              value={config.badgeColor}
              onChange={(v) => update({ badgeColor: v })}
            />
          </>
        )}
      </Section>
      <Section title="Advanced">
        <ErrorCorrectionSelect
          value={config.errorLevel}
          onChange={(v) => update({ errorLevel: v as ErrorLevel })}
        />
      </Section>
    </div>
  );
}

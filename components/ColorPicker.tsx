"use client";

import { useRef } from "react";

export default function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-sm text-muted mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative w-10 h-10 rounded-full cursor-pointer border-2 border-var overflow-hidden shrink-0 hover:border-accent/50 transition"
          style={{ backgroundColor: value }}
        >
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <span className="text-white text-xs drop-shadow-sm">✎</span>
          </div>
        </button>
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm bg-card border border-var rounded-lg text-main focus:outline-none focus:border-accent"
        />
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";

export default function LogoUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-sm text-muted mb-1.5">Logo (optional)</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      <div className="flex gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="flex-1 px-3 py-2 text-sm bg-card border border-var rounded-lg text-muted hover:border-accent/50 transition"
        >
          {value ? "Change Logo" : "Upload Logo"}
        </button>
        {value && (
          <button
            onClick={() => onChange(null)}
            className="px-3 py-2 text-sm bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition"
          >
            Remove
          </button>
        )}
      </div>
      {value && (
        <img
          src={value}
          alt="logo preview"
          className="mt-2 w-10 h-10 object-contain rounded-lg border border-var"
        />
      )}
    </div>
  );
}

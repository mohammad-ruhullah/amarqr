import type { EyeStyle } from "@/lib/types";

const styles: { value: EyeStyle; label: string }[] = [
  { value: "square", label: "█ Square" },
  { value: "circle", label: "● Circle" },
  { value: "rounded", label: "◖ Rounded" },
];

export default function EyeStyleSelector({
  value,
  onChange,
}: {
  value: EyeStyle;
  onChange: (v: EyeStyle) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-muted mb-1.5">Eye Style</label>
      <div className="flex gap-2">
        {styles.map((s) => (
          <button
            key={s.value}
            onClick={() => onChange(s.value)}
            className={`flex-1 px-3 py-1.5 text-xs rounded-lg border transition ${
              value === s.value
                ? "bg-accent text-white border-accent"
                : "bg-card text-muted border-var hover:border-accent/50"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

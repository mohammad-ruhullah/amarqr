import type { ErrorLevel } from "@/lib/types";

const levels: { value: ErrorLevel; label: string; desc: string }[] = [
  { value: "L", label: "Small", desc: "Basic" },
  { value: "M", label: "Medium", desc: "Balanced" },
  { value: "Q", label: "High", desc: "Works with logo" },
  { value: "H", label: "Max", desc: "Best with logo" },
];

export default function ErrorCorrectionSelect({
  value,
  onChange,
}: {
  value: ErrorLevel;
  onChange: (v: ErrorLevel) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-muted mb-1.5">
        Scan Reliability
        <span className="ml-1.5 text-[10px] opacity-60">(higher = survives damage/logo)</span>
      </label>
      <div className="flex gap-2">
        {levels.map((l) => (
          <button
            key={l.value}
            onClick={() => onChange(l.value)}
            className={`flex-1 px-2 py-1.5 text-xs rounded-lg border transition ${
              value === l.value
                ? "bg-accent text-white border-accent"
                : "bg-card text-muted border-var hover:border-accent/50"
            }`}
          >
            {l.label}
            <span className="block text-[10px] opacity-70">{l.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

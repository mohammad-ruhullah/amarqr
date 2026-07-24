import type { LogoShape } from "@/lib/types";

const shapes: { value: LogoShape; label: string }[] = [
  { value: "square", label: "▣ Square" },
  { value: "circle", label: "● Circle" },
];

export default function LogoShapeSelector({
  value,
  onChange,
}: {
  value: LogoShape;
  onChange: (v: LogoShape) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-muted mb-1.5">Logo Shape</label>
      <div className="flex gap-2">
        {shapes.map((s) => (
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

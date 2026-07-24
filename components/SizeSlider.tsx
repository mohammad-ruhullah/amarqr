export default function SizeSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-muted mb-1.5">
        Size: {value}px
      </label>
      <input
        type="range"
        min={128}
        max={512}
        step={16}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </div>
  );
}

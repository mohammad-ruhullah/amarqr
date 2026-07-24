import type { ContentType } from "@/lib/types";

const types: { value: ContentType; label: string }[] = [
  { value: "url", label: "URL" },
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "sms", label: "SMS" },
  { value: "wifi", label: "WiFi" },
  { value: "vcard", label: "vCard" },
  { value: "location", label: "Location" },
];

export default function ContentTypeSelector({
  value,
  onChange,
}: {
  value: ContentType;
  onChange: (v: ContentType) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-muted mb-2">Content Type</label>
      <div className="grid grid-cols-4 gap-1.5">
        {types.map((t) => (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`px-2 py-1.5 text-xs rounded-lg border transition ${
              value === t.value
                ? "bg-accent text-white border-accent"
                : "bg-card text-muted border-var hover:border-accent/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

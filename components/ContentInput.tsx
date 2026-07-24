import type { ContentType } from "@/lib/types";

const fields: Record<ContentType, { key: string; label: string; placeholder: string }[]> = {
  url: [{ key: "url", label: "URL", placeholder: "https://example.com" }],
  text: [{ key: "text", label: "Text", placeholder: "Enter your text..." }],
  email: [
    { key: "email", label: "Email", placeholder: "user@example.com" },
    { key: "subject", label: "Subject", placeholder: "Subject (optional)" },
    { key: "body", label: "Body", placeholder: "Body (optional)" },
  ],
  phone: [{ key: "phone", label: "Phone Number", placeholder: "+8801234567890" }],
  sms: [
    { key: "phone", label: "Phone Number", placeholder: "+8801234567890" },
    { key: "message", label: "Message", placeholder: "Your message..." },
  ],
  wifi: [
    { key: "ssid", label: "Network Name (SSID)", placeholder: "My WiFi" },
    { key: "password", label: "Password", placeholder: "password" },
    {
      key: "encryption",
      label: "Encryption",
      placeholder: "WPA",
    },
  ],
  vcard: [
    { key: "name", label: "Full Name", placeholder: "John Doe" },
    { key: "phone", label: "Phone", placeholder: "+8801234567890" },
    { key: "email", label: "Email", placeholder: "john@example.com" },
    { key: "org", label: "Organization", placeholder: "Company (optional)" },
  ],
  location: [
    { key: "lat", label: "Latitude", placeholder: "23.8103" },
    { key: "lng", label: "Longitude", placeholder: "90.4125" },
  ],
};

export default function ContentInput({
  type,
  values,
  onChange,
}: {
  type: ContentType;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  const inputFields = fields[type] || [];

  return (
    <div className="flex flex-col gap-3">
      {inputFields.map((f) => (
        <div key={f.key}>
          <label className="block text-sm text-muted mb-1">{f.label}</label>
          {f.key === "encryption" ? (
            <select
              value={values[f.key] || "WPA"}
              onChange={(e) => onChange(f.key, e.target.value)}
              className="w-full px-3 py-2 text-sm bg-card border border-var rounded-lg text-main focus:outline-none focus:border-accent"
            >
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">No Password</option>
            </select>
          ) : (
            <input
              type="text"
              value={values[f.key] || ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full px-3 py-2 text-sm bg-card border border-var rounded-lg text-main placeholder:text-muted/50 focus:outline-none focus:border-accent"
            />
          )}
        </div>
      ))}
    </div>
  );
}

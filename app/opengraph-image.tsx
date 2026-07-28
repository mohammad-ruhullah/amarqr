import { ImageResponse } from "next/og";

export const alt = "Amar QR — Free QR Code Generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "Inter",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "#6366f1",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 700,
              color: "white",
            }}
          >
            AQ
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#f1f5f9",
              letterSpacing: "-0.02em",
            }}
          >
            Amar QR
          </span>
        </div>
        <h1
          style={{
            fontSize: "52px",
            fontWeight: 800,
            color: "#f8fafc",
            textAlign: "center",
            margin: "0 0 16px 0",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          Free QR Code Generator
        </h1>
        <p
          style={{
            fontSize: "24px",
            color: "#94a3b8",
            textAlign: "center",
            margin: 0,
            maxWidth: "700px",
            lineHeight: 1.4,
          }}
        >
          Create beautiful, customizable QR codes forever.
          <br />
          No login. No paywall. No hidden charges.
        </p>
        <div
          style={{
            marginTop: "32px",
            display: "flex",
            gap: "12px",
          }}
        >
          {["URL", "Text", "Email", "WiFi", "vCard"].map((label) => (
            <div
              key={label}
              style={{
                padding: "8px 20px",
                background: "rgba(99,102,241,0.15)",
                borderRadius: "100px",
                fontSize: "18px",
                color: "#a5b4fc",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              {label}
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "16px",
            color: "#475569",
          }}
        >
          amarqr.online
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

"use client";

import FloatingQR from "./FloatingQR";

export default function Hero() {
  return (
    <section className="relative pt-6 md:pt-10 pb-16 md:pb-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-16 gap-y-6">
          <div className="flex flex-col items-center md:items-start gap-5">
            <div className="animate-reveal" style={{ animationDelay: "0s" }}>
              <img src="/logo.png" alt="Amar QR" className="h-40 md:h-48 w-auto" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-center md:text-left animate-reveal" style={{ animationDelay: "0.2s" }}>
              <span className="block">
                Create{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
                  Free
                </span>{" "}
                QR Codes.
              </span>
              <span className="block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
                  Forever.
                </span>
              </span>
            </h1>
            <p className="text-muted text-base md:text-lg max-w-md text-center md:text-left animate-reveal" style={{ animationDelay: "0.4s" }}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary font-semibold">
                Create free QR codes. They never expire, they never die.
              </span>{" "}
              No login. No paywall. No hidden charges. Made with love for the community.
            </p>
          </div>
          <div className="flex items-center justify-center md:self-stretch animate-reveal" style={{ animationDelay: "0.3s" }}>
            <FloatingQR />
          </div>
        </div>
      </div>
    </section>
  );
}

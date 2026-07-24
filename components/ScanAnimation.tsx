export default function ScanAnimation() {
  return (
    <div className="scanner-overlay pointer-events-none">
      <div className="scanner-corner scanner-corner-tl animate-corner-pulse" />
      <div className="scanner-corner scanner-corner-tr animate-corner-pulse" style={{ animationDelay: "0.5s" }} />
      <div className="scanner-corner scanner-corner-bl animate-corner-pulse" style={{ animationDelay: "1s" }} />
      <div className="scanner-corner scanner-corner-br animate-corner-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="scanner-line animate-scan-line" />
      <div className="scanner-line animate-scan-line opacity-40 blur-sm" />
      <div className="scanner-line animate-scan-line opacity-20 blur-md" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-accent animate-soft-pulse" style={{ top: "-1px" }} />
    </div>
  );
}

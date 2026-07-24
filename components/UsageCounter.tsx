"use client";

import { useEffect, useState, useRef } from "react";

function AnimatedNumber({ value, trigger }: { value: number; trigger: number }) {
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    const startValue = displayRef.current;
    const diff = value - startValue;
    if (diff === 0) return;

    const duration = 1500;
    const steps = 30;
    const increment = diff / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const current = startValue + increment * step;
      if (step >= steps) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, trigger]);

  return <strong>{display.toLocaleString()}</strong>;
}

export default function UsageCounter({ compact }: { compact?: boolean }) {
  const [count, setCount] = useState<number | null>(null);
  const [trigger, setTrigger] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const fetchCount = () => {
    fetch("/api/track", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setCount(d.count != null ? Number(d.count) : 0))
      .catch(() => setCount(0));
  };

  useEffect(() => {
    fetchCount();
    const onRefresh = () => fetchCount();
    window.addEventListener("focus", onRefresh);
    window.addEventListener("qr-downloaded", onRefresh);
    return () => {
      window.removeEventListener("focus", onRefresh);
      window.removeEventListener("qr-downloaded", onRefresh);
    };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTrigger((n) => n + 1);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (count === null) return null;

  if (compact) {
    return (
      <div ref={sectionRef}>
        <div className="flex items-center justify-center gap-2">
          <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            <AnimatedNumber value={count} trigger={trigger} />
          </span>
        </div>
        <p className="text-muted-var text-base md:text-lg mt-2">Free QR codes created here</p>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="inline-flex flex-col items-center px-5 py-3 bg-card border border-var rounded-xl shadow-lg shadow-black/5">
      <div className="flex items-center gap-2">
        <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          <AnimatedNumber value={count} trigger={trigger} />
        </span>
      </div>
      <p className="text-muted-var text-sm mt-0.5">Free QR codes created here</p>
    </div>
  );
}

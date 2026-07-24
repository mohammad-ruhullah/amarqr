"use client";

import { useEffect, useState } from "react";
import type { Review } from "@/lib/types";

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const colors = [
    "bg-primary",
    "bg-accent",
    "bg-secondary",
    "bg-purple-500",
    "bg-amber-500",
    "bg-rose-500",
  ];
  const color = colors[name.length % colors.length];
  return (
    <div
      className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold shrink-0`}
    >
      {initials}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-var rounded-xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-muted/20 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-muted/20 rounded" />
            <div className="h-3 w-16 bg-muted/20 rounded" />
          </div>
          <div className="h-3 w-full bg-muted/20 rounded" />
          <div className="h-3 w-3/4 bg-muted/20 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function ReviewList({ refresh }: { refresh: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => setReviews(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refresh]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted text-sm gap-2">
        <span className="text-3xl opacity-30">★</span>
        <span>No reviews yet. Be the first!</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-h-[440px] overflow-y-auto pr-2 scrollbar-thin">
      {reviews.map((r) => (
        <div
          key={r.id}
          className="bg-card border border-var rounded-xl p-4 animate-slide-up hover:border-accent/30 transition"
        >
          <div className="flex items-start gap-3">
            <Avatar name={r.name} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-main text-sm truncate capitalize">
                  {r.name}
                </span>
                <div className="flex gap-0.5 shrink-0 mt-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`text-xs ${
                        n <= r.rating ? "text-accent" : "text-muted/20"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-muted text-sm mt-1 leading-relaxed">
                {r.message}
              </p>
              <span className="text-[11px] text-muted/40 mt-1.5 block text-right">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

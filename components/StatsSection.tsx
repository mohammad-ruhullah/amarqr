"use client";

import { useEffect, useState, useRef } from "react";
import UsageCounter from "./UsageCounter";
import ReviewList from "./ReviewList";
import WriteReviewPopup from "./WriteReviewPopup";
import type { Review } from "@/lib/types";

function AnimatedNumber({ value }: { value: number }) {
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
  }, [value]);

  return (
    <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
      {display.toLocaleString()}
    </span>
  );
}

export default function StatsSection() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [reviews, setReviews] = useState<Review[] | null>(null);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => setReviews(Array.isArray(d) ? d : []))
      .catch(() => setReviews([]));
  }, [refresh]);

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="flex flex-col gap-6">
          <div className="w-full bg-card border border-var rounded-2xl shadow-lg p-6 md:p-8 text-center">
            <UsageCounter compact />
          </div>
          {reviews !== null && (
            <>
              <div className="w-full bg-card border border-var rounded-2xl shadow-lg p-6 md:p-8 text-center">
                {avgRating ? (
                  <>
                    <div className="text-5xl md:text-6xl font-bold">
                      <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                        {avgRating}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-0.5 mt-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={`text-xl ${
                            n <= Math.round(Number(avgRating))
                              ? "text-accent"
                              : "text-muted/20"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-muted-var text-xs mt-2">Average Rating</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl text-muted/30">☆</div>
                    <p className="text-muted-var text-xs mt-2">No ratings yet</p>
                  </>
                )}
              </div>
              <div className="w-full bg-card border border-var rounded-2xl shadow-lg p-6 md:p-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                      <AnimatedNumber value={reviews.length} />
                    </span>
                  </div>
                  <p className="text-muted-var text-xs mt-2">Total Reviews</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <span className="w-1.5 h-6 bg-accent rounded-full" />
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Ratings &amp; Feedback
              </h2>
              <span className="w-1.5 h-6 bg-accent rounded-full" />
            </div>
          </div>
          <ReviewList refresh={refresh} />
          <div className="mt-6 text-center">
            <button
              onClick={() => setPopupOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition active:scale-[0.98]"
            >
              ✎ Write a Review
            </button>
          </div>
        </div>
      </div>

      {popupOpen && (
        <WriteReviewPopup
          onClose={() => setPopupOpen(false)}
          onSubmitted={() => {
            setPopupOpen(false);
            setRefresh((n) => n + 1);
          }}
        />
      )}
    </section>
  );
}

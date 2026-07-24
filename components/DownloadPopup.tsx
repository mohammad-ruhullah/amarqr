"use client";

import { useState } from "react";
import { useToast } from "./Toast";

export default function DownloadPopup({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!name.trim() || !message.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim(), rating }),
      });
      setSubmitted(true);
      toast("Thank you for your review!", "success");
    } catch {
      toast("Failed to submit review", "error");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {submitted ? (
          <div className="w-full max-w-md animate-scale-in">
            <div className="bg-card border border-var rounded-2xl p-5 shadow-2xl shadow-accent/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-lg">✓</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Review Submitted!</p>
                  <p className="text-xs text-muted">Thanks for your feedback</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-accent text-white rounded-xl text-sm hover:bg-accent/90 transition active:scale-[0.98] shrink-0"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md animate-scale-in">
            <div className="bg-card border border-var rounded-2xl p-5 shadow-2xl shadow-accent/10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-lg">🎉</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">QR Downloaded!</h3>
                    <p className="text-xs text-muted">Love it? Leave a quick review</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-main hover:bg-body transition shrink-0"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3 py-2 text-sm bg-body border border-var rounded-xl text-main placeholder:text-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition"
                  />
                  <div className="flex items-center gap-1 px-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setRating(n)}
                        className={`text-lg transition-all duration-150 ${
                          n <= rating ? "text-accent scale-110" : "text-muted/20 hover:text-accent/50"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-body border border-var rounded-xl text-main placeholder:text-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !name.trim() || !message.trim()}
                    className="flex-1 px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      "Send Review"
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-body text-muted rounded-xl text-sm border border-var hover:text-main hover:border-accent/30 transition active:scale-[0.98]"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

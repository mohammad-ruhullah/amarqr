"use client";

import { useState } from "react";

export default function ReviewForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim(), rating }),
      });
      setName("");
      setMessage("");
      setRating(5);
      onSubmitted();
    } catch {
      // silent
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-var rounded-2xl p-6">
      <h3 className="font-semibold mb-1">Leave a Review</h3>
      <p className="text-muted text-xs mb-5">Share your experience</p>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs text-muted mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full px-3.5 py-2.5 text-sm bg-body border border-var rounded-xl text-main placeholder:text-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            required
            className="w-full px-3.5 py-2.5 text-sm bg-body border border-var rounded-xl text-main placeholder:text-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition resize-none"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`text-2xl transition-all duration-150 ${
                  n <= rating ? "text-accent scale-110" : "text-muted/20 hover:text-accent/50"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit Review"
          )}
        </button>
      </div>
    </form>
  );
}

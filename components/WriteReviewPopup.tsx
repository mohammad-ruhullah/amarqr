"use client";

import ReviewForm from "./ReviewForm";

export default function WriteReviewPopup({
  onClose,
  onSubmitted,
}: {
  onClose: () => void;
  onSubmitted: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-reveal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-0">
          <h3 className="text-lg font-bold">Leave a Review</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-main transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-body"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <ReviewForm onSubmitted={onSubmitted} />
        </div>
      </div>
    </div>
  );
}

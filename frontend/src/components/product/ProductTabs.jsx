import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import RatingStars from "./RatingStars";
import Button from "../common/Button";
import { useAuth } from "../../context/AuthContext";
import { submitReview } from "../../api/products";
import { useToast } from "../../context/ToastContext";

const TABS = ["Description", "Specifications", "Reviews", "Shipping & Returns"];

export default function ProductTabs({ product, onReviewSubmitted }) {
  const [active, setActive] = useState(TABS[0]);
  const { user } = useAuth();
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmitReview(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitReview(product.slug, { rating, comment });
      setComment("");
      showToast("Thanks — your review was posted");
      onReviewSubmitted?.();
    } catch (err) {
      const detail = err.response?.data?.non_field_errors?.[0] || "Could not post your review.";
      showToast(detail, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex gap-7 overflow-x-auto border-b border-ink/10">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`relative whitespace-nowrap pb-3 text-sm font-medium ${
              active === tab ? "text-ink" : "text-stone"
            }`}
          >
            {tab === "Reviews" ? `Reviews (${product.review_count})` : tab}
            {active === tab && (
              <motion.div layoutId="tab-underline" className="absolute -bottom-px left-0 right-0 h-0.5 bg-pine" />
            )}
          </button>
        ))}
      </div>

      <div className="py-7">
        {active === "Description" && (
          <p className="max-w-2xl leading-relaxed text-ink-soft">{product.description}</p>
        )}

        {active === "Specifications" && (
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {Object.entries(product.specifications || {}).length ? (
              Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-ink/10 py-2 text-sm">
                  <dt className="text-stone">{key}</dt>
                  <dd className="font-medium text-ink">{value}</dd>
                </div>
              ))
            ) : (
              <p className="text-stone">No specifications listed for this product yet.</p>
            )}
          </dl>
        )}

        {active === "Reviews" && (
          <div className="max-w-2xl space-y-6">
            {product.reviews.length === 0 && (
              <p className="text-stone">No reviews yet — be the first to share your thoughts.</p>
            )}
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b border-ink/10 pb-5">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-ink">{review.user_display || review.username}</p>
                  <RatingStars rating={review.rating} showCount={false} size={13} />
                </div>
                {review.comment && <p className="mt-1.5 text-sm text-ink-soft">{review.comment}</p>}
              </div>
            ))}

            {user ? (
              <form onSubmit={handleSubmitReview} className="rounded-2xl bg-paper-dim/60 p-5">
                <p className="text-sm font-medium text-ink">Leave a review</p>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                      <Star
                        size={22}
                        className={n <= rating ? "text-brass" : "text-stone/40"}
                        fill={n <= rating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you think?"
                  rows={3}
                  className="mt-3 w-full rounded-xl border border-ink/15 bg-paper p-3 text-sm"
                />
                <div className="mt-3">
                  <Button type="submit" variant="primary" size="md" disabled={submitting}>
                    {submitting ? "Posting…" : "Post review"}
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-stone">
                <Link to="/login" className="font-medium text-pine">Log in</Link> to leave a review.
              </p>
            )}
          </div>
        )}

        {active === "Shipping & Returns" && (
          <div className="max-w-2xl space-y-3 text-ink-soft">
            <p>Orders ship within 1–2 business days. Delivery over Rs 5,000 is free; otherwise a flat Rs 250 fee applies.</p>
            <p>Not the right fit? Items can be returned within 30 days of delivery, unworn and in original packaging, for a full refund.</p>
          </div>
        )}
      </div>
    </div>
  );
}

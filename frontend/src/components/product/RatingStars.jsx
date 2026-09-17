import { Star, StarHalf } from "lucide-react";

export default function RatingStars({ rating = 0, reviewCount, size = 15, showCount = true }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-brass">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < full) return <Star key={i} size={size} fill="currentColor" strokeWidth={0} />;
          if (i === full && hasHalf) return <StarHalf key={i} size={size} fill="currentColor" strokeWidth={0} />;
          return <Star key={i} size={size} strokeWidth={1.5} className="text-stone/50" />;
        })}
      </div>
      {showCount && (
        <span className="text-sm text-stone">
          {rating > 0 ? rating.toFixed(1) : "New"}
          {typeof reviewCount === "number" && ` (${reviewCount})`}
        </span>
      )}
    </div>
  );
}

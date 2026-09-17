import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import RatingStars from "./RatingStars";
import { formatPrice } from "../../lib/format";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { ids, toggle } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const wishlisted = ids.has(product.id);

  async function handleWishlist(e) {
    e.preventDefault();
    if (!user) {
      showToast("Log in to save items to your wishlist");
      navigate("/login");
      return;
    }
    await toggle(product.id);
  }

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-paper-dim">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-stone">No image</div>
        )}

        {product.discount_percent > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-brick px-2.5 py-1 text-xs font-semibold text-on-brick">
            -{product.discount_percent}%
          </span>
        )}

        <motion.button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          whileTap={{ scale: 0.85 }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 text-ink shadow-sm hover:bg-paper"
        >
          <motion.span
            key={wishlisted ? "on" : "off"}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 450, damping: 12 }}
            className="flex"
          >
            <Heart size={16} fill={wishlisted ? "var(--color-brick)" : "none"} color={wishlisted ? "var(--color-brick)" : "currentColor"} />
          </motion.span>
        </motion.button>

        {!product.in_stock && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink/85 px-2.5 py-1 text-xs font-medium text-paper">
            Out of stock
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-xs text-stone">{product.category_name}</p>
        <h3 className="mt-0.5 font-medium text-ink">{product.name}</h3>
        <div className="mt-1">
          <RatingStars rating={product.average_rating} reviewCount={product.review_count} size={13} />
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-semibold text-ink">{formatPrice(product.price)}</span>
          {product.compare_at_price && (
            <span className="text-sm text-stone line-through">{formatPrice(product.compare_at_price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

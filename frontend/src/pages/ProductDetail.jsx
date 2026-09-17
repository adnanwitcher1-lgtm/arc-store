import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Share2 } from "lucide-react";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import PageFade from "../components/common/PageTransition";
import ProductGallery from "../components/product/ProductGallery";
import RatingStars from "../components/product/RatingStars";
import OptionSwatches from "../components/product/OptionSwatches";
import QuantitySelector from "../components/product/QuantitySelector";
import TrustBadges from "../components/product/TrustBadges";
import ProductTabs from "../components/product/ProductTabs";
import ProductGrid from "../components/product/ProductGrid";
import { fetchProduct, fetchProducts } from "../api/products";
import { formatPrice } from "../lib/format";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState([]);
  const [selected, setSelected] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const { addItem } = useCart();
  const { user } = useAuth();
  const { ids: wishlistIds, toggle } = useWishlist();
  const { showToast } = useToast();

  function load() {
    fetchProduct(slug)
      .then((data) => {
        setProduct(data);
        setSelected(Object.fromEntries(data.options.map((o) => [o.id, o.values[0]?.id])));
        setQuantity(1);
        fetchProducts({ category: data.category_slug }).then((res) =>
          setRelated(res.results.filter((p) => p.slug !== slug).slice(0, 4))
        );
      })
      .catch(() => setNotFound(true));
  }

  useEffect(() => {
    setProduct(null);
    setNotFound(false);
    load();
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (notFound) {
    return (
      <Container className="py-24 text-center">
        <h1 className="text-2xl font-semibold text-ink">We couldn't find that product</h1>
        <Link to="/shop" className="mt-4 inline-block text-pine">Back to shop</Link>
      </Container>
    );
  }

  if (!product) {
    return <Container className="py-24 text-center text-stone">Loading…</Container>;
  }

  const wishlisted = wishlistIds.has(product.id);

  async function handleAddToCart(goToCart) {
    setAdding(true);
    try {
      await addItem(product.id, quantity, Object.values(selected).filter(Boolean));
      showToast(goToCart ? "Added — taking you to checkout" : `Added ${product.name} to cart`);
      if (goToCart) navigate("/cart");
    } catch {
      showToast("Could not add that to your cart", "error");
    } finally {
      setAdding(false);
    }
  }

  async function handleWishlist() {
    if (!user) {
      showToast("Log in to save items to your wishlist");
      navigate("/login");
      return;
    }
    await toggle(product.id);
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: product.name, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Link copied");
    }
  }

  return (
    <PageFade>
      <Container className="py-8">
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-stone">
          <Link to="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-ink">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category_slug}`} className="hover:text-ink">{product.category_name}</Link>
          <span>/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <ProductGallery images={product.images} productName={product.name} />

          <div>
            {product.in_stock ? (
              <span className="inline-block rounded-full bg-pine/10 px-3 py-1 text-xs font-medium text-pine">In stock</span>
            ) : (
              <span className="inline-block rounded-full bg-brick/10 px-3 py-1 text-xs font-medium text-brick">Out of stock</span>
            )}

            <h1 className="mt-3 text-3xl font-semibold text-ink">{product.name}</h1>

            <div className="mt-2">
              <RatingStars rating={product.average_rating} reviewCount={product.review_count} />
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-ink">{formatPrice(product.price)}</span>
              {product.compare_at_price && (
                <>
                  <span className="text-lg text-stone line-through">{formatPrice(product.compare_at_price)}</span>
                  <span className="rounded-full bg-brick/10 px-2.5 py-1 text-xs font-semibold text-brick">
                    {product.discount_percent}% off
                  </span>
                </>
              )}
            </div>

            <p className="mt-4 max-w-md text-ink-soft">{product.short_description}</p>

            <div className="mt-6 space-y-5 border-t border-ink/10 pt-6">
              {product.options.map((option) => (
                <OptionSwatches
                  key={option.id}
                  option={option}
                  selectedId={selected[option.id]}
                  onSelect={(valueId) => setSelected((s) => ({ ...s, [option.id]: valueId }))}
                />
              ))}
            </div>

            <div className="mt-6 flex items-center gap-4">
              <QuantitySelector value={quantity} onChange={setQuantity} max={product.stock || 1} />
              <span className="hidden text-sm text-stone sm:block">{product.stock} in stock</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                size="lg"
                disabled={!product.in_stock || adding}
                onClick={() => handleAddToCart(false)}
              >
                Add to cart
              </Button>
              <Button
                variant="primary"
                size="lg"
                disabled={!product.in_stock || adding}
                onClick={() => handleAddToCart(true)}
              >
                Buy now
              </Button>
            </div>

            <div className="mt-5 flex items-center gap-5">
              <button onClick={handleWishlist} className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
                <motion.span
                  key={wishlisted ? "on" : "off"}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 450, damping: 12 }}
                  className="flex"
                >
                  <Heart size={16} fill={wishlisted ? "var(--color-brick)" : "none"} color={wishlisted ? "var(--color-brick)" : "currentColor"} />
                </motion.span>
                {wishlisted ? "Saved" : "Add to wishlist"}
              </button>
              <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <TrustBadges />
        </div>

        <div id="specifications" className="mt-4">
          <ProductTabs product={product} onReviewSubmitted={load} />
        </div>

        {related.length > 0 && (
          <div className="mt-16 border-t border-ink/10 pt-12">
            <h2 className="mb-8 text-2xl font-semibold text-ink">You may also like</h2>
            <ProductGrid products={related} />
          </div>
        )}
      </Container>
    </PageFade>
  );
}

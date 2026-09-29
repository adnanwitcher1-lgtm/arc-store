import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import PageFade from "../components/common/PageTransition";
import ProductGrid from "../components/product/ProductGrid";
import TrustBadges from "../components/product/TrustBadges";
import { useCategories } from "../lib/useCategories";
import { fetchProducts } from "../api/products";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Home() {
  const { categories } = useCategories();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Every product is shown on the home page itself; "Load more" fetches the next page.
  useEffect(() => {
    setLoading(true);
    fetchProducts({ page })
      .then((data) => {
        setProducts((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...data.results.filter((p) => !seen.has(p.id))];
        });
        setHasMore(Boolean(data.next));
        setTotal(data.count);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <PageFade>
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full opacity-30 blur-3xl sm:opacity-40"
          style={{ background: "radial-gradient(circle, var(--color-pine), transparent 70%)" }}
        />
        <motion.div
          className="pointer-events-none absolute right-16 top-24 hidden text-brass sm:block"
          animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
          </svg>
        </motion.div>

        <Container className="relative flex flex-col items-center gap-10 py-10 sm:py-16 lg:flex-row lg:justify-between">
          <div className="max-w-xl">
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-5xl font-semibold leading-[1.05] text-ink sm:text-6xl"
            >
              Everyday, elevated.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="mt-5 max-w-md text-lg text-ink-soft"
            >
              Watches, footwear, skincare, grooming, fashion and lifestyle goods —
              chosen for how they hold up, not just how they photograph.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Button as={Link} to="/shop" variant="primary" size="lg">
                Shop all products
              </Button>
              <Button as={Link} to="/shop?featured=true" variant="secondary" size="lg">
                See today's picks
              </Button>
            </motion.div>
          </div>

          <motion.img
            src="/hero-banner.png"
            alt="Featured watch, perfume, grooming and fashion products"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-lg rounded-2xl object-cover lg:max-w-xl"
          />
        </Container>
      </section>

      {categories.length > 0 && (
        <Container className="pb-10">
          <motion.div
            className="flex flex-wrap gap-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={reveal}
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-pine hover:text-pine"
              >
                {cat.name}
              </Link>
            ))}
          </motion.div>
        </Container>
      )}

      <Container className="pb-20">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-ink">All products</h2>
          {total > 0 && <span className="text-sm text-stone">{total} products</span>}
        </div>

        {loading && products.length === 0 ? (
          <div className="py-16 text-center text-stone">Loading products…</div>
        ) : (
          <ProductGrid products={products} />
        )}

        {hasMore && (
          <div className="mt-12 text-center">
            <Button variant="secondary" size="lg" disabled={loading} onClick={() => setPage((p) => p + 1)}>
              {loading ? "Loading…" : "Load more products"}
            </Button>
          </div>
        )}
      </Container>

      <Container className="pb-20">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={reveal}>
          <TrustBadges />
        </motion.div>
      </Container>
    </PageFade>
  );
}

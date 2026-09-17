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
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetchProducts({ featured: true }).then((data) => setFeatured(data.results));
  }, []);

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

        <Container className="relative py-16 sm:py-24">
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
        </Container>
      </section>

      {categories.length > 0 && (
        <Container className="pb-16">
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

      {featured.length > 0 && (
        <Container className="pb-20">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={reveal}
          >
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-2xl font-semibold text-ink">Today's picks</h2>
              <Link to="/shop?featured=true" className="text-sm font-medium text-pine">
                View all
              </Link>
            </div>
            <ProductGrid products={featured} />
          </motion.div>
        </Container>
      )}

      <Container className="pb-20">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={reveal}>
          <TrustBadges />
        </motion.div>
      </Container>
    </PageFade>
  );
}

import { motion } from "framer-motion";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products, columns = 4 }) {
  const colClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-paper-dim/40 py-16 text-center text-stone">
        No products match these filters yet.
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-x-6 gap-y-10 ${colClass}`}>
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.05, ease: "easeOut" }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  );
}

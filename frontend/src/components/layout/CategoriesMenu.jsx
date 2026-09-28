import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LayoutGrid } from "lucide-react";

export default function CategoriesMenu({ categories }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-full bg-pine px-4 py-2 text-sm font-medium text-on-pine hover:bg-pine-dark"
      >
        <LayoutGrid size={15} />
        All categories
        <ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-60 rounded-xl border border-ink/10 bg-paper p-1.5 shadow-lg">
          <Link
            to="/shop"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-paper-dim"
          >
            All products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-paper-dim hover:text-ink"
            >
              {cat.name}
              <span className="text-xs text-stone">{cat.product_count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

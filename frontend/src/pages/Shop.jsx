import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "../components/common/Container";
import PageFade from "../components/common/PageTransition";
import ProductGrid from "../components/product/ProductGrid";
import { useCategories } from "../lib/useCategories";
import { fetchProducts } from "../api/products";

const SORTS = [
  { value: "", label: "Newest" },
  { value: "price", label: "Price: low to high" },
  { value: "-price", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useCategories();
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const featured = searchParams.get("featured") || "";
  const ordering = searchParams.get("ordering") || "";
  const page = Number(searchParams.get("page") || 1);

  useEffect(() => {
    setLoading(true);
    const params = { page };
    if (category) params.category = category;
    if (search) params.search = search;
    if (featured) params.featured = featured;
    if (ordering) params.ordering = ordering;

    fetchProducts(params)
      .then(setData)
      .finally(() => setLoading(false));
  }, [category, search, featured, ordering, page]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  }

  function goToPage(newPage) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const activeCategoryName = categories.find((c) => c.slug === category)?.name;

  return (
    <PageFade>
      <Container className="py-10">
        <h1 className="text-3xl font-semibold text-ink">
          {featured ? "Today's picks" : activeCategoryName || (search ? `Results for “${search}”` : "All products")}
        </h1>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-56 lg:shrink-0">
            <p className="text-sm font-medium text-ink">Category</p>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <button
                  onClick={() => updateParam("category", "")}
                  className={`rounded-lg px-2 py-1.5 ${!category ? "bg-paper-dim font-medium text-ink" : "text-ink-soft hover:bg-paper-dim/60"}`}
                >
                  All categories
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => updateParam("category", cat.slug)}
                    className={`rounded-lg px-2 py-1.5 ${category === cat.slug ? "bg-paper-dim font-medium text-ink" : "text-ink-soft hover:bg-paper-dim/60"}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-stone">{loading ? "Loading…" : `${data.count} products`}</p>
              <select
                value={ordering}
                onChange={(e) => updateParam("ordering", e.target.value)}
                className="rounded-full border border-ink/15 bg-paper px-4 py-2 text-sm"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <ProductGrid products={data.results} />

            {(data.next || data.previous) && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={!data.previous}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={17} />
                </button>
                <span className="text-sm text-stone">Page {page}</span>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={!data.next}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 disabled:opacity-30"
                  aria-label="Next page"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </PageFade>
  );
}

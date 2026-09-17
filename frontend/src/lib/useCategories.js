import { useEffect, useState } from "react";
import { fetchCategories } from "../api/products";

let cache = null;

export function useCategories() {
  const [categories, setCategories] = useState(cache || []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;

    let cancelled = false;
    setLoading(true);

    fetchCategories()
      .then((data) => {
        if (cancelled) return;
        cache = data;
        setCategories(data);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading };
}
import { useEffect, useState } from "react";
import { fetchCategories } from "../api/products";

let cache = null;
let inFlight = null;

export function useCategories() {
  const [categories, setCategories] = useState(cache || []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    inFlight = inFlight || fetchCategories();
    inFlight
      .then((data) => {
        cache = data;
        setCategories(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}

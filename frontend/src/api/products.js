import client from "./client";

export async function fetchCategories() {
  const { data } = await client.get("/categories/");
  return data.results ?? data;
}

export async function fetchProducts(params = {}) {
  const { data } = await client.get("/products/", { params });
  return data; // { count, next, previous, results }
}

export async function fetchProduct(slug) {
  const { data } = await client.get(`/products/${slug}/`);
  return data;
}

export async function submitReview(slug, payload) {
  const { data } = await client.post(`/products/${slug}/reviews/`, payload);
  return data;
}

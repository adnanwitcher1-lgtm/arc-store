import client from "./client";

export async function getWishlist() {
  const { data } = await client.get("/wishlist/");
  return data.results ?? data;
}

export async function toggleWishlist(productId) {
  const { data } = await client.post("/wishlist/toggle/", { product_id: productId });
  return data; // { wishlisted: true|false }
}

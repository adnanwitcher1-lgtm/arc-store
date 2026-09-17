import client from "./client";

export async function getCart() {
  const { data } = await client.get("/cart/");
  return data;
}

export async function addCartItem({ productId, quantity = 1, optionValueIds = [] }) {
  const { data } = await client.post("/cart/items/", {
    product_id: productId,
    quantity,
    option_value_ids: optionValueIds,
  });
  return data;
}

export async function updateCartItem(itemId, quantity) {
  const { data } = await client.patch(`/cart/items/${itemId}/`, { quantity });
  return data;
}

export async function removeCartItem(itemId) {
  const { data } = await client.delete(`/cart/items/${itemId}/`);
  return data;
}

export async function mergeCart(guestToken) {
  const { data } = await client.post("/cart/merge/", { guest_token: guestToken });
  return data;
}

import client from "./client";

export async function checkout(payload) {
  const { data } = await client.post("/orders/checkout/", payload);
  return data;
}

export async function fetchOrders() {
  const { data } = await client.get("/orders/");
  return data.results ?? data;
}

export async function fetchOrder(id) {
  const { data } = await client.get(`/orders/${id}/`);
  return data;
}

export async function trackOrder({ orderId, email }) {
  const { data } = await client.post("/orders/track/", { order_id: orderId, email });
  return data;
}

import client from "./client";

export async function sendContactMessage(payload) {
  const { data } = await client.post("/contact/", payload);
  return data;
}

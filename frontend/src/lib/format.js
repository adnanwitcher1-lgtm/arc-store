export const CURRENCY = "PKR";
export const LOCALE = "en-PK";

export function formatPrice(value) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
  }).format(Number.isFinite(num) ? num : 0);
}

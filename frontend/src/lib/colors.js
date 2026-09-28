// Turns a colour option value into something we can paint.
// 1) uses the hex code saved in admin, 2) otherwise guesses from the colour name
//    (so "Red", "Navy", "Sage" still show a real colour even if hex was left blank).

const NAMED_COLORS = {
  black: "#1C1C1E", white: "#F2F1EC", "off white": "#EDE8DC", cream: "#F3EAD3", ivory: "#F5F0E1",
  red: "#C0392B", maroon: "#7B1E2B", burgundy: "#6D1F2F", coral: "#F26B5B", terracotta: "#A1432E",
  pink: "#F3B4C0", "hot pink": "#E9498C", rose: "#E8A3B5", "rose gold": "#C9A24B", peach: "#F6C3A0",
  orange: "#E8871E", mustard: "#D9A521", yellow: "#F2C94C", gold: "#C9A24B",
  green: "#2E7D50", olive: "#6B7458", sage: "#8FA38B", mint: "#A8D8C0", teal: "#1F7A7A", "dark green": "#1E4638",
  blue: "#2F6FED", "light blue": "#C7D6E8", "sky blue": "#8CC7F0", "mid blue": "#4C6FE0", navy: "#26314F", "royal blue": "#2B4FC7",
  purple: "#7B4FB5", lavender: "#C9B8E8", violet: "#7F5AB6",
  brown: "#6B4A34", tan: "#C6A87C", khaki: "#C6B084", beige: "#D9C9A8", oatmeal: "#C6B084", camel: "#B98B57",
  grey: "#8E8E93", gray: "#8E8E93", charcoal: "#4B4B4D", graphite: "#4B4B4D", silver: "#C7C7CC",
};

export function resolveColor(value) {
  if (value?.hex_color) return value.hex_color;
  const key = (value?.label || "").trim().toLowerCase();
  return NAMED_COLORS[key] || null;
}

export function isColorOption(option) {
  const name = (option?.name || "").toLowerCase();
  if (name.includes("color") || name.includes("colour")) return true;
  return option?.values?.length > 0 && option.values.every((v) => v.hex_color);
}

// Very light colours need a visible border so the dot doesn't vanish on a light background.
export function needsBorder(hex) {
  if (!hex || !/^#([0-9a-f]{6})$/i.test(hex)) return true;
  const n = parseInt(hex.slice(1), 16);
  const luminance = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return luminance > 0.8;
}

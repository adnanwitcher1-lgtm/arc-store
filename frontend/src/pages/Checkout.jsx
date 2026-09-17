import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import Field from "../components/common/Field";
import PageFade from "../components/common/PageTransition";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { checkout } from "../api/orders";
import { formatPrice } from "../lib/format";

const initialForm = {
  full_name: "", email: "", phone: "", address_line: "", city: "", state: "",
  postal_code: "", country: "", payment_method: "cash_on_delivery", notes: "",
};

export default function Checkout() {
  const { user } = useAuth();
  const { cart, refresh } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...initialForm, full_name: user?.first_name ? `${user.first_name} ${user.last_name}`.trim() : "", email: user?.email || "" });
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <Container className="py-24 text-center">
        <h1 className="text-2xl font-semibold text-ink">Log in to check out</h1>
        <p className="mt-2 text-stone">Your cart will be waiting for you.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button as={Link} to="/login" variant="primary" size="lg">Log in</Button>
          <Button as={Link} to="/register" variant="secondary" size="lg">Create account</Button>
        </div>
      </Container>
    );
  }

  if (cart.items.length === 0) {
    return (
      <Container className="py-24 text-center">
        <h1 className="text-2xl font-semibold text-ink">Your cart is empty</h1>
        <Button as={Link} to="/shop" variant="primary" size="lg" className="mt-6">Browse products</Button>
      </Container>
    );
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const order = await checkout(form);
      await refresh();
      showToast("Order placed — thank you!");
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      showToast(err.response?.data?.detail || "Could not place your order.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageFade>
      <Container className="py-10">
        <h1 className="text-3xl font-semibold text-ink">Checkout</h1>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" value={form.full_name} onChange={(v) => update("full_name", v)} required />
              <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} required />
            </div>
            <Field label="Phone" value={form.phone} onChange={(v) => update("phone", v)} />
            <Field label="Address" value={form.address_line} onChange={(v) => update("address_line", v)} required />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="City" value={form.city} onChange={(v) => update("city", v)} required />
              <Field label="State / Province" value={form.state} onChange={(v) => update("state", v)} />
              <Field label="Postal code" value={form.postal_code} onChange={(v) => update("postal_code", v)} />
            </div>
            <Field label="Country" value={form.country} onChange={(v) => update("country", v)} required />

            <div>
              <p className="text-sm font-medium text-ink">Payment method</p>
              <div className="mt-2 flex gap-3">
                {[
                  { value: "cash_on_delivery", label: "Cash on delivery" },
                  { value: "card", label: "Card" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex-1 cursor-pointer rounded-xl border px-4 py-3 text-sm ${
                      form.payment_method === opt.value ? "border-pine bg-pine/5" : "border-ink/15"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={opt.value}
                      checked={form.payment_method === opt.value}
                      onChange={(e) => update("payment_method", e.target.value)}
                      className="mr-2"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              {form.payment_method === "card" && (
                <p className="mt-2 text-xs text-stone">
                  Card payments aren't wired up to a real processor yet — connect Stripe or another gateway before taking real orders.
                </p>
              )}
            </div>

            <Field label="Notes (optional)" value={form.notes} onChange={(v) => update("notes", v)} textarea />

            <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? "Placing order…" : "Place order"}
            </Button>
          </form>

          <div className="h-fit rounded-2xl bg-paper-dim/60 p-6">
            <h2 className="font-medium text-ink">Order summary</h2>
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
              {cart.items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>{formatPrice(item.line_total)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-ink/10 pt-4 font-medium text-ink">
              <span>Subtotal</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-stone">Free shipping over Rs 5,000, otherwise a flat Rs 250 fee.</p>
          </div>
        </div>
      </Container>
    </PageFade>
  );
}

import { useState } from "react";
import { Search, PackageSearch } from "lucide-react";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import Field from "../components/common/Field";
import PageFade from "../components/common/PageTransition";
import { trackOrder } from "../api/orders";
import { formatPrice } from "../lib/format";

const STATUS_STYLES = {
  pending: "bg-brass/15 text-brass",
  processing: "bg-pine/10 text-pine",
  shipped: "bg-pine/10 text-pine",
  delivered: "bg-pine/15 text-pine",
  cancelled: "bg-brick/10 text-brick",
};

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setOrder(null);
    try {
      const data = await trackOrder({ orderId, email });
      setOrder(data);
    } catch {
      setError("We couldn't find an order with that number and email. Double-check both and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageFade>
      <Container className="flex justify-center py-16">
        <div className="w-full max-w-lg">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pine/10 text-pine">
              <PackageSearch size={28} />
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-ink">Track your order</h1>
            <p className="mt-2 text-sm text-stone">
              Enter your order number and the email you used at checkout.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Field
              label="Order number"
              value={orderId}
              onChange={setOrderId}
              placeholder="e.g. 5"
              required
            />
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
            />
            <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full">
              <Search size={18} className="mr-2" />
              {submitting ? "Searching…" : "Track order"}
            </Button>
          </form>

          {error && (
            <p className="mt-4 rounded-xl bg-brick/10 p-4 text-sm text-brick">{error}</p>
          )}

          {order && (
            <div className="mt-8 rounded-2xl border border-ink/10 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-ink">Order #{order.id}</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[order.status]}`}
                >
                  {order.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-stone">
                Placed on {new Date(order.created_at).toLocaleDateString()}
              </p>

              {order.tracking_id && (
                <p className="mt-3 text-sm text-ink-soft">
                  Courier tracking ID: <span className="font-medium text-ink">{order.tracking_id}</span>
                </p>
              )}

              <ul className="mt-4 space-y-2 text-sm text-ink-soft">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span>{formatPrice(item.line_total)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-ink/10 pt-3 font-medium text-ink">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <p className="mt-4 text-sm text-stone">
                Shipping to {order.address_line}, {order.city}, {order.country}
              </p>
            </div>
          )}
        </div>
      </Container>
    </PageFade>
  );
}

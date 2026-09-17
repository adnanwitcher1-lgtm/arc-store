import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import PageFade from "../components/common/PageTransition";
import { useAuth } from "../context/AuthContext";
import { fetchOrders } from "../api/orders";
import { formatPrice } from "../lib/format";

const STATUS_STYLES = {
  pending: "bg-brass/15 text-brass",
  processing: "bg-pine/10 text-pine",
  shipped: "bg-pine/10 text-pine",
  delivered: "bg-pine/15 text-pine",
  cancelled: "bg-brick/10 text-brick",
};

export default function Orders() {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const justPlacedId = location.state?.justPlacedId;

  useEffect(() => {
    if (!user) return;
    fetchOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <Container className="py-24 text-center">
        <h1 className="text-2xl font-semibold text-ink">Log in to see your orders</h1>
        <Button as={Link} to="/login" variant="primary" size="lg" className="mt-6">Log in</Button>
      </Container>
    );
  }

  return (
    <PageFade>
      <Container className="py-10">
        <h1 className="text-3xl font-semibold text-ink">Your orders</h1>

        {loading ? (
          <p className="mt-8 text-stone">Loading…</p>
        ) : orders.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-stone">No orders yet.</p>
            <Button as={Link} to="/shop" variant="primary" size="lg" className="mt-6">Start shopping</Button>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`rounded-2xl border p-5 ${order.id === justPlacedId ? "border-pine" : "border-ink/10"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink">Order #{order.id}</p>
                    <p className="text-sm text-stone">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                {order.tracking_id && (
                  <p className="mt-2 text-sm text-ink-soft">
                    Tracking ID: <span className="font-medium text-ink">{order.tracking_id}</span>
                  </p>
                )}
                <ul className="mt-4 space-y-1 text-sm text-ink-soft">
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
              </div>
            ))}
          </div>
        )}
      </Container>
    </PageFade>
  );
}

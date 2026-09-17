import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Mail } from "lucide-react";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import PageFade from "../components/common/PageTransition";
import { fetchOrder } from "../api/orders";
import { formatPrice } from "../lib/format";

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchOrder(id).then(setOrder).catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <Container className="py-24 text-center">
        <h1 className="text-2xl font-semibold text-ink">We couldn't find that order</h1>
        <Button as={Link} to="/orders" variant="primary" size="lg" className="mt-6">
          View your orders
        </Button>
      </Container>
    );
  }

  if (!order) {
    return <Container className="py-24 text-center text-stone">Loading…</Container>;
  }

  return (
    <PageFade>
      <Container className="flex justify-center py-16">
        <div className="w-full max-w-lg text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pine/10 text-pine"
          >
            <CheckCircle2 size={36} />
          </motion.div>

          <h1 className="mt-5 text-3xl font-semibold text-ink">Order confirmed!</h1>
          <p className="mt-2 text-ink-soft">
            Thanks, {order.full_name.split(" ")[0]} — order <span className="font-medium text-ink">#{order.id}</span> is on its way to being packed.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-paper-dim px-4 py-2 text-sm text-ink-soft">
            <Mail size={15} />
            A confirmation email is on its way to {order.email}
          </div>

          <div className="mt-8 rounded-2xl border border-ink/10 p-6 text-left">
            <ul className="space-y-2 text-sm text-ink-soft">
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

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button as={Link} to="/shop" variant="primary" size="lg">
              Continue shopping
            </Button>
            <Button as={Link} to="/orders" variant="secondary" size="lg">
              View order history
            </Button>
          </div>
        </div>
      </Container>
    </PageFade>
  );
}

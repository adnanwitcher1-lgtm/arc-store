import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import PageFade from "../components/common/PageTransition";
import QuantitySelector from "../components/product/QuantitySelector";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/format";

export default function Cart() {
  const { cart, loading, updateItem, removeItem } = useCart();

  if (loading) {
    return <Container className="py-24 text-center text-stone">Loading your cart…</Container>;
  }

  if (cart.items.length === 0) {
    return (
      <PageFade>
        <Container className="py-24 text-center">
          <h1 className="text-2xl font-semibold text-ink">Your cart is empty</h1>
          <p className="mt-2 text-stone">Add something you'll love.</p>
          <Button as={Link} to="/shop" variant="primary" size="lg" className="mt-6">
            Browse products
          </Button>
        </Container>
      </PageFade>
    );
  }

  return (
    <PageFade>
      <Container className="py-10">
        <h1 className="text-3xl font-semibold text-ink">Your cart</h1>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-ink/10 pb-6">
                <Link to={`/product/${item.product.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-paper-dim">
                  {item.product.primary_image && (
                    <img src={item.product.primary_image} alt={item.product.name} className="h-full w-full object-cover" />
                  )}
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link to={`/product/${item.product.slug}`} className="font-medium text-ink hover:text-pine">
                        {item.product.name}
                      </Link>
                      {item.selected_options.length > 0 && (
                        <p className="text-sm text-stone">
                          {item.selected_options.map((o) => o.label).join(" · ")}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove item"
                      className="p-1 text-stone hover:text-brick"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <QuantitySelector value={item.quantity} onChange={(q) => updateItem(item.id, q)} />
                    <span className="font-medium text-ink">{formatPrice(item.line_total)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-2xl bg-paper-dim/60 p-6">
            <h2 className="font-medium text-ink">Order summary</h2>
            <div className="mt-4 flex justify-between text-sm text-ink-soft">
              <span>Subtotal ({cart.total_items} items)</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-stone">Shipping and any fees are calculated at checkout.</p>
            <Button as={Link} to="/checkout" variant="primary" size="lg" className="mt-5 w-full">
              Proceed to checkout
            </Button>
          </div>
        </div>
      </Container>
    </PageFade>
  );
}

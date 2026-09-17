import { Link } from "react-router-dom";
import Container from "../common/Container";
import Logo from "../common/Logo";
import { useCategories } from "../../lib/useCategories";
import { useAuth } from "../../context/AuthContext";

export default function Footer() {
  const { categories } = useCategories();
  const { user } = useAuth();

  return (
    <footer className="mt-24 bg-band text-band-fg">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-[26ch] text-sm text-band-fg/70">
            Everyday essentials in watches, footwear, skincare, grooming, fashion and lifestyle —
            chosen for how they hold up, not just how they look.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Shop</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-band-fg/70">
            <li>
              <Link to="/shop" className="hover:text-band-fg">All products</Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link to={`/shop?category=${cat.slug}`} className="hover:text-band-fg">
                  {cat.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/shop?featured=true" className="hover:text-band-fg">Deals</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Your account</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-band-fg/70">
            <li>
              <Link to="/cart" className="hover:text-band-fg">Cart</Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-band-fg">Wishlist</Link>
            </li>
            <li>
              <Link to={user ? "/orders" : "/login"} className="hover:text-band-fg">
                {user ? "Order history" : "Log in"}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Get in touch</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-band-fg/70">
            <li>hello@arcstore.example</li>
            <li>Mon–Sat, 9am–7pm</li>
            <li>Faisalabad, Pakistan</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-band-fg/10 py-5">
        <Container className="text-xs text-band-fg/50">
          © {new Date().getFullYear()} JH. All rights reserved.
        </Container>
      </div>
    </footer>
  );
}

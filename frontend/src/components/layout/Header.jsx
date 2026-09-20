import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, Heart, ShoppingBag, Menu, LogOut } from "lucide-react";
import Container from "../common/Container";
import Logo from "../common/Logo";
import MobileMenu from "./MobileMenu";
import { useCategories } from "../../lib/useCategories";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { cart } = useCart();
  const { ids: wishlistIds } = useWishlist();
  const { user, logout } = useAuth();

  function handleSearch(e) {
    e.preventDefault();
    navigate(query.trim() ? `/shop?search=${encodeURIComponent(query.trim())}` : "/shop");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <Container className="flex h-20 items-center gap-6">
        <button
          className="-ml-2 p-2 text-ink md:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={24} />
        </button>

        <Logo />

        <form onSubmit={handleSearch} className="relative hidden flex-1 max-w-md md:block">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products…"
            className="w-full rounded-full border border-ink/15 bg-paper py-2.5 pl-4 pr-11 text-sm text-ink placeholder:text-stone focus:border-pine"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-2 text-ink hover:bg-paper-dim"
          >
            <Search size={17} />
          </button>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <div className="relative">
            <button
              className="flex items-center gap-1.5 rounded-full p-2 text-ink hover:bg-paper-dim"
              onClick={() => setAccountOpen((v) => !v)}
              aria-label="Account"
            >
              <User size={21} />
              <span className="hidden text-sm sm:inline">{user ? user.first_name || user.username : "Account"}</span>
            </button>
            {accountOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-ink/10 bg-paper p-1.5 shadow-lg"
                onMouseLeave={() => setAccountOpen(false)}
              >
                {user ? (
                  <>
                    <Link
                      to="/orders"
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-paper-dim"
                      onClick={() => setAccountOpen(false)}
                    >
                      My orders
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setAccountOpen(false);
                        navigate("/");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-paper-dim"
                    >
                      <LogOut size={15} /> Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-paper-dim"
                      onClick={() => setAccountOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-paper-dim"
                      onClick={() => setAccountOpen(false)}
                    >
                      Create account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link to="/wishlist" className="relative rounded-full p-2 text-ink hover:bg-paper-dim" aria-label="Wishlist">
            <Heart size={21} />
            {wishlistIds.size > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-brick text-[10px] font-semibold text-on-brick">
                {wishlistIds.size}
              </span>
            )}
          </Link>

          <Link to="/cart" className="relative rounded-full p-2 text-ink hover:bg-paper-dim" aria-label="Cart">
            <ShoppingBag size={21} />
            {cart.total_items > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-pine text-[10px] font-semibold text-on-pine">
                {cart.total_items}
              </span>
            )}
          </Link>
        </div>
      </Container>

      <nav className="hidden border-t border-ink/10 md:block">
        <Container className="flex h-12 items-center gap-7 text-sm">
          <Link to="/shop" className="font-medium text-ink hover:text-pine">
            All products
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="text-ink-soft hover:text-pine">
              {cat.name}
            </Link>
          ))}
          <Link to="/track-order" className="ml-auto font-medium text-ink-soft hover:text-pine">
            Track order
          </Link>
          <Link to="/shop?featured=true" className="font-medium text-brick hover:text-brick/80">
            Deals
          </Link>
        </Container>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} categories={categories} />
    </header>
  );
}

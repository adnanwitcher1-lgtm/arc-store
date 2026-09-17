import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import Logo from "../common/Logo";
import { useAuth } from "../../context/AuthContext";

export default function MobileMenu({ open, onClose, categories }) {
  const { user, logout } = useAuth();

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-ink/40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-xs flex-col bg-paper p-6 shadow-2xl md:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={onClose} aria-label="Close menu" className="p-2 text-ink">
                <X size={22} />
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-1 text-base">
              <Link to="/shop" onClick={onClose} className="rounded-lg px-2 py-2.5 font-medium hover:bg-paper-dim">
                All products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  onClick={onClose}
                  className="rounded-lg px-2 py-2.5 text-ink-soft hover:bg-paper-dim"
                >
                  {cat.name}
                </Link>
              ))}
              <Link to="/shop?featured=true" onClick={onClose} className="rounded-lg px-2 py-2.5 font-medium text-brick">
                Deals
              </Link>
            </nav>

            <div className="mt-auto flex flex-col gap-1 border-t border-ink/10 pt-4 text-sm">
              {user ? (
                <>
                  <Link to="/orders" onClick={onClose} className="rounded-lg px-2 py-2.5 hover:bg-paper-dim">
                    My orders
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="rounded-lg px-2 py-2.5 text-left hover:bg-paper-dim"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={onClose} className="rounded-lg px-2 py-2.5 hover:bg-paper-dim">
                    Log in
                  </Link>
                  <Link to="/register" onClick={onClose} className="rounded-lg px-2 py-2.5 hover:bg-paper-dim">
                    Create account
                  </Link>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
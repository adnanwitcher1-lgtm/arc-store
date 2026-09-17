import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as wishlistApi from "../api/wishlist";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      const data = await wishlistApi.getWishlist();
      setItems(data);
    } catch {
      setItems([]);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const ids = new Set(items.map((i) => i.product.id));

  async function toggle(productId) {
    if (!user) return { requiresLogin: true };
    const result = await wishlistApi.toggleWishlist(productId);
    await refresh();
    return result;
  }

  return (
    <WishlistContext.Provider value={{ items, ids, toggle, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as cartApi from "../api/cart";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, total_items: 0 });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Re-pull the cart whenever auth state flips, so a post-login merge shows up.
  }, [refresh, user]);

  async function addItem(productId, quantity = 1, optionValueIds = []) {
    const data = await cartApi.addCartItem({ productId, quantity, optionValueIds });
    setCart(data);
    return data;
  }

  async function updateItem(itemId, quantity) {
    const data = await cartApi.updateCartItem(itemId, quantity);
    setCart(data);
  }

  async function removeItem(itemId) {
    const data = await cartApi.removeCartItem(itemId);
    setCart(data);
  }

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

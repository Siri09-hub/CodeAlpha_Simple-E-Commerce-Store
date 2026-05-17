import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    stock: number;
  };
};

type CartValue = {
  items: CartItem[];
  count: number;
  total: number;
  loading: boolean;
  addToCart: (productId: string, qty?: number) => Promise<void>;
  updateQty: (id: string, qty: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("cart_items")
      .select("id, product_id, quantity, product:products(id, name, price, image_url, stock)")
      .eq("user_id", user.id);
    if (!error && data) setItems(data as unknown as CartItem[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addToCart = async (productId: string, qty = 1) => {
    if (!user) { toast.error("Please log in first"); return; }
    const existing = items.find((i) => i.product_id === productId);
    if (existing) {
      await updateQty(existing.id, existing.quantity + qty);
    } else {
      const { error } = await supabase.from("cart_items").insert({
        user_id: user.id, product_id: productId, quantity: qty,
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Added to cart");
      await refresh();
    }
  };

  const updateQty = async (id: string, qty: number) => {
    if (qty < 1) return removeItem(id);
    const { error } = await supabase.from("cart_items").update({ quantity: qty }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    await refresh();
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    await refresh();
  };

  const clear = async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    await refresh();
  };

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * Number(i.product?.price ?? 0), 0);

  return (
    <CartContext.Provider value={{ items, count, total, loading, addToCart, updateQty, removeItem, clear, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

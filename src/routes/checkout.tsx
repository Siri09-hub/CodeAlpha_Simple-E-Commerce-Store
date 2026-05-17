import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

function CheckoutPage() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", city: "", zip: "" });

  if (!user) return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <p>Please <Link to="/login" className="underline">sign in</Link> to checkout.</p>
    </main>
  );

  if (items.length === 0 && !submitting) return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="text-muted-foreground">Your cart is empty.</p>
      <Button asChild className="mt-4"><Link to="/">Shop</Link></Button>
    </main>
  );

  const shipping = total > 5000 ? 0 : 99;
  const grand = total + shipping;

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user.id,
      total: grand,
      shipping_name: form.name,
      shipping_address: form.address,
      shipping_city: form.city,
      shipping_zip: form.zip,
    }).select().single();
    if (error || !order) { toast.error(error?.message || "Failed to place order"); setSubmitting(false); return; }

    const orderItems = items.map((it) => ({
      order_id: order.id,
      product_id: it.product_id,
      product_name: it.product.name,
      price: it.product.price,
      quantity: it.quantity,
    }));
    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) { toast.error(itemsError.message); setSubmitting(false); return; }

    await clear();
    toast.success("Order placed!");
    navigate({ to: "/orders" });
  };

  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px]">
      <form onSubmit={placeOrder} className="space-y-4">
        <h1 className="font-display text-3xl">Checkout</h1>
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="zip">PIN code</Label>
            <Input id="zip" required value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Placing order…" : `Place order · ${formatINR(grand)}`}
        </Button>
      </form>
      <aside className="h-fit rounded-xl border bg-card p-6">
        <h2 className="font-display text-xl">Order</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((it) => (
            <li key={it.id} className="flex justify-between">
              <span>{it.product.name} × {it.quantity}</span>
              <span>${(it.product.price * it.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t pt-4 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${total.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping ? `$${shipping.toFixed(2)}` : "Free"}</span></div>
        </div>
        <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
          <span>Total</span><span>${grand.toFixed(2)}</span>
        </div>
      </aside>
    </main>
  );
}

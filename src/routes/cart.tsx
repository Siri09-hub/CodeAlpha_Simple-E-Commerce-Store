import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X } from "lucide-react";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const { user } = useAuth();
  const { items, total, updateQty, removeItem } = useCart();

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Your cart</h1>
        <p className="mt-3 text-muted-foreground">Sign in to view your cart.</p>
        <Button asChild className="mt-6"><Link to="/login">Sign in</Link></Button>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <Button asChild className="mt-6"><Link to="/">Continue shopping</Link></Button>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px]">
      <section>
        <h1 className="font-display text-3xl">Cart</h1>
        <ul className="mt-6 divide-y border-y">
          {items.map((it) => (
            <li key={it.id} className="flex gap-4 py-5">
              <Link to="/product/$id" params={{ id: it.product_id }} className="size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                {it.product?.image_url && <img src={it.product.image_url} alt={it.product.name} className="h-full w-full object-cover" />}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <Link to="/product/$id" params={{ id: it.product_id }} className="font-medium hover:underline">
                    {it.product?.name}
                  </Link>
                  <button onClick={() => removeItem(it.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                    <X className="size-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">${Number(it.product?.price).toFixed(2)}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-md border">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => updateQty(it.id, it.quantity - 1)}>
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{it.quantity}</span>
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => updateQty(it.id, it.quantity + 1)}>
                      <Plus className="size-3" />
                    </Button>
                  </div>
                  <p className="font-semibold">${(it.quantity * Number(it.product?.price)).toFixed(2)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <aside className="h-fit rounded-xl border bg-card p-6">
        <h2 className="font-display text-xl">Summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${total.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{total > 100 ? "Free" : "$9.00"}</span></div>
        </div>
        <div className="mt-4 flex justify-between border-t pt-4 text-base font-semibold">
          <span>Total</span>
          <span>${(total + (total > 100 ? 0 : 9)).toFixed(2)}</span>
        </div>
        <Button asChild className="mt-6 w-full" size="lg"><Link to="/checkout">Checkout</Link></Button>
      </aside>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/orders")({ component: OrdersPage });

function OrdersPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    enabled: !!user,
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (!user) return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <p>Please <Link to="/login" className="underline">sign in</Link> to see orders.</p>
    </main>
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl">Your orders</h1>
      {isLoading ? (
        <p className="mt-6 text-muted-foreground">Loading…</p>
      ) : !data || data.length === 0 ? (
        <div className="mt-10 rounded-xl border bg-card p-10 text-center">
          <p className="text-muted-foreground">No orders yet.</p>
          <Button asChild className="mt-4"><Link to="/">Start shopping</Link></Button>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {data.map((o) => (
            <li key={o.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Order</p>
                  <p className="font-mono text-sm">{o.id.slice(0, 8)}</p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs capitalize">{o.status}</span>
                <p className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                <p className="font-semibold">{formatINR(o.total)}</p>
              </div>
              <ul className="mt-4 space-y-1 border-t pt-4 text-sm">
                {o.order_items?.map((it: { id: string; product_name: string; quantity: number; price: number }) => (
                  <li key={it.id} className="flex justify-between">
                    <span>{it.product_name} × {it.quantity}</span>
                    <span>{formatINR(Number(it.price) * it.quantity)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

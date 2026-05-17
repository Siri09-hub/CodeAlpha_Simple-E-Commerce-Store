import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { addToCart } = useCart();

  const { data: p, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Skeleton className="aspect-[4/5] max-w-md rounded-xl" />
      </main>
    );
  }
  if (!p) return <main className="mx-auto max-w-6xl px-4 py-20 text-center">Not found.</main>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Back to shop
      </Link>
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
          {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />}
        </div>
        <div className="flex flex-col">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">{p.category}</p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{p.name}</h1>
          <div className="mt-3 flex items-center gap-1 text-sm">
            <Star className="size-4 fill-current text-accent" />
            <span className="font-medium">{Number(p.rating).toFixed(1)}</span>
            <span className="text-muted-foreground">· {p.stock} in stock</span>
          </div>
          <p className="mt-6 text-muted-foreground">{p.description}</p>
          <div className="mt-8 flex items-end justify-between border-t pt-6">
            <span className="text-3xl font-semibold">${Number(p.price).toFixed(2)}</span>
            <Button size="lg" onClick={() => addToCart(p.id)} disabled={p.stock < 1}>
              {p.stock < 1 ? "Sold out" : "Add to cart"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

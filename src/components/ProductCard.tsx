import { Link } from "@tanstack/react-router";
import { Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatINR } from "@/lib/format";

export type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  rating: number;
  stock: number;
};

export function ProductCard({ p }: { p: Product }) {
  const { addToCart } = useCart();
  return (
    <article className="group flex flex-col">
      <Link to="/product/$id" params={{ id: p.id }} className="relative block overflow-hidden rounded-xl bg-muted aspect-[4/5]">
        {p.image_url && (
          <img
            src={p.image_url}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <Button
          size="icon"
          variant="secondary"
          onClick={(e) => { e.preventDefault(); addToCart(p.id); }}
          className="absolute bottom-3 right-3 size-9 rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100"
          aria-label="Add to cart"
        >
          <Plus className="size-4" />
        </Button>
      </Link>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <Link to="/product/$id" params={{ id: p.id }} className="font-medium hover:underline">
            {p.name}
          </Link>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3 fill-current text-accent" /> {Number(p.rating).toFixed(1)}
            <span className="mx-1">·</span>
            <span className="capitalize">{p.category}</span>
          </div>
        </div>
        <p className="font-semibold">{formatINR(p.price)}</p>
      </div>
    </article>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type Product } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

type Search = { q?: string; category?: string };

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: (s.q as string) || "",
    category: (s.category as string) || "",
  }),
  component: Home,
});

function Home() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState(search.q || "");

  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((p) => {
      const matchQ = !search.q || p.name.toLowerCase().includes(search.q.toLowerCase());
      const matchC = !search.category || p.category === search.category;
      return matchQ && matchC;
    });
  }, [data, search]);

  const categories = useMemo(() => Array.from(new Set((data || []).map((p) => p.category))), [data]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6">
      <section className="py-16 sm:py-24">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Est. 2026 · Free shipping over $100</p>
        <h1 className="mt-4 text-5xl font-semibold sm:text-7xl">Objects, made to last.</h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          A small, evolving catalog of everyday essentials — selected for craft, materials, and quiet design.
        </p>
      </section>

      <section className="flex flex-col gap-4 border-y py-4 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => { e.preventDefault(); navigate({ search: { q: query, category: search.category } }); }}
          className="relative md:hidden"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="pl-9" />
        </form>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!search.category ? "default" : "outline"}
            size="sm"
            onClick={() => navigate({ search: { q: search.q, category: "" } })}
          >
            All
          </Button>
          {categories.map((c) => (
            <Button
              key={c}
              variant={search.category === c ? "default" : "outline"}
              size="sm"
              className="capitalize"
              onClick={() => navigate({ search: { q: search.q, category: c } })}
            >
              {c}
            </Button>
          ))}
        </div>
      </section>

      <section className="py-10">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No products match your search.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
    </main>
  );
}

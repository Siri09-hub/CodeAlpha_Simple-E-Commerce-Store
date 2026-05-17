import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Search, User, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/", search: { q } as never });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight">Maison</span>
        </Link>

        <form onSubmit={submit} className="relative ml-4 hidden flex-1 max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="pl-9"
          />
        </form>

        <div className="ml-auto flex items-center gap-1">
          {isAdmin && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin"><ShieldCheck className="size-4" /> Admin</Link>
            </Button>
          )}
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/orders">Orders</Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label="Sign out">
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to="/login"><User className="size-4" /> Sign in</Link>
            </Button>
          )}
          <Button asChild variant="ghost" size="icon" className="relative" aria-label="Cart">
            <Link to="/cart">
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

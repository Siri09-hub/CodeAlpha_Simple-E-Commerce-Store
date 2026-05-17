
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- PRODUCTS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- CART
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- ORDERS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  shipping_name TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- POLICIES: profiles
CREATE POLICY "Profiles viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- POLICIES: user_roles
CREATE POLICY "Users can view their roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- POLICIES: products (public read, admin write)
CREATE POLICY "Products are public" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins insert products" ON public.products FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update products" ON public.products FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete products" ON public.products FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- POLICIES: cart
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- POLICIES: orders
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid()));
CREATE POLICY "Users insert own order items" ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid()));
CREATE POLICY "Admins view all order items" ON public.order_items FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  SELECT COUNT(*) INTO user_count FROM auth.users;
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

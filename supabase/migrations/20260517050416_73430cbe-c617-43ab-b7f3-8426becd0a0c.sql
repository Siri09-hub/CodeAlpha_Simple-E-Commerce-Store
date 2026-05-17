
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';

-- Convert USD prices to INR
UPDATE public.products SET price = ROUND(price * 83);

-- Backfill multiple images per product (curated Unsplash sets)
UPDATE public.products SET images = ARRAY[
  image_url,
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1000&q=80',
  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1000&q=80',
  'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=1000&q=80'
] WHERE name = 'Wireless Headphones';

UPDATE public.products SET images = ARRAY[
  image_url,
  'https://images.unsplash.com/photo-1595225476474-87563907a212?w=1000&q=80',
  'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1000&q=80',
  'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=1000&q=80'
] WHERE name = 'Mechanical Keyboard';

UPDATE public.products SET images = ARRAY[
  image_url,
  'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1000&q=80',
  'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1000&q=80',
  'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=1000&q=80'
] WHERE name = 'Minimal Smartwatch';

UPDATE public.products SET images = ARRAY[
  image_url,
  'https://images.unsplash.com/photo-1606986628253-49aa83f06d43?w=1000&q=80',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1000&q=80',
  'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1000&q=80'
] WHERE name = 'Pro Camera';

UPDATE public.products SET images = ARRAY[
  image_url,
  'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=1000&q=80',
  'https://images.unsplash.com/photo-1442550528053-c431ecb55509?w=1000&q=80',
  'https://images.unsplash.com/photo-1559525839-d9acfd1d0a52?w=1000&q=80'
] WHERE name = 'Ceramic Pour-Over';

UPDATE public.products SET images = ARRAY[
  image_url,
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&q=80',
  'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=1000&q=80',
  'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=1000&q=80'
] WHERE name = 'Leather Backpack';

UPDATE public.products SET images = ARRAY[
  image_url,
  'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1000&q=80',
  'https://images.unsplash.com/photo-1573148195900-7845dcb9b127?w=1000&q=80',
  'https://images.unsplash.com/photo-1565374395542-0ce18882c857?w=1000&q=80'
] WHERE name = 'Desk Lamp';

UPDATE public.products SET images = ARRAY[
  image_url,
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1000&q=80',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1000&q=80',
  'https://images.unsplash.com/photo-1622445275576-721325763afe?w=1000&q=80'
] WHERE name = 'Linen Tee';

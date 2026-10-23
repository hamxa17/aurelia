-- Aurelia store — starter products (19 items, placeholder prices; edit in the admin panel)
-- Run AFTER schema.sql, once. Running it twice will add duplicates.
insert into public.products (name, price, note, accent, badge, section, subcategory, sort_order) values
  ('Araya Collagen Mix Berry', 1200, 'Collagen drink mix, berry flavour', 'berry', null, 'supplements', null, 10),
  ('Fiber Xs Collagen (Apple)', 1100, 'Fibre + collagen, apple flavour', 'sage', null, 'supplements', null, 20),
  ('Gluta Berry (Pink Collagen)', 1300, 'Glutathione + pink collagen', 'rose', null, 'supplements', null, 30),
  ('Gluta Collagen Tomato & Cherry', 1300, 'Glutathione collagen, tomato & cherry', 'berry', null, 'supplements', null, 40),
  ('Garnier Bright Complete Ampoule Serum 3% Niacinamide', 650, 'Brightening serum with 3% niacinamide', 'gold', null, 'skincare', 'Facial Serum', 50),
  ('Garnier Facewash', 350, 'Everyday brightening facewash', 'gold', null, 'skincare', 'Facewash', 60),
  ('Garnier Super Whip', 450, 'Whipped foam cleanser', 'rose', null, 'skincare', 'Super Whips', 70),
  ('Garnier Face Scrub', 380, 'Gentle exfoliating scrub', 'clay', null, 'skincare', 'Face Scrub', 80),
  ('CeraVe Moisturiser', 1800, 'Barrier-repair moisturising cream', 'sage', null, 'skincare', 'Moisturiser', 90),
  ('Papaya Facewash', 250, 'Papaya extract facewash', 'clay', null, 'skincare', 'Facewash', 100),
  ('TRESemmé Shampoo', 550, 'Salon-style everyday shampoo', 'gold', null, 'haircare', 'Shampoo', 110),
  ('Sunsilk Shampoo', 350, 'Everyday shine shampoo', 'rose', null, 'haircare', 'Shampoo', 120),
  ('Dove Shampoo', 450, 'Nourishing care shampoo', 'sage', null, 'haircare', 'Shampoo', 130),
  ('TRESemmé Conditioner', 550, 'Smoothing conditioner', 'gold', null, 'haircare', 'Conditioner', 140),
  ('Organic Coffee Shampoo', 500, 'Coffee extract shampoo', 'clay', null, 'haircare', 'Shampoo', 150),
  ('Organic Olive Shampoo', 500, 'Olive oil shampoo', 'sage', null, 'haircare', 'Shampoo', 160),
  ('Vitamin E Collagen Body Lotion', 400, 'Vitamin E + collagen body lotion', 'rose', null, 'skincare', 'Body Care', 170),
  ('Kojic Soap', 200, 'Kojic acid brightening soap', 'gold', null, 'skincare', 'Facewash', 180),
  ('Garnier UV Sunscreen (Clear)', 550, 'Clear, lightweight UV protection', 'gold', null, 'skincare', 'Sunscreen', 190);

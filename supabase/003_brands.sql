-- Split brand from product name so cards can show "GARNIER" above "Bright Complete Facewash"
update public.products p set brand = v.brand, name = v.new_name
from (values
  ('Garnier Bright Complete Ampoule Serum 3% Niacinamide', 'Garnier', 'Bright Complete Vitamin C Serum'),
  ('Garnier Facewash', 'Garnier', 'Bright Complete Facewash'),
  ('Garnier Super Whip', 'Garnier', 'Sakura Glow Super Whip'),
  ('Garnier Face Scrub', 'Garnier', 'Pure Active Charcoal Scrub'),
  ('Garnier UV Sunscreen (Clear)', 'Garnier', 'Super UV Sunscreen (Clear)'),
  ('CeraVe Moisturiser', 'CeraVe', 'Moisturising Cream'),
  ('TRESemmé Shampoo', 'TRESemmé', 'Keratin Smooth Shampoo'),
  ('TRESemmé Conditioner', 'TRESemmé', 'Keratin Smooth Conditioner'),
  ('Sunsilk Shampoo', 'Sunsilk', 'Volume Shampoo'),
  ('Dove Shampoo', 'Dove', 'Hair Fall Rescue Shampoo'),
  ('Araya Collagen Mix Berry', 'Araya', 'Collagen Mix Berry'),
  ('Fiber Xs Collagen (Apple)', 'Fiber XS', 'Collagen (Apple)')
) as v(old_name, brand, new_name)
where p.name = v.old_name;

insert into public.fr_grocery_categories(name,slug,sort_order) values
('Rice & Rice Varieties','rice',1),
('Dals & Pulses','dals',2),
('Atta, Flour & Millets','flour',3),
('Oils & Ghee','oils',4),
('Spices & Masalas','spices',5),
('Sugar, Salt & Sweeteners','sugar-salt',6),
('Snacks & Biscuits','snacks',7),
('Dairy & Breakfast','dairy',8),
('Beverages','beverages',9),
('Cleaning & Household','cleaning',10),
('Personal Care','personal-care',11),
('Baby Care','baby-care',12),
('Fruits & Vegetables','fruits-vegetables',13)
on conflict (slug) do nothing;

-- Draft catalogue: 52 core grocery items x 8 pack/quantity variants = 416 unique SKUs.
-- All rows remain inactive and at zero price until an approved seller confirms price, stock and image.
with base_items(category_slug, product_name) as (
  values
  ('rice','Sona Masoori Rice'),('rice','Basmati Rice'),('rice','Raw Rice'),('rice','Boiled Rice'),
  ('dals','Toor Dal'),('dals','Moong Dal'),('dals','Urad Dal'),('dals','Chana Dal'),
  ('flour','Wheat Atta'),('flour','Maida'),('flour','Ragi Flour'),('flour','Jowar Flour'),
  ('oils','Sunflower Oil'),('oils','Groundnut Oil'),('oils','Rice Bran Oil'),('oils','Cow Ghee'),
  ('spices','Turmeric Powder'),('spices','Red Chilli Powder'),('spices','Coriander Powder'),('spices','Garam Masala'),
  ('sugar-salt','Sugar'),('sugar-salt','Iodised Salt'),('sugar-salt','Jaggery'),('sugar-salt','Rock Salt'),
  ('snacks','Marie Biscuits'),('snacks','Glucose Biscuits'),('snacks','Potato Chips'),('snacks','Mixture'),
  ('dairy','Toned Milk'),('dairy','Curd'),('dairy','Paneer'),('dairy','Oats'),
  ('beverages','Tea Powder'),('beverages','Coffee Powder'),('beverages','Fruit Juice'),('beverages','Drinking Water'),
  ('cleaning','Bathing Soap'),('cleaning','Detergent Powder'),('cleaning','Dishwash Bar'),('cleaning','Floor Cleaner'),
  ('personal-care','Toothpaste'),('personal-care','Toothbrush'),('personal-care','Shampoo'),('personal-care','Hair Oil'),
  ('baby-care','Baby Diapers'),('baby-care','Baby Wipes'),('baby-care','Baby Soap'),('baby-care','Baby Powder'),
  ('fruits-vegetables','Onion'),('fruits-vegetables','Potato'),('fruits-vegetables','Tomato'),('fruits-vegetables','Banana')
),
packs(pack_label, pack_code) as (
  values ('100 g','100g'),('200 g','200g'),('500 g','500g'),('1 kg','1kg'),
         ('2 kg','2kg'),('5 kg','5kg'),('1 litre','1l'),('2 litre','2l')
)
insert into public.fr_grocery_products(category_id, sku, product_name, pack_label, mrp, selling_price, is_active)
select c.id,
       upper(b.category_slug || '-' || regexp_replace(lower(b.product_name),'[^a-z0-9]+','-','g') || '-' || p.pack_code),
       b.product_name,
       p.pack_label,
       0, 0, false
from base_items b
join public.fr_grocery_categories c on c.slug=b.category_slug
cross join packs p
on conflict (sku) do nothing;

-- Verify expected draft SKU count:
-- select count(*) from public.fr_grocery_products; -- expected 416 from this seed.

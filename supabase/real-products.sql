-- Marjan: replace all products with the real catalogue (18 products).
-- Past orders are NOT affected: each order keeps its own copy of the items, names and prices.

begin;

alter table public.products add column if not exists subcategory text;

delete from public.products;

insert into public.products
  (name, brand, category, subcategory, price, sale_price, stock, featured, image_url, youtube_url, description, created_at)
values
  ('TECO TK 150 Chiller', 'TECO', 'Heating & Cooling', 'Chillers', 33000, null, 10, true, '/products/teco-tk150.jpg', 'https://www.youtube.com/watch?v=IoTxOnMogfQ', 'Compact TECO chiller for smaller aquariums. The titanium heat exchanger works in fresh and salt water, and the digital thermostat holds the temperature you set.
Cooling only.', now() - interval '0 minutes'),
  ('TECO TK 500 Chiller', 'TECO', 'Heating & Cooling', 'Chillers', 48000, null, 10, true, '/products/teco-tk500.jpg', 'https://www.youtube.com/watch?v=t1wkcDxn-70', 'TECO TK 500 chiller for aquariums up to 500 litres. Titanium heat exchanger, eco-friendly R290 refrigerant and Wi-Fi control.
Cooling only. For cooling and heating in one unit, choose the TK 500 H.', now() - interval '1 minutes'),
  ('TECO TK 500 H Chiller & Heater', 'TECO', 'Heating & Cooling', 'Chillers', 53000, null, 10, true, '/products/teco-tk500.jpg', 'https://www.youtube.com/watch?v=t1wkcDxn-70', 'TECO TK 500 H for aquariums up to 500 litres. A chiller with a built-in heater, so one unit both cools and heats your tank all year round.
Titanium heat exchanger, eco-friendly R290 refrigerant and Wi-Fi control.', now() - interval '2 minutes'),
  ('TECO TK 1000 H Chiller & Heater', 'TECO', 'Heating & Cooling', 'Chillers', 70000, null, 10, true, '/products/teco-tk1000.jpg', 'https://www.youtube.com/watch?v=WN79aaRTbjk', 'TECO''s larger chiller for bigger aquariums, with a built-in heater so it both cools and heats.
Titanium heat exchanger, eco-friendly R290 refrigerant and Wi-Fi control.', now() - interval '3 minutes'),
  ('Aquaforest Hybrid Pro Salt 22 kg', 'Aquaforest', 'Salt & Additives', 'Salt Mix', 5800, null, 0, false, '/products/aquaforest-hybrid-pro-salt.jpg', 'https://www.youtube.com/watch?v=2_IY4UiGQZ4', 'Laboratory-made salt with natural sea salt flakes and a blend of probiotics that support coral immunity, reduce nutrients and stabilise parameters. Contains vitamins and amino acids.
The 22 kg bucket makes about 564 litres of salt water at 33 ppt.', now() - interval '4 minutes'),
  ('Aquaforest Reef Salt 22 kg', 'Aquaforest', 'Salt & Additives', 'Salt Mix', 5500, null, 0, false, '/products/aquaforest-reef-salt.jpg', 'https://www.youtube.com/watch?v=Kj5eyr1JIuo', 'Laboratory-made reef salt with stable, lab-guaranteed parameters, proven on a wide variety of corals. Suitable for SPS, LPS and soft corals, clams and fish.
The 22 kg bucket makes about 564 litres of salt water at 33 ppt.', now() - interval '5 minutes'),
  ('Filter X Solid Filter 10 × 20 cm', 'Filter X', 'Filtration', 'Solid Filters', 2200, null, 10, false, '/products/filter-x-10x20.jpg', null, 'Filter X solid filter.
Size: 10 × 20 cm.', now() - interval '6 minutes'),
  ('Filter X Solid Filter 10 × 15 cm', 'Filter X', 'Filtration', 'Solid Filters', 1800, null, 10, false, '/products/filter-x-10x15.jpg', null, 'Filter X solid filter.
Size: 10 × 15 cm.', now() - interval '7 minutes'),
  ('Filter X Solid Filter 10 × 25 cm', 'Filter X', 'Filtration', 'Solid Filters', 2500, null, 10, false, '/products/filter-x-10x25.jpg', null, 'Filter X solid filter.
Size: 10 × 25 cm.', now() - interval '8 minutes'),
  ('Filter X Solid Filter 5 × 20 cm', 'Filter X', 'Filtration', 'Solid Filters', 1600, null, 10, false, '/products/filter-x-5x20.jpg', null, 'Filter X solid filter.
Size: 5 × 20 cm.', now() - interval '9 minutes'),
  ('Filter X Solid Filter 5 × 15 cm', 'Filter X', 'Filtration', 'Solid Filters', 1300, null, 10, false, '/products/filter-x-5x15.jpg', null, 'Filter X solid filter.
Size: 5 × 15 cm.', now() - interval '10 minutes'),
  ('Filter X Solid Filter 18 × 20 cm', 'Filter X', 'Filtration', 'Solid Filters', 2500, null, 10, false, '/products/filter-x-18x20.jpg', null, 'Filter X solid filter.
Size: 18 × 20 cm.', now() - interval '11 minutes'),
  ('Filter X Solid Filter 18 × 15 cm', 'Filter X', 'Filtration', 'Solid Filters', 2800, null, 10, false, '/products/filter-x-18x15.jpg', null, 'Filter X solid filter.
Size: 18 × 15 cm.', now() - interval '12 minutes'),
  ('Sicce Multi 800 Return Pump', 'Sicce', 'Pumps & Powerheads', 'Return Pumps', 1600, null, 0, false, '/products/sicce-multi-800-1300.jpg', 'https://www.youtube.com/watch?v=E8WkQ1g1iX8', 'Sicce Multi multifunction pump for water recirculation, for use as a return pump. Made in Italy, with a 3-year guarantee.
Flow: 800 l/h. Power: 13 W.', now() - interval '13 minutes'),
  ('Sicce Multi 1300 Return Pump', 'Sicce', 'Pumps & Powerheads', 'Return Pumps', 2000, null, 0, false, '/products/sicce-multi-800-1300.jpg', 'https://www.youtube.com/watch?v=E8WkQ1g1iX8', 'Sicce Multi multifunction pump for water recirculation, for use as a return pump. Made in Italy, with a 3-year guarantee.
Flow: 1,200 l/h. Power: 20 W.', now() - interval '14 minutes'),
  ('Sicce Multi 2500 Return Pump', 'Sicce', 'Pumps & Powerheads', 'Return Pumps', 2500, null, 0, false, '/products/sicce-multi-2500.jpg', 'https://www.youtube.com/watch?v=d0tjiCMyxDI', 'Sicce Multi multifunction pump for water recirculation, for use as a return pump. Made in Italy, with a 3-year guarantee.
Flow: 2,500 l/h.', now() - interval '15 minutes'),
  ('Sicce Multi 4000 Return Pump', 'Sicce', 'Pumps & Powerheads', 'Return Pumps', 3000, null, 0, false, '/products/sicce-multi-4000.jpg', 'https://www.youtube.com/watch?v=d0tjiCMyxDI', 'Sicce Multi multifunction pump for water recirculation, for use as a return pump. Made in Italy, with a 3-year guarantee.', now() - interval '16 minutes'),
  ('Sicce Multi 5800 Return Pump', 'Sicce', 'Pumps & Powerheads', 'Return Pumps', 3500, null, 0, false, '/products/sicce-multi-5800.jpg', 'https://www.youtube.com/watch?v=d0tjiCMyxDI', 'Sicce Multi multifunction pump for water recirculation, for use as a return pump. Made in Italy, with a 3-year guarantee.', now() - interval '17 minutes');

commit;

-- Check: should list 18 rows grouped by category
select category, subcategory, count(*) as products, sum(case when stock > 0 then 1 else 0 end) as in_stock
from public.products group by 1, 2 order by 1, 2;

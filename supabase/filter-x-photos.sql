-- Adds the placeholder photos to the 7 Filter X products.
-- Only needed if you ALREADY ran real-products.sql before this update.
update public.products set image_url = '/products/filter-x-10x20.jpg' where name = 'Filter X Solid Filter 10 × 20 cm';
update public.products set image_url = '/products/filter-x-10x15.jpg' where name = 'Filter X Solid Filter 10 × 15 cm';
update public.products set image_url = '/products/filter-x-10x25.jpg' where name = 'Filter X Solid Filter 10 × 25 cm';
update public.products set image_url = '/products/filter-x-5x20.jpg' where name = 'Filter X Solid Filter 5 × 20 cm';
update public.products set image_url = '/products/filter-x-5x15.jpg' where name = 'Filter X Solid Filter 5 × 15 cm';
update public.products set image_url = '/products/filter-x-18x20.jpg' where name = 'Filter X Solid Filter 18 × 20 cm';
update public.products set image_url = '/products/filter-x-18x15.jpg' where name = 'Filter X Solid Filter 18 × 15 cm';

// Built-in categories, used only until the categories table exists in the database.
// After that, categories are managed in the admin dashboard (/admin/categories).
export const CATALOG = [
  { name: 'Heating & Cooling', subs: ['Chillers'] },
  { name: 'Salt & Additives', subs: ['Salt Mix'] },
  { name: 'Filtration', subs: ['Solid Filters'] },
  { name: 'Pumps & Powerheads', subs: ['Return Pumps'] },
  // Pre-owned items. Add more subcategories here when needed.
  { name: 'Used', subs: ['Pumps', 'Chillers', 'Filtration', 'Other'] },
];

export const CATEGORIES = CATALOG.map((c) => c.name);

export function subsOf(category) {
  return CATALOG.find((c) => c.name === category)?.subs || [];
}

export function categoryHref(category, sub) {
  const p = new URLSearchParams({ category });
  if (sub) p.set('sub', sub);
  return `/products?${p.toString()}`;
}


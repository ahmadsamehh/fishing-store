// The store's menu: categories and their subcategories.
// Edit names here and they update in the menu, filters and admin form.
export const CATALOG = [
  { name: 'Aquariums & Stands', subs: ['Nano Aquariums', 'All-in-One Aquariums', 'Reef-Ready Aquariums', 'Aquarium Stands', 'Lids & Screen Tops'] },
  { name: 'Lighting', subs: ['LED Fixtures', 'T5 Lighting', 'Light Mounts', 'Light Controllers'] },
  { name: 'Pumps & Powerheads', subs: ['Return Pumps', 'Wave Makers', 'Pump Accessories'] },
  { name: 'Filtration', subs: ['Protein Skimmers', 'Sumps', 'Filter Socks & Rollers', 'Reactors'] },
  { name: 'Filter Media', subs: ['Activated Carbon', 'Phosphate Removers', 'Bio Media'] },
  { name: 'Salt & Additives', subs: ['Salt Mix', 'Calcium & Alkalinity', 'Trace Elements', 'Bacteria'] },
  { name: 'Testing & Controllers', subs: ['Test Kits', 'Refractometers', 'Monitors & Controllers'] },
  { name: 'Heating & Cooling', subs: ['Heaters', 'Chillers', 'Cooling Fans'] },
  { name: 'Fish & Coral Food', subs: ['Fish Food', 'Coral Food', 'Frozen Food'] },
  { name: 'Rock & Sand', subs: ['Live Rock', 'Dry Rock', 'Sand'] },
  { name: 'Live Fish & Coral', subs: ['Fish', 'Soft Corals', 'LPS Corals', 'SPS Corals', 'Invertebrates'] },
  { name: 'Maintenance', subs: ['Cleaning Tools', 'Fragging Supplies', 'Water Change'] },
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

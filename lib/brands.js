// Brands come from the Brand field of each product: nothing extra to manage.
// "TECO", "Teco" and " teco " count as one brand.
export const brandKey = (b) => (b || '').trim().toLowerCase();

// All brands with how many products each has, a display name, a logo (if the admin
// uploaded one) and a product photo to fall back on.
export function brandList(products, isRealPhoto = (p) => Boolean(p.image), brandInfo = []) {
  const info = new Map(brandInfo.map((b) => [b.key, b]));
  const map = new Map();
  for (const p of products) {
    const key = brandKey(p.brand);
    if (!key) continue;
    if (!map.has(key)) map.set(key, { key, names: {}, count: 0, product: null });
    const b = map.get(key);
    const name = p.brand.trim();
    b.names[name] = (b.names[name] || 0) + 1;
    b.count++;
    if (!b.product && isRealPhoto(p)) b.product = p;
  }
  return [...map.values()]
    .map((b) => {
      const extra = info.get(b.key);
      return {
        key: b.key,
        name: extra?.name || Object.entries(b.names).sort((x, y) => y[1] - x[1])[0][0],
        count: b.count,
        product: b.product,
        logo: extra?.logoUrl || '',
      };
    })
    // Brands with a logo first, then with a product photo, then by number of products.
    .sort((a, b) =>
      Number(Boolean(b.logo)) - Number(Boolean(a.logo)) ||
      Number(Boolean(b.product)) - Number(Boolean(a.product)) ||
      b.count - a.count ||
      a.name.localeCompare(b.name));
}

export const brandHref = (name) => `/products?brand=${encodeURIComponent(brandKey(name))}`;

// Delivery fee rules. The owner edits these in /admin/delivery; these are the
// starting values, used until the settings are loaded (or if they are missing).
export const DEFAULT_DELIVERY = {
  fee: 100,              // normal delivery fee, in EGP
  freeOver: 10000,       // orders of this amount or more are delivered free
  freeCities: ['Cairo'], // governorates always delivered free
  perCity: {},           // a different fee for a governorate, e.g. { "Aswan": 150 }
};

// Works out the delivery fee for one order.
// Returns the amount and, when it is free, the reason why.
export function deliveryFor(subtotal, city, rules = DEFAULT_DELIVERY) {
  const r = { ...DEFAULT_DELIVERY, ...(rules || {}) };
  const freeCities = (r.freeCities || []).map((c) => c.trim().toLowerCase());
  const chosen = (city || '').trim();

  if (chosen && freeCities.includes(chosen.toLowerCase())) {
    return { fee: 0, free: true, reason: `Free delivery to ${chosen}` };
  }
  if (r.freeOver > 0 && subtotal >= r.freeOver) {
    return { fee: 0, free: true, reason: 'Free delivery on this order' };
  }
  const perCity = r.perCity || {};
  const key = Object.keys(perCity).find((c) => c.trim().toLowerCase() === chosen.toLowerCase());
  const fee = Number(key ? perCity[key] : r.fee) || 0;
  return { fee, free: fee === 0, reason: fee === 0 ? 'Free delivery' : '' };
}

// A short line for the storefront, e.g. "Free delivery on orders over EGP 10,000".
export function deliveryNote(rules = DEFAULT_DELIVERY) {
  const r = { ...DEFAULT_DELIVERY, ...(rules || {}) };
  const parts = [];
  if (r.freeCities?.length) parts.push(`Free delivery to ${r.freeCities.join(', ')}`);
  if (r.freeOver > 0) parts.push(`free on orders over EGP ${Number(r.freeOver).toLocaleString('en-US')}`);
  return parts.join(' · ');
}

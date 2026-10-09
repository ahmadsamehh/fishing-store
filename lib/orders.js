// Order statuses, in the order an order normally moves through them.
// 'sent' is the starting status: the customer sent the order on WhatsApp.
export const STATUSES = [
  { value: 'sent', label: 'Ordered via WhatsApp' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const STATUS_LABELS = Object.fromEntries(STATUSES.map((s) => [s.value, s.label]));

// The normal path, used for the progress tracker (cancelled is shown separately).
export const PROGRESS = ['sent', 'confirmed', 'out_for_delivery', 'delivered'];

export function formatOrderDate(iso, withTime = false) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

// Turns an Egyptian mobile like 01012345678 into 201012345678 for WhatsApp links.
export function waNumber(phone) {
  const d = (phone || '').replace(/[^\d]/g, '');
  if (d.startsWith('0020')) return d.slice(2);
  if (d.startsWith('20')) return d;
  if (d.startsWith('0')) return '2' + d;
  return d;
}

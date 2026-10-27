import { SITE_URL } from '@/lib/config';

// Builds the tab title and the WhatsApp/Facebook link preview for each product,
// on the server, so a shared product link shows its name, price and photo.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return {};
  try {
    const res = await fetch(
      `${url}/rest/v1/products?id=eq.${encodeURIComponent(id)}&select=name,description,price,sale_price,image_url,stock`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 300 } }
    );
    const [p] = res.ok ? await res.json() : [];
    if (!p) return { title: 'Product not found' };
    const price = p.sale_price && p.sale_price < p.price ? p.sale_price : p.price;
    const lead = (p.description || '').split(/(?<=[.!?])\s+/)[0];
    const description = `EGP ${Number(price).toLocaleString('en-US')}${Number(p.stock) > 0 ? '' : ' · Out of stock'}${lead ? ` · ${lead}` : ''}`;
    const image = p.image_url ? (p.image_url.startsWith('http') ? p.image_url : `${SITE_URL}${p.image_url}`) : `${SITE_URL}/og-image.jpg`;
    return {
      title: p.name,
      description,
      openGraph: { title: p.name, description, images: [{ url: image, alt: p.name }], type: 'website' },
      twitter: { card: 'summary_large_image', title: p.name, description, images: [image] },
    };
  } catch {
    return {};
  }
}

export default function ProductLayout({ children }) {
  return children;
}

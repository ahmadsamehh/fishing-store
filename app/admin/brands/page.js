'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { brandList } from '@/lib/brands';
import { resizeToJpeg, thumbOf } from '@/lib/images';
import AdminGate from '@/components/AdminGate';

function BrandRow({ brand, onSaved }) {
  const { uploadImage, adminSaveBrand, adminRemoveBrandLogo } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const blob = await resizeToJpeg(file, 600, 0.9);
      const url = await uploadImage(blob);
      const err = await adminSaveBrand(brand.key, { name: brand.name, logoUrl: url });
      err ? setError(err) : onSaved(`Logo saved for ${brand.name}.`);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  const removeLogo = async () => {
    if (!window.confirm(`Remove the logo for ${brand.name}? The strip will show a product photo instead.`)) return;
    setBusy(true);
    const err = await adminRemoveBrandLogo(brand.key, brand.logo);
    err ? setError(err) : onSaved(`Logo removed for ${brand.name}.`);
    setBusy(false);
  };

  const shown = brand.logo || (brand.product?.image ? thumbOf(brand.product.image) : '');

  return (
    <li className="brd-item">
      <span className={`brd-logo${brand.logo ? '' : ' is-fallback'}`}>
        {shown ? <img src={shown} alt="" loading="lazy" /> : <span>{brand.name.charAt(0)}</span>}
      </span>
      <span className="brd-info">
        <strong>{brand.name}</strong>
        <small className="muted">
          {brand.count} {brand.count === 1 ? 'product' : 'products'} · {brand.logo ? 'logo uploaded' : 'showing a product photo'}
        </small>
        {error && <small className="error brd-err">{error}</small>}
      </span>
      <span className="brd-acts">
        <label className={`btn btn-outline btn-sm${busy ? ' is-busy' : ''}`}>
          {busy ? 'Saving…' : brand.logo ? 'Change logo' : 'Upload logo'}
          <input type="file" accept="image/*" onChange={pick} className="sr-only" disabled={busy} />
        </label>
        {brand.logo && <button type="button" className="btn btn-danger btn-sm" onClick={removeLogo} disabled={busy}>Remove</button>}
      </span>
    </li>
  );
}

function BrandsPanel() {
  const { products, brandInfo } = useStore();
  const [message, setMessage] = useState('');
  const brands = brandList(products, (p) => Boolean(p.image), brandInfo || []);

  if (brandInfo === null) {
    return (
      <div className="adm-page">
        <div className="section-head"><h1>Brands</h1></div>
        <p className="error">The brands table isn't set up yet. Run the brands SQL in Supabase, then refresh this page.</p>
      </div>
    );
  }

  return (
    <div className="adm-page">
      <div className="section-head"><h1>Brands</h1></div>
      <p className="muted cat-intro">
        The brands in the "Shop by brand" strip on the home page. Brands come from the Brand field of each product, so this
        list updates by itself. Upload a logo for each one; without a logo, a product photo is shown instead.
      </p>
      <p className="muted small">Tip: a logo on a white or transparent background looks best.</p>

      {message && <p className="notice" role="status">{message}</p>}

      <ul className="brd-list">
        {brands.map((b) => (<BrandRow key={b.key} brand={b} onSaved={setMessage} />))}
      </ul>
      {!brands.length && <div className="empty">No brands yet. Add a product with a brand name first.</div>}
    </div>
  );
}

export default function AdminBrandsPage() {
  return (
    <AdminGate>
      <BrandsPanel />
    </AdminGate>
  );
}

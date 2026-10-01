'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, supabaseConfigured, IMAGE_BUCKET } from './supabase';

const CART_KEY = 'marjan-cart';
const StoreContext = createContext(null);

// Database rows use snake_case; the pages use camelCase.
function fromRow(r) {
  return {
    id: r.id,
    name: r.name,
    brand: r.brand || '',
    category: r.category || '',
    price: Number(r.price),
    salePrice: r.sale_price === null ? null : Number(r.sale_price),
    stock: r.stock,
    featured: r.featured,
    image: r.image_url || '',
    description: r.description || '',
  };
}

function toRow(p) {
  return {
    name: p.name,
    brand: p.brand || null,
    category: p.category || null,
    price: p.price,
    sale_price: p.salePrice ?? null,
    stock: p.stock ?? 0,
    featured: Boolean(p.featured),
    image_url: p.image || null,
    description: p.description || null,
  };
}

function readCart() {
  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [cart, setCart] = useState([]);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!supabaseConfigured) {
      setLoadError('The store is not connected to the database yet.');
      setReady(true);
      return;
    }
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) setLoadError('Could not load products. Refresh the page to try again.');
    else {
      setProducts(data.map(fromRow));
      setLoadError('');
    }
    setReady(true);
  }, []);

  // Load products and cart once.
  useEffect(() => {
    loadProducts();
    setCart(readCart());
  }, [loadProducts]);

  // Keep track of who is signed in.
  useEffect(() => {
    if (!supabaseConfigured) {
      setAuthReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Ask the database whether the signed-in person is an admin.
  useEffect(() => {
    if (!session) {
      setIsAdmin(false);
      return;
    }
    supabase.rpc('is_admin').then(({ data }) => setIsAdmin(Boolean(data)));
  }, [session?.user?.id]);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? 'Wrong email or password.' : '';
  };
  const signOut = () => supabase.auth.signOut();

  // Uploads a photo and returns its public link.
  const uploadImage = async (blob) => {
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, blob, { contentType: 'image/jpeg' });
    if (error) throw new Error('The photo could not be uploaded.');
    return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
  };

  const removeImage = async (url) => {
    const marker = `/${IMAGE_BUCKET}/`;
    if (!url || !url.includes(marker)) return;
    await supabase.storage.from(IMAGE_BUCKET).remove([url.split(marker)[1]]);
  };

  const addProduct = async (data) => {
    const { error } = await supabase.from('products').insert(toRow(data));
    if (error) throw new Error('The product was not saved. Check that you are signed in as an admin.');
    await loadProducts();
  };

  const updateProduct = async (id, data) => {
    const { error } = await supabase.from('products').update(toRow(data)).eq('id', id);
    if (error) throw new Error('The changes were not saved. Check that you are signed in as an admin.');
    await loadProducts();
  };

  const deleteProduct = async (product) => {
    const { error } = await supabase.from('products').delete().eq('id', product.id);
    if (error) throw new Error('The product was not deleted.');
    await removeImage(product.image);
    persistCart(cart.filter((c) => c.id !== product.id));
    await loadProducts();
  };

  const persistCart = (next) => {
    setCart(next);
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(next));
    } catch {}
  };

  const addToCart = (id, qty = 1) => {
    const found = cart.find((c) => c.id === id);
    persistCart(found ? cart.map((c) => (c.id === id ? { ...c, qty: c.qty + qty } : c)) : [...cart, { id, qty }]);
  };
  const setCartQty = (id, qty) =>
    persistCart(qty <= 0 ? cart.filter((c) => c.id !== id) : cart.map((c) => (c.id === id ? { ...c, qty } : c)));

  const cartCount = cart.reduce((n, c) => n + c.qty, 0);

  return (
    <StoreContext.Provider
      value={{
        products, ready, loadError,
        session, isAdmin, authReady, signIn, signOut,
        addProduct, updateProduct, deleteProduct, uploadImage, removeImage,
        cart, cartCount, addToCart, setCartQty,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}

export function formatPrice(n) {
  return 'EGP ' + Number(n || 0).toLocaleString('en-US');
}

export function finalPrice(p) {
  return p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
}

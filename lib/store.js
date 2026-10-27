'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, adminSupabase, supabaseConfigured, IMAGE_BUCKET } from './supabase';
import { CATALOG as DEFAULT_CATALOG } from './catalog';
import { resizeToJpeg } from './images';

const CART_KEY = 'marjan-cart';
const StoreContext = createContext(null);

// Database rows use snake_case; the pages use camelCase.
function fromRow(r) {
  return {
    id: r.id,
    name: r.name,
    brand: r.brand || '',
    category: r.category || '',
    subcategory: r.subcategory || '',
    price: Number(r.price),
    salePrice: r.sale_price === null ? null : Number(r.sale_price),
    stock: r.stock,
    featured: r.featured,
    image: r.image_url || '',
    description: r.description || '',
    youtubeUrl: r.youtube_url || '',
  };
}

function toRow(p) {
  return {
    name: p.name,
    brand: p.brand || null,
    category: p.category || null,
    subcategory: p.subcategory || null,
    price: p.price,
    sale_price: p.salePrice ?? null,
    stock: p.stock ?? 0,
    featured: Boolean(p.featured),
    image_url: p.image || null,
    description: p.description || null,
    youtube_url: p.youtubeUrl || null,
  };
}

// Guests keep their cart in the browser. Signed-in customers keep it in the
// database, so each account has its own cart on any device.
function readLocal(key) {
  try {
    return JSON.parse(window.localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}
function writeLocal(key, items) {
  try {
    if (items.length) window.localStorage.setItem(key, JSON.stringify(items));
    else window.localStorage.removeItem(key);
  } catch {}
}
function mergeCarts(a, b) {
  const out = a.map((x) => ({ ...x }));
  for (const item of b) {
    const found = out.find((c) => c.id === item.id);
    if (found) found.qty += item.qty;
    else out.push({ ...item });
  }
  return out;
}
async function loadUserCart(userId) {
  const { data, error } = await supabase.from('carts').select('items').eq('user_id', userId).maybeSingle();
  if (error) return readLocal(`${CART_KEY}-${userId}`); // fallback if the carts table is missing
  return Array.isArray(data?.items) ? data.items : [];
}
async function saveUserCart(userId, items) {
  const { error } = await supabase
    .from('carts')
    .upsert({ user_id: userId, items, updated_at: new Date().toISOString() });
  if (error) writeLocal(`${CART_KEY}-${userId}`, items);
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [cart, setCart] = useState([]);
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [toast, setToast] = useState(null); // { id, text }
  const showToast = (text, opts = {}) => setToast({ id: Date.now(), text, cart: Boolean(opts.cart) });
  const hideToast = () => setToast(null);
  const [adminSession, setAdminSession] = useState(null);
  const [adminReady, setAdminReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState('');

  // Categories come from the database (managed in /admin/categories).
  // Until the categories table exists, the built-in list is used, so the store never breaks.
  const [catalog, setCatalog] = useState(DEFAULT_CATALOG);
  const loadCatalog = useCallback(async () => {
    if (!supabaseConfigured) return;
    const [cats, subs] = await Promise.all([
      supabase.from('categories').select('name, sort').order('sort').order('name'),
      supabase.from('subcategories').select('category, name, sort').order('sort').order('name'),
    ]);
    if (cats.error || subs.error || !cats.data.length) return;
    setCatalog(cats.data.map((c) => ({ name: c.name, sort: c.sort, subs: subs.data.filter((x) => x.category === c.name).map((x) => x.name) })));
  }, []);

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

  useEffect(() => {
    loadProducts();
    loadCatalog();
  }, [loadProducts]);

  // Keep track of which customer is signed in to the store.
  useEffect(() => {
    if (!supabaseConfigured) {
      setAuthReady(true);
      setAdminReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      // The customer opened the "reset password" link from their email.
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
    });

    adminSupabase.auth.getSession().then(({ data }) => {
      setAdminSession(data.session);
      setAdminReady(true);
    });
    const { data: adminSub } = adminSupabase.auth.onAuthStateChange((_event, s) => setAdminSession(s));

    return () => {
      sub.subscription.unsubscribe();
      adminSub.subscription.unsubscribe();
    };
  }, []);

  // Load the right cart whenever the signed-in customer changes.
  const userId = session?.user?.id || null;
  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    (async () => {
      if (!userId) {
        // Guest, or just signed out: show the browser's guest cart (empty after sign-out).
        setCart(readLocal(CART_KEY));
        return;
      }
      // Signed in: load this account's cart and add anything picked up as a guest.
      const saved = await loadUserCart(userId);
      const guest = readLocal(CART_KEY);
      const merged = mergeCarts(saved, guest);
      if (cancelled) return;
      setCart(merged);
      if (guest.length) {
        writeLocal(CART_KEY, []);
        await saveUserCart(userId, merged);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, authReady]);

  // Ask the database whether the person signed in to /admin is an admin.
  useEffect(() => {
    if (!adminSession) {
      setIsAdmin(false);
      return;
    }
    adminSupabase.rpc('is_admin').then(({ data }) => setIsAdmin(Boolean(data)));
    // Display name for the admin panel (falls back to the email if no name is set).
    adminSupabase
      .from('admins')
      .select('name')
      .eq('user_id', adminSession.user.id)
      .maybeSingle()
      .then(({ data }) => setAdminName(data?.name || ''));
  }, [adminSession?.user?.id]);

  // Store (customer) login
  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? 'Wrong email or password.' : '';
  };
  const signOut = () => supabase.auth.signOut();

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/account` });
    return error ? 'We could not send the email. Check the address and try again in a minute.' : '';
  };
  const updatePassword = async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return error.message.includes('different') ? 'Choose a password you have not used before.' : 'Your password could not be changed. Try again.';
    setRecovery(false);
    return '';
  };

  // Admin panel login (separate from the store login)
  const adminSignIn = async (email, password) => {
    const { error } = await adminSupabase.auth.signInWithPassword({ email, password });
    return error ? 'Wrong email or password.' : '';
  };
  const adminSignOut = () => adminSupabase.auth.signOut();

  // Customer accounts
  const signUp = async ({ fullName, phone, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
        emailRedirectTo: `${window.location.origin}/account`,
      },
    });
    if (error) return { error: error.message.includes('already') ? 'An account with this email already exists. Sign in instead.' : error.message };
    return { needsConfirmation: !data.session };
  };

  const loadProfile = async () => {
    if (!session) return null;
    const meta = session.user.user_metadata || {};
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
    return {
      fullName: data?.full_name ?? meta.full_name ?? '',
      phone: data?.phone ?? meta.phone ?? '',
      city: data?.city ?? '',
      address: data?.address ?? '',
    };
  };

  const saveProfile = async (p) => {
    if (!session) return '';
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      full_name: p.fullName || null,
      phone: p.phone || null,
      city: p.city || null,
      address: p.address || null,
      updated_at: new Date().toISOString(),
    });
    return error ? 'Your details could not be saved.' : '';
  };

  // Orders (saved for signed-in customers so they can see them later)
  // Saves every order (guests too) so it shows in the admin panel.
  // Signed-in customers can also see theirs under My orders.
  const placeOrder = async (order) => {
    const { error } = await supabase.from('orders').insert({
      code: order.code,
      user_id: session?.user?.id || null,
      items: order.items,
      subtotal: order.subtotal,
      full_name: order.fullName,
      phone: order.phone,
      city: order.city,
      address: order.address || null,
      location: order.location || null,
      notes: order.notes || null,
      message: order.message,
    });
    return error ? 'Your order message is ready, but we could not save a copy on our side. Please make sure you press send in WhatsApp.' : '';
  };

  const loadOrders = async () => {
    if (!session) return [];
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (error) throw new Error('Your orders could not be loaded. Refresh the page to try again.');
    return data;
  };

  // Admin: all orders, newest first
  const adminLoadOrders = async () => {
    const { data, error } = await adminSupabase
      .from('orders')
      .select('*, history:order_status_history(status, changed_by_name, changed_at)')
      .order('created_at', { ascending: false });
    if (error) throw new Error('Orders could not be loaded. Refresh the page to try again.');
    return data;
  };

  const adminCountNewOrders = async () => {
    const { count } = await adminSupabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'sent');
    return count || 0;
  };

  const adminUpdateOrderStatus = async (id, status) => {
    const { data, error } = await adminSupabase
      .from('orders')
      .update({ status }) // the database records who changed it and when
      .eq('id', id)
      .select('*, history:order_status_history(status, changed_by_name, changed_at)')
      .single();
    if (error) throw new Error('The status was not updated. Check that you are signed in as an admin.');
    return data;
  };

  // ---- Admin: categories ----
  const catErr = (error, fallback) => {
    if (!error) return '';
    if (error.code === '23505') return 'That name already exists.';
    if (error.code === '23503') return 'This category still has products. Move or delete them first.';
    return fallback;
  };
  const afterCatalogChange = async () => { await Promise.all([loadCatalog(), loadProducts()]); };

  const adminAddCategory = async (name) => {
    const sort = Math.max(0, ...catalog.map((c) => c.sort || 0)) + 1;
    const { error } = await adminSupabase.from('categories').insert({ name: name.trim(), sort });
    if (!error) await afterCatalogChange();
    return catErr(error, 'The category was not added.');
  };
  const adminRenameCategory = async (oldName, newName) => {
    const { error } = await adminSupabase.from('categories').update({ name: newName.trim() }).eq('name', oldName);
    if (!error) await afterCatalogChange();
    return catErr(error, 'The category was not renamed.');
  };
  const adminDeleteCategory = async (name) => {
    const { error } = await adminSupabase.from('categories').delete().eq('name', name);
    if (!error) await afterCatalogChange();
    return catErr(error, 'The category was not deleted.');
  };
  // Swaps a category with its neighbour to move it up (-1) or down (+1) in the menu.
  const adminMoveCategory = async (name, dir) => {
    const list = catalog.map((c, i) => ({ name: c.name, sort: i + 1 }));
    const i = list.findIndex((c) => c.name === name), j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return '';
    const a = list.at(i), b = list.at(j);
    const r = await Promise.all(list.map((c) => adminSupabase.from('categories').update({ sort: c === a ? b.sort : c === b ? a.sort : c.sort }).eq('name', c.name)));
    await loadCatalog();
    return r.some((x) => x.error) ? 'The order was not saved.' : '';
  };

  const adminAddSub = async (category, name) => {
    const subs = catalog.find((c) => c.name === category)?.subs || [];
    const { error } = await adminSupabase.from('subcategories').insert({ category, name: name.trim(), sort: subs.length + 1 });
    if (!error) await loadCatalog();
    return catErr(error, 'The subcategory was not added.');
  };
  const adminRenameSub = async (category, oldName, newName) => {
    const { error } = await adminSupabase.rpc('rename_subcategory', { p_category: category, p_old: oldName, p_new: newName.trim() });
    if (!error) await afterCatalogChange();
    return catErr(error, 'The subcategory was not renamed.');
  };
  const adminDeleteSub = async (category, name) => {
    const { error } = await adminSupabase.from('subcategories').delete().eq('category', category).eq('name', name);
    if (!error) await loadCatalog();
    return catErr(error, 'The subcategory was not deleted.');
  };
  const adminMoveSub = async (category, name, dir) => {
    const subs = catalog.find((c) => c.name === category)?.subs || [];
    const i = subs.indexOf(name), j = i + dir;
    if (i < 0 || j < 0 || j >= subs.length) return '';
    const order = [...subs]; order.splice(i, 1); order.splice(j, 0, name);
    const r = await Promise.all(order.map((n, k) => adminSupabase.from('subcategories').update({ sort: k + 1 }).eq('category', category).eq('name', n)));
    await loadCatalog();
    return r.some((x) => x.error) ? 'The order was not saved.' : '';
  };

  // Uploads a photo and returns its public link.
  // Uploads a photo in two sizes: full (product page) and small "-sm" (cards and lists).
  const uploadImage = async (blob) => {
    const base = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const small = await resizeToJpeg(blob, 480, 0.8);
    const bucket = adminSupabase.storage.from(IMAGE_BUCKET);
    const [full, sm] = await Promise.all([
      bucket.upload(`${base}.jpg`, blob, { contentType: 'image/jpeg' }),
      bucket.upload(`${base}-sm.jpg`, small, { contentType: 'image/jpeg' }),
    ]);
    if (full.error || sm.error) throw new Error('The photo could not be uploaded.');
    return bucket.getPublicUrl(`${base}.jpg`).data.publicUrl;
  };

  const removeImage = async (url) => {
    const marker = `/${IMAGE_BUCKET}/`;
    if (!url || !url.includes(marker)) return;
    const path = url.split(marker)[1];
    await adminSupabase.storage.from(IMAGE_BUCKET).remove([path, path.replace(/\.jpg$/i, '-sm.jpg')]);
  };


  const addProduct = async (data) => {
    const { error } = await adminSupabase.from('products').insert(toRow(data));
    if (error) throw new Error('The product was not saved. Check that you are signed in as an admin.');
    await loadProducts();
  };

  const updateProduct = async (id, data) => {
    const { error } = await adminSupabase.from('products').update(toRow(data)).eq('id', id);
    if (error) throw new Error('The changes were not saved. Check that you are signed in as an admin.');
    await loadProducts();
  };

  const deleteProduct = async (product) => {
    const { error } = await adminSupabase.from('products').delete().eq('id', product.id);
    if (error) throw new Error('The product was not deleted.');
    await removeImage(product.image);
    await loadProducts();
  };

  const persistCart = (next) => {
    setCart(next);
    if (userId) saveUserCart(userId, next);
    else writeLocal(CART_KEY, next);
  };

  const addToCart = (id, qty = 1, opts = {}) => {
    const found = cart.find((c) => c.id === id);
    persistCart(found ? cart.map((c) => (c.id === id ? { ...c, qty: c.qty + qty } : c)) : [...cart, { id, qty }]);
    if (opts.silent) return;
    const name = products.find((p) => p.id === id)?.name;
    showToast(name ? `${qty > 1 ? `${qty} × ` : ''}${name} added to your cart` : 'Added to your cart', { cart: true });
  };
  const setCartQty = (id, qty) =>
    persistCart(qty <= 0 ? cart.filter((c) => c.id !== id) : cart.map((c) => (c.id === id ? { ...c, qty } : c)));

  // Adds several items at once (used by "Order again").
  const addManyToCart = (items) => persistCart(mergeCarts(cart, items.map((i) => ({ id: i.id, qty: i.qty }))));

  const clearCart = () => persistCart([]);
  // Only count items that still exist in the store.
  const cartCount = cart.reduce((n, c) => n + (products.some((p) => p.id === c.id) ? c.qty : 0), 0);

  // Remove products that were deleted from the store from any saved cart
  // (guest carts in the browser and account carts in the database).
  useEffect(() => {
    if (!ready || loadError || !cart.length) return;
    const valid = cart.filter((c) => products.some((p) => p.id === c.id));
    if (valid.length !== cart.length) persistCart(valid);
  }, [ready, loadError, products, cart]);

  return (
    <StoreContext.Provider
      value={{
        products, ready, loadError,
        catalog, adminAddCategory, adminRenameCategory, adminDeleteCategory, adminMoveCategory,
        adminAddSub, adminRenameSub, adminDeleteSub, adminMoveSub,
        session, authReady, signIn, signOut, signUp, loadProfile, saveProfile,
        recovery, resetPassword, updatePassword,
        adminSession, adminReady, isAdmin, adminSignIn, adminSignOut,
        placeOrder, loadOrders, adminLoadOrders, adminUpdateOrderStatus, adminCountNewOrders, adminName,
        addProduct, updateProduct, deleteProduct, uploadImage, removeImage,
        toast, showToast, hideToast,
        cart, cartCount, addToCart, addManyToCart, setCartQty, clearCart,
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

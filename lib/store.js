'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SEED_PRODUCTS } from './seed';

// Demo storage: everything lives in this browser only.
// Later we swap these functions for Supabase calls; the pages stay the same.
const PRODUCTS_KEY = 'marjan-demo-products';
const CART_KEY = 'marjan-demo-cart';

const StoreContext = createContext(null);

function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setProducts(readJSON(PRODUCTS_KEY, SEED_PRODUCTS));
    setCart(readJSON(CART_KEY, []));
    setReady(true);
  }, []);

  const persistProducts = useCallback((next) => {
    setProducts(next);
    const ok = writeJSON(PRODUCTS_KEY, next);
    setSaveError(ok ? '' : 'Could not save. The browser storage is full — try a smaller image.');
  }, []);

  const persistCart = useCallback((next) => {
    setCart(next);
    writeJSON(CART_KEY, next);
  }, []);

  const addProduct = (data) => {
    const id = 'p' + Date.now().toString(36);
    persistProducts([{ ...data, id }, ...products]);
    return id;
  };
  const updateProduct = (id, data) =>
    persistProducts(products.map((p) => (p.id === id ? { ...p, ...data } : p)));
  const deleteProduct = (id) => {
    persistProducts(products.filter((p) => p.id !== id));
    persistCart(cart.filter((c) => c.id !== id));
  };
  const resetDemo = () => {
    persistProducts(SEED_PRODUCTS);
    persistCart([]);
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
      value={{ products, ready, saveError, addProduct, updateProduct, deleteProduct, resetDemo, cart, cartCount, addToCart, setCartQty }}
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

'use client';
import { useStore } from './store';

// The live list of categories (from the database, managed in /admin/categories).
export function useCatalog() {
  const { catalog } = useStore();
  return {
    catalog,
    categories: catalog.map((c) => c.name),
    subsOf: (name) => catalog.find((c) => c.name === name)?.subs || [],
  };
}

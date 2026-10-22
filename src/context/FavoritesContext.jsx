import { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const FavoritesContext = createContext(null);

// Bookmarks for developers and projects, stored per browser.
export function FavoritesProvider({ children }) {
  const [items, setItems] = useLocalStorage('dd_favorites', { user: [], project: [] });

  const isFavorite = useCallback((type, id) => items[type]?.includes(id) ?? false, [items]);

  const toggle = useCallback((type, id) => {
    setItems((prev) => {
      const list = prev[type] ?? [];
      return { ...prev, [type]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] };
    });
  }, [setItems]);

  const value = useMemo(() => ({ isFavorite, toggle, items }), [isFavorite, toggle, items]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return ctx;
};

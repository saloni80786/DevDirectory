import { useCallback, useState } from 'react';

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initialValue : JSON.parse(raw);
    } catch {
      return initialValue;
    }
  });

  const set = useCallback((next) => {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      try { localStorage.setItem(key, JSON.stringify(resolved)); } catch { /* storage full or blocked */ }
      return resolved;
    });
  }, [key]);

  const remove = useCallback(() => {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    setValue(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, set, remove];
}

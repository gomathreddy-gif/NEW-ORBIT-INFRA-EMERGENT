import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);
const WL_KEY = "orbit_wishlist";
const CMP_KEY = "orbit_compare";
const MAX_COMPARE = 4;

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [compare, setCompare] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setWishlist(JSON.parse(localStorage.getItem(WL_KEY) || "[]"));
      setCompare(JSON.parse(localStorage.getItem(CMP_KEY) || "[]"));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(WL_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CMP_KEY, JSON.stringify(compare));
  }, [compare, hydrated]);

  const toggleWishlist = (id) =>
    setWishlist((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const inWishlist = (id) => wishlist.includes(id);

  const toggleCompare = (id) => {
    setCompare((s) => {
      if (s.includes(id)) return s.filter((x) => x !== id);
      if (s.length >= MAX_COMPARE) return s;
      return [...s, id];
    });
  };

  const inCompare = (id) => compare.includes(id);
  const clearCompare = () => setCompare([]);

  return (
    <Ctx.Provider value={{ wishlist, compare, hydrated, toggleWishlist, inWishlist, toggleCompare, inCompare, clearCompare, MAX_COMPARE }}>
      {children}
    </Ctx.Provider>
  );
};

export const useWishlist = () => useContext(Ctx);

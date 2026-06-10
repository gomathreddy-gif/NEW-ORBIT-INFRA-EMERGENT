import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import api from "@/lib/api";
import PropertyCard from "@/components/PropertyCard";
import { useWishlist } from "@/contexts/WishlistContext";

const Wishlist = () => {
  const { wishlist, hydrated } = useWishlist();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (wishlist.length === 0) { setItems([]); setLoading(false); return; }
    api.post("/properties/by-ids", { ids: wishlist }).then(r => setItems(r.data)).finally(() => setLoading(false));
  }, [wishlist, hydrated]);

  return (
    <div className="bg-white">
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="eyebrow text-gold mb-3">Saved</div>
          <h1 className="font-serif text-4xl sm:text-5xl mb-4 flex items-center gap-3">
            <Heart className="w-10 h-10 fill-gold text-gold" /> Your Wishlist
          </h1>
          <p className="text-white/70">{wishlist.length} {wishlist.length === 1 ? "property" : "properties"} saved on this device.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center text-ink-muted py-12">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16" data-testid="wishlist-empty">
              <Heart className="w-12 h-12 text-line mx-auto mb-4" />
              <p className="text-ink-muted mb-6">Your wishlist is empty. Browse properties and tap the heart icon to save.</p>
              <Link to="/properties" className="bg-navy text-white px-6 py-3 hover:bg-navy-hover">Browse Properties</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((p, i) => <PropertyCard key={p.id} property={p} idx={i} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Wishlist;

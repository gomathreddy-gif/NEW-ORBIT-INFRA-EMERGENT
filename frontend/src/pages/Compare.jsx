import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Scale, X, Check, Minus } from "lucide-react";
import api, { fileUrl } from "@/lib/api";
import { useWishlist } from "@/contexts/WishlistContext";

const fallback = "https://images.unsplash.com/photo-1760067537640-6ffab10b27d2?crop=entropy&cs=srgb&fm=jpg&q=80&w=600";

const formatPrice = (p) => {
  if (!p) return "—";
  if (p >= 10000000) return `₹ ${(p / 10000000).toFixed(2)} Cr`;
  if (p >= 100000) return `₹ ${(p / 100000).toFixed(2)} L`;
  return `₹ ${p.toLocaleString("en-IN")}`;
};

const Compare = () => {
  const { compare, toggleCompare, clearCompare, hydrated } = useWishlist();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (compare.length === 0) { setItems([]); setLoading(false); return; }
    api.post("/properties/by-ids", { ids: compare }).then(r => setItems(r.data)).finally(() => setLoading(false));
  }, [compare, hydrated]);

  const allAmenities = Array.from(new Set(items.flatMap(p => p.amenities || [])));

  return (
    <div className="bg-white">
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="eyebrow text-gold mb-3">Side-by-Side</div>
              <h1 className="font-serif text-4xl sm:text-5xl mb-2 flex items-center gap-3">
                <Scale className="w-10 h-10 text-gold" /> Compare Properties
              </h1>
              <p className="text-white/70">{compare.length} of 4 selected</p>
            </div>
            {compare.length > 0 && (
              <button onClick={clearCompare} data-testid="compare-clear-btn" className="border border-white/30 text-white px-5 py-2 text-sm hover:bg-white hover:text-navy">
                Clear All
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center text-ink-muted py-12">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16" data-testid="compare-empty">
              <Scale className="w-12 h-12 text-line mx-auto mb-4" />
              <p className="text-ink-muted mb-6">No properties to compare. Add up to 4 properties from the listings page.</p>
              <Link to="/properties" className="bg-navy text-white px-6 py-3 hover:bg-navy-hover">Browse Properties</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr>
                    <th className="text-left bg-surface p-4 w-40 text-xs uppercase tracking-widest text-ink-muted font-semibold">Property</th>
                    {items.map((p) => (
                      <th key={p.id} className="p-3 align-top min-w-[220px]">
                        <div className="relative bg-white border border-line">
                          <button onClick={() => toggleCompare(p.id)} className="absolute top-2 right-2 bg-white/95 w-7 h-7 flex items-center justify-center text-red-600 z-10" data-testid={`compare-remove-${p.id}`}>
                            <X className="w-4 h-4" />
                          </button>
                          <div className="aspect-[4/3] overflow-hidden">
                            <img src={p.images?.[0] ? fileUrl(p.images[0]) : fallback} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-3">
                            <div className="font-serif text-navy text-sm leading-tight line-clamp-2">{p.name}</div>
                            <div className="text-xs text-ink-muted mt-1">{p.location}</div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    ["Price", (p) => <span className="font-serif text-navy font-bold">{formatPrice(p.price)}</span>],
                    ["Type", (p) => p.property_type],
                    ["Status", (p) => <span className="bg-surface px-2 py-0.5 text-xs">{p.status}</span>],
                    ["Area", (p) => `${p.area_sqft} sqft`],
                    ["Bedrooms", (p) => p.bedrooms || "—"],
                    ["Bathrooms", (p) => p.bathrooms || "—"],
                    ["Location", (p) => p.location],
                  ].map(([label, render], i) => (
                    <tr key={i} className="border-t border-line">
                      <td className="bg-surface p-4 text-xs uppercase tracking-widest text-ink-muted font-semibold">{label}</td>
                      {items.map((p) => <td key={p.id} className="p-4 text-navy">{render(p)}</td>)}
                    </tr>
                  ))}
                  {allAmenities.length > 0 && (
                    <tr className="border-t border-line">
                      <td colSpan={items.length + 1} className="bg-navy text-gold px-4 py-2 text-xs uppercase tracking-widest font-bold">Amenities</td>
                    </tr>
                  )}
                  {allAmenities.map((a, i) => (
                    <tr key={`am-${i}`} className="border-t border-line">
                      <td className="bg-surface p-4 text-sm text-navy">{a}</td>
                      {items.map((p) => (
                        <td key={p.id} className="p-4 text-center">
                          {p.amenities?.includes(a) ? <Check className="w-5 h-5 text-emerald-600 mx-auto" /> : <Minus className="w-5 h-5 text-line mx-auto" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-t border-line">
                    <td className="bg-surface p-4 text-xs uppercase tracking-widest text-ink-muted font-semibold">Actions</td>
                    {items.map((p) => (
                      <td key={p.id} className="p-3 text-center">
                        <Link to={`/properties/${p.id}`} className="text-xs uppercase tracking-widest text-gold hover:text-navy font-bold">View →</Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Compare;

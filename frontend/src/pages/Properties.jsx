import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import api from "@/lib/api";
import PropertyCard from "@/components/PropertyCard";

const Properties = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: "", property_type: "", status: "", bedrooms: "", min_price: "", max_price: "", min_area: "",
  });

  const fetchData = async (f = filters) => {
    setLoading(true);
    const params = {};
    Object.entries(f).forEach(([k, v]) => { if (v !== "" && v !== null) params[k] = v; });
    try {
      const r = await api.get("/properties", { params });
      setItems(r.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, []);

  const onChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const onSearch = (e) => { e.preventDefault(); fetchData(); };
  const onReset = () => {
    const empty = { location: "", property_type: "", status: "", bedrooms: "", min_price: "", max_price: "", min_area: "" };
    setFilters(empty);
    fetchData(empty);
  };

  return (
    <div className="bg-white">
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="eyebrow text-gold mb-3">Browse</div>
          <h1 className="font-serif text-4xl sm:text-5xl mb-3">Premium Properties</h1>
          <p className="text-white/70">Discover hand-curated properties across Andhra Pradesh.</p>
        </div>
      </section>

      <section className="py-10 border-b border-line" data-testid="filters-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={onSearch} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <input name="location" value={filters.location} onChange={onChange} placeholder="Location" data-testid="filter-location" className="border border-line bg-surface px-4 py-3 rounded-sm text-sm focus:border-navy focus:outline-none col-span-2" />
            <select name="property_type" value={filters.property_type} onChange={onChange} data-testid="filter-type" className="border border-line bg-surface px-3 py-3 rounded-sm text-sm">
              <option value="">Type</option>
              <option>Apartment</option><option>Villa</option><option>Plot</option><option>Commercial</option><option>House</option>
            </select>
            <select name="status" value={filters.status} onChange={onChange} data-testid="filter-status" className="border border-line bg-surface px-3 py-3 rounded-sm text-sm">
              <option value="">Status</option>
              <option>Available</option><option>Ready To Move</option><option>Under Construction</option><option>Upcoming</option><option>Sold</option>
            </select>
            <select name="bedrooms" value={filters.bedrooms} onChange={onChange} data-testid="filter-beds" className="border border-line bg-surface px-3 py-3 rounded-sm text-sm">
              <option value="">Beds</option>
              <option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option>
            </select>
            <input name="min_price" type="number" value={filters.min_price} onChange={onChange} placeholder="Min ₹" data-testid="filter-min-price" className="border border-line bg-surface px-3 py-3 rounded-sm text-sm" />
            <input name="max_price" type="number" value={filters.max_price} onChange={onChange} placeholder="Max ₹" data-testid="filter-max-price" className="border border-line bg-surface px-3 py-3 rounded-sm text-sm" />
          </form>
          <div className="flex gap-3 mt-3">
            <button onClick={onSearch} data-testid="filter-search-btn" className="bg-navy text-white px-6 py-3 rounded-sm text-sm hover:bg-navy-hover transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" /> Search
            </button>
            <button onClick={onReset} data-testid="filter-reset-btn" className="border border-line text-ink-muted px-6 py-3 rounded-sm text-sm hover:border-navy hover:text-navy transition-colors">
              Reset
            </button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12 text-ink-muted" data-testid="properties-loading">Loading properties…</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-ink-muted" data-testid="properties-empty">
              No properties found matching your criteria. Try adjusting filters.
            </div>
          ) : (
            <>
              <div className="mb-6 text-sm text-ink-muted" data-testid="properties-count">{items.length} properties found</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((p, i) => <PropertyCard key={p.id} property={p} idx={i} />)}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Properties;

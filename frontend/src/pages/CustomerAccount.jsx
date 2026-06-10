import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, LogOut, Search, Trash2, Play } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const CustomerAccount = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await api.get("/saved-searches");
      setSearches(r.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const run = (s) => {
    const params = new URLSearchParams();
    Object.entries(s.filters || {}).forEach(([k, v]) => { if (v !== "" && v != null) params.set(k, v); });
    navigate(`/properties?${params.toString()}`);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this saved search?")) return;
    await api.delete(`/saved-searches/${id}`);
    toast.success("Removed");
    load();
  };

  const onLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="bg-white">
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gold text-navy rounded-full flex items-center justify-center font-serif text-2xl font-bold">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="eyebrow text-gold mb-1">My Account</div>
              <h1 className="font-serif text-3xl" data-testid="account-name">{user.name}</h1>
              <p className="text-white/70 text-sm">{user.email}</p>
            </div>
          </div>
          <button onClick={onLogout} data-testid="logout-btn" className="border border-white/30 text-white px-5 py-2 hover:bg-white hover:text-navy flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-6">
          <Link to="/wishlist" className="bg-white border border-line p-6 hover:border-gold transition-colors" data-testid="account-wishlist-link">
            <div className="eyebrow mb-2">Saved Properties</div>
            <h3 className="font-serif text-xl text-navy">My Wishlist</h3>
            <p className="text-ink-muted text-sm mt-2">View your saved properties.</p>
          </Link>
          <Link to="/compare" className="bg-white border border-line p-6 hover:border-gold transition-colors" data-testid="account-compare-link">
            <div className="eyebrow mb-2">Compare</div>
            <h3 className="font-serif text-xl text-navy">My Comparisons</h3>
            <p className="text-ink-muted text-sm mt-2">Properties you're comparing.</p>
          </Link>
          <Link to="/properties" className="bg-white border border-line p-6 hover:border-gold transition-colors" data-testid="account-browse-link">
            <div className="eyebrow mb-2">Discover</div>
            <h3 className="font-serif text-xl text-navy">Browse Properties</h3>
            <p className="text-ink-muted text-sm mt-2">Find your next home.</p>
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="bg-white border border-line">
            <div className="px-6 py-4 border-b border-line flex justify-between items-center">
              <h3 className="font-serif text-xl text-navy flex items-center gap-2"><Search className="w-5 h-5 text-gold" /> Saved Searches</h3>
            </div>
            {loading ? (
              <div className="p-6 text-center text-ink-muted">Loading…</div>
            ) : searches.length === 0 ? (
              <div className="p-10 text-center text-ink-muted" data-testid="no-searches">
                You haven't saved any searches yet. Apply filters on the Properties page and click "Save Search".
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-surface text-xs uppercase tracking-widest text-ink-muted">
                  <tr>
                    <th className="text-left px-6 py-3">Name</th>
                    <th className="text-left px-6 py-3">Filters</th>
                    <th className="text-left px-6 py-3">Created</th>
                    <th className="text-left px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searches.map((s, i) => (
                    <tr key={s.id} className="border-t border-line" data-testid={`saved-search-${i}`}>
                      <td className="px-6 py-4 font-medium text-navy">{s.name}</td>
                      <td className="px-6 py-4 text-xs text-ink-muted">
                        {Object.entries(s.filters || {}).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(" • ") || "All"}
                      </td>
                      <td className="px-6 py-4 text-xs text-ink-muted">{new Date(s.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => run(s)} data-testid={`run-search-${i}`} className="text-navy hover:text-gold p-2"><Play className="w-4 h-4" /></button>
                          <button onClick={() => remove(s.id)} data-testid={`delete-search-${i}`} className="text-red-600 hover:text-red-800 p-2"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerAccount;

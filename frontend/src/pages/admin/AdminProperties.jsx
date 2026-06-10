import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api, { fileUrl } from "@/lib/api";

const AdminProperties = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/properties", { params: { limit: 200 } });
      setItems(r.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this property? This cannot be undone.")) return;
    try {
      await api.delete(`/properties/${id}`);
      toast.success("Property deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-serif text-3xl text-navy">Properties</h2>
          <p className="text-ink-muted text-sm">{items.length} total</p>
        </div>
        <Link to="/admin/properties/new" data-testid="add-property-btn" className="bg-navy text-white px-5 py-3 rounded-sm hover:bg-navy-hover flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      <div className="bg-white border border-line overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-ink-muted">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-ink-muted" data-testid="no-properties">
            No properties yet. <Link to="/admin/properties/new" className="text-gold underline">Add your first property</Link>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="text-left px-4 py-3">Image</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Location</th>
                  <th className="text-left px-4 py-3">Price</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p, i) => (
                  <tr key={p.id} className="border-t border-line" data-testid={`admin-property-row-${i}`}>
                    <td className="px-4 py-3">
                      <div className="w-16 h-12 bg-surface overflow-hidden">
                        {p.images?.[0] ? <img src={fileUrl(p.images[0])} alt="" className="w-full h-full object-cover" /> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-navy">{p.name}</td>
                    <td className="px-4 py-3 text-sm">{p.property_type}</td>
                    <td className="px-4 py-3 text-sm text-ink-muted">{p.location}</td>
                    <td className="px-4 py-3 text-sm">₹ {p.price?.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-sm"><span className="bg-surface px-3 py-1 text-xs">{p.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/admin/properties/${p.id}/edit`} data-testid={`edit-property-${i}`} className="text-navy hover:text-gold p-2"><Edit className="w-4 h-4" /></Link>
                        <button onClick={() => remove(p.id)} data-testid={`delete-property-${i}`} className="text-red-600 hover:text-red-800 p-2"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProperties;

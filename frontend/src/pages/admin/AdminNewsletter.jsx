import { useEffect, useState } from "react";
import { Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const AdminNewsletter = () => {
  const [items, setItems] = useState([]);

  const load = async () => {
    const r = await api.get("/newsletter");
    setItems(r.data);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Remove this subscriber?")) return;
    await api.delete(`/newsletter/${id}`);
    toast.success("Removed"); load();
  };

  const exportCsv = () => {
    const csv = "email,subscribed_at\n" + items.map((i) => `${i.email},${i.created_at}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "newsletter-subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-serif text-3xl text-navy">Newsletter Subscribers</h2>
          <p className="text-ink-muted text-sm">{items.length} subscribers</p>
        </div>
        {items.length > 0 && (
          <button onClick={exportCsv} data-testid="export-csv-btn" className="bg-navy text-white px-5 py-3 hover:bg-navy-hover flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      <div className="bg-white border border-line">
        {items.length === 0 ? (
          <div className="p-10 text-center text-ink-muted" data-testid="no-subs">No subscribers yet.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-surface text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Subscribed</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="px-4 py-3 text-sm text-navy">{s.email}</td>
                  <td className="px-4 py-3 text-xs text-ink-muted">{new Date(s.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3"><button onClick={() => remove(s.id)} className="text-red-600 p-2"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminNewsletter;

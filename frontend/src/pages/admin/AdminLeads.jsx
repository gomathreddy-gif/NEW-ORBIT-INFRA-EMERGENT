import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Phone } from "lucide-react";
import api from "@/lib/api";

const types = [
  { value: "", label: "All" },
  { value: "enquiry", label: "Enquiry" },
  { value: "site_visit", label: "Site Visit" },
  { value: "loan", label: "Loan" },
  { value: "callback", label: "Callback" },
  { value: "contact", label: "Contact Form" },
];

const statuses = ["New", "Contacted", "Follow Up", "Closed"];

const AdminLeads = () => {
  const [items, setItems] = useState([]);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const load = async () => {
    const params = {};
    if (type) params.lead_type = type;
    if (status) params.status = status;
    const r = await api.get("/leads", { params });
    setItems(r.data);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [type, status]);

  const updateStatus = async (id, st) => {
    await api.patch(`/leads/${id}`, { status: st });
    toast.success("Status updated");
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    await api.delete(`/leads/${id}`);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-navy">Leads, Visits & Loans</h2>
        <p className="text-ink-muted text-sm">{items.length} leads</p>
      </div>

      <div className="flex gap-3">
        <select value={type} onChange={(e) => setType(e.target.value)} data-testid="filter-leadtype" className="border border-line bg-white px-4 py-2 text-sm">
          {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} data-testid="filter-status" className="border border-line bg-white px-4 py-2 text-sm">
          <option value="">All Status</option>
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white border border-line overflow-x-auto">
        {items.length === 0 ? (
          <div className="p-10 text-center text-ink-muted" data-testid="no-leads-row">No leads to display.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-surface text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Mobile</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Property</th>
                <th className="text-left px-4 py-3">Details</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((l, i) => (
                <tr key={l.id} className="border-t border-line text-sm" data-testid={`lead-row-${i}`}>
                  <td className="px-4 py-3 font-medium text-navy">{l.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a href={`tel:${l.mobile}`} className="text-navy hover:text-gold"><Phone className="inline w-3 h-3 mr-1" />{l.mobile}</a>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{l.lead_type?.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-ink-muted">{l.property_name || "-"}</td>
                  <td className="px-4 py-3 text-ink-muted text-xs max-w-xs">
                    {l.message && <div>"{l.message}"</div>}
                    {l.visit_date && <div>Visit: {l.visit_date} {l.visit_time}</div>}
                    {l.monthly_income && <div>Income: ₹{l.monthly_income}</div>}
                    {l.occupation && <div>Occupation: {l.occupation}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <select value={l.status} onChange={(e) => updateStatus(l.id, e.target.value)} data-testid={`status-select-${i}`} className="border border-line bg-surface px-2 py-1 text-xs">
                      {statuses.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => remove(l.id)} data-testid={`delete-lead-${i}`} className="text-red-600 hover:text-red-800 p-2"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminLeads;

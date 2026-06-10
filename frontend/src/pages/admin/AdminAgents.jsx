import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import api, { fileUrl } from "@/lib/api";

const blank = { name: "", role: "Property Consultant", phone: "", email: "", experience: "", bio: "", avatar: "", active: true };

const AdminAgents = () => {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null); // null | "new" | id
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const r = await api.get("/agents", { params: { active_only: false } });
    setItems(r.data);
  };
  useEffect(() => { load(); }, []);

  const startEdit = (a) => { setEditing(a.id); setF({ ...a }); };
  const startNew = () => { setEditing("new"); setF(blank); };
  const cancel = () => { setEditing(null); setF(blank); };

  const upd = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setF((s) => ({ ...s, avatar: r.data.path }));
    } catch { toast.error("Upload failed"); }
    setUploading(false);
  };

  const save = async () => {
    setBusy(true);
    try {
      if (editing === "new") await api.post("/agents", f);
      else await api.put(`/agents/${editing}`, f);
      toast.success("Saved");
      cancel(); load();
    } catch { toast.error("Save failed"); }
    setBusy(false);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this agent?")) return;
    await api.delete(`/agents/${id}`);
    toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-serif text-3xl text-navy">Agents</h2>
          <p className="text-ink-muted text-sm">{items.length} agents</p>
        </div>
        {!editing && <button onClick={startNew} data-testid="add-agent-btn" className="bg-navy text-white px-5 py-3 hover:bg-navy-hover flex items-center gap-2"><Plus className="w-4 h-4" /> Add Agent</button>}
      </div>

      {editing && (
        <div className="bg-white border border-line p-6 space-y-4" data-testid="agent-form">
          <h3 className="font-serif text-lg text-navy">{editing === "new" ? "New Agent" : "Edit Agent"}</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <input placeholder="Name *" required value={f.name} onChange={upd("name")} data-testid="agent-name" className="border border-line bg-surface px-4 py-3 text-sm" />
            <input placeholder="Role" value={f.role} onChange={upd("role")} className="border border-line bg-surface px-4 py-3 text-sm" />
            <input placeholder="Phone" value={f.phone} onChange={upd("phone")} data-testid="agent-phone" className="border border-line bg-surface px-4 py-3 text-sm" />
            <input placeholder="Email" type="email" value={f.email} onChange={upd("email")} className="border border-line bg-surface px-4 py-3 text-sm" />
            <input placeholder="Experience (e.g. 8+ years)" value={f.experience} onChange={upd("experience")} className="border border-line bg-surface px-4 py-3 text-sm" />
          </div>
          <textarea placeholder="Short bio" rows={3} value={f.bio} onChange={upd("bio")} className="w-full border border-line bg-surface px-4 py-3 text-sm" />
          <div>
            <label className="flex items-center gap-3 bg-surface border border-dashed border-line p-4 cursor-pointer hover:border-gold">
              <Upload className="w-5 h-5 text-gold" />
              <span className="text-sm text-ink-muted">{uploading ? "Uploading..." : "Upload avatar"}</span>
              <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
            </label>
            {f.avatar && <div className="mt-3 relative w-24 h-24"><img src={fileUrl(f.avatar)} alt="" className="w-full h-full object-cover" /><button type="button" onClick={() => setF({ ...f, avatar: "" })} className="absolute -top-2 -right-2 bg-white w-6 h-6 rounded-full text-red-600 border border-line"><X className="w-3 h-3 mx-auto" /></button></div>}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.active} onChange={upd("active")} /> Active (visible on public page)
          </label>
          <div className="flex gap-3">
            <button onClick={save} disabled={busy || !f.name} data-testid="save-agent-btn" className="bg-navy text-white px-6 py-3 hover:bg-navy-hover disabled:opacity-50">{busy ? "Saving..." : "Save"}</button>
            <button onClick={cancel} className="border border-line px-6 py-3 text-ink-muted hover:border-navy hover:text-navy">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-line">
        {items.length === 0 ? (
          <div className="p-10 text-center text-ink-muted">No agents yet.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-surface text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="text-left px-4 py-3">Avatar</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Contact</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a, i) => (
                <tr key={a.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 bg-surface overflow-hidden rounded-full">
                      {a.avatar && <img src={fileUrl(a.avatar)} alt="" className="w-full h-full object-cover" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-navy">{a.name}</td>
                  <td className="px-4 py-3 text-sm">{a.role}</td>
                  <td className="px-4 py-3 text-xs text-ink-muted">{a.phone}<br />{a.email}</td>
                  <td className="px-4 py-3 text-sm">{a.active ? <span className="text-emerald-700">Active</span> : <span className="text-ink-muted">Hidden</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(a)} className="text-navy hover:text-gold p-2"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => remove(a.id)} className="text-red-600 p-2"><Trash2 className="w-4 h-4" /></button>
                    </div>
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

export default AdminAgents;

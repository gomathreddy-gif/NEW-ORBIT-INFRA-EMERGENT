import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const AdminBlog = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/blogs", { params: { published_only: false } });
      setItems(r.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this blog post?")) return;
    await api.delete(`/blogs/${id}`);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-serif text-3xl text-navy">Blog Posts</h2>
          <p className="text-ink-muted text-sm">{items.length} posts</p>
        </div>
        <Link to="/admin/blog/new" data-testid="add-blog-btn" className="bg-navy text-white px-5 py-3 hover:bg-navy-hover flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Post
        </Link>
      </div>

      <div className="bg-white border border-line">
        {loading ? (
          <div className="p-10 text-center text-ink-muted">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-ink-muted" data-testid="no-blogs">No posts yet. <Link to="/admin/blog/new" className="text-gold underline">Create your first</Link>.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-surface text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Author</th>
                <th className="text-left px-4 py-3">Tags</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b, i) => (
                <tr key={b.id} className="border-t border-line" data-testid={`admin-blog-row-${i}`}>
                  <td className="px-4 py-3 text-sm font-medium text-navy max-w-md">{b.title}</td>
                  <td className="px-4 py-3 text-sm text-ink-muted">{b.author}</td>
                  <td className="px-4 py-3 text-xs">{b.tags?.slice(0, 2).join(", ")}</td>
                  <td className="px-4 py-3 text-sm">
                    {b.published ? <span className="flex items-center gap-1 text-emerald-700"><Eye className="w-3 h-3" />Live</span> : <span className="flex items-center gap-1 text-ink-muted"><EyeOff className="w-3 h-3" />Draft</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">{new Date(b.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link to={`/admin/blog/${b.id}/edit`} className="text-navy hover:text-gold p-2"><Edit className="w-4 h-4" /></Link>
                      <button onClick={() => remove(b.id)} className="text-red-600 p-2"><Trash2 className="w-4 h-4" /></button>
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

export default AdminBlog;

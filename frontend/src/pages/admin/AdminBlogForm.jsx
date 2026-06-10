import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import api, { fileUrl } from "@/lib/api";

const blank = { title: "", slug: "", excerpt: "", content: "", cover_image: "", tags: "", author: "Orbit Infra Team", published: true };
const toArr = (s) => (Array.isArray(s) ? s : (s || "").split(",").map(x => x.trim()).filter(Boolean));
const fromArr = (a) => (a || []).join(", ");

const AdminBlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/blogs/${id}`).then(r => setF({ ...r.data, tags: fromArr(r.data.tags) }));
  }, [id]);

  const upd = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setF((s) => ({ ...s, cover_image: r.data.path }));
      toast.success("Cover image uploaded");
    } catch { toast.error("Upload failed"); }
    setUploading(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...f, tags: toArr(f.tags) };
      if (id) {
        await api.put(`/blogs/${id}`, body);
        toast.success("Post updated");
      } else {
        await api.post("/blogs", body);
        toast.success("Post created");
      }
      navigate("/admin/blog");
    } catch (err) {
      toast.error("Save failed");
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-serif text-3xl text-navy">{id ? "Edit Post" : "New Blog Post"}</h2>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate("/admin/blog")} className="px-5 py-3 border border-line text-ink-muted hover:border-navy hover:text-navy">Cancel</button>
          <button disabled={busy} data-testid="save-blog-btn" className="bg-navy text-white px-6 py-3 hover:bg-navy-hover disabled:opacity-50">{busy ? "Saving..." : "Save Post"}</button>
        </div>
      </div>

      <div className="bg-white border border-line p-6 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-ink-muted">Title *</label>
          <input required value={f.title} onChange={upd("title")} data-testid="blog-title" className="w-full border border-line bg-surface px-4 py-3 mt-1" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-ink-muted">Slug (optional, auto-generated)</label>
          <input value={f.slug} onChange={upd("slug")} className="w-full border border-line bg-surface px-4 py-3 mt-1" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-ink-muted">Excerpt</label>
          <textarea rows={2} value={f.excerpt} onChange={upd("excerpt")} className="w-full border border-line bg-surface px-4 py-3 mt-1" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-ink-muted">Content *</label>
          <textarea required rows={14} value={f.content} onChange={upd("content")} data-testid="blog-content-input" className="w-full border border-line bg-surface px-4 py-3 mt-1 font-mono text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-ink-muted">Author</label>
            <input value={f.author} onChange={upd("author")} className="w-full border border-line bg-surface px-4 py-3 mt-1" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-ink-muted">Tags (comma-separated)</label>
            <input value={f.tags} onChange={upd("tags")} className="w-full border border-line bg-surface px-4 py-3 mt-1" placeholder="Buying Tips, Investment" />
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-ink-muted">Cover Image</label>
          <label className="flex items-center gap-3 bg-surface border border-dashed border-line p-4 cursor-pointer hover:border-gold mt-1 transition-colors">
            <Upload className="w-5 h-5 text-gold" />
            <span className="text-sm text-ink-muted">{uploading ? "Uploading..." : "Click to upload"}</span>
            <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
          </label>
          {f.cover_image && (
            <div className="mt-3 relative aspect-[16/9] max-w-md">
              <img src={fileUrl(f.cover_image)} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setF({ ...f, cover_image: "" })} className="absolute top-2 right-2 bg-white/95 w-7 h-7 flex items-center justify-center text-red-600"><X className="w-4 h-4" /></button>
            </div>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.published} onChange={upd("published")} /> Published
        </label>
      </div>
    </form>
  );
};

export default AdminBlogForm;

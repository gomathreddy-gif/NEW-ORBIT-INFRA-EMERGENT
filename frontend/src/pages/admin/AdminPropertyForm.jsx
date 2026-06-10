import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import api, { fileUrl } from "@/lib/api";

const blank = {
  name: "", property_type: "Apartment", location: "", city: "Andhra Pradesh",
  price: "", area_sqft: "", bedrooms: 0, bathrooms: 0,
  status: "Available", project_status: "Ongoing",
  description: "", amenities: "", floor_plans: "",
  nearby_schools: "", nearby_hospitals: "", nearby_shopping: "",
  video_url: "", map_url: "", featured: false, images: [],
};

const toArr = (s) => (Array.isArray(s) ? s : (s || "").split(",").map(x => x.trim()).filter(Boolean));
const fromArr = (a) => (a || []).join(", ");

const AdminPropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/properties/${id}`).then(r => {
      const p = r.data;
      setF({
        ...p,
        amenities: fromArr(p.amenities),
        floor_plans: fromArr(p.floor_plans),
        nearby_schools: fromArr(p.nearby_schools),
        nearby_hospitals: fromArr(p.nearby_hospitals),
        nearby_shopping: fromArr(p.nearby_shopping),
      });
    });
  }, [id]);

  const onUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const r = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        uploaded.push(r.data.path);
      }
      setF((s) => ({ ...s, images: [...s.images, ...uploaded] }));
      toast.success(`${uploaded.length} image(s) uploaded`);
    } catch {
      toast.error("Upload failed");
    }
    setUploading(false);
  };

  const removeImg = (i) => setF((s) => ({ ...s, images: s.images.filter((_, k) => k !== i) }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = {
        ...f,
        price: Number(f.price),
        area_sqft: Number(f.area_sqft),
        bedrooms: Number(f.bedrooms) || 0,
        bathrooms: Number(f.bathrooms) || 0,
        amenities: toArr(f.amenities),
        floor_plans: toArr(f.floor_plans),
        nearby_schools: toArr(f.nearby_schools),
        nearby_hospitals: toArr(f.nearby_hospitals),
        nearby_shopping: toArr(f.nearby_shopping),
      };
      if (id) {
        await api.put(`/properties/${id}`, body);
        toast.success("Property updated");
      } else {
        await api.post("/properties", body);
        toast.success("Property created");
      }
      navigate("/admin/properties");
    } catch (err) {
      const msg = err.response?.data?.detail;
      toast.error(typeof msg === "string" ? msg : "Save failed");
    }
    setBusy(false);
  };

  const upd = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-serif text-3xl text-navy">{id ? "Edit Property" : "New Property"}</h2>
          <p className="text-ink-muted text-sm">Fill in property details. Comma-separate list items.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate("/admin/properties")} className="px-5 py-3 border border-line text-ink-muted hover:border-navy hover:text-navy">Cancel</button>
          <button disabled={busy} data-testid="save-property-btn" className="bg-navy text-white px-6 py-3 hover:bg-navy-hover disabled:opacity-50">
            {busy ? "Saving..." : "Save Property"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-line p-6 space-y-4">
          <h3 className="font-serif text-lg text-navy">Basic Info</h3>
          <Field label="Name" required><input required value={f.name} onChange={upd("name")} data-testid="prop-name" className="input" /></Field>
          <Field label="Type">
            <select value={f.property_type} onChange={upd("property_type")} data-testid="prop-type" className="input">
              {["Apartment", "Villa", "Plot", "Commercial", "House"].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Location" required><input required value={f.location} onChange={upd("location")} data-testid="prop-location" className="input" placeholder="e.g. Vijayawada, AP" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹)" required><input type="number" required value={f.price} onChange={upd("price")} data-testid="prop-price" className="input" /></Field>
            <Field label="Area (sqft)" required><input type="number" required value={f.area_sqft} onChange={upd("area_sqft")} data-testid="prop-area" className="input" /></Field>
            <Field label="Bedrooms"><input type="number" value={f.bedrooms} onChange={upd("bedrooms")} data-testid="prop-beds" className="input" /></Field>
            <Field label="Bathrooms"><input type="number" value={f.bathrooms} onChange={upd("bathrooms")} data-testid="prop-baths" className="input" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select value={f.status} onChange={upd("status")} data-testid="prop-status" className="input">
                {["Available", "Sold", "Under Construction", "Ready To Move", "Upcoming"].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Project Status">
              <select value={f.project_status} onChange={upd("project_status")} className="input">
                {["Ongoing", "Completed", "Upcoming"].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.featured} onChange={upd("featured")} data-testid="prop-featured" /> Featured Property
          </label>
        </div>

        <div className="bg-white border border-line p-6 space-y-4">
          <h3 className="font-serif text-lg text-navy">Description & Media</h3>
          <Field label="Description"><textarea rows={4} value={f.description} onChange={upd("description")} className="input" /></Field>
          <Field label="Amenities (comma-separated)"><input value={f.amenities} onChange={upd("amenities")} className="input" placeholder="Pool, Gym, Park" /></Field>
          <Field label="Nearby Schools"><input value={f.nearby_schools} onChange={upd("nearby_schools")} className="input" placeholder="Delhi Public School, ..." /></Field>
          <Field label="Nearby Hospitals"><input value={f.nearby_hospitals} onChange={upd("nearby_hospitals")} className="input" /></Field>
          <Field label="Nearby Shopping"><input value={f.nearby_shopping} onChange={upd("nearby_shopping")} className="input" /></Field>
          <Field label="Video URL (YouTube embed)"><input value={f.video_url} onChange={upd("video_url")} className="input" placeholder="https://www.youtube.com/embed/..." /></Field>
          <Field label="Google Maps Embed URL"><input value={f.map_url} onChange={upd("map_url")} className="input" /></Field>
        </div>
      </div>

      <div className="bg-white border border-line p-6">
        <h3 className="font-serif text-lg text-navy mb-4">Images</h3>
        <label className="flex items-center gap-3 bg-surface border border-dashed border-line p-6 cursor-pointer hover:border-gold transition-colors" data-testid="upload-btn">
          <Upload className="w-5 h-5 text-gold" />
          <span className="text-sm text-ink-muted">{uploading ? "Uploading..." : "Click to upload images (JPG/PNG/WebP)"}</span>
          <input type="file" accept="image/*" multiple onChange={onUpload} className="hidden" />
        </label>
        {f.images?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {f.images.map((p, i) => (
              <div key={i} className="relative aspect-[4/3]" data-testid={`image-preview-${i}`}>
                <img src={fileUrl(p)} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImg(i)} className="absolute top-2 right-2 bg-white/95 text-red-600 w-7 h-7 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`.input{width:100%;border:1px solid #E9ECEF;background:#F8F9FA;padding:0.65rem 0.9rem;font-size:0.875rem}.input:focus{outline:none;border-color:#0A2240}`}</style>
    </form>
  );
};

const Field = ({ label, required, children }) => (
  <div>
    <label className="text-xs uppercase tracking-widest text-ink-muted font-semibold">{label}{required && <span className="text-gold ml-1">*</span>}</label>
    <div className="mt-1">{children}</div>
  </div>
);

export default AdminPropertyForm;

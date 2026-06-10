import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, BedDouble, Bath, Maximize, Phone, CheckCircle2, GraduationCap, Stethoscope, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import api, { fileUrl } from "@/lib/api";

const fallback = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600";

const formatPrice = (p) => {
  if (!p) return "Price on request";
  if (p >= 10000000) return `₹ ${(p / 10000000).toFixed(2)} Cr`;
  if (p >= 100000) return `₹ ${(p / 100000).toFixed(2)} L`;
  return `₹ ${p.toLocaleString("en-IN")}`;
};

const PropertyDetail = () => {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [active, setActive] = useState(0);
  const [modal, setModal] = useState(null); // 'visit' | 'loan' | 'callback'
  const [form, setForm] = useState({ name: "", mobile: "", email: "", visit_date: "", visit_time: "", message: "", occupation: "", monthly_income: "", property_value: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/properties/${id}`).then(r => setP(r.data)).catch(() => setP(false));
  }, [id]);

  if (p === false) return <div className="min-h-[60vh] flex items-center justify-center text-ink-muted">Property not found.</div>;
  if (!p) return <div className="min-h-[60vh] flex items-center justify-center text-ink-muted">Loading…</div>;

  const images = (p.images && p.images.length) ? p.images.map(fileUrl) : [fallback];

  const submitLead = async (type) => {
    setBusy(true);
    try {
      const body = {
        name: form.name, mobile: form.mobile, email: form.email,
        message: form.message, lead_type: type,
        property_id: p.id, property_name: p.name,
        visit_date: form.visit_date, visit_time: form.visit_time,
        occupation: form.occupation,
        monthly_income: form.monthly_income ? Number(form.monthly_income) : null,
        property_value: form.property_value ? Number(form.property_value) : null,
      };
      await api.post("/leads", body);
      toast.success("Request submitted! We'll contact you soon.");
      setModal(null);
      setForm({ name: "", mobile: "", email: "", visit_date: "", visit_time: "", message: "", occupation: "", monthly_income: "", property_value: "" });
    } catch {
      toast.error("Submission failed. Please try again.");
    }
    setBusy(false);
  };

  const waMessage = encodeURIComponent(`Hi, I'm interested in ${p.name} at ${p.location}. Please share more details.`);

  return (
    <div className="bg-white">
      {/* GALLERY */}
      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-4 gap-3">
            <div className="lg:col-span-3 aspect-[16/10] bg-navy overflow-hidden" data-testid="gallery-main">
              <img src={images[active]} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex lg:flex-col gap-3 overflow-x-auto">
              {images.slice(0, 4).map((src, i) => (
                <button key={i} onClick={() => setActive(i)} data-testid={`gallery-thumb-${i}`} className={`aspect-[4/3] w-32 lg:w-full overflow-hidden border-2 ${active === i ? "border-gold" : "border-transparent"}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="eyebrow mb-2">{p.property_type}</div>
            <h1 className="font-serif text-3xl sm:text-4xl text-navy mb-3" data-testid="property-name">{p.name}</h1>
            <div className="flex items-center text-ink-muted mb-6"><MapPin className="w-4 h-4 mr-1 text-gold" /> {p.location}</div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-surface p-6 border-l-2 border-gold">
              <div><div className="text-xs uppercase tracking-wider text-ink-muted">Area</div><div className="font-serif text-xl text-navy">{p.area_sqft} sqft</div></div>
              <div><div className="text-xs uppercase tracking-wider text-ink-muted">Bedrooms</div><div className="font-serif text-xl text-navy">{p.bedrooms || "-"}</div></div>
              <div><div className="text-xs uppercase tracking-wider text-ink-muted">Bathrooms</div><div className="font-serif text-xl text-navy">{p.bathrooms || "-"}</div></div>
              <div><div className="text-xs uppercase tracking-wider text-ink-muted">Status</div><div className="font-serif text-xl text-navy">{p.status}</div></div>
            </div>

            <div className="mb-8">
              <h2 className="font-serif text-2xl text-navy mb-3">Description</h2>
              <p className="text-ink-muted leading-relaxed">{p.description || "Premium property in a prime location."}</p>
            </div>

            {p.amenities?.length > 0 && (
              <div className="mb-8">
                <h2 className="font-serif text-2xl text-navy mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {p.amenities.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-ink-muted">
                      <CheckCircle2 className="w-4 h-4 text-gold" /> {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {p.video_url && (
              <div className="mb-8">
                <h2 className="font-serif text-2xl text-navy mb-3">Video Tour</h2>
                <div className="aspect-video bg-navy">
                  <iframe src={p.video_url} title="Tour" className="w-full h-full" allowFullScreen />
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6 mt-10">
              {[
                { icon: GraduationCap, title: "Nearby Schools", items: p.nearby_schools },
                { icon: Stethoscope, title: "Nearby Hospitals", items: p.nearby_hospitals },
                { icon: ShoppingBag, title: "Shopping Centers", items: p.nearby_shopping },
              ].map((b, i) => (
                <div key={i} className="bg-surface p-6 border-t-2 border-gold">
                  <b.icon className="w-6 h-6 text-gold mb-3" />
                  <h3 className="font-serif text-lg text-navy mb-2">{b.title}</h3>
                  <ul className="text-sm text-ink-muted space-y-1">
                    {(b.items || []).slice(0, 4).map((it, j) => <li key={j}>• {it}</li>)}
                    {(!b.items || b.items.length === 0) && <li className="text-xs">Information coming soon</li>}
                  </ul>
                </div>
              ))}
            </div>

            {p.map_url && (
              <div className="mt-10">
                <h2 className="font-serif text-2xl text-navy mb-3">Location</h2>
                <div className="aspect-[16/9] bg-surface">
                  <iframe src={p.map_url} title="Location" className="w-full h-full border-0" loading="lazy" />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT STICKY */}
          <aside className="lg:sticky lg:top-28 self-start">
            <div className="bg-navy text-white p-8" data-testid="property-cta-card">
              <div className="eyebrow text-gold mb-2">Price</div>
              <div className="font-serif text-4xl text-gold mb-6">{formatPrice(p.price)}</div>
              <div className="space-y-3">
                <button onClick={() => setModal("visit")} data-testid="book-visit-btn" className="w-full bg-gold text-navy font-semibold py-3 hover:bg-gold-hover transition-colors">Book Site Visit</button>
                <button onClick={() => setModal("callback")} data-testid="request-callback-btn" className="w-full border border-white/30 text-white py-3 hover:bg-white hover:text-navy transition-colors">Request Callback</button>
                <Link to="/loan" data-testid="apply-loan-btn" className="block w-full border border-white/30 text-white text-center py-3 hover:bg-white hover:text-navy transition-colors">Apply for Loan</Link>
                <a href={`https://wa.me/919441085800?text=${waMessage}`} target="_blank" rel="noreferrer" data-testid="whatsapp-inquiry-btn" className="block w-full bg-wagreen text-white text-center py-3 hover:bg-[#1ebe57] transition-colors">WhatsApp Inquiry</a>
                <a href="tel:+919441085800" className="block w-full text-center text-white/80 hover:text-gold text-sm pt-3 border-t border-white/10" data-testid="phone-direct">
                  <Phone className="inline w-4 h-4 mr-1" /> +91 9441085800
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white max-w-md w-full p-8 relative" onClick={(e) => e.stopPropagation()} data-testid="lead-modal">
            <button onClick={() => setModal(null)} className="absolute top-4 right-4 text-ink-muted hover:text-navy" data-testid="modal-close"><X className="w-5 h-5" /></button>
            <div className="eyebrow mb-2">{modal === "visit" ? "Site Visit" : modal === "loan" ? "Loan Application" : "Callback"}</div>
            <h3 className="font-serif text-2xl text-navy mb-5">
              {modal === "visit" ? "Schedule Your Visit" : modal === "callback" ? "We'll Call You Back" : "Apply for Loan"}
            </h3>
            <div className="space-y-3">
              <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="lead-name" className="w-full border border-line bg-surface px-4 py-3 text-sm" />
              <input placeholder="Mobile Number" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} data-testid="lead-mobile" className="w-full border border-line bg-surface px-4 py-3 text-sm" />
              {modal === "visit" && (
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} data-testid="lead-date" className="border border-line bg-surface px-4 py-3 text-sm" />
                  <input type="time" value={form.visit_time} onChange={(e) => setForm({ ...form, visit_time: e.target.value })} data-testid="lead-time" className="border border-line bg-surface px-4 py-3 text-sm" />
                </div>
              )}
              <textarea placeholder="Message (optional)" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="lead-message" className="w-full border border-line bg-surface px-4 py-3 text-sm" />
              <button onClick={() => submitLead(modal === "visit" ? "site_visit" : modal)} disabled={busy || !form.name || !form.mobile} data-testid="lead-submit-btn" className="w-full bg-navy text-white py-3 hover:bg-navy-hover disabled:opacity-50">
                {busy ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;

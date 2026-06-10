import { useEffect, useState } from "react";
import { Phone, Mail, MessageCircle, Award } from "lucide-react";
import api, { fileUrl } from "@/lib/api";

const Agents = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/agents").then(r => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white">
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="eyebrow text-gold mb-3">Our Team</div>
          <h1 className="font-serif text-4xl sm:text-5xl mb-4">Meet Our Property Experts</h1>
          <p className="text-white/70 max-w-2xl">Trusted advisors with deep local expertise — here to guide you at every step.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center text-ink-muted py-12">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-center text-ink-muted py-12" data-testid="agents-empty">
              Our team profiles will appear here. Admin can add agents from the dashboard.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((a, i) => (
                <div key={a.id} data-testid={`agent-card-${i}`} className="bg-white border border-line hover:border-gold transition-colors overflow-hidden">
                  <div className="aspect-square bg-surface overflow-hidden">
                    {a.avatar ? (
                      <img src={fileUrl(a.avatar)} alt={a.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-navy flex items-center justify-center">
                        <span className="font-serif text-gold text-5xl">{a.name?.charAt(0) || "A"}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="eyebrow mb-2">{a.role}</div>
                    <h3 className="font-serif text-xl text-navy mb-2">{a.name}</h3>
                    {a.experience && (
                      <div className="flex items-center gap-1 text-xs text-ink-muted mb-3">
                        <Award className="w-3 h-3 text-gold" /> {a.experience}
                      </div>
                    )}
                    {a.bio && <p className="text-ink-muted text-sm leading-relaxed mb-4 line-clamp-3">{a.bio}</p>}
                    <div className="flex gap-2 pt-4 border-t border-line">
                      {a.phone && (
                        <a href={`tel:${a.phone}`} className="flex-1 border border-line text-navy text-center py-2 text-xs hover:border-gold hover:text-gold"><Phone className="inline w-3 h-3 mr-1" />Call</a>
                      )}
                      {a.email && (
                        <a href={`mailto:${a.email}`} className="flex-1 border border-line text-navy text-center py-2 text-xs hover:border-gold hover:text-gold"><Mail className="inline w-3 h-3 mr-1" />Email</a>
                      )}
                      {a.phone && (
                        <a href={`https://wa.me/91${a.phone.replace(/\D/g, "").slice(-10)}`} target="_blank" rel="noreferrer" className="flex-1 bg-wagreen text-white text-center py-2 text-xs hover:bg-[#1ebe57]"><MessageCircle className="inline w-3 h-3 mr-1" />WA</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Agents;

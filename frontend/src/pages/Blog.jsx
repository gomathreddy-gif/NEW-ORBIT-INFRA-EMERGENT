import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, Tag } from "lucide-react";
import api, { fileUrl } from "@/lib/api";

const Blog = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/blogs").then(r => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white">
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="eyebrow text-gold mb-3">Insights</div>
          <h1 className="font-serif text-4xl sm:text-5xl mb-4">Blog & News</h1>
          <p className="text-white/70 max-w-2xl">Market updates, buying guides and investment insights from Orbit Infra experts.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center text-ink-muted py-12">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-center text-ink-muted py-12" data-testid="blog-empty">No blog posts yet. Check back soon.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((b, i) => (
                <Link to={`/blog/${b.slug}`} key={b.id} data-testid={`blog-card-${i}`} className="group bg-white border border-line hover:shadow-[0_8px_30px_rgb(10,34,64,0.08)] transition-all overflow-hidden">
                  <div className="aspect-[16/10] overflow-hidden zoom-wrap bg-surface">
                    {b.cover_image ? (
                      <img src={fileUrl(b.cover_image)} alt={b.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gold font-serif text-3xl">O</div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-ink-muted mb-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(b.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {b.author}</span>
                    </div>
                    <h3 className="font-serif text-xl text-navy leading-snug mb-3 group-hover:text-gold transition-colors line-clamp-2">{b.title}</h3>
                    <p className="text-ink-muted text-sm leading-relaxed line-clamp-3">{b.excerpt || b.content.slice(0, 140)}</p>
                    {b.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {b.tags.slice(0, 3).map((t, k) => (
                          <span key={k} className="text-xs bg-surface text-navy px-2 py-1"><Tag className="inline w-3 h-3 mr-1" />{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;

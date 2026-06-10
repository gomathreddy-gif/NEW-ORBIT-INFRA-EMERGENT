import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";
import api, { fileUrl } from "@/lib/api";

const BlogDetail = () => {
  const { slug } = useParams();
  const [b, setB] = useState(null);

  useEffect(() => {
    api.get(`/blogs/${slug}`).then(r => setB(r.data)).catch(() => setB(false));
  }, [slug]);

  if (b === false) return <div className="min-h-[60vh] flex items-center justify-center text-ink-muted">Blog post not found.</div>;
  if (!b) return <div className="min-h-[60vh] flex items-center justify-center text-ink-muted">Loading…</div>;

  return (
    <article className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/blog" className="inline-flex items-center gap-1 text-gold hover:text-navy text-sm mb-6" data-testid="blog-back-btn">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
        <div className="eyebrow mb-2">{b.tags?.[0] || "Article"}</div>
        <h1 className="font-serif text-3xl sm:text-5xl text-navy leading-tight mb-5" data-testid="blog-title">{b.title}</h1>
        <div className="flex items-center gap-5 text-sm text-ink-muted mb-8 pb-6 border-b border-line">
          <span className="flex items-center gap-1"><User className="w-4 h-4" /> {b.author}</span>
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(b.created_at).toLocaleDateString()}</span>
        </div>
        {b.cover_image && (
          <div className="aspect-[16/9] overflow-hidden mb-8">
            <img src={fileUrl(b.cover_image)} alt={b.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="prose max-w-none text-ink-muted leading-relaxed whitespace-pre-wrap" data-testid="blog-content">
          {b.content}
        </div>
        {b.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-line">
            {b.tags.map((t, i) => (
              <span key={i} className="text-xs bg-surface text-navy px-3 py-1.5"><Tag className="inline w-3 h-3 mr-1" />{t}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogDetail;

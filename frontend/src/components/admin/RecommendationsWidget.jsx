import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Flame, Clock, Sparkles } from "lucide-react";
import api, { fileUrl } from "@/lib/api";

const fmtPrice = (p) => {
  if (!p) return "—";
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)}Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)}L`;
  return `₹${p.toLocaleString("en-IN")}`;
};

const Section = ({ icon: Icon, title, items, accent, testid, emptyText }) => (
  <div className="bg-white border border-line" data-testid={testid}>
    <div className={`px-6 py-4 border-b border-line border-l-4 ${accent}`}>
      <h3 className="font-serif text-lg text-navy flex items-center gap-2"><Icon className="w-4 h-4 text-gold" /> {title}</h3>
    </div>
    {items.length === 0 ? (
      <div className="p-6 text-ink-muted text-sm" data-testid={`${testid}-empty`}>{emptyText}</div>
    ) : (
      <div className="divide-y divide-line">
        {items.map((p, i) => (
          <div key={p.id} className="p-4 flex gap-3 items-start" data-testid={`${testid}-item-${i}`}>
            <div className="w-14 h-14 bg-surface overflow-hidden flex-shrink-0">
              {p.images?.[0] && <img src={fileUrl(p.images[0])} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/admin/properties/${p.id}/edit`} className="text-sm font-medium text-navy hover:text-gold truncate block">{p.name}</Link>
              <div className="text-xs text-ink-muted mt-0.5">{p.location} • {fmtPrice(p.price)} • {p.status}</div>
              <div className="mt-2 inline-block bg-surface px-2 py-1 text-[11px] uppercase tracking-wider font-semibold text-navy">{p.reason}</div>
              <div className="text-xs text-ink-muted mt-2 leading-relaxed">{p.suggestion}</div>
            </div>
            <Link to={`/admin/properties/${p.id}/edit`} className="text-xs uppercase tracking-widest font-bold text-gold hover:text-navy whitespace-nowrap" data-testid={`${testid}-fix-${i}`}>
              Fix →
            </Link>
          </div>
        ))}
      </div>
    )}
  </div>
);

const RecommendationsWidget = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/recommendations").then(r => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return null;

  const hasAny = data.underperforming.length || data.hot.length || data.stale.length;

  return (
    <div className="space-y-4" data-testid="recommendations-section">
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow mb-1">Insights</div>
          <h2 className="font-serif text-2xl text-navy flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" /> Smart Recommendations
          </h2>
        </div>
        {!hasAny && (
          <div className="text-xs text-ink-muted">No actionable insights yet — keep adding properties & generating views.</div>
        )}
      </div>
      {hasAny ? (
        <div className="grid lg:grid-cols-3 gap-4">
          <Section
            icon={AlertTriangle}
            title="Needs Attention"
            items={data.underperforming}
            accent="border-l-red-500"
            testid="rec-underperforming"
            emptyText="No underperforming listings 🎉"
          />
          <Section
            icon={Flame}
            title="Hot Performers"
            items={data.hot}
            accent="border-l-gold"
            testid="rec-hot"
            emptyText="No hot listings yet. Promote your best properties to drive engagement."
          />
          <Section
            icon={Clock}
            title="Stale Listings"
            items={data.stale}
            accent="border-l-amber-500"
            testid="rec-stale"
            emptyText="All listings are getting attention."
          />
        </div>
      ) : null}
    </div>
  );
};

export default RecommendationsWidget;

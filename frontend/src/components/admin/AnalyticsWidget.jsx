import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, TrendingUp, BarChart3, Trophy } from "lucide-react";
import api, { fileUrl } from "@/lib/api";

const fmtPrice = (p) => {
  if (!p) return "—";
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)}Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)}L`;
  return `₹${p.toLocaleString("en-IN")}`;
};

const AnalyticsWidget = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/analytics").then(r => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return null;

  const max = Math.max(1, ...data.daily_views.map(d => d.views));

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* DAILY VIEWS CHART */}
      <div className="lg:col-span-2 bg-white border border-line p-6" data-testid="analytics-trend">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-serif text-lg text-navy flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gold" /> Views — Last 7 Days
            </h3>
            <p className="text-xs text-ink-muted mt-1">Total: <span className="text-navy font-bold">{data.total_views}</span> property views</p>
          </div>
          <TrendingUp className="w-5 h-5 text-gold" />
        </div>
        <div className="flex items-end gap-2 h-40">
          {data.daily_views.map((d, i) => {
            const h = Math.round((d.views / max) * 100);
            const day = new Date(d.date).toLocaleDateString("en-US", { weekday: "short" });
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5" data-testid={`view-bar-${i}`}>
                <div className="text-xs font-semibold text-navy">{d.views}</div>
                <div
                  className="w-full bg-gold/20 hover:bg-gold transition-colors rounded-sm"
                  style={{ height: `${Math.max(6, h)}%`, background: d.views > 0 ? "#D4AF37" : "#E9ECEF" }}
                  title={`${d.date}: ${d.views} views`}
                />
                <div className="text-[10px] uppercase tracking-wider text-ink-muted">{day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PROPERTY TYPE BREAKDOWN */}
      <div className="bg-white border border-line p-6" data-testid="analytics-types">
        <h3 className="font-serif text-lg text-navy mb-4">By Type</h3>
        {data.type_breakdown.length === 0 ? (
          <p className="text-xs text-ink-muted">No data yet</p>
        ) : (
          <div className="space-y-3">
            {data.type_breakdown.map((t, i) => {
              const total = data.type_breakdown.reduce((s, x) => s + x.count, 0);
              const pct = Math.round((t.count / total) * 100);
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-navy font-medium">{t.type}</span>
                    <span className="text-ink-muted">{t.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-surface">
                    <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TOP VIEWED */}
      <div className="bg-white border border-line">
        <div className="px-6 py-4 border-b border-line">
          <h3 className="font-serif text-lg text-navy flex items-center gap-2"><Eye className="w-4 h-4 text-gold" /> Most Viewed Properties</h3>
        </div>
        {data.top_viewed.length === 0 ? (
          <div className="p-6 text-ink-muted text-sm" data-testid="no-viewed">No property views yet.</div>
        ) : (
          <div className="divide-y divide-line">
            {data.top_viewed.map((p, i) => (
              <Link key={p.id} to={`/admin/properties/${p.id}/edit`} className="flex items-center gap-3 p-4 hover:bg-surface transition-colors" data-testid={`top-viewed-${i}`}>
                <div className="w-12 h-12 bg-surface overflow-hidden flex-shrink-0">
                  {p.images?.[0] && <img src={fileUrl(p.images[0])} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-navy truncate">{p.name}</div>
                  <div className="text-xs text-ink-muted">{p.location} • {fmtPrice(p.price)}</div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-lg text-gold">{p.view_count}</div>
                  <div className="text-[10px] uppercase tracking-wider text-ink-muted">views</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* TOP LEAD GENERATORS */}
      <div className="lg:col-span-2 bg-white border border-line">
        <div className="px-6 py-4 border-b border-line">
          <h3 className="font-serif text-lg text-navy flex items-center gap-2"><Trophy className="w-4 h-4 text-gold" /> Top Lead-Generating Properties</h3>
        </div>
        {data.top_lead_properties.length === 0 ? (
          <div className="p-6 text-ink-muted text-sm" data-testid="no-lead-properties">No property-specific leads yet.</div>
        ) : (
          <div className="divide-y divide-line">
            {data.top_lead_properties.map((p, i) => (
              <Link key={p.id} to={`/admin/properties/${p.id}/edit`} className="flex items-center gap-3 p-4 hover:bg-surface transition-colors" data-testid={`top-lead-${i}`}>
                <div className="w-12 h-12 bg-surface overflow-hidden flex-shrink-0">
                  {p.images?.[0] && <img src={fileUrl(p.images[0])} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-navy truncate">{p.name}</div>
                  <div className="text-xs text-ink-muted">{p.location} • {fmtPrice(p.price)} • {p.status}</div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-lg text-gold">{p.lead_count}</div>
                  <div className="text-[10px] uppercase tracking-wider text-ink-muted">leads</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsWidget;

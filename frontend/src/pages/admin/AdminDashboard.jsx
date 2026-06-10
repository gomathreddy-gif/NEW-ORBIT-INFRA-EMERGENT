import { useEffect, useState } from "react";
import { Building2, Users, TrendingUp, AlertCircle, Bell, CalendarCheck, Banknote } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import AnalyticsWidget from "@/components/admin/AnalyticsWidget";

const StatCard = ({ icon: Icon, label, value, color = "navy", testid }) => (
  <div className="bg-white border border-line p-6" data-testid={testid}>
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs uppercase tracking-widest text-ink-muted">{label}</div>
        <div className="font-serif text-3xl text-navy mt-2">{value}</div>
      </div>
      <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${color === "gold" ? "bg-gold text-navy" : "bg-navy text-gold"}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [notifs, setNotifs] = useState([]);
  const [leads, setLeads] = useState([]);

  const load = async () => {
    try {
      const [s, n, l] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/notifications"),
        api.get("/leads"),
      ]);
      setStats(s.data);
      setNotifs(n.data);
      setLeads(l.data.slice(0, 5));
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    await api.post("/notifications/read-all");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-navy">Dashboard</h2>
        <p className="text-ink-muted text-sm">Overview of properties, leads and customer activity</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard testid="stat-properties" icon={Building2} label="Properties" value={stats.total_properties || 0} />
        <StatCard testid="stat-available" icon={TrendingUp} label="Available" value={stats.available || 0} color="gold" />
        <StatCard testid="stat-leads" icon={Users} label="Total Leads" value={stats.total_leads || 0} />
        <StatCard testid="stat-new-leads" icon={AlertCircle} label="New Leads" value={stats.new_leads || 0} color="gold" />
        <StatCard testid="stat-visits" icon={CalendarCheck} label="Site Visits" value={stats.site_visits || 0} />
        <StatCard testid="stat-loans" icon={Banknote} label="Loan Requests" value={stats.loan_requests || 0} />
        <StatCard testid="stat-enquiries" icon={Users} label="Enquiries" value={stats.enquiries || 0} />
        <StatCard testid="stat-sold" icon={Building2} label="Sold" value={stats.sold || 0} />
      </div>

      <AnalyticsWidget />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-line">
          <div className="px-6 py-4 border-b border-line flex justify-between">
            <h3 className="font-serif text-lg text-navy">Recent Leads</h3>
            <Link to="/admin/leads" className="text-xs text-gold uppercase tracking-widest font-bold hover:text-navy">View All →</Link>
          </div>
          {leads.length === 0 ? (
            <div className="p-6 text-ink-muted text-sm" data-testid="no-leads">No leads yet. Customer enquiries will appear here.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-surface text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="text-left px-6 py-3">Name</th>
                  <th className="text-left px-6 py-3">Mobile</th>
                  <th className="text-left px-6 py-3">Type</th>
                  <th className="text-left px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l, i) => (
                  <tr key={l.id} className="border-t border-line" data-testid={`dashboard-lead-${i}`}>
                    <td className="px-6 py-3 text-sm">{l.name}</td>
                    <td className="px-6 py-3 text-sm text-ink-muted">{l.mobile}</td>
                    <td className="px-6 py-3 text-sm capitalize">{l.lead_type.replace("_", " ")}</td>
                    <td className="px-6 py-3 text-sm"><span className="bg-surface px-3 py-1 text-xs">{l.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white border border-line">
          <div className="px-6 py-4 border-b border-line flex justify-between items-center">
            <h3 className="font-serif text-lg text-navy flex items-center gap-2"><Bell className="w-4 h-4 text-gold" /> Notifications</h3>
            {notifs.some(n => !n.read) && <button onClick={markAllRead} data-testid="mark-all-read-btn" className="text-xs text-gold uppercase tracking-widest font-bold">Mark All Read</button>}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="p-6 text-ink-muted text-sm">No notifications.</div>
            ) : notifs.slice(0, 10).map((n, i) => (
              <div key={n.id} className={`px-6 py-3 border-b border-line text-sm ${!n.read ? "bg-gold/5" : ""}`} data-testid={`notif-${i}`}>
                <div className="font-semibold text-navy">{n.title}</div>
                <div className="text-xs text-ink-muted mt-1">{n.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

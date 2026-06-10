import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LayoutDashboard, Building2, Users, Bell, LogOut, FileText, UserCog, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const load = () => api.get("/notifications", { params: { only_unread: true } }).then(r => setUnread(r.data.length)).catch(() => {});
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, []);

  const items = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, key: "dashboard" },
    { to: "/admin/properties", label: "Properties", icon: Building2, key: "properties" },
    { to: "/admin/leads", label: "Leads & Visits", icon: Users, key: "leads" },
    { to: "/admin/blog", label: "Blog Posts", icon: FileText, key: "blog" },
    { to: "/admin/agents", label: "Agents", icon: UserCog, key: "agents" },
    { to: "/admin/newsletter", label: "Newsletter", icon: Mail, key: "newsletter" },
  ];

  const handleLogout = async () => { await logout(); navigate("/admin/login"); };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-5 bg-white">
      <aside className="bg-navy text-white lg:col-span-1 lg:min-h-screen" data-testid="admin-sidebar">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold flex items-center justify-center">
              <span className="font-serif text-navy text-xl font-bold">O</span>
            </div>
            <div>
              <div className="font-serif text-lg">Orbit Admin</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold">Control Center</div>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.key}
              to={it.to}
              end={it.end}
              data-testid={`admin-nav-${it.key}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm rounded-sm transition-colors ${
                  isActive ? "bg-gold text-navy" : "text-white/80 hover:bg-white/5 hover:text-gold"
                }`
              }
            >
              <it.icon className="w-4 h-4" /> {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 mt-auto">
          <div className="text-xs text-white/50 mb-2">{user?.email}</div>
          <button onClick={handleLogout} data-testid="admin-logout-btn" className="w-full flex items-center gap-2 text-sm text-white/80 hover:text-gold border border-white/10 px-4 py-2 rounded-sm hover:border-gold">
            <LogOut className="w-4 h-4" /> Logout
          </button>
          <Link to="/" className="block text-center mt-3 text-xs text-white/50 hover:text-gold">← Back to Site</Link>
        </div>
      </aside>

      <main className="lg:col-span-4 bg-surface min-h-screen">
        <div className="bg-white border-b border-line px-6 py-4 flex justify-between items-center sticky top-0 z-30">
          <h1 className="font-serif text-xl text-navy">Admin Panel</h1>
          <div className="relative">
            <Bell className="w-5 h-5 text-navy" />
            {unread > 0 && <span className="absolute -top-2 -right-2 bg-gold text-navy text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold" data-testid="notif-badge">{unread}</span>}
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;

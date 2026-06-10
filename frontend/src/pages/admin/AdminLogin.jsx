import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success("Welcome back, Admin!");
      navigate("/admin");
    } catch (err) {
      const msg = err.response?.data?.detail;
      toast.error(typeof msg === "string" ? msg : "Login failed");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy p-4" data-testid="admin-login-page">
      <div className="bg-white max-w-md w-full p-10 border-t-4 border-gold">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-navy text-gold rounded-sm flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <div className="eyebrow mb-2">Admin Access</div>
          <h1 className="font-serif text-3xl text-navy">Orbit Infra Control</h1>
          <p className="text-ink-muted text-sm mt-2">Sign in to manage your properties and leads</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-ink-muted">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="admin-login-email" className="w-full border border-line bg-surface px-4 py-3 mt-1" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-ink-muted">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="admin-login-password" className="w-full border border-line bg-surface px-4 py-3 mt-1" />
          </div>
          <button disabled={busy} data-testid="admin-login-submit" className="w-full bg-navy text-white py-3 hover:bg-navy-hover disabled:opacity-50">
            {busy ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <Link to="/" className="block text-center text-xs text-ink-muted hover:text-gold mt-6">← Back to website</Link>
      </div>
    </div>
  );
};

export default AdminLogin;

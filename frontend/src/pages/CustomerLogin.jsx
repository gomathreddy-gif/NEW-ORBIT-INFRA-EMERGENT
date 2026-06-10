import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CustomerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/account";

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name || "friend"}!`);
      navigate(user.role === "admin" ? "/admin" : redirectTo);
    } catch (err) {
      const msg = err.response?.data?.detail;
      toast.error(typeof msg === "string" ? msg : "Login failed");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-[80vh] bg-white flex items-center justify-center px-4 py-16">
      <div className="bg-white max-w-md w-full border border-line p-10 shadow-sm" data-testid="customer-login-page">
        <div className="text-center mb-6">
          <UserCircle className="w-12 h-12 text-gold mx-auto mb-2" />
          <div className="eyebrow mb-2">Customer Sign In</div>
          <h1 className="font-serif text-3xl text-navy">Welcome Back</h1>
          <p className="text-sm text-ink-muted mt-2">Sign in to access saved searches & wishlists synced across devices.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-ink-muted">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="login-email" className="w-full border border-line bg-surface px-4 py-3 mt-1" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-ink-muted">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="login-password" className="w-full border border-line bg-surface px-4 py-3 mt-1" />
          </div>
          <button disabled={busy} data-testid="login-submit" className="w-full bg-navy text-white py-3 hover:bg-navy-hover disabled:opacity-50">
            {busy ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="text-center text-sm text-ink-muted mt-6">
          New here? <Link to="/register" className="text-gold hover:text-navy font-semibold" data-testid="register-link">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;

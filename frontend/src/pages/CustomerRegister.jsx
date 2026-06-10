import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const CustomerRegister = () => {
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "" });
  const [busy, setBusy] = useState(false);
  const { setUserDirect } = useAuth();
  const navigate = useNavigate();

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post("/auth/register", form);
      if (data.token) localStorage.setItem("orbit_token", data.token);
      setUserDirect(data.user);
      toast.success("Account created! Welcome aboard.");
      navigate("/account");
    } catch (err) {
      const msg = err.response?.data?.detail;
      toast.error(typeof msg === "string" ? msg : "Registration failed");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-[80vh] bg-white flex items-center justify-center px-4 py-16">
      <div className="bg-white max-w-md w-full border border-line p-10 shadow-sm" data-testid="register-page">
        <div className="text-center mb-6">
          <UserPlus className="w-12 h-12 text-gold mx-auto mb-2" />
          <div className="eyebrow mb-2">Create Account</div>
          <h1 className="font-serif text-3xl text-navy">Join Orbit Infra</h1>
          <p className="text-sm text-ink-muted mt-2">Save searches, sync wishlists, and get tailored property alerts.</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Full Name" value={form.name} onChange={upd("name")} data-testid="reg-name" className="w-full border border-line bg-surface px-4 py-3" />
          <input required type="email" placeholder="Email" value={form.email} onChange={upd("email")} data-testid="reg-email" className="w-full border border-line bg-surface px-4 py-3" />
          <input placeholder="Mobile (optional)" value={form.mobile} onChange={upd("mobile")} data-testid="reg-mobile" className="w-full border border-line bg-surface px-4 py-3" />
          <input required type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={upd("password")} data-testid="reg-password" className="w-full border border-line bg-surface px-4 py-3" />
          <button disabled={busy} data-testid="reg-submit" className="w-full bg-navy text-white py-3 hover:bg-navy-hover disabled:opacity-50">
            {busy ? "Creating..." : "Create Account"}
          </button>
        </form>
        <div className="text-center text-sm text-ink-muted mt-6">
          Already have an account? <Link to="/login" className="text-gold hover:text-navy font-semibold" data-testid="login-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;

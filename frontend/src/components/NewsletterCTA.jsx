import { useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import api from "@/lib/api";

const NewsletterCTA = ({ inline = false }) => {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      const { data } = await api.post("/newsletter", { email });
      toast.success(data.message === "Already subscribed" ? "You're already subscribed!" : "Subscribed! Watch your inbox.");
      setEmail("");
    } catch {
      toast.error("Subscription failed. Try again.");
    }
    setBusy(false);
  };

  if (inline) {
    return (
      <form onSubmit={submit} className="flex gap-2" data-testid="newsletter-inline">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          data-testid="newsletter-email"
          className="flex-1 bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-gold focus:outline-none"
        />
        <button disabled={busy} data-testid="newsletter-submit" className="bg-gold text-navy px-5 py-3 text-sm font-semibold hover:bg-gold-hover disabled:opacity-50">
          {busy ? "..." : "Subscribe"}
        </button>
      </form>
    );
  }

  return (
    <section className="py-16 bg-navy text-white" data-testid="newsletter-section">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Mail className="w-10 h-10 text-gold mx-auto mb-4" />
        <div className="eyebrow text-gold mb-2">Newsletter</div>
        <h3 className="font-serif text-3xl mb-3">Get property updates first</h3>
        <p className="text-white/70 mb-6">Hand-picked listings, market reports and exclusive launches — straight to your inbox.</p>
        <form onSubmit={submit} className="flex max-w-md mx-auto gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            data-testid="newsletter-email-block"
            className="flex-1 bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-gold focus:outline-none"
          />
          <button disabled={busy} data-testid="newsletter-submit-block" className="bg-gold text-navy px-6 py-3 text-sm font-semibold hover:bg-gold-hover disabled:opacity-50">
            {busy ? "..." : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterCTA;

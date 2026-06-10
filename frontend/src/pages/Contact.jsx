import { useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const Contact = () => {
  const [form, setForm] = useState({ name: "", mobile: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/leads", { ...form, lead_type: "contact" });
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", mobile: "", email: "", message: "" });
    } catch {
      toast.error("Failed to send. Please try again.");
    }
    setBusy(false);
  };

  return (
    <div className="bg-white">
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="eyebrow text-gold mb-3">Get in Touch</div>
          <h1 className="font-serif text-4xl sm:text-5xl mb-4">Let's talk about your dream property</h1>
          <p className="text-white/70 max-w-2xl">Our team is just a call away. Reach out with any question or request — we'll respond fast.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10">
          <div>
            <h2 className="font-serif text-2xl text-navy mb-6">Reach Us</h2>
            <div className="space-y-5">
              <div className="flex gap-4 items-start p-5 bg-surface border-l-2 border-gold" data-testid="contact-phone">
                <Phone className="w-6 h-6 text-gold mt-1" />
                <div>
                  <div className="text-xs uppercase tracking-widest text-ink-muted mb-1">Phone</div>
                  <a href="tel:+919441085800" className="text-navy font-serif text-lg">+91 9441085800</a>
                </div>
              </div>
              <div className="flex gap-4 items-start p-5 bg-surface border-l-2 border-gold" data-testid="contact-email">
                <Mail className="w-6 h-6 text-gold mt-1" />
                <div>
                  <div className="text-xs uppercase tracking-widest text-ink-muted mb-1">Email</div>
                  <a href="mailto:orbitinfra4039@gmail.com" className="text-navy font-serif text-lg break-all">orbitinfra4039@gmail.com</a>
                </div>
              </div>
              <div className="flex gap-4 items-start p-5 bg-surface border-l-2 border-gold" data-testid="contact-address">
                <MapPin className="w-6 h-6 text-gold mt-1" />
                <div>
                  <div className="text-xs uppercase tracking-widest text-ink-muted mb-1">Office</div>
                  <div className="text-navy font-serif text-lg">Andhra Pradesh, India</div>
                </div>
              </div>
              <div className="aspect-[16/10] bg-surface">
                <iframe title="Map" src="https://www.google.com/maps?q=Andhra+Pradesh&output=embed" className="w-full h-full border-0" loading="lazy" />
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="bg-white border border-line p-8" data-testid="contact-form">
            <h2 className="font-serif text-2xl text-navy mb-6">Send a Message</h2>
            <div className="space-y-3">
              <input required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="contact-name" className="w-full border border-line bg-surface px-4 py-3 text-sm" />
              <input required placeholder="Mobile Number" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} data-testid="contact-mobile" className="w-full border border-line bg-surface px-4 py-3 text-sm" />
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="contact-email-input" className="w-full border border-line bg-surface px-4 py-3 text-sm" />
              <textarea required placeholder="Your message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="contact-message" className="w-full border border-line bg-surface px-4 py-3 text-sm" />
              <button disabled={busy} data-testid="contact-submit-btn" className="w-full bg-navy text-white py-3 hover:bg-navy-hover disabled:opacity-50 flex items-center justify-center gap-2">
                {busy ? "Sending..." : <>Send Message <Send className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Contact;

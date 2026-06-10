import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Banknote, CalendarCheck, ArrowRight, Star, Home as HomeIcon, Award, Users, Building2 } from "lucide-react";
import api from "@/lib/api";
import PropertyCard from "@/components/PropertyCard";
import NewsletterCTA from "@/components/NewsletterCTA";
import { useI18n } from "@/contexts/I18nContext";

const heroImg = "https://images.unsplash.com/photo-1760067537640-6ffab10b27d2?crop=entropy&cs=srgb&fm=jpg&q=85&w=2000";

const Counter = ({ end, label, suffix = "+" }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    let s = 0;
    const step = Math.ceil(end / 60);
    const iv = setInterval(() => {
      s += step;
      if (s >= end) { s = end; clearInterval(iv); }
      setN(s);
    }, 24);
    return () => clearInterval(iv);
  }, [end]);
  return (
    <div className="text-center">
      <div className="font-serif text-4xl lg:text-5xl text-gold font-bold counter" data-testid={`counter-${label}`}>{n}{suffix}</div>
      <div className="text-xs uppercase tracking-[0.2em] text-white/70 mt-2">{label}</div>
    </div>
  );
};

const Home = () => {
  const { t } = useI18n();
  const [featured, setFeatured] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    api.get("/properties", { params: { limit: 6 } }).then(r => setFeatured(r.data)).catch(() => {});
    api.get("/testimonials").then(r => setTestimonials(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[88vh] min-h-[600px] flex items-center" data-testid="hero-section">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Luxury home" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/60 to-navy/20" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl text-white">
            <div className="eyebrow text-gold mb-5">{t("common.tagline")}</div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6 tracking-tight">
              {t("hero.title")}
            </h1>
            <p className="text-lg text-white/85 leading-relaxed mb-8 max-w-2xl">{t("hero.sub")}</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/properties" data-testid="hero-explore-btn" className="bg-gold text-navy hover:bg-gold-hover px-8 py-4 rounded-sm font-semibold transition-all flex items-center gap-2">
                {t("hero.cta1")} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contact" data-testid="hero-visit-btn" className="border border-white/40 text-white hover:bg-white hover:text-navy px-8 py-4 rounded-sm font-medium transition-all">
                {t("hero.cta2")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* COUNTERS */}
      <section className="bg-navy py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Counter end={500} label="Properties Sold" />
          <Counter end={1200} label="Happy Clients" />
          <Counter end={15} label="Years Experience" />
          <Counter end={50} label="Awards" />
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-20 lg:py-28 bg-white" data-testid="about-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <img src="https://images.unsplash.com/photo-1778694276857-c39c6193e2ee?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200" alt="About" className="w-full rounded-sm" />
          </div>
          <div>
            <div className="eyebrow mb-3">{t("sections.about")}</div>
            <div className="gold-line" />
            <h2 className="font-serif text-3xl sm:text-4xl text-navy leading-tight mb-6">
              Building Trust, One Home at a Time
            </h2>
            <p className="text-ink-muted leading-relaxed mb-4">
              Orbit Infra Projects is Andhra Pradesh's premier real estate partner. We help families, investors and businesses buy, sell, lease, and finance properties — with absolute transparency and legal verification at every step.
            </p>
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div>
                <div className="text-gold font-bold uppercase text-xs tracking-widest mb-2">Mission</div>
                <p className="text-sm text-ink-muted">Make property ownership simple, transparent and accessible.</p>
              </div>
              <div>
                <div className="text-gold font-bold uppercase text-xs tracking-widest mb-2">Vision</div>
                <p className="text-sm text-ink-muted">Andhra Pradesh's most trusted real estate ecosystem.</p>
              </div>
            </div>
            <Link to="/about" className="inline-block mt-8 text-navy font-medium border-b-2 border-gold pb-1 hover:text-gold transition-colors" data-testid="about-readmore">
              Read More About Us →
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="py-20 lg:py-28 bg-surface" data-testid="featured-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="eyebrow mb-3">{t("sections.featured")}</div>
            <h2 className="font-serif text-3xl sm:text-4xl text-navy">{t("sections.featuredSub")}</h2>
          </div>
          {featured.length === 0 ? (
            <div className="text-center text-ink-muted py-10" data-testid="featured-empty">
              Properties will appear here. Admin can add properties from the dashboard.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((p, i) => <PropertyCard key={p.id} property={p} idx={i} />)}
            </div>
          )}
          <div className="text-center mt-12">
            <Link to="/properties" data-testid="view-all-properties-btn" className="bg-navy text-white hover:bg-navy-hover px-8 py-4 rounded-sm font-medium inline-block transition-all">
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 lg:py-28 bg-white" data-testid="why-choose-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="eyebrow mb-3">{t("sections.whyChoose")}</div>
            <h2 className="font-serif text-3xl sm:text-4xl text-navy">The Orbit Advantage</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: "Trusted Property Verification", text: "All properties are legally verified, RERA-compliant and genuine." },
              { icon: Banknote, title: "Easy Home Loan Assistance", text: "Quick approvals through our 15+ banking partners with the best interest rates." },
              { icon: CalendarCheck, title: "Hassle-Free Site Visits", text: "Book instant site visits with personalized expert guidance for every property." },
            ].map((f, i) => (
              <div key={i} className="bg-surface p-8 border-t-2 border-gold hover:shadow-[0_8px_30px_rgb(10,34,64,0.08)] transition-shadow" data-testid={`why-card-${i}`}>
                <div className="w-14 h-14 bg-navy text-gold flex items-center justify-center mb-5">
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-xl text-navy mb-3">{f.title}</h3>
                <p className="text-ink-muted text-sm leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES TEASER */}
      <section className="py-20 lg:py-28 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="eyebrow mb-3">{t("sections.services")}</div>
            <h2 className="font-serif text-3xl sm:text-4xl">End-to-end Real Estate Solutions</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: HomeIcon, label: "Buy & Sell" },
              { icon: Building2, label: "Rental Services" },
              { icon: Award, label: "Valuation" },
              { icon: Users, label: "Consulting" },
            ].map((s, i) => (
              <div key={i} className="border border-white/10 p-6 hover:border-gold transition-colors" data-testid={`service-tile-${i}`}>
                <s.icon className="w-8 h-8 text-gold mb-3" />
                <div className="text-sm uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/services" className="border border-gold text-gold px-8 py-4 hover:bg-gold hover:text-navy inline-block transition-all">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 lg:py-28 bg-surface" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="eyebrow mb-3">{t("sections.reviews")}</div>
            <h2 className="font-serif text-3xl sm:text-4xl text-navy">Loved by Homeowners & Investors</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map((tm, i) => (
              <div key={tm.id} className="bg-white p-8 border border-line" data-testid={`testimonial-${i}`}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: tm.rating }).map((_, k) => <Star key={k} className="w-4 h-4 fill-gold text-gold" />)}
                </div>
                <p className="text-ink-muted leading-relaxed mb-6 text-sm">"{tm.message}"</p>
                <div className="border-t border-line pt-4">
                  <div className="font-serif text-navy text-lg">{tm.name}</div>
                  <div className="text-xs text-ink-muted">{tm.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <NewsletterCTA />

      {/* CTA */}
      <section className="py-16 bg-gold">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-navy mb-4">Ready to find your dream home?</h2>
          <p className="text-navy/80 mb-8 text-lg">Speak to an Orbit Infra expert today. We're here to help.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" data-testid="cta-contact-btn" className="bg-navy text-white px-8 py-4 hover:bg-navy-hover transition-colors">Contact Us</Link>
            <a href="tel:+919441085800" data-testid="cta-call-btn" className="border-2 border-navy text-navy hover:bg-navy hover:text-white px-8 py-4 transition-colors">Call: 9441085800</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

import { Home, DollarSign, Key, FileCheck, Scale, Banknote, TrendingUp } from "lucide-react";

const services = [
  { icon: Home, title: "Buying Property", text: "Curated listings, expert guidance, and end-to-end support from search to registration." },
  { icon: DollarSign, title: "Selling Property", text: "Get the best market price with our valuation experts and wide buyer network." },
  { icon: Key, title: "Rental Services", text: "Hassle-free residential and commercial rentals with verified tenants." },
  { icon: FileCheck, title: "Property Valuation", text: "Accurate, RERA-compliant property valuations by certified appraisers." },
  { icon: Scale, title: "Legal Assistance", text: "Title verification, document drafting, and complete legal due diligence." },
  { icon: Banknote, title: "Home Loan Assistance", text: "Loans approved in 7 days through 15+ banking partners at best rates." },
  { icon: TrendingUp, title: "Investment Consulting", text: "Data-driven advice on high-growth properties for maximum ROI." },
];

const Services = () => (
  <div className="bg-white">
    <section className="bg-navy text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="eyebrow text-gold mb-3">Our Services</div>
        <h1 className="font-serif text-4xl sm:text-5xl mb-4">Complete Real Estate Solutions</h1>
        <p className="text-white/70 max-w-2xl">From finding the right property to financing and beyond — we handle everything so you don't have to.</p>
      </div>
    </section>

    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <div key={i} className="bg-white border border-line p-8 hover:border-gold transition-colors group" data-testid={`service-card-${i}`}>
            <div className="w-14 h-14 bg-surface flex items-center justify-center mb-5 group-hover:bg-gold transition-colors">
              <s.icon className="w-7 h-7 text-gold group-hover:text-navy" />
            </div>
            <h3 className="font-serif text-xl text-navy mb-3">{s.title}</h3>
            <p className="text-ink-muted text-sm leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default Services;

import { ShieldCheck, Award, Eye, Target, Sparkles } from "lucide-react";

const About = () => (
  <div className="bg-white">
    <section className="bg-navy text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="eyebrow text-gold mb-3">About Us</div>
        <h1 className="font-serif text-4xl sm:text-5xl mb-4">Your Trusted Real Estate Partner</h1>
        <p className="text-white/70 max-w-2xl">Orbit Infra Projects is a premier real estate brand dedicated to making property ownership simple, transparent and secure across Andhra Pradesh.</p>
      </div>
    </section>

    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <img src="https://images.unsplash.com/photo-1760067537204-fe9b55b2f1b0?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200" alt="Company" className="w-full" />
        <div>
          <div className="eyebrow mb-3">Who We Are</div>
          <h2 className="font-serif text-3xl text-navy mb-5">Building dream homes, one family at a time</h2>
          <p className="text-ink-muted leading-relaxed mb-4">
            With over 15 years of experience in Andhra Pradesh's real estate sector, Orbit Infra Projects has earned the trust of 1,200+ families and investors. We combine deep local expertise with modern digital tools to deliver an unmatched property buying, selling and leasing experience.
          </p>
          <p className="text-ink-muted leading-relaxed">
            Our promise: every property listed is legally verified, every transaction is transparent, and every customer is treated like family.
          </p>
        </div>
      </div>
    </section>

    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
        {[
          { icon: Target, title: "Our Mission", text: "Make property ownership simple, accessible and transparent for every Indian family." },
          { icon: Eye, title: "Our Vision", text: "Build Andhra Pradesh's most trusted real estate ecosystem powered by integrity and technology." },
          { icon: Sparkles, title: "Our Values", text: "Trust, transparency, customer-first thinking and an obsession with quality service." },
        ].map((b, i) => (
          <div key={i} className="bg-white p-8 border-t-2 border-gold" data-testid={`about-tile-${i}`}>
            <b.icon className="w-8 h-8 text-gold mb-4" />
            <h3 className="font-serif text-xl text-navy mb-3">{b.title}</h3>
            <p className="text-ink-muted text-sm leading-relaxed">{b.text}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="eyebrow mb-3">Why Choose Us</div>
          <h2 className="font-serif text-3xl text-navy">What sets Orbit Infra apart</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, title: "Legal Verification", text: "Every property is RERA-verified and legally clean." },
            { icon: Award, title: "Award Winning", text: "Recognised by industry bodies for excellence." },
            { icon: Target, title: "Personalised Match", text: "We find properties that suit your lifestyle." },
            { icon: Sparkles, title: "Premium Service", text: "White-glove service from search to handover." },
          ].map((b, i) => (
            <div key={i} className="border border-line p-6 hover:border-gold transition-colors" data-testid={`why-us-${i}`}>
              <b.icon className="w-7 h-7 text-gold mb-3" />
              <h3 className="font-serif text-lg text-navy mb-2">{b.title}</h3>
              <p className="text-ink-muted text-sm">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default About;

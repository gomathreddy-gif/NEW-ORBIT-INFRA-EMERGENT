import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import NewsletterCTA from "@/components/NewsletterCTA";

const Footer = () => {
  return (
    <footer className="bg-navy text-white" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-sm bg-gold flex items-center justify-center">
                <span className="font-serif text-navy text-xl font-bold">O</span>
              </div>
              <div>
                <div className="font-serif text-lg font-bold">Orbit Infra</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-gold">Projects</div>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-5">
              Your Trusted Real Estate Partner across Andhra Pradesh. Premium properties, transparent dealings, expert loan assistance.
            </p>
            <div className="text-xs uppercase tracking-[0.2em] text-gold font-bold mb-3">Stay Updated</div>
            <NewsletterCTA inline />
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-[0.2em] text-gold font-bold mb-5">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="text-white/70 hover:text-gold transition-colors">Home</Link></li>
              <li><Link to="/properties" className="text-white/70 hover:text-gold transition-colors">Properties</Link></li>
              <li><Link to="/about" className="text-white/70 hover:text-gold transition-colors">About Us</Link></li>
              <li><Link to="/services" className="text-white/70 hover:text-gold transition-colors">Services</Link></li>
              <li><Link to="/loan" className="text-white/70 hover:text-gold transition-colors">Home Loan</Link></li>
              <li><Link to="/agents" className="text-white/70 hover:text-gold transition-colors">Agents</Link></li>
              <li><Link to="/blog" className="text-white/70 hover:text-gold transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="text-white/70 hover:text-gold transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-[0.2em] text-gold font-bold mb-5">Tools</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/wishlist" className="hover:text-gold">My Wishlist</Link></li>
              <li><Link to="/compare" className="hover:text-gold">Compare Properties</Link></li>
              <li><Link to="/loan" className="hover:text-gold">EMI Calculator</Link></li>
              <li>Property Valuation</li>
              <li>Legal Assistance</li>
              <li>Investment Consulting</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-[0.2em] text-gold font-bold mb-5">Contact</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5 text-gold" /> +91 9441085800</li>
              <li className="flex items-start gap-2"><Mail className="w-4 h-4 mt-0.5 text-gold" /> orbitinfra4039@gmail.com</li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-gold" /> Andhra Pradesh, India</li>
            </ul>
            <div className="flex gap-3 mt-5">
              <a href="#" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-navy transition-colors" data-testid="social-facebook"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-navy transition-colors" data-testid="social-instagram"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-navy transition-colors" data-testid="social-twitter"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-navy transition-colors" data-testid="social-linkedin"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between text-xs text-white/50">
          <div>© {new Date().getFullYear()} Orbit Infra Projects. All rights reserved.</div>
          <div className="mt-2 md:mt-0">Your Trusted Real Estate Partner</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

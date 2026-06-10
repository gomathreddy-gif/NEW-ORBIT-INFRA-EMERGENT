import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Phone, Heart, Scale, User, LogIn } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { t, lang, setLang } = useI18n();
  const { wishlist, compare } = useWishlist();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: t("nav.home"), key: "home" },
    { to: "/properties", label: t("nav.properties"), key: "properties" },
    { to: "/about", label: t("nav.about"), key: "about" },
    { to: "/services", label: t("nav.services"), key: "services" },
    { to: "/loan", label: t("nav.loan"), key: "loan" },
    { to: "/agents", label: "Agents", key: "agents" },
    { to: "/blog", label: "Blog", key: "blog" },
    { to: "/contact", label: t("nav.contact"), key: "contact" },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-line sticky top-0 z-50" data-testid="site-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3" data-testid="brand-logo">
            <div className="w-10 h-10 rounded-sm bg-navy flex items-center justify-center">
              <span className="font-serif text-gold text-xl font-bold">O</span>
            </div>
            <div className="leading-tight">
              <div className="font-serif text-navy text-lg font-bold tracking-tight">Orbit Infra</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">Projects</div>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-7">
            {links.map((l) => (
              <NavLink
                key={l.key}
                to={l.to}
                end={l.to === "/"}
                data-testid={`nav-${l.key}`}
                className={({ isActive }) =>
                  `text-xs uppercase tracking-wider font-medium transition-colors ${
                    isActive ? "text-gold" : "text-navy hover:text-gold"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <Link to="/compare" data-testid="compare-icon" className="relative p-2 text-navy hover:text-gold transition-colors" aria-label="Compare">
              <Scale className="w-5 h-5" />
              {compare.length > 0 && <span className="absolute -top-1 -right-1 bg-gold text-navy text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{compare.length}</span>}
            </Link>
            <Link to="/wishlist" data-testid="wishlist-icon" className="relative p-2 text-navy hover:text-gold transition-colors" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-gold text-navy text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{wishlist.length}</span>}
            </Link>
            {user ? (
              <Link to="/account" data-testid="account-icon" className="flex items-center gap-1.5 p-2 text-navy hover:text-gold transition-colors">
                <div className="w-7 h-7 bg-navy text-gold rounded-full flex items-center justify-center text-xs font-bold">
                  {(user.name || "U").charAt(0).toUpperCase()}
                </div>
              </Link>
            ) : (
              <Link to="/login" data-testid="login-icon" className="p-2 text-navy hover:text-gold transition-colors" aria-label="Sign In">
                <LogIn className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setLang(lang === "en" ? "te" : "en")}
              data-testid="lang-toggle"
              className="text-xs uppercase tracking-widest font-semibold text-navy border border-line px-3 py-2 hover:border-gold hover:text-gold transition-colors ml-2"
            >
              {lang === "en" ? "తెలుగు" : "English"}
            </button>
            <a
              href="tel:+919441085800"
              data-testid="header-call-btn"
              className="hidden 2xl:flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-sm hover:bg-navy-hover transition-colors text-sm ml-2"
            >
              <Phone className="w-4 h-4" /> 9441085800
            </a>
          </div>

          <button
            className="lg:hidden text-navy"
            onClick={() => setOpen(!open)}
            data-testid="mobile-menu-toggle"
            aria-label="Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-line" data-testid="mobile-menu">
          <div className="px-4 py-4 space-y-3">
            {links.map((l) => (
              <NavLink
                key={l.key}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                data-testid={`mobile-nav-${l.key}`}
                className={({ isActive }) =>
                  `block py-2 text-sm uppercase tracking-wide font-medium ${
                    isActive ? "text-gold" : "text-navy"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="flex gap-2 pt-3 border-t border-line">
              <Link to="/wishlist" onClick={() => setOpen(false)} className="flex-1 border border-line py-2 text-center text-sm text-navy">
                <Heart className="inline w-4 h-4 mr-1" /> Wishlist ({wishlist.length})
              </Link>
              <Link to="/compare" onClick={() => setOpen(false)} className="flex-1 border border-line py-2 text-center text-sm text-navy">
                <Scale className="inline w-4 h-4 mr-1" /> Compare ({compare.length})
              </Link>
            </div>
            <button
              onClick={() => { setLang(lang === "en" ? "te" : "en"); }}
              data-testid="mobile-lang-toggle"
              className="text-xs uppercase tracking-widest font-semibold text-navy border border-line px-3 py-2"
            >
              {lang === "en" ? "తెలుగు" : "English"}
            </button>
            <a href="tel:+919441085800" className="block bg-navy text-white text-center py-3 rounded-sm" data-testid="mobile-call-btn">
              <Phone className="inline w-4 h-4 mr-2" /> 9441085800
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

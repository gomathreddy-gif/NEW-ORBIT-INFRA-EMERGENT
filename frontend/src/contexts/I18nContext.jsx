import { createContext, useContext, useState, useEffect } from "react";

const dict = {
  en: {
    nav: { home: "Home", properties: "Properties", about: "About", services: "Services", loan: "Home Loan", contact: "Contact", admin: "Admin" },
    hero: {
      title: "Find Your Dream Property With Confidence",
      sub: "We Help You Buy, Sell, Invest and Finance Properties Across Andhra Pradesh.",
      cta1: "Explore Properties",
      cta2: "Book Site Visit",
    },
    common: {
      tagline: "Your Trusted Real Estate Partner",
      brand: "Orbit Infra Projects",
      explore: "Explore",
      learnMore: "Learn More",
      viewDetails: "View Details",
      scheduleVisit: "Schedule Site Visit",
      applyLoan: "Apply Home Loan",
      whatsappEnquire: "WhatsApp Inquiry",
      submit: "Submit",
      sending: "Sending...",
      thankYou: "Thank you! We'll be in touch soon.",
    },
    sections: {
      featured: "Featured Properties",
      featuredSub: "Hand-picked premium properties across Andhra Pradesh",
      about: "About Us",
      whyChoose: "Why Choose Us",
      services: "Our Services",
      reviews: "What Clients Say",
      projects: "Our Projects",
      contact: "Get in Touch",
    },
  },
  te: {
    nav: { home: "హోమ్", properties: "ఆస్తులు", about: "మా గురించి", services: "సేవలు", loan: "హోమ్ లోన్", contact: "సంప్రదించండి", admin: "అడ్మిన్" },
    hero: {
      title: "మీ కలల ఆస్తిని విశ్వాసంతో కనుగొనండి",
      sub: "ఆంధ్రప్రదేశ్ అంతటా కొనుగోలు, అమ్మకం, పెట్టుబడి మరియు ఫైనాన్స్ ఆస్తులలో మేము మీకు సహాయం చేస్తాము.",
      cta1: "ఆస్తులను అన్వేషించండి",
      cta2: "సైట్ సందర్శనను బుక్ చేయండి",
    },
    common: {
      tagline: "మీ నమ్మకమైన రియల్ ఎస్టేట్ భాగస్వామి",
      brand: "ఆర్బిట్ ఇన్ఫ్రా ప్రాజెక్ట్స్",
      explore: "అన్వేషించండి",
      learnMore: "మరింత తెలుసుకోండి",
      viewDetails: "వివరాలు చూడండి",
      scheduleVisit: "సైట్ సందర్శన బుక్",
      applyLoan: "హోమ్ లోన్ కోసం దరఖాస్తు",
      whatsappEnquire: "వాట్సాప్ విచారణ",
      submit: "సమర్పించండి",
      sending: "పంపుతోంది...",
      thankYou: "ధన్యవాదాలు! మేము త్వరలో సంప్రదిస్తాము.",
    },
    sections: {
      featured: "ఫీచర్డ్ ఆస్తులు",
      featuredSub: "ఆంధ్రప్రదేశ్ అంతటా ప్రీమియం ఆస్తులు",
      about: "మా గురించి",
      whyChoose: "మమ్మల్ని ఎందుకు ఎంచుకోవాలి",
      services: "మా సేవలు",
      reviews: "క్లయింట్లు ఏమి చెబుతున్నారు",
      projects: "మా ప్రాజెక్ట్‌లు",
      contact: "సంప్రదించండి",
    },
  },
};

const I18nCtx = createContext(null);

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("orbit_lang") || "en");
  useEffect(() => { localStorage.setItem("orbit_lang", lang); }, [lang]);

  const t = (path) => {
    const parts = path.split(".");
    let cur = dict[lang] || dict.en;
    for (const p of parts) { cur = cur?.[p]; if (cur == null) return path; }
    return cur;
  };

  return (
    <I18nCtx.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nCtx.Provider>
  );
};

export const useI18n = () => useContext(I18nCtx);

import { MessageCircle } from "lucide-react";

const WhatsAppButton = ({ message = "Hello Orbit Infra, I'd like to enquire about a property." }) => {
  const url = `https://wa.me/919441085800?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-float-btn"
      className="fixed bottom-6 right-6 z-50 bg-wagreen hover:bg-[#1ebe57] text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center transition-transform hover:scale-110"
      aria-label="WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
};

export default WhatsAppButton;

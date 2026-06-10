import { Link } from "react-router-dom";
import { MapPin, BedDouble, Bath, Maximize, Heart, Scale } from "lucide-react";
import { fileUrl } from "@/lib/api";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";

const fallbackImg = "https://images.unsplash.com/photo-1760067537640-6ffab10b27d2?crop=entropy&cs=srgb&fm=jpg&q=80&w=800";

const formatPrice = (p) => {
  if (!p) return "Price on request";
  if (p >= 10000000) return `₹ ${(p / 10000000).toFixed(2)} Cr`;
  if (p >= 100000) return `₹ ${(p / 100000).toFixed(2)} L`;
  return `₹ ${p.toLocaleString("en-IN")}`;
};

const statusColor = (s) => {
  switch (s) {
    case "Available": return "bg-gold text-navy";
    case "Sold": return "bg-red-600 text-white";
    case "Under Construction": return "bg-amber-500 text-white";
    case "Ready To Move": return "bg-emerald-600 text-white";
    case "Upcoming": return "bg-navy text-white";
    default: return "bg-gold text-navy";
  }
};

const PropertyCard = ({ property, idx = 0 }) => {
  const { inWishlist, toggleWishlist, inCompare, toggleCompare, compare, MAX_COMPARE } = useWishlist();
  const img = property.images?.[0] ? fileUrl(property.images[0]) : fallbackImg;
  const isFav = inWishlist(property.id);
  const isCmp = inCompare(property.id);

  const onFav = (e) => {
    e.preventDefault(); e.stopPropagation();
    toggleWishlist(property.id);
    toast.success(isFav ? "Removed from wishlist" : "Added to wishlist");
  };
  const onCmp = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isCmp && compare.length >= MAX_COMPARE) {
      toast.warning(`Max ${MAX_COMPARE} properties for comparison`);
      return;
    }
    toggleCompare(property.id);
    toast.success(isCmp ? "Removed from compare" : "Added to compare");
  };

  return (
    <article
      data-testid={`property-card-${idx}`}
      className="bg-white border border-line hover:shadow-[0_8px_30px_rgb(10,34,64,0.08)] transition-all duration-300 group overflow-hidden rounded-sm"
    >
      <div className="zoom-wrap relative aspect-[4/3] w-full">
        <span className={`absolute top-4 left-4 ${statusColor(property.status)} text-xs uppercase font-bold tracking-wider px-3 py-1 z-10`}>
          {property.status}
        </span>
        <span className="absolute top-4 right-4 bg-white/95 text-navy text-xs uppercase font-bold tracking-wider px-3 py-1 z-10">
          {property.property_type}
        </span>
        <div className="absolute bottom-3 right-3 flex gap-2 z-10">
          <button onClick={onCmp} data-testid={`compare-toggle-${idx}`} aria-label="Compare" className={`w-9 h-9 flex items-center justify-center transition-colors ${isCmp ? "bg-gold text-navy" : "bg-white/95 text-navy hover:bg-gold hover:text-navy"}`}>
            <Scale className="w-4 h-4" />
          </button>
          <button onClick={onFav} data-testid={`wishlist-toggle-${idx}`} aria-label="Wishlist" className={`w-9 h-9 flex items-center justify-center transition-colors ${isFav ? "bg-red-500 text-white" : "bg-white/95 text-navy hover:bg-red-500 hover:text-white"}`}>
            <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
          </button>
        </div>
        <img src={img} alt={property.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="p-6">
        <h3 className="font-serif text-xl text-navy leading-snug mb-2 line-clamp-1">{property.name}</h3>
        <div className="flex items-center text-ink-muted text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1 text-gold" /> {property.location}
        </div>
        <div className="flex items-center justify-between border-t border-line pt-4 mb-4 text-sm text-ink-muted">
          <span className="flex items-center gap-1"><Maximize className="w-4 h-4 text-gold" /> {property.area_sqft} sqft</span>
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble className="w-4 h-4 text-gold" /> {property.bedrooms}</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-4 h-4 text-gold" /> {property.bathrooms}</span>}
        </div>
        <div className="flex items-center justify-between">
          <div className="font-serif text-2xl text-navy font-bold">{formatPrice(property.price)}</div>
          <Link
            to={`/properties/${property.id}`}
            data-testid={`view-property-${idx}`}
            className="text-xs uppercase tracking-widest font-bold text-gold hover:text-navy transition-colors"
          >
            View Details →
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;

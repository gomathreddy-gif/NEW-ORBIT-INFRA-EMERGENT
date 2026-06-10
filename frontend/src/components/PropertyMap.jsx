import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { fileUrl } from "@/lib/api";

// Custom navy/gold marker
const goldIcon = L.divIcon({
  className: "orbit-marker",
  html: `<div style="position:relative;width:36px;height:46px;">
    <svg viewBox="0 0 36 46" width="36" height="46" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28s18-14.5 18-28C36 8.06 27.94 0 18 0z" fill="#0A2240"/>
      <circle cx="18" cy="18" r="9" fill="#D4AF37"/>
      <path d="M14 18l3 3 5-5" stroke="#0A2240" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>`,
  iconSize: [36, 46],
  iconAnchor: [18, 46],
  popupAnchor: [0, -42],
});

const formatPrice = (p) => {
  if (!p) return "—";
  if (p >= 10000000) return `₹ ${(p / 10000000).toFixed(2)} Cr`;
  if (p >= 100000) return `₹ ${(p / 100000).toFixed(2)} L`;
  return `₹ ${p.toLocaleString("en-IN")}`;
};

// Center on AP roughly (Vijayawada): 16.5062, 80.6480
const AP_CENTER = [16.5062, 80.6480];

const PropertyMap = ({ properties = [], height = 480, center, zoom = 7, single = false }) => {
  const valid = properties.filter((p) => typeof p.lat === "number" && typeof p.lng === "number");
  const mapCenter = center || (valid[0] ? [valid[0].lat, valid[0].lng] : AP_CENTER);

  return (
    <div style={{ height }} className="w-full overflow-hidden border border-line bg-surface" data-testid="property-map">
      <MapContainer center={mapCenter} zoom={single ? 14 : zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {valid.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={goldIcon}>
            <Popup>
              <div style={{ minWidth: 180 }}>
                {p.images?.[0] && (
                  <img src={fileUrl(p.images[0])} alt={p.name} style={{ width: "100%", height: 100, objectFit: "cover", marginBottom: 6 }} />
                )}
                <div style={{ fontFamily: "Playfair Display, serif", color: "#0A2240", fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#4A5A70", marginTop: 2 }}>{p.location}</div>
                <div style={{ color: "#0A2240", fontWeight: 700, marginTop: 4 }}>{formatPrice(p.price)}</div>
                <Link to={`/properties/${p.id}`} style={{ display: "inline-block", marginTop: 6, fontSize: 11, color: "#D4AF37", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                  View Details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;

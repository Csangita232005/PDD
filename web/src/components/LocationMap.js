import React, { useState, useEffect, useRef } from "react";

function LocationMap({
  title = "Live Location & Navigation Route Map",
  height = "320px",
  pickupCoords = null,
  dropoffCoords = null,
  volunteerCoords = null,
  routeLabel = "",
  deliveryType = "VOLUNTEER_DELIVERY",
  role = "DONOR",
}) {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [currentGps, setCurrentGps] = useState(null);

  // Get user device GPS if needed
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Dynamically load Google Maps JS API script if API key is provided
  useEffect(() => {
    if (!apiKey || apiKey === "your_google_maps_api_key_here") return;

    if (window.google && window.google.maps) {
      setGoogleLoaded(true);
      return;
    }

    const scriptId = "google-maps-script";
    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.onload = () => setGoogleLoaded(true);
    script.onerror = () => console.warn("Google Maps script failed to load. Falling back to map embed.");
    document.head.appendChild(script);
  }, [apiKey]);

  // Render Google Map with Directions Service when JS API is ready
  useEffect(() => {
    if (!googleLoaded || !mapRef.current || !window.google || !window.google.maps) return;

    const pLat = pickupCoords?.lat || currentGps?.lat || 17.3850;
    const pLng = pickupCoords?.lng || currentGps?.lng || 78.4867;
    const center = { lat: pLat, lng: pLng };

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center,
      mapTypeControl: false,
    });

    if (pickupCoords && dropoffCoords) {
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
      });

      const origin = new window.google.maps.LatLng(pickupCoords.lat, pickupCoords.lng);
      const destination = new window.google.maps.LatLng(dropoffCoords.lat, dropoffCoords.lng);

      directionsService.route(
        {
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
            const route = result.routes[0]?.legs[0];
            if (route) {
              setRouteInfo({
                distance: route.distance?.text,
                duration: route.duration?.text,
              });
            }
          }
        }
      );
    } else if (pickupCoords) {
      new window.google.maps.Marker({
        position: { lat: pickupCoords.lat, lng: pickupCoords.lng },
        map,
        title: "Pickup Location",
        icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
      });
    }
  }, [googleLoaded, pickupCoords, dropoffCoords, currentGps]);

  // Derive center for map embed fallback
  const centerLat = volunteerCoords?.lat || pickupCoords?.lat || currentGps?.lat || 17.3850;
  const centerLng = volunteerCoords?.lng || pickupCoords?.lng || currentGps?.lng || 78.4867;

  const delta = 0.03;
  const bbox = `${centerLng - delta},${centerLat - delta},${centerLng + delta},${centerLat + delta}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${centerLat},${centerLng}`;

  const cleanPickupAddr = pickupCoords?.address || "Donor Location";
  let cleanDropoffAddr = dropoffCoords?.address;
  if (!cleanDropoffAddr || cleanDropoffAddr === "Recipient Location" || cleanDropoffAddr === "Recipient Address" || cleanDropoffAddr === "Destination Pending") {
    cleanDropoffAddr = "";
  }

  let googleNavUrl = "#";
  if (cleanPickupAddr && cleanDropoffAddr) {
    googleNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(cleanPickupAddr)}&destination=${encodeURIComponent(cleanDropoffAddr)}&travelmode=driving`;
  } else if (pickupCoords?.lat && dropoffCoords?.lat && (pickupCoords.lat !== dropoffCoords.lat || pickupCoords.lng !== dropoffCoords.lng)) {
    googleNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${pickupCoords.lat},${pickupCoords.lng}&destination=${dropoffCoords.lat},${dropoffCoords.lng}&travelmode=driving`;
  } else if (cleanPickupAddr) {
    googleNavUrl = `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(cleanPickupAddr)}&travelmode=driving`;
  } else if (pickupCoords?.lat) {
    googleNavUrl = `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${pickupCoords.lat},${pickupCoords.lng}&travelmode=driving`;
  } else {
    googleNavUrl = `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${centerLat},${centerLng}&travelmode=driving`;
  }

  const getFlowBadgeText = () => {
    const isSelf = ["SELF_DELIVERY", "SELF_COLLECTION", "BENEFICIARY_SELF_PICKUP"].includes(deliveryType);
    if (isSelf) {
      return role === "NGO"
        ? "🏛️ NGO Self-Collection Route"
        : role === "RECEIVER" || role === "BENEFICIARY"
        ? "🤲 Beneficiary Self Pickup Route"
        : "🚗 Self-Collection Route";
    }
    return "🚴 Volunteer Pickup & Delivery Route";
  };

  const hasLocationData = Boolean(
    (pickupCoords && (pickupCoords.address || (pickupCoords.lat && pickupCoords.lng))) ||
    (dropoffCoords && (dropoffCoords.address || (dropoffCoords.lat && dropoffCoords.lng))) ||
    (volunteerCoords && (volunteerCoords.lat && volunteerCoords.lng))
  );

  if (!hasLocationData) {
    return (
      <div style={styles.card}>
        <div style={{ textAlign: "center", padding: "30px 20px", color: "#666" }}>
          <span style={{ fontSize: "36px" }}>📍</span>
          <h4 style={{ margin: "8px 0 4px 0", color: "#444", fontSize: "16px", fontWeight: "bold" }}>
            Location Not Available
          </h4>
          <p style={{ margin: 0, fontSize: "13px", color: "#777" }}>
            No active delivery route or location coordinates to monitor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h4 style={styles.title}>📍 {title}</h4>
          <span style={styles.flowBadge}>{getFlowBadgeText()}</span>
        </div>

        <a
          href={googleNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.gmapsBtn}
          title="Open Google Maps Turn-by-Turn Directions"
        >
          🗺️ Open Directions
        </a>
      </div>

      {routeInfo && (
        <div style={styles.routeBanner}>
          <span>🚘 <strong>Distance:</strong> {routeInfo.distance}</span>
          <span>⏱️ <strong>Est. Time:</strong> {routeInfo.duration}</span>
        </div>
      )}

      {(pickupCoords || dropoffCoords || volunteerCoords) && (
        <div style={styles.routeLegend}>
          {pickupCoords && (
            <span style={{ color: "#2e7d32", fontWeight: "bold" }}>
              📦 Pickup: {pickupCoords.address || `${pickupCoords.lat.toFixed(3)}, ${pickupCoords.lng.toFixed(3)}`}
            </span>
          )}
          {volunteerCoords && (
            <span style={{ color: "#1565c0", fontWeight: "bold" }}>
              🚴 Volunteer: {volunteerCoords.name || "Assigned"} ({volunteerCoords.lat.toFixed(3)}, {volunteerCoords.lng.toFixed(3)})
            </span>
          )}
          {dropoffCoords && (
            <span style={{ color: "#e65100", fontWeight: "bold" }}>
              🏁 Destination: {dropoffCoords.address || `${dropoffCoords.lat.toFixed(3)}, ${dropoffCoords.lng.toFixed(3)}`}
            </span>
          )}
        </div>
      )}

      <div style={{ ...styles.mapWrapper, height }}>
        {apiKey && apiKey !== "your_google_maps_api_key_here" ? (
          <div ref={mapRef} style={{ width: "100%", height: "100%", borderRadius: "14px" }} />
        ) : (
          <iframe
            title="Location Route Map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src={embedUrl}
            style={{ border: 0, borderRadius: "14px" }}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "18px",
    margin: "20px 0",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
    border: "1px solid #e8f5e9",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
    flexWrap: "wrap",
    gap: "10px",
  },
  title: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "bold",
    color: "#2e7d32",
  },
  flowBadge: {
    fontSize: "11px",
    fontWeight: "bold",
    color: "#1b5e20",
    backgroundColor: "#e8f5e9",
    padding: "3px 8px",
    borderRadius: "10px",
    display: "inline-block",
    marginTop: "4px",
  },
  gmapsBtn: {
    backgroundColor: "#1565c0",
    color: "white",
    border: "none",
    borderRadius: "20px",
    padding: "6px 14px",
    fontSize: "12px",
    fontWeight: "bold",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    cursor: "pointer",
  },
  routeBanner: {
    display: "flex",
    gap: "20px",
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "10px",
  },
  routeLegend: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    fontSize: "12px",
    marginBottom: "10px",
    backgroundColor: "#fafafa",
    padding: "8px 12px",
    borderRadius: "10px",
    border: "1px solid #eee",
  },
  mapWrapper: {
    width: "100%",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
};

export default LocationMap;

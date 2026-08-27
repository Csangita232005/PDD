import React, { useEffect, useRef } from "react";

function GooglePlaceAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Search street, city, landmark or area...",
  style = {},
  required = false,
}) {
  const inputRef = useRef(null);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || apiKey === "your_google_maps_api_key" || !inputRef.current) return;

    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) return;

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["geocode", "establishment"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place && place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const formattedAddress = place.formatted_address || place.name || inputRef.current.value;
          const placeId = place.place_id || "";

          if (onChange) onChange(formattedAddress);
          if (onPlaceSelect) {
            onPlaceSelect({
              address: formattedAddress,
              formattedAddress,
              lat,
              lng,
              placeId,
            });
          }
        }
      });
    };

    if (window.google && window.google.maps && window.google.maps.places) {
      initAutocomplete();
    } else {
      const scriptId = "google-maps-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.onload = () => initAutocomplete();
        document.head.appendChild(script);
      }
    }
  }, [apiKey, onChange, onPlaceSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "10px 12px",
        borderRadius: "9px",
        border: "1.5px solid #d0d7de",
        fontSize: "14px",
        outline: "none",
        ...style,
      }}
      required={required}
    />
  );
}

export default GooglePlaceAutocomplete;

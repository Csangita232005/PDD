import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { createDonation } from "../services/api";
import NavbarHeader from "../components/NavbarHeader";
import GooglePlaceAutocomplete from "../components/GooglePlaceAutocomplete";

function DonateFood() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const userAddr = currentUser?.formattedAddress || currentUser?.address || "";
  const [foodName, setFoodName] = useState("");
  const [category, setCategory] = useState("Cooked Meals");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [unit, setUnit] = useState("Packs");
  const [preparedAt, setPreparedAt] = useState("");
  const [expiryAt, setExpiryAt] = useState("");
  const [address, setAddress] = useState(userAddr);
  const [latitude, setLatitude] = useState(currentUser?.latitude || 17.3850);
  const [longitude, setLongitude] = useState(currentUser?.longitude || 78.4867);
  const [placeId, setPlaceId] = useState(currentUser?.placeId || "");
  const [detectingGps, setDetectingGps] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState("VOLUNTEER_DELIVERY");
  const [intendedRecipient, setIntendedRecipient] = useState("ALL");
  const [contactNumber, setContactNumber] = useState(currentUser?.mobile || "");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (!address) setAddress(currentUser.formattedAddress || currentUser.address || "");
      if (currentUser.latitude) setLatitude(currentUser.latitude);
      if (currentUser.longitude) setLongitude(currentUser.longitude);
      if (currentUser.mobile && !contactNumber) setContactNumber(currentUser.mobile);
    }
  }, [currentUser]);

  const fetchGpsLocation = (showAlert = false) => {
    if ("geolocation" in navigator) {
      setDetectingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          setDetectingGps(false);
          if (showAlert) {
            alert(`GPS Location Detected! (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`);
          }
        },
        (err) => {
          setDetectingGps(false);
          if (showAlert) {
            alert("Could not fetch GPS. Please enter pickup address manually.");
          }
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const handlePlaceSelect = (place) => {
    if (!place) return;
    setAddress(place.formattedAddress || place.address || "");
    if (place.lat) setLatitude(place.lat);
    if (place.lng) setLongitude(place.lng);
    if (place.placeId) setPlaceId(place.placeId);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!foodName.trim() || !quantity || !address.trim() || !contactNumber.trim()) {
      alert(t("fillAllFields") || "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        foodName: foodName.trim(),
        category,
        description: description.trim(),
        quantity,
        unit,
        prepDate: preparedAt || new Date().toISOString(),
        expiryTime: expiryAt || "4 Hours",
        address: address.trim(),
        formattedAddress: address.trim(),
        latitude,
        longitude,
        placeId,
        deliveryMode,
        deliveryPreference: deliveryMode,
        intendedRecipient,
        contactNumber: contactNumber.trim(),
        donorId: currentUser?.id || currentUser?._id,
        donorName: currentUser?.name || "Donor",
        foodImage: imagePreview,
      };

      const res = await createDonation(payload);
      setLoading(false);
      if (res.success) {
        alert("Food donation created successfully!");
        navigate("/donor/dashboard");
      } else {
        alert(res.message || "Failed to post donation.");
      }
    } catch (err) {
      setLoading(false);
      alert(err.response?.data?.message || "Failed to post donation.");
    }
  };

  return (
    <div style={styles.container}>
      <NavbarHeader title="Create Food Donation" subtitle="Share surplus food with local NGOs & Receivers" />

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <button type="button" style={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h3 style={{ margin: 0, color: "#2e7d32" }}>🍱 Food Donation Form</h3>
        </div>

        <label style={styles.label}>{t("foodNameLabel") || "Food Item Name"} *</label>
        <input
          type="text"
          placeholder="e.g. Fresh Veg Biryani & Curry"
          style={styles.input}
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          required
        />

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>{t("foodCategoryLabel") || "Category"}</label>
            <select
              style={styles.input}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Cooked Meals">Cooked Meals</option>
              <option value="Packaged Food">Packaged Food</option>
              <option value="Raw Groceries">Raw Groceries / Bakery</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={styles.label}>{t("quantityLabel") || "Quantity"} *</label>
            <input
              type="number"
              style={styles.input}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={styles.label}>{t("unitLabel") || "Unit"}</label>
            <select
              style={styles.input}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="Packs">Packs</option>
              <option value="Kg">Kg</option>
              <option value="Meals">Meals</option>
              <option value="Boxes">Boxes</option>
            </select>
          </div>
        </div>

        <label style={styles.label}>Notes & Description</label>
        <textarea
          placeholder="Freshly prepared, packed hygienically in containers..."
          style={{ ...styles.input, height: "60px" }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Preparation Date & Time</label>
            <input
              type="datetime-local"
              style={styles.input}
              value={preparedAt}
              onChange={(e) => setPreparedAt(e.target.value)}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={styles.label}>Expiry Date & Time</label>
            <input
              type="datetime-local"
              style={styles.input}
              value={expiryAt}
              onChange={(e) => setExpiryAt(e.target.value)}
            />
          </div>
        </div>

        <label style={styles.label}>🎯 Intended Recipient Type *</label>
        <select
          style={styles.input}
          value={intendedRecipient}
          onChange={(e) => setIntendedRecipient(e.target.value)}
        >
          <option value="ALL">🌐 Open to Everyone (NGOs & Individual Receivers)</option>
          <option value="NGO">🏛️ NGO Organizations Only</option>
          <option value="RECEIVER">🤲 Individual Receivers Only</option>
        </select>

        <label style={styles.label}>🚚 Delivery Method Preference *</label>
        <select
          style={styles.input}
          value={deliveryMode}
          onChange={(e) => setDeliveryMode(e.target.value)}
        >
          <option value="VOLUNTEER_DELIVERY">🚴 Volunteer Pickup (Request a volunteer to collect food)</option>
          <option value="SELF_DELIVERY">🚗 Donor Self-Delivery (Donor will deliver food personally)</option>
        </select>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
          <label style={styles.label}>{t("pickupAddressLabel") || "Pickup Address"} *</label>
          <button type="button" style={styles.gpsBtn} onClick={() => fetchGpsLocation(true)}>
            {detectingGps ? "⌛ Fetching GPS..." : "📍 Get GPS Coordinates"}
          </button>
        </div>

        <GooglePlaceAutocomplete
          value={address}
          onChange={(val) => setAddress(val)}
          onPlaceSelect={handlePlaceSelect}
          placeholder="Search pickup address..."
          required
        />

        <p style={{ margin: "4px 0 10px 0", fontSize: "11px", color: "#666" }}>
          Registered Donor Default: {userAddr || "Not set"}. Coordinates: Lat {latitude.toFixed(4)}, Lng {longitude.toFixed(4)}
        </p>

        <label style={styles.label}>{t("contactNumberLabel") || "Contact Mobile Number"} *</label>
        <input
          type="tel"
          style={styles.input}
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          required
        />

        <label style={styles.label}>Food Image Upload (Optional)</label>
        <input
          type="file"
          accept="image/*"
          style={styles.input}
          onChange={handleImageChange}
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "10px", marginTop: "10px" }}
          />
        )}

        <button type="submit" style={styles.submitBtn} disabled={loading}>
          {loading ? t("loading") : "Post Food Donation"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    background: "#f5f5f5",
    minHeight: "100vh",
    paddingBottom: "30px",
  },
  backBtn: {
    background: "#eee",
    color: "#333",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  form: {
    maxWidth: "500px",
    margin: "20px auto",
    background: "white",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },
  row: {
    display: "flex",
    gap: "10px",
  },
  label: {
    display: "block",
    fontWeight: "bold",
    fontSize: "13px",
    color: "#333",
    marginTop: "10px",
    marginBottom: "4px",
  },
  gpsBtn: {
    background: "#e8f5e9",
    color: "#2e7d32",
    border: "1px solid #c8e6c9",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "20px",
  },
};

export default DonateFood;
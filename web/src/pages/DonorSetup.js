import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { setupUserRole } from "../services/api";
import GooglePlaceAutocomplete from "../components/GooglePlaceAutocomplete";

function DonorSetup() {
  const navigate = useNavigate();
  const { currentUser, refreshUserProfile } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState(currentUser?.name || "");
  const [mobile, setMobile] = useState(currentUser?.mobile || "");
  const [address, setAddress] = useState(currentUser?.roleProfiles?.donor?.address?.formattedAddress || currentUser?.donorAddress || "");
  const [donorType, setDonorType] = useState("Individual");
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePlaceSelect = (place) => {
    if (!place) return;
    setAddress(place.formattedAddress || place.address || "");
  };

  const validateAddress = (addr) => {
    const trimmed = (addr || "").trim();
    if (!trimmed) {
      return "Pickup address is required.";
    }
    if (trimmed.length < 10) {
      return "Address is too short. Please enter a complete address (at least 10 characters with street, landmark, or city details).";
    }
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length < 2) {
      return "Please enter a valid full address (e.g. 'Plot 12, Jubilee Hills, Hyderabad').";
    }
    return null;
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!name.trim()) {
      setErrorMsg("Name is required.");
      return;
    }
    if (!mobile.trim()) {
      setErrorMsg("Mobile number is required.");
      return;
    }

    const validationError = validateAddress(address);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await setupUserRole({
        role: "DONOR",
        name: name.trim(),
        mobile: mobile.trim(),
        address: address.trim(),
        donorType,
        organizationName: organization.trim(),
        email: currentUser?.email,
        userId: currentUser?.id,
      });
      setLoading(false);
      if (res.success) {
        await refreshUserProfile();
        navigate("/donor/dashboard");
      } else {
        setErrorMsg(res.message || "Failed to update setup.");
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg("Failed to update profile.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>🍱 Donor Setup</h2>
        <p style={styles.subtitle}>Provide your location details for smooth food pickup.</p>

        {/* User Account Info Display Card */}
        <div style={styles.accountInfoCard}>
          <label style={styles.cardLabel}>👤 Name</label>
          <input
            type="text"
            style={styles.cardInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
          <label style={styles.cardLabel}>📧 Email</label>
          <input
            type="email"
            style={{ ...styles.cardInput, backgroundColor: "#f0f0f0", color: "#666", cursor: "not-allowed" }}
            value={currentUser?.email || ""}
            disabled
          />
          <label style={styles.cardLabel}>📱 Mobile</label>
          <input
            type="tel"
            style={styles.cardInput}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Enter mobile number"
            required
          />
        </div>

        {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

        <label style={styles.label}>Donor Type</label>
        <select
          style={styles.input}
          value={donorType}
          onChange={(e) => setDonorType(e.target.value)}
        >
          <option value="Individual">Individual (Home)</option>
          <option value="Restaurant">Restaurant / Hotel</option>
          <option value="Caterer">Event Caterer</option>
          <option value="Supermarket">Supermarket / Bakery</option>
        </select>

        {donorType !== "Individual" && (
          <input
            type="text"
            placeholder="Organization / Business Name"
            style={styles.input}
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          />
        )}

        <label style={styles.label}>Pickup Address</label>
        <GooglePlaceAutocomplete
          value={address}
          onChange={(val) => setAddress(val)}
          onPlaceSelect={handlePlaceSelect}
          placeholder="Search street, locality, city..."
          required
        />

        <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? t("loading") : "Complete Donor Setup"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#f5f5f5",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  box: {
    background: "white",
    padding: "30px",
    borderRadius: "16px",
    width: "380px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  title: {
    color: "#2e7d32",
    marginBottom: "5px",
    fontSize: "24px",
    fontWeight: "700",
  },
  subtitle: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "15px",
  },
  accountInfoCard: {
    background: "#e8f5e9",
    border: "1px solid #c8e6c9",
    borderRadius: "10px",
    padding: "12px 16px",
    marginBottom: "15px",
    textAlign: "left",
  },
  cardLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: "700",
    color: "#2e7d32",
    marginTop: "6px",
    marginBottom: "2px",
  },
  cardInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #a5d6a7",
    fontSize: "13px",
    marginBottom: "4px",
    outline: "none",
  },
  accountText: {
    margin: "3px 0",
    fontSize: "13px",
    color: "#2e7d32",
  },
  errorBox: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "12px",
    fontSize: "13px",
    textAlign: "left",
  },
  label: {
    display: "block",
    textAlign: "left",
    fontWeight: "bold",
    color: "#333",
    marginTop: "10px",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px",
    marginTop: "5px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  btn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    marginTop: "15px",
  },
};

export default DonorSetup;
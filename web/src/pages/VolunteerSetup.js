import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { setupUserRole } from "../services/api";

function VolunteerSetup() {
  const navigate = useNavigate();
  const { currentUser, refreshUserProfile } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState(currentUser?.name || "");
  const [mobile, setMobile] = useState(currentUser?.mobile || "");
  const [vehicleType, setVehicleType] = useState("Bike");
  const [preferredZone, setPreferredZone] = useState(currentUser?.roleProfiles?.volunteer?.address?.formattedAddress || currentUser?.volunteerAddress || "");
  const [availability, setAvailability] = useState("Flexible");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
    if (!preferredZone.trim()) {
      setErrorMsg("Preferred delivery area / zone is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await setupUserRole({
        role: "VOLUNTEER",
        name: name.trim(),
        mobile: mobile.trim(),
        vehicleType,
        preferredZone: preferredZone.trim(),
        address: preferredZone.trim(),
        availability,
        email: currentUser?.email,
        userId: currentUser?.id,
      });
      setLoading(false);
      if (res.success) {
        await refreshUserProfile();
        navigate("/volunteer");
      } else {
        setErrorMsg(res.message || "Failed to update setup.");
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg("Failed to update volunteer setup.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>🚚 Volunteer Setup</h2>
        <p style={styles.subtitle}>Tell us your availability & transport for food delivery.</p>

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

        <label style={styles.label}>Vehicle Type</label>
        <select
          style={styles.input}
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
        >
          <option value="Bike">Motorcycle / Scooter</option>
          <option value="Bicycle">Bicycle</option>
          <option value="Car">Car / Auto</option>
          <option value="Van">Van / Cargo Truck</option>
        </select>

        <label style={styles.label}>Preferred Delivery Zone / Base Area</label>
        <input
          type="text"
          placeholder="e.g. Jubilee Hills, Hyderabad"
          style={styles.input}
          value={preferredZone}
          onChange={(e) => setPreferredZone(e.target.value)}
        />

        <label style={styles.label}>Availability</label>
        <select
          style={styles.input}
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        >
          <option value="Flexible">Flexible (Anytime)</option>
          <option value="Mornings">Mornings Only</option>
          <option value="Evenings">Evenings & Nights</option>
          <option value="Weekends">Weekends Only</option>
        </select>

        <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? t("loading") : "Complete Volunteer Setup"}
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
    marginTop: "8px",
    fontSize: "13px",
  },
  input: {
    width: "92%",
    padding: "11px",
    margin: "6px 0",
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

export default VolunteerSetup;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { setupUserRole } from "../services/api";

function ReceiverSetup() {
  const navigate = useNavigate();
  const { currentUser, refreshUserProfile } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState(currentUser?.name || "");
  const [mobile, setMobile] = useState(currentUser?.mobile || "");
  const [receiverType, setReceiverType] = useState("Individual");
  const [address, setAddress] = useState(currentUser?.roleProfiles?.beneficiary?.address?.formattedAddress || currentUser?.receiverAddress || "");
  const [peopleCount, setPeopleCount] = useState("5");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const validateAddress = (addr) => {
    const trimmed = (addr || "").trim();
    if (!trimmed) {
      return "Delivery address is required.";
    }
    if (trimmed.length < 10) {
      return "Address is too short. Please enter a complete address (at least 10 characters with street, landmark, or city details).";
    }
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length < 2) {
      return "Please enter a valid full address (e.g. 'Door 4, Madhapur, Hyderabad').";
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
        role: "RECEIVER",
        name: name.trim(),
        mobile: mobile.trim(),
        receiverType,
        address: address.trim(),
        peopleCount: Number(peopleCount) || 5,
        email: currentUser?.email,
        userId: currentUser?.id,
      });
      setLoading(false);
      if (res.success) {
        await refreshUserProfile();
        navigate("/receiver");
      } else {
        setErrorMsg(res.message || "Failed to update setup.");
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg("Failed to update receiver setup.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>🤝 Receiver Setup</h2>
        <p style={styles.subtitle}>Enter your details to receive food donations.</p>

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

        <label style={styles.label}>Receiver Category</label>
        <select
          style={styles.input}
          value={receiverType}
          onChange={(e) => setReceiverType(e.target.value)}
        >
          <option value="Individual">Individual / Family</option>
          <option value="Orphanage">Orphanage / Children's Home</option>
          <option value="OldAgeHome">Old Age Home</option>
          <option value="CommunityShelter">Community Shelter</option>
        </select>

        <label style={styles.label}>Delivery / Pickup Address</label>
        <textarea
          placeholder="Enter complete delivery/pickup address (e.g. Door No, Street, City)"
          style={{ ...styles.input, height: "70px" }}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <label style={styles.label}>Approx. Number of People</label>
        <input
          type="number"
          placeholder="e.g. 10"
          style={styles.input}
          value={peopleCount}
          onChange={(e) => setPeopleCount(e.target.value)}
        />

        <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? t("loading") : "Complete Receiver Setup"}
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

export default ReceiverSetup;
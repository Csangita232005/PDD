import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { setupUserRole } from "../services/api";

function NGOSetup() {
  const navigate = useNavigate();
  const { currentUser, refreshUserProfile } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState(currentUser?.name || "");
  const [mobile, setMobile] = useState(currentUser?.mobile || "");
  const [ngoName, setNgoName] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [address, setAddress] = useState(currentUser?.roleProfiles?.ngo?.address?.formattedAddress || currentUser?.ngoAddress || "");
  const [capacity, setCapacity] = useState("100");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const validateAddress = (addr) => {
    const trimmed = (addr || "").trim();
    if (!trimmed) {
      return "NGO address is required.";
    }
    if (trimmed.length < 10) {
      return "Address is too short. Please enter a complete address (at least 10 characters with street, landmark, or city details).";
    }
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length < 2) {
      return "Please enter a valid full address (e.g. 'Street 4, Jubilee Hills, Hyderabad').";
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
    if (!ngoName.trim()) {
      setErrorMsg("NGO Organization name is required.");
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
        role: "NGO",
        name: name.trim(),
        mobile: mobile.trim(),
        ngoName: ngoName.trim(),
        registrationNo: registrationNo.trim(),
        address: address.trim(),
        capacity: Number(capacity) || 100,
        email: currentUser?.email,
        userId: currentUser?.id,
      });
      setLoading(false);
      if (res.success) {
        await refreshUserProfile();
        navigate("/ngo");
      } else {
        setErrorMsg(res.message || "Failed to update NGO setup.");
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg("Failed to update NGO setup.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>🏛️ NGO / Shelter Setup</h2>
        <p style={styles.subtitle}>Register your organization details for food distribution.</p>

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

        <input
          type="text"
          placeholder="NGO / Foundation Name"
          style={styles.input}
          value={ngoName}
          onChange={(e) => setNgoName(e.target.value)}
        />

        <input
          type="text"
          placeholder="NGO Registration Number (Optional)"
          style={styles.input}
          value={registrationNo}
          onChange={(e) => setRegistrationNo(e.target.value)}
        />

        <textarea
          placeholder="Complete NGO Address (e.g. Building, Street, City)"
          style={{ ...styles.input, height: "70px" }}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <label style={styles.label}>Daily Meal Capacity</label>
        <input
          type="number"
          placeholder="e.g. 150"
          style={styles.input}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />

        <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? t("loading") : "Complete NGO Setup"}
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
    marginTop: "5px",
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

export default NGOSetup;
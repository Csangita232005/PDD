import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { updateUserProfile } from "../services/api";

function EditNGOProfile() {
  const navigate = useNavigate();
  const { currentUser, refreshUserProfile } = useAuth();
  const { t } = useLanguage();

  const [ngoName, setNgoName] = useState(currentUser?.organizationName || currentUser?.name || "");
  const [registrationNo, setRegistrationNo] = useState(currentUser?.registrationNo || "");
  const [email] = useState(currentUser?.email || "");
  const [mobile, setMobile] = useState(currentUser?.mobile || "");
  const [address, setAddress] = useState(currentUser?.roleProfiles?.ngo?.address?.formattedAddress || currentUser?.ngoAddress || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        role: "NGO",
        userId: currentUser?.id || currentUser?._id,
        email: currentUser?.email,
        organizationName: ngoName,
        registrationNo,
        mobile,
        address,
      };

      const res = await updateUserProfile(payload);
      setLoading(false);
      if (res.success) {
        await refreshUserProfile();
        alert("NGO Profile Updated Successfully! 🏛️");
        navigate("/ngoprofile");
      } else {
        alert(res.message || "Failed to update NGO profile.");
      }
    } catch (err) {
      setLoading(false);
      alert("Failed to update NGO profile.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/ngoprofile")}>
          ←
        </button>
        <h2>Edit NGO Profile ✏️</h2>
      </div>

      <div style={styles.formCard}>
        <label style={styles.label}>NGO / Foundation Name</label>
        <input
          type="text"
          value={ngoName}
          onChange={(e) => setNgoName(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Registration / License Number</label>
        <input
          type="text"
          value={registrationNo}
          onChange={(e) => setRegistrationNo(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Email</label>
        <input
          type="email"
          value={email}
          disabled
          style={{ ...styles.input, backgroundColor: "#f0f0f0" }}
        />

        <label style={styles.label}>Contact Number</label>
        <input
          type="text"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>NGO Headquarters / Distribution Address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter complete NGO address..."
          style={styles.textarea}
        ></textarea>

        <button style={styles.saveBtn} onClick={handleSave} disabled={loading}>
          {loading ? t("loading") : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f4fdf4",
    paddingBottom: "30px",
  },

  header: {
    background: "linear-gradient(to right, #2e7d32, #66bb6a)",
    color: "white",
    padding: "20px",
    textAlign: "center",
    position: "relative",
    borderBottomLeftRadius: "20px",
    borderBottomRightRadius: "20px",
  },

  backBtn: {
    position: "absolute",
    left: "15px",
    top: "17px",
    background: "white",
    color: "#2e7d32",
    border: "none",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    fontSize: "22px",
    cursor: "pointer",
  },

  formCard: {
    background: "white",
    margin: "20px",
    padding: "25px",
    borderRadius: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },

  label: {
    display: "block",
    color: "#2e7d32",
    fontWeight: "bold",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    padding: "13px",
    marginBottom: "16px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },

  textarea: {
    width: "100%",
    padding: "13px",
    marginBottom: "16px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    minHeight: "80px",
    resize: "none",
    fontSize: "15px",
  },

  saveBtn: {
    width: "100%",
    padding: "15px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default EditNGOProfile;
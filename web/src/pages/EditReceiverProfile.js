import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { updateUserProfile } from "../services/api";

function EditReceiverProfile() {
  const navigate = useNavigate();
  const { currentUser, refreshUserProfile } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState(currentUser?.name || "");
  const [email] = useState(currentUser?.email || "");
  const [mobile, setMobile] = useState(currentUser?.mobile || "");
  const [receiverType, setReceiverType] = useState(currentUser?.receiverType || "Individual");
  const [address, setAddress] = useState(currentUser?.roleProfiles?.beneficiary?.address?.formattedAddress || currentUser?.receiverAddress || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        role: "RECEIVER",
        userId: currentUser?.id || currentUser?._id,
        email: currentUser?.email,
        name,
        mobile,
        receiverType,
        address,
      };

      const res = await updateUserProfile(payload);
      setLoading(false);
      if (res.success) {
        await refreshUserProfile();
        alert("Receiver Profile Updated Successfully! 🤲");
        navigate("/receiverprofile");
      } else {
        alert(res.message || "Failed to update receiver profile.");
      }
    } catch (err) {
      setLoading(false);
      alert("Failed to update receiver profile.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/receiverprofile")}>
          ←
        </button>

        <h2>Edit Receiver Profile ✏️</h2>

        <button style={styles.homeBtn} onClick={() => navigate("/receiver/dashboard")}>
          🏠
        </button>
      </div>

      <div style={styles.formCard}>
        <label style={styles.label}>Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Email</label>
        <input
          type="email"
          value={email}
          disabled
          style={{ ...styles.input, backgroundColor: "#f0f0f0" }}
        />

        <label style={styles.label}>Mobile Number</label>
        <input
          type="text"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Receiver Category / Type</label>
        <select
          value={receiverType}
          onChange={(e) => setReceiverType(e.target.value)}
          style={styles.input}
        >
          <option value="Individual">Individual / Family</option>
          <option value="OldAgeHome">Old Age Home</option>
          <option value="Orphanage">Orphanage</option>
          <option value="Shelter Home">Shelter Home</option>
          <option value="Community Kitchen">Community Kitchen</option>
        </select>

        <label style={styles.label}>Delivery / Pickup Address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter complete delivery/receiver address..."
          style={styles.textarea}
        ></textarea>

        <button style={styles.updateBtn} onClick={handleUpdate} disabled={loading}>
          {loading ? t("loading") : "Update Profile"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#fff8f0",
    paddingBottom: "30px",
  },

  header: {
    background: "linear-gradient(to right, #ef6c00, #ffb74d)",
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
    color: "#ef6c00",
    border: "none",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    fontSize: "22px",
    cursor: "pointer",
  },

  homeBtn: {
    position: "absolute",
    right: "15px",
    top: "17px",
    background: "white",
    color: "#ef6c00",
    border: "none",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    fontSize: "18px",
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
    color: "#ef6c00",
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

  updateBtn: {
    width: "100%",
    padding: "15px",
    background: "#ef6c00",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default EditReceiverProfile;
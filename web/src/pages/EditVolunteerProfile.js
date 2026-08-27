import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { updateUserProfile } from "../services/api";

function EditVolunteerProfile() {
  const navigate = useNavigate();
  const { currentUser, refreshUserProfile } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState(currentUser?.name || "");
  const [email] = useState(currentUser?.email || "");
  const [mobile, setMobile] = useState(currentUser?.mobile || "");
  const [vehicleType, setVehicleType] = useState(currentUser?.vehicleType || "Bike");
  const [availability, setAvailability] = useState("Evening");
  const [address, setAddress] = useState(currentUser?.roleProfiles?.volunteer?.address?.formattedAddress || currentUser?.volunteerAddress || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        role: "VOLUNTEER",
        userId: currentUser?.id || currentUser?._id,
        email: currentUser?.email,
        name,
        mobile,
        vehicleType,
        address,
      };

      const res = await updateUserProfile(payload);
      setLoading(false);
      if (res.success) {
        await refreshUserProfile();
        alert("Volunteer Profile Updated Successfully! 🚴");
        navigate("/volunteerprofile");
      } else {
        alert(res.message || "Failed to update profile.");
      }
    } catch (err) {
      setLoading(false);
      alert("Failed to update profile.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          style={styles.backBtn}
          onClick={() => navigate("/volunteerprofile")}
        >
          ←
        </button>

        <h2>Edit Volunteer Profile ✏️</h2>
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

        <label style={styles.label}>Vehicle Type</label>
        <select
          style={styles.input}
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
        >
          <option value="Bike">Bike / Two-Wheeler</option>
          <option value="Scooter">Scooter</option>
          <option value="Auto">Auto / Three-Wheeler</option>
          <option value="Cycle">Cycle / Bicycle</option>
          <option value="Car">Car / Four-Wheeler</option>
        </select>

        <label style={styles.label}>Availability</label>
        <select
          style={styles.input}
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        >
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Evening">Evening</option>
          <option value="Full Day">Full Day / Flexible</option>
        </select>

        <label style={styles.label}>Volunteer Base Location / Address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter volunteer location/address..."
          style={styles.textarea}
        />

        <button
          style={styles.saveBtn}
          onClick={handleSave}
          disabled={loading}
        >
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
    background:
      "linear-gradient(to right, #1565c0, #64b5f6)",

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

    color: "#1565c0",

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

    color: "#1565c0",

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

    background: "#1565c0",

    color: "white",

    border: "none",

    borderRadius: "12px",

    fontSize: "16px",

    fontWeight: "bold",

    cursor: "pointer",
  },
};

export default EditVolunteerProfile;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { updateUserProfile } from "../services/api";

function EditProfile() {
  const navigate = useNavigate();
  const { currentUser, refreshUserProfile } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState(currentUser?.name || "");
  const [mobile, setMobile] = useState(currentUser?.mobile || "");
  const [address, setAddress] = useState(currentUser?.roleProfiles?.donor?.address?.formattedAddress || currentUser?.donorAddress || "");
  const [imagePreview, setImagePreview] = useState(currentUser?.profileImage || "");
  const [loading, setLoading] = useState(false);

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

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        role: "DONOR",
        name,
        mobile,
        address,
        profileImage: imagePreview,
        email: currentUser?.email,
        userId: currentUser?.id,
      };

      const res = await updateUserProfile(payload);
      setLoading(false);
      if (res.success) {
        await refreshUserProfile();
        alert("Profile updated successfully!");
        navigate(-1);
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
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        <h2 style={{ margin: 0, fontSize: "18px" }}>✏️ Edit Profile</h2>
      </div>

      <form style={styles.form} onSubmit={handleSave}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src={imagePreview || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
            alt="Preview"
            style={styles.avatar}
          />
          <input
            type="file"
            accept="image/*"
            style={{ marginTop: "10px" }}
            onChange={handleImageChange}
          />
        </div>

        <label style={styles.label}>Full Name</label>
        <input
          type="text"
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label style={styles.label}>Mobile Number</label>
        <input
          type="tel"
          style={styles.input}
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
        />

        <label style={styles.label}>Address</label>
        <textarea
          style={{ ...styles.input, height: "70px" }}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <button type="submit" style={styles.saveBtn} disabled={loading}>
          {loading ? t("loading") : t("save")}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    background: "#f5f5f5",
    minHeight: "100vh",
    paddingBottom: "40px",
  },
  header: {
    background: "#2e7d32",
    color: "white",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
  },
  backBtn: {
    background: "rgba(255,255,255,0.2)",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  switchRoleBtn: {
    background: "rgba(255,255,255,0.25)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.5)",
    padding: "6px 12px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "12px",
  },
  logoutHeaderBtn: {
    background: "#c62828",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "12px",
  },
  form: {
    maxWidth: "450px",
    margin: "25px auto",
    background: "white",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },
  avatar: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #2e7d32",
  },
  label: {
    display: "block",
    fontWeight: "bold",
    fontSize: "13px",
    color: "#333",
    marginTop: "12px",
    marginBottom: "4px",
  },
  input: {
    width: "95%",
    padding: "11px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  saveBtn: {
    width: "100%",
    padding: "13px",
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

export default EditProfile;
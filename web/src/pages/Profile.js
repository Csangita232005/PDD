import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { resetDemoDataApi } from "../services/api";

function Profile() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const [resetting, setResetting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleResetDemoData = async () => {
    if (!window.confirm("Are you sure you want to reset demo data? This will clear current operational records and re-seed clean sample data.")) {
      return;
    }
    setResetting(true);
    try {
      const res = await resetDemoDataApi();
      setResetting(false);
      if (res.success) {
        alert("Demo data reset successfully! 🚀");
        window.location.reload();
      } else {
        alert(res.message || "Failed to reset demo data.");
      }
    } catch (e) {
      setResetting(false);
      alert("Failed to reset demo data.");
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

        <h2 style={{ margin: 0, fontSize: "18px" }}>👤 {t("profile")}</h2>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          <img
            src={currentUser?.profileImage || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
            alt="Profile"
            style={styles.avatar}
          />
          <h2 style={{ margin: "10px 0 4px 0", color: "#2e7d32" }}>
            {currentUser?.name || "User Name"}
          </h2>
          <span style={styles.roleTag}>{currentUser?.role || "USER"}</span>

          <div style={styles.infoGroup}>
            <div style={styles.infoItem}>
              <span>📧 <strong>Email:</strong></span>
              <span>{currentUser?.email}</span>
            </div>

            <div style={styles.infoItem}>
              <span>📱 <strong>Mobile:</strong></span>
              <span>{currentUser?.mobile || "Not provided"}</span>
            </div>

            <div style={styles.infoItem}>
              <span>📍 <strong>Address:</strong></span>
              <span>
                {(currentUser?.role === 'VOLUNTEER' ? currentUser?.volunteerAddress :
                  currentUser?.role === 'NGO' ? currentUser?.ngoAddress :
                  currentUser?.role === 'RECEIVER' ? currentUser?.receiverAddress :
                  currentUser?.role === 'DONOR' ? currentUser?.donorAddress : currentUser?.address) || "Not provided"}
              </span>
            </div>
          </div>

          <div style={styles.btnRow}>
            <button style={styles.editBtn} onClick={() => navigate("/editprofile")}>
              ✏️ Edit Profile
            </button>
            <button style={styles.logoutBtn} onClick={handleLogout}>
              🚪 {t("logout")}
            </button>
          </div>

          {/* Dev / Demo Admin Box */}
          <div style={styles.devBox}>
            <h4 style={{ margin: "0 0 6px 0", color: "#555", fontSize: "13px" }}>⚙️ Developer / Demo Actions</h4>
            <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#666" }}>
              Safely reset operational database & restore clean initial demo state.
            </p>
            <button
              style={styles.resetBtn}
              onClick={handleResetDemoData}
              disabled={resetting}
            >
              {resetting ? "Resetting..." : "🔄 Reset Demo Data"}
            </button>
          </div>
        </div>
      </div>
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
  content: {
    maxWidth: "500px",
    margin: "25px auto",
    padding: "0 15px",
  },
  card: {
    background: "white",
    padding: "30px 20px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #2e7d32",
  },
  roleTag: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    padding: "4px 12px",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "13px",
  },
  infoGroup: {
    textAlign: "left",
    marginTop: "25px",
    marginBottom: "25px",
    borderTop: "1px solid #eee",
    paddingTop: "15px",
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "14px",
    color: "#444",
  },
  btnRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },
  editBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  logoutBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#c62828",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  devBox: {
    background: "#fafafa",
    border: "1px dashed #ccc",
    padding: "14px",
    borderRadius: "12px",
    textAlign: "center",
  },
  resetBtn: {
    padding: "10px 16px",
    backgroundColor: "#f57c00",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "13px",
  },
};

export default Profile;
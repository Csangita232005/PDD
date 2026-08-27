import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NGOProfile() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button style={styles.backBtn} onClick={() => navigate("/ngo/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>

        <h2 style={{ margin: 0, fontSize: "18px" }}>🏢 NGO Profile</h2>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          <img
            src={currentUser?.profileImage || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
            alt="Profile"
            style={styles.avatar}
          />
          <h2 style={{ margin: "10px 0 4px 0", color: "#2e7d32" }}>
            {currentUser?.name || "Helping Hands NGO"}
          </h2>
          <span style={styles.roleTag}>REGISTERED NGO PARTNER</span>

          <div style={styles.infoGroup}>
            <div style={styles.infoItem}>
              <span>🏢 <strong>NGO Name:</strong></span>
              <span>{currentUser?.organizationName || currentUser?.name || "Helping Hands NGO"}</span>
            </div>

            <div style={styles.infoItem}>
              <span>📋 <strong>Type:</strong></span>
              <span>Food Relief & Distribution</span>
            </div>

            <div style={styles.infoItem}>
              <span>📜 <strong>License No:</strong></span>
              <span>{currentUser?.registrationNo || "NGO2026CHN145"}</span>
            </div>

            <div style={styles.infoItem}>
              <span>📧 <strong>Email:</strong></span>
              <span>{currentUser?.email || "helpinghands@gmail.com"}</span>
            </div>

            <div style={styles.infoItem}>
              <span>📱 <strong>Contact:</strong></span>
              <span>{currentUser?.mobile || "+91 9876543210"}</span>
            </div>

            <div style={styles.infoItem}>
              <span>📍 <strong>Address:</strong></span>
              <span>{currentUser?.ngoAddress || currentUser?.address || "Not provided"}</span>
            </div>
          </div>

          <div style={styles.btnRow}>
            <button style={styles.editBtn} onClick={() => navigate("/editngoprofile")}>
              ✏️ Edit Profile
            </button>
            <button style={styles.logoutBtn} onClick={handleLogout}>
              🚪 Logout
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
    fontSize: "12px",
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
};

export default NGOProfile;
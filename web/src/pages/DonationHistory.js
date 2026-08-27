import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDonations } from "../services/api";

function DonationHistory() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const res = await getDonations({ donorId: currentUser.id });
        if (res.success && res.donations) {
          setDonations(res.donations);
        }
      } catch (e) {
        console.warn("Failed to fetch donation history:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [currentUser]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ←
        </button>

        <h2 style={styles.headerTitle}>Donation History 📜</h2>
      </div>

      <div style={styles.cardContainer}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "30px", color: "#666" }}>Loading donation history...</div>
        ) : donations.length === 0 ? (
          <div style={styles.emptyCard}>
            <h3 style={{ color: "#2e7d32", marginTop: 0 }}>No Donation History Found</h3>
            <p style={{ color: "#555" }}>
              You have not made any food donations yet. Click "+ Donate Food Now" to make your first donation!
            </p>
            <button style={styles.donateBtn} onClick={() => navigate("/donatefood")}>
              + Donate Food Now
            </button>
          </div>
        ) : (
          donations.map((item) => (
            <div key={item.id || item._id} style={styles.card}>
              <div style={styles.topRow}>
                <h3 style={styles.food}>{item.food_name || item.foodName}</h3>

                <span
                  style={
                    item.status === "COMPLETED" || item.status === "Delivered"
                      ? styles.success
                      : styles.pending
                  }
                >
                  {item.status}
                </span>
              </div>

              <p style={styles.text}>Quantity: {item.quantity} {item.unit || "Packs"}</p>
              <p style={styles.text}>Address: {item.address}</p>
              <p style={styles.text}>Date: {new Date(item.created_at || item.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>

      <button style={styles.impactBtn} onClick={() => navigate("/impact")}>
        🌍 View Impact Dashboard
      </button>

      <div style={styles.bottomNav}>
        <div style={styles.navItem} onClick={() => navigate("/donor")}>
          🏠
          <p style={styles.navText}>Home</p>
        </div>

        <div style={styles.navItem} onClick={() => navigate("/activedonations")}>
          📦
          <p style={styles.navText}>Active</p>
        </div>

        <div style={styles.navItem} onClick={() => navigate("/notifications")}>
          🔔
          <p style={styles.navText}>Alerts</p>
        </div>

        <div style={styles.navItem} onClick={() => navigate("/profile")}>
          👤
          <p style={styles.navText}>Profile</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f5f5",
    paddingBottom: "100px",
  },

  header: {
    background: "#2e7d32",
    color: "white",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    borderBottomLeftRadius: "20px",
    borderBottomRightRadius: "20px",
  },

  headerTitle: {
    margin: 0,
    fontSize: "23px",
  },

  backBtn: {
    background: "white",
    border: "none",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    fontSize: "20px",
    cursor: "pointer",
  },

  cardContainer: {
    padding: "20px",
  },

  emptyCard: {
    background: "white",
    padding: "30px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  donateBtn: {
    marginTop: "12px",
    padding: "12px 22px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  card: {
    background: "white",
    padding: "20px",
    borderRadius: "18px",
    marginBottom: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  food: {
    color: "#2e7d32",
    margin: 0,
  },

  success: {
    background: "#c8e6c9",
    color: "#1b5e20",
    padding: "6px 12px",
    borderRadius: "15px",
    fontSize: "13px",
    fontWeight: "bold",
  },

  pending: {
    background: "#ffe082",
    color: "#e65100",
    padding: "6px 12px",
    borderRadius: "15px",
    fontSize: "13px",
    fontWeight: "bold",
  },

  text: {
    marginTop: "8px",
    marginBottom: "2px",
    color: "#555",
    fontSize: "14px",
  },

  impactBtn: {
    display: "block",
    width: "85%",
    margin: "20px auto",
    padding: "15px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  bottomNav: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    background: "white",
    display: "flex",
    justifyContent: "space-around",
    padding: "12px 0",
    boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
  },

  navItem: {
    textAlign: "center",
    cursor: "pointer",
  },

  navText: {
    fontSize: "12px",
    marginTop: "5px",
  },
};

export default DonationHistory;
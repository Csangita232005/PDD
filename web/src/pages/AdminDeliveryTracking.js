import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDeliveryTracking() {
  const navigate = useNavigate();

  const [status, setStatus] = useState("On the way 🚴");
  const [step, setStep] = useState(3);

  const updateStatus = () => {
    setStatus("Delivered Successfully ✅");
    setStep(4);
    alert("Delivery status updated successfully");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ←
        </button>

        <h2>Delivery Tracking 📍</h2>

        <button style={styles.homeBtn} onClick={() => navigate("/admin")}>
          🏠
        </button>
      </div>

      <div style={styles.mapBox}>
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200"
          alt="map"
          style={styles.map}
        />

        <div style={styles.liveBadge}>LIVE</div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.title}>Current Delivery</h3>

        <p><b>Food:</b> Veg Meals Pack</p>
        <p><b>Donor:</b> Green Hotel</p>
        <p><b>Volunteer:</b> Rahul Kumar</p>
        <p><b>Receiver:</b> Child Orphanage</p>
        <p><b>Status:</b> {status}</p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.title}>Delivery Timeline</h3>

        <p>{step >= 1 ? "✅" : "⏳"} Donation Accepted</p>
        <p>{step >= 2 ? "✅" : "⏳"} Volunteer Assigned</p>
        <p>{step >= 3 ? "✅" : "⏳"} Pickup Started</p>
        <p>{step >= 4 ? "✅" : "⏳"} Delivered</p>
      </div>

      <button style={styles.updateBtn} onClick={updateStatus}>
        Mark Delivery Completed
      </button>

      <button style={styles.reportBtn} onClick={() => navigate("/adminreports")}>
        View Reports
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f3f6fb",
    paddingBottom: "30px",
  },

  header: {
    background: "linear-gradient(to right, #263238, #607d8b)",
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
    color: "#263238",
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
    color: "#263238",
    border: "none",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    cursor: "pointer",
  },

  mapBox: {
    position: "relative",
    margin: "20px",
  },

  map: {
    width: "100%",
    height: "260px",
    objectFit: "cover",
    borderRadius: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },

  liveBadge: {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "red",
    color: "white",
    padding: "8px 14px",
    borderRadius: "20px",
    fontWeight: "bold",
  },

  card: {
    background: "white",
    margin: "20px",
    padding: "22px",
    borderRadius: "18px",
    lineHeight: "1.8",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  title: {
    color: "#263238",
    marginBottom: "12px",
  },

  updateBtn: {
    width: "85%",
    display: "block",
    margin: "25px auto 10px",
    padding: "15px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  reportBtn: {
    width: "85%",
    display: "block",
    margin: "15px auto",
    padding: "15px",
    background: "#263238",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default AdminDeliveryTracking;
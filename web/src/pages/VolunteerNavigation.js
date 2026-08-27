import { useNavigate } from "react-router-dom";
import { getLatestDonation } from "../utils/smartDonation";

function VolunteerNavigation() {
  const navigate = useNavigate();
  const donation = getLatestDonation();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ←
        </button>

        <h2>Optimized Route 🗺️</h2>

        <button style={styles.homeBtn} onClick={() => navigate("/volunteer")}>
          🏠
        </button>
      </div>

      <div style={styles.mapContainer}>
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200"
          alt="map"
          style={styles.map}
        />

        <div style={styles.liveBadge}>OPTIMIZED</div>
      </div>

      <div style={styles.routeBox}>
        <h3>Route Optimization</h3>
        <p>Shortest route selected based on distance and expiry urgency.</p>
        <p><b>ETA:</b> {donation.eta}</p>
        <p><b>Distance:</b> {donation.distance}</p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.title}>Pickup Information</h3>
        <p><b>Pickup From:</b> Green Hotel</p>
        <p><b>Receiver:</b> Child Orphanage</p>
        <p><b>Food:</b> {donation.foodName}</p>
        <p><b>Quantity:</b> {donation.quantity} Packs</p>
        <p><b>Priority:</b> {donation.priority}</p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.title}>Smart Matching Explanation</h3>
        <p>Assigned based on:</p>
        <p>✅ Distance</p>
        <p>✅ Urgency</p>
        <p>✅ Volunteer Capacity</p>
        <p><b>Match Score:</b> {donation.matchScore}%</p>
      </div>

      <button
        style={styles.pickupBtn}
        onClick={() => navigate("/pickupcompleted")}
      >
        Mark Pickup Completed
      </button>
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
    background: "linear-gradient(to right, #1565c0, #64b5f6)",
    color: "white",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: "20px",
    borderBottomRightRadius: "20px",
  },

  backBtn: {
    background: "white",
    color: "#1565c0",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    fontSize: "20px",
    cursor: "pointer",
  },

  homeBtn: {
    background: "white",
    color: "#1565c0",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    fontSize: "18px",
    cursor: "pointer",
  },

  mapContainer: {
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
    background: "#1565c0",
    color: "white",
    padding: "8px 15px",
    borderRadius: "20px",
    fontWeight: "bold",
  },

  routeBox: {
    background: "#e3f2fd",
    margin: "20px",
    padding: "18px",
    borderRadius: "15px",
    color: "#0d47a1",
    fontWeight: "bold",
  },

  card: {
    background: "white",
    margin: "20px",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    lineHeight: "1.8",
  },

  title: {
    color: "#1565c0",
    marginBottom: "10px",
  },

  pickupBtn: {
    width: "85%",
    display: "block",
    margin: "25px auto",
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

export default VolunteerNavigation;
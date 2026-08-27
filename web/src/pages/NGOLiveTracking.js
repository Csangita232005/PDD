import { useNavigate } from "react-router-dom";

function NGOLiveTracking() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <h2>Volunteer Live Tracking 📍</h2>
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
        <h3 style={styles.title}>Assigned Volunteer</h3>
        <p><b>Name:</b> Rahul Kumar</p>
        <p><b>Vehicle:</b> Bike</p>
        <p><b>Contact:</b> +91 9876543210</p>
        <p><b>Current Status:</b> On the way to pickup</p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.title}>Donation Route</h3>
        <p><b>Pickup:</b> Green Hotel</p>
        <p><b>Drop Location:</b> Child Orphanage</p>
        <p><b>Food:</b> Veg Meals Pack</p>
        <p><b>Quantity:</b> 40 Packs</p>
      </div>

      <div style={styles.statusBox}>
        Estimated Delivery Time: 15 minutes
      </div>

      <button style={styles.button} onClick={() => navigate("/completeddeliveries")}>
        Mark Delivery Completed
      </button>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f4fdf4", paddingBottom: "30px" },
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
  mapBox: { position: "relative", margin: "20px" },
  map: {
    width: "100%",
    height: "250px",
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
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    lineHeight: "1.8",
  },
  title: { color: "#2e7d32" },
  statusBox: {
    background: "#c8e6c9",
    margin: "20px",
    padding: "18px",
    borderRadius: "15px",
    textAlign: "center",
    fontWeight: "bold",
    color: "#1b5e20",
  },
  button: {
    width: "85%",
    display: "block",
    margin: "25px auto",
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

export default NGOLiveTracking;
import { useNavigate } from "react-router-dom";

function ReceiverTracking() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/pickupstatus")}>
          ←
        </button>

        <h2>Receiver Tracking 📍</h2>

        <button style={styles.homeIcon} onClick={() => navigate("/receiver")}>
          🏠
        </button>
      </div>

      <img
        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200"
        alt="map"
        style={styles.map}
      />

      <div style={styles.card}>
        <h3>Pickup Information</h3>

        <p><b>Food:</b> Veg Meals Pack</p>
        <p><b>Donor:</b> Green Hotel</p>
        <p><b>Status:</b> Pickup Ready</p>
        <p><b>Estimated Time:</b> 10 mins</p>

        <button
          style={styles.button}
          onClick={() => navigate("/pickupcompleted")}
        >
          Mark Pickup Completed
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#fff8f0",
  },

  header: {
    background: "#ef6c00",
    color: "white",
    padding: "20px",
    textAlign: "center",
    position: "relative",
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

  homeIcon: {
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

  map: {
    width: "100%",
    height: "280px",
    objectFit: "cover",
  },

  card: {
    background: "white",
    margin: "20px",
    padding: "25px",
    borderRadius: "20px",
    lineHeight: "1.8",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  button: {
    width: "100%",
    padding: "15px",
    background: "#ef6c00",
    color: "white",
    border: "none",
    borderRadius: "12px",
    marginTop: "20px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default ReceiverTracking;
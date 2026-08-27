import { useNavigate } from "react-router-dom";
import { getLatestDonation } from "../utils/smartDonation";

function PickupRequests() {
  const navigate = useNavigate();
  const donation = getLatestDonation();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/volunteer")}>
          ←
        </button>
        <h2>Pickup Requests 📥</h2>
      </div>

      <div style={styles.recommendBox}>
        <h3>⭐ Best Match For You</h3>
        <p>Assigned based on distance + urgency + capacity</p>
        <p>Match Score: {donation.matchScore}%</p>
        <p>Priority: {donation.priority}</p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.foodTitle}>{donation.foodName}</h3>
        <p><b>Donor:</b> Green Hotel</p>
        <p><b>Pickup:</b> {donation.location}</p>
        <p><b>Delivery:</b> Child Orphanage</p>
        <p><b>Quantity:</b> {donation.quantity} Packs</p>
        <p><b>Expiry:</b> {donation.expiryTime}</p>
        <p><b>Distance:</b> {donation.distance}</p>
        <p><b>ETA:</b> {donation.eta}</p>

        <button style={styles.button} onClick={() => navigate("/acceptpickup")}>
          View & Accept
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
    background: "linear-gradient(to right, #1565c0, #64b5f6)",
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

  recommendBox: {
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
    padding: "22px",
    borderRadius: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    lineHeight: "1.8",
  },

  foodTitle: {
    color: "#1565c0",
    marginBottom: "10px",
  },

  button: {
    width: "100%",
    marginTop: "15px",
    padding: "14px",
    background: "#1565c0",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default PickupRequests;
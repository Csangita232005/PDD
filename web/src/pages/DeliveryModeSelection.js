import { useNavigate } from "react-router-dom";

function DeliveryModeSelection() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <h2>Select Delivery Mode 🚚</h2>
      </div>

      <div style={styles.card} onClick={() => navigate("/confirmation")}>
        <h1>🚴</h1>
        <h3>Volunteer Pickup</h3>
        <p>NGO assigns volunteer for pickup and delivery.</p>
      </div>

      <div style={styles.card} onClick={() => navigate("/receiverpickupflow")}>
        <h1>🙋</h1>
        <h3>Receiver Pickup</h3>
        <p>Receiver comes and collects food from donor.</p>
      </div>

      <div style={styles.card} onClick={() => navigate("/selfdeliveryflow")}>
        <h1>🚗</h1>
        <h3>Self Delivery</h3>
        <p>Donor personally delivers the food.</p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f4fdf4" },
  header: {
    background: "#2e7d32",
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
    color: "#2e7d32",
    border: "none",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    fontSize: "22px",
    cursor: "pointer",
  },
  card: {
    background: "white",
    margin: "20px",
    padding: "25px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },
};

export default DeliveryModeSelection;
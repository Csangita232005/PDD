import { useNavigate } from "react-router-dom";

function SelfDelivery() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>🚗</div>
        <h1>Self Delivery Selected</h1>
        <p>Donor will personally deliver food to NGO or receiver.</p>

        <button style={styles.button} onClick={() => navigate("/history")}>
          Mark as Delivered
        </button>

        <button style={styles.homeBtn} onClick={() => navigate("/donor")}>
          Back to Donor Dashboard
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f4fdf4",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  card: {
    background: "white",
    padding: "35px",
    borderRadius: "22px",
    textAlign: "center",
    boxShadow: "0 5px 15px rgba(0,0,0,0.12)",
  },
  icon: {
    fontSize: "70px",
  },
  button: {
    width: "100%",
    padding: "15px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "20px",
  },
  homeBtn: {
    width: "100%",
    padding: "15px",
    background: "#eeeeee",
    color: "#333",
    border: "none",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "15px",
  },
};

export default SelfDelivery;
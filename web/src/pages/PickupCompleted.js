import { useNavigate } from "react-router-dom";

function PickupCompleted() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>✅</div>

        <h1 style={styles.title}>Pickup Completed</h1>

        <p style={styles.subtitle}>
          Food has been collected successfully from donor location.
        </p>

        <div style={styles.detailsBox}>
          <p><b>Food:</b> Veg Meals Pack</p>
          <p><b>Quantity:</b> 40 Packs</p>
          <p><b>Collected From:</b> Green Hotel</p>
          <p><b>Status:</b> Completed</p>
        </div>

        <button
          style={styles.historyBtn}
          onClick={() => navigate("/receiverhistory")}
        >
          View Receiver History
        </button>

        <div style={styles.btnRow}>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back
          </button>

          <button style={styles.homeBtn} onClick={() => navigate("/receiver")}>
            🏠 Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #fff3e0, #ffffff)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },

  card: {
    background: "white",
    width: "100%",
    maxWidth: "420px",
    padding: "35px 25px",
    borderRadius: "25px",
    textAlign: "center",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  },

  icon: {
    fontSize: "70px",
    marginBottom: "15px",
  },

  title: {
    color: "#ef6c00",
    marginBottom: "10px",
  },

  subtitle: {
    color: "#666",
    marginBottom: "25px",
  },

  detailsBox: {
    background: "#fff3e0",
    padding: "18px",
    borderRadius: "15px",
    textAlign: "left",
    lineHeight: "2",
    marginBottom: "25px",
  },

  historyBtn: {
    width: "100%",
    padding: "15px",
    background: "#ef6c00",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "18px",
  },

  btnRow: {
    display: "flex",
    gap: "12px",
  },

  backBtn: {
    flex: 1,
    padding: "13px",
    background: "#eeeeee",
    border: "none",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  homeBtn: {
    flex: 1,
    padding: "13px",
    background: "#43a047",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default PickupCompleted;
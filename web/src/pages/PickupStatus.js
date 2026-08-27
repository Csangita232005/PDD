import { useNavigate } from "react-router-dom";

function PickupStatus() {

  const navigate = useNavigate();

  return (

    <div style={styles.container}>

      <div style={styles.header}>

        <button
          style={styles.backBtn}
          onClick={() => navigate("/receiver")}
        >
            <button
  style={styles.homeBtn}
  onClick={() => navigate("/receiver")}
>
  🏠
</button>
          ←
        </button>

        <h2>Pickup Status 📦</h2>

      </div>

      <div style={styles.card}>

        <h2>Pickup Request Sent</h2>

        <p>Waiting for donor approval...</p>

        <div style={styles.timeline}>

          <p>✅ Request Sent</p>

          <p>⏳ Waiting Approval</p>

          <p>📍 Pickup Ready</p>

          <p>🍱 Food Collected</p>

        </div>

        <button
          style={styles.button}
          onClick={() => navigate("/receivertracking")}
        >
          Track Pickup
        </button>

      </div>
<div style={styles.header}>
  <button style={styles.backBtn} onClick={() => navigate(-1)}>
    ←
  </button>

  <h2>Available Food 🍱</h2>

  <button style={styles.homeBtn} onClick={() => navigate("/receiver")}>
    🏠
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

  card: {
    background: "white",
    margin: "20px",
    padding: "25px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  timeline: {
    marginTop: "20px",
    lineHeight: "2",
    textAlign: "left",
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
  homeBtn: {
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
};

export default PickupStatus;
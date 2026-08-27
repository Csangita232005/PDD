import { useNavigate } from "react-router-dom";

function RequestPickup() {

  const navigate = useNavigate();

  return (

    <div style={styles.container}>

      <div style={styles.card}>

        <h1>Pickup Request Sent ✅</h1>

        <p>
          Donor has been notified about your request.
        </p>
<button
  style={styles.homeBtn}
  onClick={() => navigate("/receiver")}
>
  🏠
</button>
        <button
          style={styles.button}
          onClick={() => navigate("/pickupstatus")}
        >
          Check Status
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#fff8e1",
    padding: "20px",
  },

  card: {
    background: "white",
    padding: "35px",
    borderRadius: "20px",
    textAlign: "center",
  },

  button: {
    width: "100%",
    padding: "15px",
    background: "#ef6c00",
    color: "white",
    border: "none",
    borderRadius: "12px",
    marginTop: "20px",
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

export default RequestPickup;
import { useNavigate } from "react-router-dom";

function ReceiverHistory() {

  const navigate = useNavigate();

  return (

    <div style={styles.container}>

      <div style={styles.header}>

        <button
          style={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          ←
        </button>

        <h2>Receiver History 🕘</h2>

        <button
          style={styles.homeBtn}
          onClick={() => navigate("/receiver")}
        >
          🏠
        </button>

      </div>

      <div style={styles.card}>

        <h3>Veg Meals Pack</h3>

        <p>Collected From: Green Hotel</p>

        <p>Date: 12 May 2026</p>

        <p>Status: Completed ✅</p>

      </div>

      <div style={styles.card}>

        <h3>Bakery Items</h3>

        <p>Collected From: Sweet Bakery</p>

        <p>Date: 10 May 2026</p>

        <p>Status: Completed ✅</p>

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

  card: {
    background: "white",
    margin: "20px",
    padding: "22px",
    borderRadius: "18px",
    lineHeight: "1.8",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
};

export default ReceiverHistory;
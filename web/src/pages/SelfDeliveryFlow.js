import { useNavigate } from "react-router-dom";

function SelfDeliveryFlow() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>🚗 Self Delivery</h1>
        <p>Donor will personally deliver the food to receiver/NGO.</p>

        <div style={styles.box}>
          <p>✅ Food Posted</p>
          <p>🚗 Donor Started Delivery</p>
          <p>📍 Delivery In Progress</p>
        </div>

        <button style={styles.button} onClick={() => navigate("/thankyou")}>
          Mark as Delivered
        </button>

        <button
  style={styles.homeBtn}
  onClick={() => navigate("/impact")}
>
  View My Impact
</button>
        <button style={styles.homeBtn} onClick={() => navigate("/donor")}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f4fdf4", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" },
  card: { background: "white", padding: "35px", borderRadius: "22px", textAlign: "center", boxShadow: "0 5px 15px rgba(0,0,0,0.12)" },
  box: { background: "#e8f5e9", padding: "18px", borderRadius: "15px", textAlign: "left", margin: "20px 0", lineHeight: "1.8" },
  button: { width: "100%", padding: "15px", background: "#2e7d32", color: "white", border: "none", borderRadius: "12px", fontWeight: "bold" },
  homeBtn: { width: "100%", padding: "15px", background: "#eeeeee", border: "none", borderRadius: "12px", marginTop: "15px", fontWeight: "bold" },
};

export default SelfDeliveryFlow;
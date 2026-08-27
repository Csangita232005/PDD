import { useNavigate } from "react-router-dom";

function ReceiverPickupFlow() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>🙋 Receiver Pickup</h1>
        <p>Receiver will come and collect the food from donor location.</p>

        <div style={styles.box}>
          <p>✅ Food Posted</p>
          <p>✅ Receiver Notified</p>
          <p>📍 Waiting for Receiver Pickup</p>
        </div>

        <button style={styles.button} onClick={() => navigate("/thankyou")}>
          Mark Pickup Completed
        </button>

       <button
        style={styles.homeBtn}
       onClick={() => navigate("/impact")}>
        View Donation Impact
       </button>

        <button style={styles.homeBtn} onClick={() => navigate("/donor")}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#fff8f0", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" },
  card: { background: "white", padding: "35px", borderRadius: "22px", textAlign: "center", boxShadow: "0 5px 15px rgba(0,0,0,0.12)" },
  box: { background: "#fff3e0", padding: "18px", borderRadius: "15px", textAlign: "left", margin: "20px 0", lineHeight: "1.8" },
  button: { width: "100%", padding: "15px", background: "#ef6c00", color: "white", border: "none", borderRadius: "12px", fontWeight: "bold" },
  homeBtn: { width: "100%", padding: "15px", background: "#eeeeee", border: "none", borderRadius: "12px", marginTop: "15px", fontWeight: "bold" },
};

export default ReceiverPickupFlow;
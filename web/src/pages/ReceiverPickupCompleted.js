import { useNavigate } from "react-router-dom";

function ReceiverPickupCompleted() {

  const navigate = useNavigate();

  return (

    <div style={styles.container}>

      <div style={styles.card}>

        <div style={styles.icon}>
          ✅
        </div>

        <h1 style={styles.title}>
          Pickup Completed
        </h1>

        <p style={styles.text}>
          Food collected successfully from donor location.
        </p>

        <div style={styles.infoBox}>

          <p><b>Food:</b> Veg Meals Pack</p>

          <p><b>Quantity:</b> 40 Packs</p>

          <p><b>Donor:</b> Green Hotel</p>

        </div>

        <button
          style={styles.button}
          onClick={() => navigate("/receiverhistory")}
        >
          View History
        </button>

        <button
          style={styles.homeBtn}
          onClick={() => navigate("/receiver")}
        >
          Back To Dashboard
        </button>

      </div>

    </div>
  );
}

const styles = {

  container: {
    minHeight: "100vh",

    background:
      "linear-gradient(to bottom, #fff3e0, #ffffff)",

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    padding: "20px",
  },

  card: {
    background: "white",

    padding: "35px",

    borderRadius: "25px",

    textAlign: "center",

    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  },

  icon: {
    fontSize: "80px",
  },

  title: {
    color: "#ef6c00",
  },

  text: {
    color: "#555",
    marginTop: "10px",
  },

  infoBox: {
    background: "#fff3e0",

    padding: "18px",

    borderRadius: "15px",

    textAlign: "left",

    marginTop: "20px",

    lineHeight: "1.8",
  },

  button: {
    width: "100%",

    padding: "15px",

    background: "#ef6c00",

    color: "white",

    border: "none",

    borderRadius: "12px",

    fontWeight: "bold",

    marginTop: "20px",

    cursor: "pointer",
  },

  homeBtn: {
    width: "100%",

    padding: "15px",

    background: "#eeeeee",

    color: "#333",

    border: "none",

    borderRadius: "12px",

    marginTop: "15px",

    cursor: "pointer",
  },
};

export default ReceiverPickupCompleted;
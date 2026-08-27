import { useNavigate } from "react-router-dom";

function DeliveryCompleted() {

  const navigate = useNavigate();

  return (

    <div style={styles.container}>

      {/* Back Button */}

      <button
        style={styles.backBtn}
        onClick={() => navigate(-1)}
      >
        ←
      </button>

      {/* Success Card */}

      <div style={styles.card}>

        <div style={styles.successIcon}>
          ✅
        </div>

        <h1 style={styles.title}>
          Delivery Completed
        </h1>

        <p style={styles.message}>
          Food successfully delivered to the receiver.
          Thank you for reducing food waste and helping people ❤️
        </p>

        {/* Delivery Details */}

        <div style={styles.detailsBox}>

          <p><b>Food:</b> Veg Meals Pack</p>

          <p><b>Quantity:</b> 40 Packs</p>

          <p><b>Delivered To:</b> Child Orphanage</p>

          <p><b>Status:</b> Successfully Delivered</p>

        </div>

        {/* Buttons */}

        <button
          style={styles.homeBtn}
          onClick={() => navigate("/volunteerimpact")}
        >
          View My Impact
        </button>

        <button
          style={styles.historyBtn}
          onClick={() => navigate(-1)}
        >
          Back
        </button>

      </div>

    </div>
  );
}

const styles = {

  container: {
    minHeight: "100vh",

    background:
      "linear-gradient(to bottom, #e8f5e9, #ffffff)",

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    padding: "20px",

    position: "relative",
  },

  backBtn: {
    position: "absolute",

    top: "20px",
    left: "20px",

    width: "42px",
    height: "42px",

    borderRadius: "50%",

    border: "none",

    background: "white",

    color: "#2e7d32",

    fontSize: "22px",

    cursor: "pointer",

    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },

  card: {
    background: "white",

    padding: "35px",

    borderRadius: "25px",

    textAlign: "center",

    width: "350px",

    boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
  },

  successIcon: {
    fontSize: "80px",

    marginBottom: "15px",
  },

  title: {
    color: "#2e7d32",

    marginBottom: "15px",
  },

  message: {
    color: "#555",

    lineHeight: "1.7",

    marginBottom: "25px",
  },

  detailsBox: {
    background: "#f4fdf4",

    padding: "18px",

    borderRadius: "15px",

    textAlign: "left",

    lineHeight: "1.8",

    marginBottom: "25px",

    color: "#444",
  },

  homeBtn: {
    width: "100%",

    padding: "14px",

    background: "#2e7d32",

    color: "white",

    border: "none",

    borderRadius: "12px",

    fontSize: "16px",

    fontWeight: "bold",

    cursor: "pointer",

    marginBottom: "15px",
  },

  historyBtn: {
    width: "100%",

    padding: "14px",

    background: "#eeeeee",

    color: "#333",

    border: "none",

    borderRadius: "12px",

    fontSize: "16px",

    fontWeight: "bold",

    cursor: "pointer",
  },
};

export default DeliveryCompleted;
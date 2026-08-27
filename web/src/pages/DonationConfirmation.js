import { useNavigate } from "react-router-dom";

function DonationConfirmation() {

  const navigate = useNavigate();

  return (

    <div style={styles.container}>

      <div style={styles.card}>

        <div style={styles.icon}>
          🚴
        </div>

        <h1 style={styles.title}>
          Volunteer Pickup Selected
        </h1>

        <p style={styles.subtitle}>
          NGO will assign a volunteer for pickup and delivery.
        </p>

        <div style={styles.detailsBox}>

          <p>🍱 Food: Veg Meals</p>

          <p>📦 Quantity: 20 Packs</p>

          <p>📍 Pickup: Chennai</p>

          <p>🚴 Status: Volunteer Will Pickup Soon</p>

        </div>

        <button
          style={styles.primaryBtn}
          onClick={() => navigate("/activedonations")}
        >
          View Active Donations
        </button>

        <button
          style={styles.secondaryBtn}
          onClick={() => navigate("/donor")}
        >
          🏠 Go To Home
        </button>

      </div>

    </div>
  );
}

const styles = {

  container: {
    minHeight: "100vh",

    background:
      "linear-gradient(to bottom right, #e8f5e9, #c8e6c9)",

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    padding: "20px",
  },

  card: {
    background: "white",

    width: "420px",

    padding: "40px",

    borderRadius: "28px",

    textAlign: "center",

    boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
  },

  icon: {
    fontSize: "70px",

    marginBottom: "15px",
  },

  title: {
    color: "#2e7d32",

    marginBottom: "12px",

    fontSize: "38px",
  },

  subtitle: {
    color: "#666",

    lineHeight: "1.6",

    marginBottom: "30px",

    fontSize: "18px",
  },

  detailsBox: {
    background: "#f1f8e9",

    padding: "22px",

    borderRadius: "18px",

    textAlign: "left",

    lineHeight: "2",

    marginBottom: "28px",

    fontSize: "17px",
  },

  primaryBtn: {
    width: "100%",

    padding: "16px",

    background: "#2e7d32",

    color: "white",

    border: "none",

    borderRadius: "14px",

    fontSize: "17px",

    fontWeight: "bold",

    cursor: "pointer",

    marginBottom: "15px",
  },

  secondaryBtn: {
    width: "100%",

    padding: "16px",

    background: "white",

    color: "#2e7d32",

    border: "2px solid #2e7d32",

    borderRadius: "14px",

    fontSize: "17px",

    fontWeight: "bold",

    cursor: "pointer",
  },
};

export default DonationConfirmation;
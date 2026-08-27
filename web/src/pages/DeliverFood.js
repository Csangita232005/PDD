import { useNavigate } from "react-router-dom";

function DeliverFood() {

  const navigate = useNavigate();

  return (

    <div style={styles.container}>

      {/* Header */}

      <div style={styles.header}>

        <button
          style={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          ←
        </button>

        <h2>Deliver Food 🚚</h2>

        <button
          style={styles.homeBtn}
          onClick={() => navigate("/volunteer")}
        >
          🏠
        </button>

      </div>

      {/* Delivery Card */}

      <div style={styles.card}>

        <h3 style={styles.title}>
          Delivery Information
        </h3>

        <p><b>Food:</b> Veg Meals Pack</p>

        <p><b>Quantity:</b> 40 Packs</p>

        <p><b>Pickup From:</b> Green Hotel</p>

        <p><b>Deliver To:</b> Child Orphanage</p>

        <p><b>Receiver Contact:</b> +91 9876543210</p>

      </div>

      {/* Map Section */}

      <div style={styles.mapBox}>

        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200"
          alt="map"
          style={styles.map}
        />

      </div>

      {/* Status */}

      <div style={styles.statusBox}>
        🚴 Volunteer is on the way to delivery location
      </div>

      {/* Complete Button */}

      <button
        style={styles.completeBtn}
        onClick={() => navigate("/deliverycompleted")}
      >
        Mark Delivery Completed
      </button>

    </div>
  );
}

const styles = {

  container: {
    minHeight: "100vh",
    background: "#f4fdf4",
    paddingBottom: "30px",
  },

  header: {
    background:
      "linear-gradient(to right, #1565c0, #64b5f6)",

    color: "white",

    padding: "20px",

    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    borderBottomLeftRadius: "20px",
    borderBottomRightRadius: "20px",
  },

  backBtn: {
    background: "white",

    color: "#1565c0",

    border: "none",

    borderRadius: "50%",

    width: "40px",
    height: "40px",

    fontSize: "22px",

    cursor: "pointer",
  },

  homeBtn: {
    background: "white",

    color: "#1565c0",

    border: "none",

    borderRadius: "50%",

    width: "40px",
    height: "40px",

    fontSize: "20px",

    cursor: "pointer",
  },

  card: {
    background: "white",

    margin: "20px",

    padding: "22px",

    borderRadius: "18px",

    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",

    lineHeight: "1.8",
  },

  title: {
    color: "#1565c0",

    marginBottom: "12px",
  },

  mapBox: {
    margin: "20px",
  },

  map: {
    width: "100%",

    height: "250px",

    objectFit: "cover",

    borderRadius: "18px",

    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },

  statusBox: {
    background: "#e3f2fd",

    margin: "20px",

    padding: "18px",

    borderRadius: "15px",

    textAlign: "center",

    fontWeight: "bold",

    color: "#0d47a1",
  },

  completeBtn: {
    width: "85%",

    display: "block",

    margin: "25px auto",

    padding: "15px",

    background: "#1565c0",

    color: "white",

    border: "none",

    borderRadius: "12px",

    fontSize: "16px",

    fontWeight: "bold",

    cursor: "pointer",
  },
};

export default DeliverFood;
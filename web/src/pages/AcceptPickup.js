import { useNavigate } from "react-router-dom";

function AcceptPickup() {

  const navigate = useNavigate();

  const handleAccept = () => {
    alert("Pickup Accepted Successfully");
    navigate("/volunteernavigation");
  };

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

        <h2>Accept Pickup ✅</h2>

        <button
          style={styles.homeBtn}
          onClick={() => navigate("/volunteer")}
        >
          🏠
        </button>

      </div>

      {/* Pickup Card */}

      <div style={styles.card}>

        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200"
          alt="food"
          style={styles.image}
        />

        <h2 style={styles.foodName}>
          Veg Meals Pack
        </h2>

        <p><b>Quantity:</b> 40 Food Packs</p>

        <p><b>Pickup From:</b> Green Hotel</p>

        <p><b>Deliver To:</b> Child Orphanage</p>

        <p><b>Distance:</b> 2 Km</p>

        <p><b>Pickup Time:</b> 6:30 PM</p>

      </div>

      {/* Volunteer Info */}

      <div style={styles.infoCard}>

        <h3 style={styles.sectionTitle}>
          Delivery Information
        </h3>

        <p>
          Please collect the food before expiry time and
          safely deliver it to the assigned NGO/receiver.
        </p>

      </div>

      {/* Accept Button */}

      <button
        style={styles.acceptBtn}
        onClick={handleAccept}
      >
        Accept Pickup
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

    width: "38px",
    height: "38px",

    fontSize: "20px",

    cursor: "pointer",
  },

  homeBtn: {
    background: "white",

    color: "#1565c0",

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

    borderRadius: "20px",

    overflow: "hidden",

    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",

    paddingBottom: "20px",
  },

  image: {
    width: "100%",

    height: "220px",

    objectFit: "cover",
  },

  foodName: {
    color: "#1565c0",

    padding: "15px 20px 5px",
  },

  infoCard: {
    background: "white",

    margin: "20px",

    padding: "20px",

    borderRadius: "18px",

    lineHeight: "1.8",

    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  sectionTitle: {
    color: "#1565c0",
    marginBottom: "10px",
  },

  acceptBtn: {
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

export default AcceptPickup;
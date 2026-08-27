import { useNavigate } from "react-router-dom";

function FoodDetails() {

  const navigate = useNavigate();

  return (

    <div style={styles.container}>

      <div style={styles.header}>

        <button
          style={styles.backBtn}
          onClick={() => navigate(-1)}
        >
            <button
  style={styles.homeBtn}
  onClick={() => navigate("/receiver")}
>
  🏠
</button>
          ←
        </button>

        <h2>Food Details 📋</h2>

      </div>

      <img
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200"
        alt="food"
        style={styles.image}
      />

      <div style={styles.card}>

        <h2>Veg Meals Pack</h2>

        <p><b>Quantity:</b> 40 Packs</p>

        <p><b>Expiry:</b> 8 PM Today</p>

        <p><b>Donor:</b> Green Hotel</p>

        <p><b>Location:</b> Chennai</p>

        <p><b>Description:</b> Freshly prepared dinner meals.</p>

        <button
          style={styles.button}
          onClick={() => navigate("/requestpickup")}
        >
          Request Pickup
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

  image: {
    width: "100%",
    height: "280px",

    objectFit: "cover",
  },

  card: {
    background: "white",

    margin: "20px",

    padding: "25px",

    borderRadius: "20px",

    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",

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

export default FoodDetails;
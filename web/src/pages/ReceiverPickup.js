import { useNavigate } from "react-router-dom";

function RequestPickup() {

  const navigate = useNavigate();

  const handleRequest = () => {
    alert("Pickup Request Sent Successfully");
    navigate("/pickupstatus");
  };

  return (

    <div style={styles.container}>

      <div style={styles.header}>

        <button
          style={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          ←
        </button>

        <h2>Request Pickup 🙋</h2>

      </div>

      <div style={styles.card}>

        <h2>Veg Meals Pack</h2>

        <p><b>Available:</b> 40 Packs</p>

        <p><b>Donor:</b> Green Hotel</p>

        <p><b>Pickup Address:</b> Chennai</p>

        <textarea
          placeholder="Enter pickup note..."
          style={styles.textarea}
        />

        <button
          style={styles.button}
          onClick={handleRequest}
        >
          Send Pickup Request
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

  card: {
    background: "white",
    margin: "20px",
    padding: "25px",
    borderRadius: "20px",
    lineHeight: "1.8",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  textarea: {
    width: "100%",
    height: "100px",
    marginTop: "20px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
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
};

export default RequestPickup;
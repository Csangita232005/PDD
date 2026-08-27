import { useNavigate } from "react-router-dom";
import socket from "../services/socket";

function AssignVolunteer() {
  const navigate = useNavigate();

  const handleAssign = (volunteerName = "Rahul Kumar") => {
    socket.emit("delivery:new_available", {
      volunteerName,
      foodType: "Surplus Food Pack",
      timestamp: new Date().toISOString()
    });
    alert(`Volunteer (${volunteerName}) assigned! Broadcast sent to Volunteer Dashboard.`);
    navigate("/ngotracking");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ←
        </button>

        <h2>Assign Volunteer 🚴</h2>
      </div>

      <div style={styles.donationCard}>
        <h3 style={styles.title}>Donation Details</h3>
        <p><b>Food:</b> Veg Meals Pack</p>
        <p><b>Quantity:</b> 40 Packs</p>
        <p><b>Pickup:</b> Green Hotel</p>
        <p><b>Delivery:</b> Child Orphanage</p>
      </div>

      <h3 style={styles.sectionTitle}>Available Volunteers</h3>

      <div style={styles.volunteerCard}>
        <div style={styles.profileSection}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="volunteer"
            style={styles.profile}
          />
          <div>
            <h3>Rahul Kumar</h3>
            <p style={styles.text}>Bike • 2 Km Away</p>
          </div>
        </div>

        <button style={styles.assignBtn} onClick={() => handleAssign("Rahul Kumar")}>
          Assign
        </button>
      </div>

      <div style={styles.volunteerCard}>
        <div style={styles.profileSection}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
            alt="volunteer"
            style={styles.profile}
          />
          <div>
            <h3>Priya</h3>
            <p style={styles.text}>Scooter • 4 Km Away</p>
          </div>
        </div>

        <button style={styles.assignBtn} onClick={() => handleAssign("Priya")}>
          Assign
        </button>
      </div>

      <div style={styles.volunteerCard}>
        <div style={styles.profileSection}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/6997/6997662.png"
            alt="volunteer"
            style={styles.profile}
          />
          <div>
            <h3>Arun</h3>
            <p style={styles.text}>Auto • 3 Km Away</p>
          </div>
        </div>

        <button style={styles.assignBtn} onClick={() => handleAssign("Arun")}>
          Assign
        </button>
      </div>
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
    background: "linear-gradient(to right, #2e7d32, #66bb6a)",
    color: "white",
    padding: "20px",
    textAlign: "center",
    position: "relative",
    borderBottomLeftRadius: "20px",
    borderBottomRightRadius: "20px",
  },

  backBtn: {
    position: "absolute",
    left: "15px",
    top: "17px",
    background: "white",
    color: "#2e7d32",
    border: "none",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    fontSize: "22px",
    cursor: "pointer",
  },

  donationCard: {
    background: "white",
    margin: "20px",
    padding: "22px",
    borderRadius: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    lineHeight: "1.8",
  },

  title: {
    color: "#2e7d32",
    marginBottom: "12px",
  },

  sectionTitle: {
    color: "#2e7d32",
    marginLeft: "20px",
    marginBottom: "15px",
  },

  volunteerCard: {
    background: "white",
    margin: "15px 20px",
    padding: "18px",
    borderRadius: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  profile: {
    width: "65px",
    height: "65px",
    borderRadius: "50%",
  },

  text: {
    color: "#666",
  },

  assignBtn: {
    padding: "12px 18px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default AssignVolunteer;
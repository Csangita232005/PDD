import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDonations } from "../services/api";

function CompletedDeliveries() {
  const navigate = useNavigate();
  const [completedList, setCompletedList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompleted = async () => {
      try {
        const res = await getDonations();
        if (res.success) {
          const list = (res.donations || []).filter((d) => d.status === "COMPLETED");
          setCompletedList(list);
        }
      } catch (err) {
        console.warn("Failed to fetch completed deliveries:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompleted();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <h2>Completed Deliveries ✅</h2>
      </div>

      <div style={styles.content}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#666" }}>Loading completed deliveries...</p>
        ) : completedList.length === 0 ? (
          <div style={styles.emptyCard}>
            <p>No completed deliveries recorded in the database yet.</p>
          </div>
        ) : (
          completedList.map((item) => (
            <div key={item.id || item._id} style={styles.card}>
              <h3>{item.food_name || item.foodName}</h3>
              <p><b>Quantity:</b> {item.quantity} {item.unit || "Packs"}</p>
              <p><b>Volunteer:</b> {item.assignedVolunteer || "Volunteer"}</p>
              <p><b>Donor:</b> {item.donor_name || "Donor"}</p>
              <p><b>Status:</b> Delivered & Confirmed Successfully ✅</p>
            </div>
          ))
        )}

        <button style={styles.button} onClick={() => navigate("/reports")}>
          View Reports
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f5f5",
    paddingBottom: "30px",
  },
  header: {
    background: "#2e7d32",
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
  content: {
    maxWidth: "600px",
    margin: "20px auto",
    padding: "0 15px",
  },
  emptyCard: {
    background: "white",
    padding: "25px",
    borderRadius: "18px",
    textAlign: "center",
    color: "#666",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },
  card: {
    background: "white",
    marginBottom: "15px",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  button: {
    width: "100%",
    display: "block",
    margin: "25px auto",
    padding: "15px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default CompletedDeliveries;
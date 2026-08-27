import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDonations } from "../services/api";

function IncomingDonations() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncoming = async () => {
      try {
        const res = await getDonations();
        if (res.success) {
          const list = (res.donations || []).filter((d) =>
            ["PENDING", "REQUESTED", "ACCEPTED", "VOLUNTEER_ASSIGNED"].includes(d.status)
          );
          setDonations(list);
        }
      } catch (err) {
        console.warn("Failed to fetch incoming donations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIncoming();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/ngo")}>
          ←
        </button>
        <h2>Incoming Donations 🍱</h2>
      </div>

      <div style={styles.content}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#666" }}>Loading active incoming donations...</p>
        ) : donations.length === 0 ? (
          <div style={styles.emptyCard}>
            <p>No active incoming donations in the database right now.</p>
          </div>
        ) : (
          donations.map((item) => (
            <div
              key={item.id || item._id}
              style={styles.card}
              onClick={() => navigate(`/donationdetails?id=${item.id || item._id}`)}
            >
              <h3>{item.food_name || item.foodName}</h3>
              <p><b>Quantity:</b> {item.quantity} {item.unit || "Packs"}</p>
              <p><b>Donor:</b> {item.donor_name || item.donor || "Donor"}</p>
              <p><b>Status:</b> {item.status}</p>
            </div>
          ))
        )}
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
    cursor: "pointer",
    lineHeight: "1.6",
  },
};

export default IncomingDonations;
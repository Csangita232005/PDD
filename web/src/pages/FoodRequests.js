import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDonations } from "../services/api";

function FoodRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await getDonations();
        if (res.success) {
          const activeList = (res.donations || []).filter((d) =>
            ["PENDING", "REQUESTED"].includes(d.status)
          );
          setRequests(activeList);
        }
      } catch (err) {
        console.warn("Failed to fetch food requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/ngo")}>
          ←
        </button>
        <h2>Food Requests 🍽️</h2>
      </div>

      <div style={styles.content}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#666" }}>Loading active food listings...</p>
        ) : requests.length === 0 ? (
          <div style={styles.emptyCard}>
            <p>No active food requests in the database right now.</p>
          </div>
        ) : (
          requests.map((item) => (
            <div key={item.id || item._id} style={styles.requestCard}>
              <h3>{item.food_name || item.foodName}</h3>
              <p><b>Quantity:</b> {item.quantity} {item.unit || "Packs"}</p>
              <p><b>Location:</b> {item.address}</p>
              <p><b>Expiry:</b> {item.expiryTime || "4 Hours"}</p>
              <p><b>Donor:</b> {item.donor_name || "Donor"}</p>

              <button style={styles.matchBtn} onClick={() => navigate(`/donationdetails?id=${item.id || item._id}`)}>
                Find Matching Donation & Details
              </button>
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
    background: "#f4fdf4",
    paddingBottom: "30px",
  },
  header: {
    background: "linear-gradient(to right, #1b5e20, #66bb6a)",
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
  requestCard: {
    background: "white",
    marginBottom: "15px",
    padding: "22px",
    borderRadius: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    lineHeight: "1.7",
  },
  matchBtn: {
    width: "100%",
    padding: "14px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default FoodRequests;
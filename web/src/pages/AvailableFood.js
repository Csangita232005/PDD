import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDonations, acceptDonation } from "../services/api";
import { getSocket } from "../services/socket";

function AvailableFood() {
  const navigate = useNavigate();
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAvailable = async () => {
    try {
      const res = await getDonations();
      if (res.success) {
        const list = (res.donations || []).filter((d) =>
          ["PENDING", "REQUESTED"].includes(d.status)
        );
        setAvailable(list);
      }
    } catch (err) {
      console.warn("Failed to fetch available food:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailable();

    const socket = getSocket();
    const handleUpdate = () => fetchAvailable();

    socket.on("donation:created", handleUpdate);
    socket.on("donation:claimed", handleUpdate);
    socket.on("delivery:status_change", handleUpdate);
    socket.on("donation:completed", handleUpdate);

    return () => {
      socket.off("donation:created", handleUpdate);
      socket.off("donation:claimed", handleUpdate);
      socket.off("delivery:status_change", handleUpdate);
      socket.off("donation:completed", handleUpdate);
    };
  }, []);

  const handleAccept = async (id) => {
    try {
      const res = await acceptDonation(id);
      if (res.success) {
        alert("Food donation accepted successfully!");
        navigate("/ngo");
      } else {
        alert(res.message || "Failed to accept food.");
      }
    } catch (err) {
      alert("Failed to accept food.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <h2>Available Food Listings 🍲</h2>
      </div>

      <div style={styles.content}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#666" }}>Loading available food listings...</p>
        ) : available.length === 0 ? (
          <div style={styles.emptyCard}>
            <p>No active available food listings in the database right now.</p>
          </div>
        ) : (
          available.map((item) => (
            <div key={item.id || item._id} style={styles.card}>
              <h3>{item.food_name || item.foodName}</h3>
              <p><b>Quantity:</b> {item.quantity} {item.unit || "Packs"}</p>
              <p><b>Pickup Address:</b> {item.address}</p>
              <p><b>Donor:</b> {item.donor_name || item.donor || "Donor"}</p>

              <button style={styles.acceptBtn} onClick={() => handleAccept(item.id || item._id)}>
                ✓ Accept Food
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
    lineHeight: "1.7",
  },
  acceptBtn: {
    width: "100%",
    padding: "12px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default AvailableFood;
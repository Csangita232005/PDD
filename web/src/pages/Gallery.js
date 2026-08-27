import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDonations } from "../services/api";

function Gallery() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [completedDonations, setCompletedDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      if (!currentUser) return;
      try {
        const res = await getDonations({ donorId: currentUser.id });
        if (res.success) {
          const completed = (res.donations || []).filter((d) => d.status === "COMPLETED");
          setCompletedDonations(completed);
        }
      } catch (e) {
        console.warn("Failed to fetch gallery:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [currentUser]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/donor")}>←</button>
        <h2 style={{ margin: 0 }}>Community Trust & Impact 📸</h2>
      </div>

      <p style={styles.subtitle}>
        Verified photos from your completed food donations
      </p>

      {loading ? (
        <p style={{ textAlign: "center", color: "#666" }}>Loading gallery...</p>
      ) : completedDonations.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>📷</div>
          <h3 style={{ color: "#2e7d32", margin: "5px 0" }}>No Completed Donations Yet</h3>
          <p style={{ color: "#666", fontSize: "14px" }}>
            When your food donations are delivered by volunteers to receivers or NGOs, photos of your completed impact will appear here.
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {completedDonations.map((item, index) => (
            <div style={styles.card} key={item.id || index}>
              <img
                src={item.foodImage || "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1200"}
                alt="Completed Donation"
                style={styles.image}
              />
              <div style={{ padding: "10px" }}>
                <p style={styles.foodTitle}>{item.food_name || item.foodName}</p>
                <p style={styles.subText}>{item.quantity} {item.unit || "Packs"} • Delivered ✅</p>
              </div>
            </div>
          ))}
        </div>
      )}
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
  subtitle: {
    textAlign: "center",
    color: "#555",
    margin: "20px",
  },
  emptyCard: {
    background: "white",
    maxWidth: "400px",
    margin: "30px auto",
    padding: "30px",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "15px",
    padding: "0 20px",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  },
  image: {
    width: "100%",
    height: "130px",
    objectFit: "cover",
  },
  foodTitle: {
    margin: 0,
    color: "#2e7d32",
    fontWeight: "bold",
    fontSize: "14px",
  },
  subText: {
    margin: "4px 0 0 0",
    color: "#666",
    fontSize: "12px",
  },
};

export default Gallery;
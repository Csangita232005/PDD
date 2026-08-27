import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPlatformStats } from "../services/api";

function Reports() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalFoodSavedKg: 0,
    totalPeopleHelped: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getPlatformStats();
        if (res.success) {
          setStats(res.stats || {});
        }
      } catch (err) {
        console.warn("Failed to fetch reports stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <h2>NGO Reports 📊</h2>
      </div>

      <div style={styles.content}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#666" }}>Loading report analytics...</p>
        ) : (
          <div style={styles.stats}>
            <div style={styles.card}>
              <h2 style={{ color: "#2e7d32", margin: 0 }}>{stats.totalCompleted || 0}</h2>
              <p>Total Deliveries Completed</p>
            </div>

            <div style={styles.card}>
              <h2 style={{ color: "#e65100", margin: 0 }}>{stats.totalFoodSavedKg || 0} Kg</h2>
              <p>Food Distributed & Saved</p>
            </div>

            <div style={styles.card}>
              <h2 style={{ color: "#1565c0", margin: 0 }}>{stats.totalPeopleHelped || 0}</h2>
              <p>People Served</p>
            </div>
          </div>
        )}

        <div style={styles.reportBox}>
          <h3>Monthly Impact Summary</h3>
          <p>Real-time analytics recorded from active database donations and verified volunteer deliveries across local communities.</p>
        </div>
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
  stats: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "15px",
    marginBottom: "20px",
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  reportBox: {
    background: "white",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    lineHeight: "1.6",
  },
};

export default Reports;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDonations, getAdminStatsApi } from "../services/api";

function AdminReports() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("Monthly");
  const [donations, setDonations] = useState([]);
  const [adminStats, setAdminStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resD = await getDonations();
        if (resD.success) setDonations(resD.donations || []);

        const resA = await getAdminStatsApi();
        if (resA.success) setAdminStats(resA.stats || {});
      } catch (e) {
        console.warn("Failed to fetch admin report analytics:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const now = new Date();
  const filteredDonations = donations.filter((d) => {
    const dDate = new Date(d.createdAt || Date.now());
    const diffHours = (now - dDate) / (1000 * 60 * 60);
    if (filter === "Daily") return diffHours <= 24;
    if (filter === "Weekly") return diffHours <= 24 * 7;
    return diffHours <= 24 * 30; // Monthly
  });

  const displayDonations = filteredDonations.length > 0 ? filteredDonations : donations;

  const totalCount = displayDonations.length;
  const completedCount = displayDonations.filter((d) => d.status === "COMPLETED" || d.status === "RECEIVED").length;
  const foodSaved = displayDonations.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);
  const peopleHelped = foodSaved * 2;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ←
        </button>

        <h2>Reports & Analytics 📊</h2>

        <button style={styles.homeBtn} onClick={() => navigate("/admin")}>
          🏠
        </button>
      </div>

      <div style={styles.filterBox}>
        <button
          style={filter === "Daily" ? styles.activeFilter : styles.filterBtn}
          onClick={() => setFilter("Daily")}
        >
          Daily
        </button>

        <button
          style={filter === "Weekly" ? styles.activeFilter : styles.filterBtn}
          onClick={() => setFilter("Weekly")}
        >
          Weekly
        </button>

        <button
          style={filter === "Monthly" ? styles.activeFilter : styles.filterBtn}
          onClick={() => setFilter("Monthly")}
        >
          Monthly
        </button>
      </div>

      <p style={styles.selectedText}>Showing {filter} Real-Time Report</p>

      <div style={styles.reportGrid}>
        <div style={styles.card}>
          <h2>{loading ? "..." : totalCount}</h2>
          <p>Total Food Requests</p>
        </div>

        <div style={styles.card}>
          <h2>{loading ? "..." : completedCount}</h2>
          <p>Completed Deliveries</p>
        </div>

        <div style={styles.card}>
          <h2>{loading ? "..." : `${foodSaved} Kg`}</h2>
          <p>Food Rescued & Saved</p>
        </div>

        <div style={styles.card}>
          <h2>{loading ? "..." : peopleHelped}</h2>
          <p>People Nourished</p>
        </div>
      </div>

      <div style={styles.summary}>
        <h3>MongoDB System Summary</h3>
        <p>✅ <strong>Total Users Registered:</strong> {adminStats.totalUsers || 0} (Donors: {adminStats.donorsCount || 0}, NGOs: {adminStats.ngosCount || 0}, Volunteers: {adminStats.volunteersCount || 0}, Receivers: {adminStats.receiversCount || 0})</p>
        <p>📦 <strong>Pending Food Requests:</strong> {adminStats.pendingDonations || 0}</p>
        <p>🚚 <strong>Active Live Fleet Deliveries:</strong> {adminStats.activeDeliveries || 0}</p>
        <p>🌍 <strong>Active Report Filter:</strong> {filter} Window</p>
      </div>

      <div style={styles.progressBox}>
        <h3>Fulfillment Rate</h3>

        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${completionRate}%` }}></div>
        </div>

        <p style={styles.progressText}>{completionRate}% food donations completed successfully</p>
      </div>

      <button style={styles.performanceBtn} onClick={() => navigate("/performance")}>
        View Platform Performance
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f3f6fb",
    paddingBottom: "30px",
  },

  header: {
    background: "linear-gradient(to right, #263238, #607d8b)",
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
    color: "#263238",
    border: "none",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    fontSize: "22px",
    cursor: "pointer",
  },

  homeBtn: {
    position: "absolute",
    right: "15px",
    top: "17px",
    background: "white",
    color: "#263238",
    border: "none",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    cursor: "pointer",
  },

  filterBox: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "25px",
  },

  filterBtn: {
    padding: "10px 18px",
    background: "white",
    color: "#263238",
    border: "1px solid #ccc",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  activeFilter: {
    padding: "10px 18px",
    background: "#263238",
    color: "white",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  selectedText: {
    textAlign: "center",
    color: "#555",
    fontWeight: "bold",
    marginTop: "15px",
  },

  reportGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    padding: "20px",
  },

  card: {
    background: "white",
    padding: "22px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  summary: {
    background: "white",
    margin: "20px",
    padding: "22px",
    borderRadius: "18px",
    lineHeight: "1.8",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  progressBox: {
    background: "white",
    margin: "20px",
    padding: "22px",
    borderRadius: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  progressBar: {
    width: "100%",
    height: "18px",
    background: "#e0e0e0",
    borderRadius: "20px",
    overflow: "hidden",
    marginTop: "12px",
  },

  progressFill: {
    width: "78%",
    height: "100%",
    background: "#263238",
  },

  progressText: {
    marginTop: "10px",
    color: "#555",
    fontWeight: "bold",
  },

  performanceBtn: {
    width: "85%",
    display: "block",
    margin: "25px auto",
    padding: "15px",
    background: "#263238",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default AdminReports;
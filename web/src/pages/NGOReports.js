import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDonations, getPersonalStats } from "../services/api";

function NGOReports() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalClaimed: 0,
    completedCount: 0,
    foodDistributedKg: 0,
    peopleHelped: 0,
    mostActiveArea: "Local Operating Zone",
  });
  const [loading, setLoading] = useState(true);

  const uid = currentUser?.id || currentUser?._id;

  useEffect(() => {
    const fetchNgoData = async () => {
      try {
        const resD = await getDonations();
        const resP = uid ? await getPersonalStats(uid) : { success: false };

        if (resD.success && Array.isArray(resD.donations)) {
          const ngoClaimed = resD.donations.filter(
            (d) =>
              d.ngo_id === uid ||
              (d.claimedBy?.role === "NGO" && d.claimedBy?.userId === uid) ||
              d.acceptedByNGO === currentUser?.name
          );
          const completed = ngoClaimed.filter((d) => d.status === "COMPLETED");
          const foodKg = completed.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);
          const area = ngoClaimed[0]?.address || currentUser?.ngoAddress || currentUser?.address || "Hyderabad Operations";

          setStats({
            totalClaimed: ngoClaimed.length,
            completedCount: completed.length,
            foodDistributedKg: resP.stats?.foodSavedKg || foodKg,
            peopleHelped: resP.stats?.peopleHelped || foodKg * 2,
            mostActiveArea: area,
          });
        }
      } catch (e) {
        console.warn("Failed to fetch NGO report data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchNgoData();
  }, [currentUser, uid]);

  const completionPct = stats.totalClaimed > 0 ? Math.round((stats.completedCount / stats.totalClaimed) * 100) : 100;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/ngo")}>
          ←
        </button>
        <h2>NGO Reports 📊</h2>
      </div>

      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h2>{loading ? "..." : stats.totalClaimed}</h2>
          <p>Total Claimed Requests</p>
        </div>

        <div style={styles.statCard}>
          <h2>{loading ? "..." : `${stats.foodDistributedKg} Kg`}</h2>
          <p>Food Distributed</p>
        </div>

        <div style={styles.statCard}>
          <h2>{loading ? "..." : stats.peopleHelped}</h2>
          <p>People Helped</p>
        </div>
      </div>

      <div style={styles.reportCard}>
        <h3>🍱 Verified Food Rescue Metric</h3>
        <p>{stats.completedCount} Deliveries Completed & Distributed to Shelters</p>
      </div>

      <div style={styles.reportCard}>
        <h3>🏢 NGO Organization</h3>
        <p>{currentUser?.name || "Community NGO Partner"}</p>
      </div>

      <div style={styles.reportCard}>
        <h3>📍 Primary Operating Area</h3>
        <p>{stats.mostActiveArea}</p>
      </div>

      <div style={styles.progressCard}>
        <h3 style={styles.progressTitle}>Distribution Fulfillment Progress</h3>

        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${completionPct}%` }}></div>
        </div>

        <p style={styles.progressText}>
          {stats.completedCount} / {stats.totalClaimed} Deliveries Completed ({completionPct}%)
        </p>
      </div>

      {/* Banner */}

      <div style={styles.banner}>
        ❤️ Together we are reducing hunger and food waste.
      </div>

      {/* Button */}

      <button
        style={styles.homeBtn}
        onClick={() => navigate("/ngo")}
      >
        Back to NGO Dashboard
      </button>

    </div>
  );
}

const styles = {

  container: {
    minHeight: "100vh",
    background: "#f4fdf4",
    paddingBottom: "40px",
  },

  header: {
    background:
      "linear-gradient(to right, #2e7d32, #66bb6a)",

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

  statsContainer: {
    display: "flex",

    justifyContent: "space-around",

    marginTop: "25px",

    flexWrap: "wrap",

    gap: "15px",

    padding: "0 15px",
  },

  statCard: {
    background: "white",

    width: "100px",

    padding: "20px",

    borderRadius: "18px",

    textAlign: "center",

    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },

  reportCard: {
    background: "white",

    margin: "20px",

    padding: "20px",

    borderRadius: "18px",

    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  progressCard: {
    background: "white",

    margin: "20px",

    padding: "20px",

    borderRadius: "18px",

    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  progressTitle: {
    color: "#2e7d32",
    marginBottom: "15px",
  },

  progressBar: {
    width: "100%",

    height: "18px",

    background: "#ddd",

    borderRadius: "20px",

    overflow: "hidden",
  },

  progressFill: {
    width: "82%",

    height: "100%",

    background:
      "linear-gradient(to right, #2e7d32, #66bb6a)",
  },

  progressText: {
    marginTop: "12px",

    fontWeight: "bold",

    color: "#555",
  },

  banner: {
    background:
      "linear-gradient(to right, #43a047, #81c784)",

    margin: "20px",

    padding: "22px",

    borderRadius: "20px",

    textAlign: "center",

    color: "white",

    fontWeight: "bold",

    fontSize: "18px",
  },

  homeBtn: {
    width: "85%",

    margin: "25px auto",

    display: "block",

    padding: "15px",

    background: "#2e7d32",

    color: "white",

    border: "none",

    borderRadius: "12px",

    fontSize: "16px",

    fontWeight: "bold",

    cursor: "pointer",
  },
};

export default NGOReports;
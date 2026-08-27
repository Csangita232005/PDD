import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPlatformStats, getAdminStatsApi } from "../services/api";

function PlatformPerformance() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalCompleted: 0,
    totalFoodSavedKg: 0,
    totalPeopleHelped: 0,
    donorsCount: 0,
    ngosCount: 0,
    volunteersCount: 0,
    receiversCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfData = async () => {
      try {
        const resPl = await getPlatformStats();
        const resAd = await getAdminStatsApi();
        if (resPl.success || resAd.success) {
          setStats({
            totalDonations: resAd.stats?.totalDonations || resPl.stats?.totalDonations || 0,
            totalCompleted: resAd.stats?.completedDonations || resPl.stats?.totalCompleted || 0,
            totalFoodSavedKg: resAd.stats?.foodSavedKg || resPl.stats?.totalFoodSavedKg || 0,
            totalPeopleHelped: resAd.stats?.peopleHelped || resPl.stats?.totalPeopleHelped || 0,
            donorsCount: resAd.stats?.donorsCount || resPl.stats?.donorsCount || 0,
            ngosCount: resAd.stats?.ngosCount || resPl.stats?.ngosCount || 0,
            volunteersCount: resAd.stats?.volunteersCount || resPl.stats?.volunteersCount || 0,
            receiversCount: resAd.stats?.receiversCount || 0,
          });
        }
      } catch (e) {
        console.warn("Failed to fetch performance data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfData();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/admin")}>
          ←
        </button>

        <div>
          <h1 style={styles.title}>Platform Performance Overview</h1>
          <p style={styles.subtitle}>
            Real-time insights of food donation ecosystem
          </p>
        </div>

        <button style={styles.homeBtn} onClick={() => navigate("/thankyou")}>
          Finish
        </button>
      </div>

      <div style={styles.topStats}>
        <div style={styles.statCard}>
          <h2>{loading ? "..." : stats.totalDonations}</h2>
          <p>Total Food Requests</p>
        </div>

        <div style={styles.statCard}>
          <h2>{loading ? "..." : `${stats.totalFoodSavedKg} kg`}</h2>
          <p>Food Donated & Saved</p>
        </div>

        <div style={styles.statCard}>
          <h2>{loading ? "..." : stats.totalPeopleHelped}</h2>
          <p>People Helped</p>
        </div>

        <div style={styles.statCard}>
          <h2>{loading ? "..." : stats.totalCompleted}</h2>
          <p>Successful Deliveries</p>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Registered Platform Ecosystem</h2>

        <div style={styles.grid}>
          <div style={styles.performanceCard}>
            <h3>Donors</h3>
            <h1>{stats.donorsCount}</h1>
            <p>Active Donors</p>
          </div>

          <div style={styles.performanceCard}>
            <h3>Receivers / NGOs</h3>
            <h1>{stats.ngosCount + stats.receiversCount}</h1>
            <p>Organizations & Receivers</p>
          </div>

          <div style={styles.performanceCard}>
            <h3>Volunteers</h3>
            <h1>{stats.volunteersCount}</h1>
            <p>Active Fleet Volunteers</p>
          </div>

          <div style={styles.performanceCard}>
            <h3>Overall Efficiency</h3>
            <h1>{stats.totalDonations > 0 ? `${Math.round((stats.totalCompleted / stats.totalDonations) * 100)}%` : "100%"}</h1>
            <p>Fulfillment Rate</p>
          </div>
        </div>
      </div>

      <div style={styles.summary}>
        <h2>Overall Impact Summary 🌍</h2>

        <p><b>Food Donated:</b> {stats.totalFoodSavedKg} kg</p>
        <p><b>People Helped:</b> {stats.totalPeopleHelped}</p>
        <p><b>Food Waste CO₂ Saved:</b> {Math.round(stats.totalFoodSavedKg * 0.53)} kg CO₂</p>
        <p><b>Active Operations:</b> MongoDB Real-Time Connected</p>
      </div>

      <button style={styles.button} onClick={() => navigate("/thankyou")}>
        Go to Thank You Screen
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
    background: "linear-gradient(to right, #1b5e20, #66bb6a)",
    color: "white",
    padding: "25px",
    position: "relative",
    textAlign: "center",
    borderBottomLeftRadius: "25px",
    borderBottomRightRadius: "25px",
  },

  backBtn: {
    position: "absolute",
    left: "15px",
    top: "25px",
    background: "white",
    color: "#1b5e20",
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
    top: "25px",
    background: "white",
    color: "#1b5e20",
    border: "none",
    borderRadius: "20px",
    padding: "10px 16px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  title: {
    margin: 0,
    fontSize: "28px",
  },

  subtitle: {
    marginTop: "8px",
    color: "#e8f5e9",
  },

  topStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    padding: "20px",
  },

  statCard: {
    background: "white",
    padding: "22px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  section: {
    padding: "20px",
  },

  sectionTitle: {
    color: "#1b5e20",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },

  performanceCard: {
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

  button: {
    width: "85%",
    display: "block",
    margin: "25px auto",
    padding: "15px",
    background: "#1b5e20",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default PlatformPerformance;
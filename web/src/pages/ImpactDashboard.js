import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getPersonalStats, getPlatformStats } from "../services/api";

function ImpactDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [personalStats, setPersonalStats] = useState({
    totalDonations: 0,
    completedDonations: 0,
    foodSavedKg: 0,
    peopleHelped: 0,
  });

  const [platformStats, setPlatformStats] = useState({
    totalDonations: 0,
    totalCompleted: 0,
    totalFoodSavedKg: 0,
    totalPeopleHelped: 0,
    donorsCount: 0,
    ngosCount: 0,
    volunteersCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;
      try {
        const resP = await getPersonalStats(currentUser.id);
        if (resP.success) setPersonalStats(resP.stats);

        const resPl = await getPlatformStats();
        if (resPl.success) setPlatformStats(resPl.stats);
      } catch (e) {
        console.warn("Failed to fetch impact stats:", e);
      }
    };
    fetchStats();
  }, [currentUser]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2 style={{ margin: 0, fontSize: "22px" }}>🌍 ShareBite Impact Analytics</h2>
      </div>

      <div style={styles.content}>
        {currentUser && (
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>👤 {t("personalImpact")}</h3>

            <div style={styles.statsGrid}>
              <div style={styles.metricCard}>
                <h2 style={{ color: "#2e7d32", margin: 0 }}>{personalStats.totalDonations}</h2>
                <p style={styles.metricLabel}>{t("totalDonations")}</p>
              </div>

              <div style={styles.metricCard}>
                <h2 style={{ color: "#1565c0", margin: 0 }}>{personalStats.completedDonations}</h2>
                <p style={styles.metricLabel}>{t("totalDeliveries")}</p>
              </div>

              <div style={styles.metricCard}>
                <h2 style={{ color: "#e65100", margin: 0 }}>{personalStats.foodSavedKg} Kg</h2>
                <p style={styles.metricLabel}>{t("totalFoodSaved")}</p>
              </div>

              <div style={styles.metricCard}>
                <h2 style={{ color: "#6a1b9a", margin: 0 }}>{personalStats.peopleHelped}</h2>
                <p style={styles.metricLabel}>{t("totalPeopleHelped")}</p>
              </div>
            </div>
          </div>
        )}

        <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>🌟 {t("platformImpact")}</h3>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "-10px", marginBottom: "20px" }}>
            Cumulative real-time metrics across all community members.
          </p>

          <div style={styles.statsGrid}>
            <div style={styles.metricCardBig}>
              <div style={{ fontSize: "35px" }}>🍲</div>
              <h2 style={{ color: "#2e7d32", margin: "5px 0" }}>{platformStats.totalFoodSavedKg} Kg</h2>
              <p style={styles.metricLabel}>{t("totalFoodSaved")}</p>
            </div>

            <div style={styles.metricCardBig}>
              <div style={{ fontSize: "35px" }}>🤝</div>
              <h2 style={{ color: "#1565c0", margin: "5px 0" }}>{platformStats.totalPeopleHelped}</h2>
              <p style={styles.metricLabel}>{t("totalPeopleHelped")}</p>
            </div>

            <div style={styles.metricCardBig}>
              <div style={{ fontSize: "35px" }}>🚚</div>
              <h2 style={{ color: "#e65100", margin: "5px 0" }}>{platformStats.totalCompleted}</h2>
              <p style={styles.metricLabel}>{t("totalDeliveries")}</p>
            </div>

            <div style={styles.metricCardBig}>
              <div style={{ fontSize: "35px" }}>📦</div>
              <h2 style={{ color: "#6a1b9a", margin: "5px 0" }}>{platformStats.totalDonations}</h2>
              <p style={styles.metricLabel}>{t("totalDonations")}</p>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "25px 0" }} />

          <h4 style={{ color: "#333", marginBottom: "15px" }}>Community Network Strength</h4>

          <div style={styles.networkRow}>
            <div style={styles.netCard}>
              <h4>{platformStats.donorsCount}</h4>
              <p>Active Donors</p>
            </div>

            <div style={styles.netCard}>
              <h4>{platformStats.ngosCount}</h4>
              <p>Partnered NGOs</p>
            </div>

            <div style={styles.netCard}>
              <h4>{platformStats.volunteersCount}</h4>
              <p>Active Volunteers</p>
            </div>
          </div>
        </div>

        <button style={styles.backDashBtn} onClick={() => navigate("/roles")}>
          🏠 {t("backToDashboard")}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#f5f5f5",
    minHeight: "100vh",
    paddingBottom: "40px",
  },
  header: {
    background: "#2e7d32",
    color: "white",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  backBtn: {
    background: "rgba(255,255,255,0.2)",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  content: {
    maxWidth: "800px",
    margin: "20px auto",
    padding: "0 15px",
  },
  sectionCard: {
    background: "white",
    padding: "25px",
    borderRadius: "18px",
    marginBottom: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
  },
  sectionTitle: {
    color: "#2e7d32",
    margin: "0 0 20px 0",
    fontSize: "20px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "15px",
  },
  metricCard: {
    background: "#f9f9f9",
    padding: "18px 10px",
    borderRadius: "14px",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  },
  metricCardBig: {
    background: "#f9f9f9",
    padding: "20px 10px",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  metricLabel: {
    margin: "5px 0 0 0",
    color: "#666",
    fontSize: "13px",
    fontWeight: "bold",
  },
  networkRow: {
    display: "flex",
    justifyContent: "space-around",
    gap: "10px",
  },
  netCard: {
    flex: 1,
    background: "#e8f5e9",
    padding: "14px",
    borderRadius: "12px",
    textAlign: "center",
    color: "#2e7d32",
  },
  backDashBtn: {
    display: "block",
    width: "100%",
    padding: "14px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default ImpactDashboard;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDonations, getPersonalStats } from "../services/api";

function VolunteerImpact() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalPickups: 0,
    deliveriesCount: 0,
    foodDeliveredKg: 0,
    peopleHelped: 0,
  });
  const [loading, setLoading] = useState(true);

  const uid = currentUser?.id || currentUser?._id;

  useEffect(() => {
    const fetchVolData = async () => {
      try {
        const resD = await getDonations();
        const resP = uid ? await getPersonalStats(uid) : { success: false };

        if (resD.success && Array.isArray(resD.donations)) {
          const myTasks = resD.donations.filter(
            (d) => d.volunteer_id === uid || d.assignedVolunteer === currentUser?.name
          );
          const completed = myTasks.filter((d) => d.status === "COMPLETED");
          const foodKg = completed.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);

          setStats({
            totalPickups: myTasks.length,
            deliveriesCount: completed.length,
            foodDeliveredKg: resP.stats?.foodSavedKg || foodKg,
            peopleHelped: resP.stats?.peopleHelped || foodKg * 2,
          });
        }
      } catch (e) {
        console.warn("Failed to fetch volunteer impact data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchVolData();
  }, [currentUser, uid]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/volunteer")}>
          ←
        </button>
        <h2>Volunteer Impact 🌍</h2>
      </div>

      <div style={styles.hero}>
        <h1>Great Work, {currentUser?.name || "Volunteer"}! 💙</h1>
        <p>Your service helped food reach people on time.</p>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <h2>{loading ? "..." : stats.totalPickups}</h2>
          <p>Assigned Tasks</p>
        </div>

        <div style={styles.card}>
          <h2>{loading ? "..." : stats.deliveriesCount}</h2>
          <p>Completed Deliveries</p>
        </div>

        <div style={styles.card}>
          <h2>{loading ? "..." : `${stats.foodDeliveredKg} Kg`}</h2>
          <p>Food Delivered</p>
        </div>

        <div style={styles.card}>
          <h2>{loading ? "..." : stats.peopleHelped}</h2>
          <p>People Nourished</p>
        </div>
      </div>

      <div style={styles.badgeBox}>
        <h3>Achievements 🏆</h3>
        <p>💙 Hunger Helper</p>
        <p>🚴 Fast Pickup Volunteer</p>
        <p>🌱 Food Waste Saver</p>
      </div>

      <button style={styles.button} onClick={() => navigate("/volunteerprofile")}>
        View Profile
      </button>
      <button
  style={styles.homeBtn}
  onClick={() => navigate("/volunteer")}
>
  Go To Dashboard 🏠
</button>
<button
  style={styles.button}
  onClick={() => navigate("/thankyou")}
>
  Finish
</button>
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
    background: "linear-gradient(to right, #1565c0, #64b5f6)",
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
    color: "#1565c0",
    border: "none",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    fontSize: "22px",
    cursor: "pointer",
  },

  hero: {
    background: "#e3f2fd",
    margin: "20px",
    padding: "22px",
    borderRadius: "20px",
    textAlign: "center",
    color: "#0d47a1",
  },

  statsGrid: {
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

  badgeBox: {
    background: "white",
    margin: "20px",
    padding: "22px",
    borderRadius: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    lineHeight: "1.8",
  },

  button: {
    width: "85%",
    display: "block",
    margin: "25px auto",
    padding: "15px",
    background: "#1565c0",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  homeBtn: {
  width: "85%",
  display: "block",
  margin: "15px auto",
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

export default VolunteerImpact;
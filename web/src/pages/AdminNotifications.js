import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications } from "../services/api";
import { getSocket } from "../services/socket";

function AdminNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await getNotifications();
      if (res.success && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      }
    } catch (e) {
      console.warn("Failed to fetch admin notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();

    const socket = getSocket();
    socket.on("notification:new", fetchNotifs);
    return () => {
      socket.off("notification:new", fetchNotifs);
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/admin")}>←</button>
        <h2>Admin Notifications 🔔</h2>
        <button style={styles.homeBtn} onClick={() => navigate("/admin")}>🏠</button>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "10px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading system notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={styles.card}>
            <h3>🔔 System Notifications Ready</h3>
            <p>No active alerts. Real-time food donation activity pings will appear here live.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div key={item.id || item._id} style={styles.card}>
              <h3 style={{ color: "#1565c0", margin: "0 0 6px 0" }}>{item.title}</h3>
              <p style={{ margin: "4px 0", color: "#444" }}>{item.message}</p>
              <span style={{ fontSize: "11px", color: "#888", display: "block", marginTop: "6px" }}>
                {new Date(item.createdAt || Date.now()).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f3f6fb" },

  header: {
    background: "#263238",
    color: "white",
    padding: "20px",
    textAlign: "center",
    position: "relative",
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

  card: {
    background: "white",
    margin: "20px",
    padding: "22px",
    borderRadius: "18px",
    lineHeight: "1.7",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
};

export default AdminNotifications;
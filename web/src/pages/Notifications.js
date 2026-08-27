import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getNotifications, markNotificationRead } from "../services/api";
import NavbarHeader from "../components/NavbarHeader";

function Notifications() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const uid = currentUser?.id || currentUser?._id;

  const fetchNotifications = async () => {
    if (!uid) {
      setLoading(false);
      return;
    }
    try {
      const res = await getNotifications(uid);
      if (res.success && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      }
    } catch (e) {
      console.warn("Failed to fetch notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchNotifications();
  }, [currentUser]);

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      fetchNotifications();
    } catch (e) {
      console.warn("Failed to mark notification as read:", e);
    }
  };

  return (
    <div style={styles.container}>
      <NavbarHeader title="In-App Notifications" subtitle="Real-time alerts for donations, claims & deliveries" />

      <div style={styles.content}>
        <div style={styles.contentHeader}>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h3 style={{ margin: 0, color: "#2e7d32" }}>🔔 My Notifications</h3>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={styles.emptyCard}>
            <p>No notifications yet. Real-time updates will appear here on food status changes!</p>
          </div>
        ) : (
          notifications.map((item) => {
            const notifId = item.id || item._id;
            const isRead = item.isRead || item.is_read;
            return (
              <div
                key={notifId}
                style={{
                  ...styles.card,
                  backgroundColor: isRead ? "#ffffff" : "#e8f5e9",
                  borderLeft: isRead ? "4px solid #ccc" : "4px solid #2e7d32",
                }}
                onClick={() => handleRead(notifId)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: "0 0 6px 0", color: "#2e7d32", fontSize: "16px" }}>{item.title}</h4>
                  {!isRead && <span style={styles.newDot}>Unread</span>}
                </div>
                <p style={{ margin: "4px 0", color: "#444", fontSize: "14px" }}>{item.message}</p>
                <span style={{ fontSize: "11px", color: "#777", display: "block", marginTop: "6px" }}>
                  {new Date(item.createdAt || Date.now()).toLocaleString()}
                </span>
              </div>
            );
          })
        )}
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
  content: {
    maxWidth: "640px",
    margin: "20px auto",
    padding: "0 15px",
  },
  contentHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "15px",
  },
  backBtn: {
    background: "#ffffff",
    color: "#2e7d32",
    border: "1px solid #ccc",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  emptyCard: {
    background: "white",
    padding: "30px",
    borderRadius: "14px",
    textAlign: "center",
    color: "#666",
  },
  card: {
    padding: "16px",
    borderRadius: "14px",
    marginBottom: "12px",
    boxShadow: "0 3px 8px rgba(0,0,0,0.06)",
    cursor: "pointer",
  },
  newDot: {
    backgroundColor: "#d32f2f",
    color: "white",
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "10px",
    fontWeight: "bold",
  },
};

export default Notifications;
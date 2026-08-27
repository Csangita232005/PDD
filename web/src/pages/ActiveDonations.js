import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDonations, updateDeliveryStage } from "../services/api";
import { getSocket, joinUserRoom } from "../services/socket";
import NavbarHeader from "../components/NavbarHeader";

function ActiveDonations() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeDonations, setActiveDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveDonations = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    try {
      const uid = currentUser.id || currentUser._id;
      const res = await getDonations({ donorId: uid });
      if (res.success && res.donations) {
        const active = res.donations.filter((d) => d.status !== "COMPLETED");
        setActiveDonations(active);
      } else {
        setActiveDonations([]);
      }
    } catch (e) {
      console.warn("Failed to fetch active donations:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchActiveDonations();

    const socket = getSocket();
    const uid = currentUser?.id || currentUser?._id;
    if (uid) joinUserRoom(uid);

    const handleUpdate = () => fetchActiveDonations();

    socket.on("donation:claimed", handleUpdate);
    socket.on("delivery:status_change", handleUpdate);
    socket.on("donation:completed", handleUpdate);
    socket.on("notification:new", handleUpdate);

    return () => {
      socket.off("donation:claimed", handleUpdate);
      socket.off("delivery:status_change", handleUpdate);
      socket.off("donation:completed", handleUpdate);
      socket.off("notification:new", handleUpdate);
    };
  }, [currentUser]);

  const handleSelfDeliveryStage = async (donationId, stage) => {
    try {
      await updateDeliveryStage(donationId, stage);
      alert(`Status updated to ${stage.replace('_', ' ')}! 🎉`);
      fetchActiveDonations();
    } catch (e) {
      alert("Failed to update stage.");
    }
  };

  return (
    <div style={styles.container}>
      <NavbarHeader title="Active Donations" subtitle="Track live food rescue status & recipient details" />

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading active donations...</div>
      ) : activeDonations.length === 0 ? (
        <div style={styles.emptyContainer}>
          <div style={styles.emptyCard}>
            <h3 style={{ color: "#2e7d32", marginTop: 0 }}>No Active Donations</h3>
            <p style={{ color: "#555", lineHeight: "1.5" }}>
              You don't have any active food donations in progress right now.
            </p>
            <button style={styles.donateBtn} onClick={() => navigate("/donatefood")}>
              + Donate Food Now
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.listContainer}>
          {activeDonations.map((donation) => {
            const donId = donation.id || donation._id;
            const deliveryMethod = donation.deliveryPreference || donation.deliveryMode || "VOLUNTEER_DELIVERY";
            const recipientName = donation.recipientName || donation.claimedBy?.name || "Pending Acceptance";
            const recipientRole = donation.recipientRole || donation.claimedBy?.role || "Recipient";
            const volunteerName = donation.assignedVolunteer || "Not assigned yet";
            const volunteerPhone = donation.volunteerPhone || "Available upon assignment";

            const isAccepted = ["ACCEPTED", "VOLUNTEER_ASSIGNED", "PICKUP_STARTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(donation.status);
            const isVolAssigned = ["VOLUNTEER_ASSIGNED", "PICKUP_STARTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(donation.status);
            const isPickedUp = ["PICKED_UP", "IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(donation.status);
            const isDelivered = ["DELIVERED", "COMPLETED"].includes(donation.status);

            return (
              <div key={donId} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={{ margin: 0, color: "#2e7d32" }}>{donation.food_name || donation.foodName}</h3>
                    <span style={{ fontSize: "13px", color: "#666" }}>
                      Posted on: {new Date(donation.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span style={styles.statusBadge(donation.status)}>{donation.status}</span>
                </div>

                <div style={styles.detailsGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.label}>Quantity & Type:</span>
                    <strong>{donation.quantity} {donation.unit || "Packs"} ({donation.category || 'Cooked Meals'})</strong>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.label}>Pickup Address:</span>
                    <span>📍 {donation.address}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.label}>Intended Recipient:</span>
                    <span>{donation.intendedRecipient === 'NGO' ? 'NGOs Only' : donation.intendedRecipient === 'RECEIVER' ? 'Receivers Only' : 'Open to All'}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.label}>Delivery Method:</span>
                    <strong>{deliveryMethod === 'SELF_DELIVERY' ? '🚗 Donor Self-Delivery' : '🚴 Volunteer Pickup'}</strong>
                  </div>
                </div>

                {/* Recipient & Volunteer Box */}
                <div style={styles.partyBox}>
                  <div style={styles.partyCol}>
                    <span style={styles.partyTitle}>🤝 Recipient Details</span>
                    <p style={{ margin: "2px 0", fontSize: "14px", fontWeight: "bold", color: "#1b5e20" }}>
                      {recipientName} {donation.recipientName && `(${recipientRole})`}
                    </p>
                    {donation.recipientPhone && <p style={{ margin: "2px 0", fontSize: "12px", color: "#555" }}>📞 {donation.recipientPhone}</p>}
                  </div>

                  <div style={styles.partyCol}>
                    <span style={styles.partyTitle}>🚴 Volunteer Details</span>
                    <p style={{ margin: "2px 0", fontSize: "14px", fontWeight: "bold", color: "#1565c0" }}>
                      {volunteerName}
                    </p>
                    {donation.assignedVolunteer && <p style={{ margin: "2px 0", fontSize: "12px", color: "#555" }}>📞 {volunteerPhone}</p>}
                  </div>
                </div>

                {/* Complete Status Timeline Tracker */}
                <div style={styles.timelineContainer}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "14px" }}>📌 Complete Status Timeline</h4>

                  <div style={styles.stepRow}>
                    <span style={styles.dot(true)}>✓</span>
                    <div>
                      <strong>Donation Created</strong>
                      <p style={styles.stepSub}>Donation listed & available for claim</p>
                    </div>
                  </div>

                  <div style={styles.stepRow}>
                    <span style={styles.dot(isAccepted)}>{isAccepted ? "✓" : "2"}</span>
                    <div>
                      <strong>Accepted by {recipientName}</strong>
                      <p style={styles.stepSub}>{isAccepted ? `Accepted by ${recipientRole}` : "Waiting for NGO or Receiver to accept"}</p>
                    </div>
                  </div>

                  {deliveryMethod !== 'SELF_DELIVERY' && (
                    <div style={styles.stepRow}>
                      <span style={styles.dot(isVolAssigned)}>{isVolAssigned ? "✓" : "3"}</span>
                      <div>
                        <strong>Volunteer Assigned</strong>
                        <p style={styles.stepSub}>{isVolAssigned ? `Assigned to ${volunteerName}` : "Waiting for volunteer acceptance"}</p>
                      </div>
                    </div>
                  )}

                  <div style={styles.stepRow}>
                    <span style={styles.dot(isPickedUp)}>{isPickedUp ? "✓" : deliveryMethod === 'SELF_DELIVERY' ? "3" : "4"}</span>
                    <div>
                      <strong>Food Picked Up / Out for Delivery</strong>
                      <p style={styles.stepSub}>{isPickedUp ? "Food picked up from donor address" : "Pending pickup"}</p>
                    </div>
                  </div>

                  <div style={styles.stepRow}>
                    <span style={styles.dot(isDelivered)}>{isDelivered ? "✓" : deliveryMethod === 'SELF_DELIVERY' ? "4" : "5"}</span>
                    <div>
                      <strong>Food Delivered & Confirmed Received</strong>
                      <p style={styles.stepSub}>{isDelivered ? "Recipient confirmed food receipt" : "Pending delivery completion"}</p>
                    </div>
                  </div>
                </div>

                {/* Self Delivery Donor Controls */}
                {deliveryMethod === 'SELF_DELIVERY' && donation.status === 'ACCEPTED' && (
                  <div style={styles.actionBox}>
                    <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "bold", color: "#2e7d32" }}>
                      🚗 You selected Donor Self-Delivery. Mark status when you begin delivery:
                    </p>
                    <button
                      style={styles.actionBtn("#1565c0")}
                      onClick={() => handleSelfDeliveryStage(donId, "IN_TRANSIT")}
                    >
                      🚚 Mark Out for Delivery
                    </button>
                  </div>
                )}

                {deliveryMethod === 'SELF_DELIVERY' && donation.status === 'IN_TRANSIT' && (
                  <div style={styles.actionBox}>
                    <button
                      style={styles.actionBtn("#2e7d32")}
                      onClick={() => handleSelfDeliveryStage(donId, "DELIVERED")}
                    >
                      📦 Mark Food Delivered to Recipient
                    </button>
                  </div>
                )}

                <button
                  style={styles.trackBtn}
                  onClick={() => navigate("/livetracking")}
                >
                  View Live Map Tracking 📍
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f5f5",
    paddingBottom: "40px",
  },
  emptyContainer: {
    maxWidth: "500px",
    margin: "40px auto",
    padding: "0 20px",
  },
  emptyCard: {
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },
  donateBtn: {
    marginTop: "15px",
    padding: "13px 25px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  listContainer: {
    maxWidth: "700px",
    margin: "20px auto",
    padding: "0 15px",
  },
  card: {
    background: "white",
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid #eee",
    paddingBottom: "12px",
    marginBottom: "14px",
  },
  statusBadge: (status) => ({
    padding: "6px 12px",
    borderRadius: "14px",
    fontSize: "12px",
    fontWeight: "bold",
    backgroundColor:
      status === "COMPLETED" ? "#e8f5e9" : status === "PENDING" ? "#fff3e0" : "#e3f2fd",
    color:
      status === "COMPLETED" ? "#2e7d32" : status === "PENDING" ? "#e65100" : "#1565c0",
  }),
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "15px",
  },
  detailItem: {
    fontSize: "13px",
    color: "#444",
  },
  label: {
    display: "block",
    color: "#777",
    fontSize: "11px",
    marginBottom: "2px",
  },
  partyBox: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    background: "#f9fbf9",
    border: "1px solid #e0ebd0",
    borderRadius: "12px",
    padding: "12px",
    marginBottom: "15px",
  },
  partyCol: {
    flex: 1,
  },
  partyTitle: {
    fontSize: "11px",
    fontWeight: "bold",
    color: "#555",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "4px",
  },
  timelineContainer: {
    background: "#fafafa",
    borderRadius: "12px",
    padding: "14px",
    border: "1px solid #eee",
    marginBottom: "15px",
  },
  stepRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "8px",
  },
  dot: (active) => ({
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    backgroundColor: active ? "#2e7d32" : "#ccc",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "bold",
    flexShrink: 0,
    marginTop: "2px",
  }),
  stepSub: {
    margin: 0,
    fontSize: "12px",
    color: "#666",
  },
  actionBox: {
    background: "#e3f2fd",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "12px",
  },
  actionBtn: (bgColor) => ({
    padding: "10px 16px",
    backgroundColor: bgColor,
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  }),
  trackBtn: {
    width: "100%",
    padding: "12px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default ActiveDonations;
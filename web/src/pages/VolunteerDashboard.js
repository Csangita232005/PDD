import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getDonations, assignVolunteer, updateDeliveryStage, updateVolunteerLocationApi } from "../services/api";
import { getSocket, joinUserRoom, joinRoleRoom } from "../services/socket";
import LocationMap from "../components/LocationMap";
import NavbarHeader from "../components/NavbarHeader";

function VolunteerDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("Idle");
  const [lastGpsTime, setLastGpsTime] = useState(null);
  const [currentVolunteerPos, setCurrentVolunteerPos] = useState(null);

  const volunteerProfileAddr = currentUser?.roleProfiles?.volunteer?.address?.formattedAddress || currentUser?.volunteerAddress || "";

  useEffect(() => {
    if (currentUser && !volunteerProfileAddr) {
      navigate("/volunteersetup");
    }
  }, [currentUser, volunteerProfileAddr, navigate]);

  const uid = currentUser?.id || currentUser?._id;

  const fetchDonations = async () => {
    try {
      const res = await getDonations();
      if (res.success) {
        setAllDonations(res.donations || []);
      }
    } catch (err) {
      console.warn("Failed to fetch volunteer donations:", err);
    }
  };

  useEffect(() => {
    fetchDonations();

    const socket = getSocket();
    if (uid) {
      joinUserRoom(uid);
      joinRoleRoom("VOLUNTEER");
    }

    const handleRealtimeUpdate = () => {
      fetchDonations();
    };

    socket.on("donation:created", handleRealtimeUpdate);
    socket.on("donation:claimed", handleRealtimeUpdate);
    socket.on("delivery:new_available", handleRealtimeUpdate);
    socket.on("delivery:status_change", handleRealtimeUpdate);
    socket.on("donation:completed", handleRealtimeUpdate);

    return () => {
      socket.off("donation:created", handleRealtimeUpdate);
      socket.off("donation:claimed", handleRealtimeUpdate);
      socket.off("delivery:new_available", handleRealtimeUpdate);
      socket.off("delivery:status_change", handleRealtimeUpdate);
      socket.off("donation:completed", handleRealtimeUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const selfModes = ["BENEFICIARY_SELF_PICKUP", "SELF_COLLECTION", "DONOR_DELIVERY", "SELF_DELIVERY", "RECEIVER_PICKUP"];

  // Available tasks: Require volunteer delivery and no volunteer assigned yet
  const availablePickups = allDonations.filter((d) => {
    if (d.volunteerRequired === false) return false;
    if (selfModes.includes(d.collectionMethod) || selfModes.includes(d.deliveryPreference) || selfModes.includes(d.deliveryMode)) return false;
    if (d.status === "ACCEPTED_SELF_COLLECTION" || d.status === "COMPLETED" || d.status === "CANCELLED") return false;
    if (d.volunteer_id || d.assignedVolunteer) return false;

    const isVolunteerType = d.collectionMethod === "VOLUNTEER_DELIVERY" || d.deliveryPreference === "VOLUNTEER_DELIVERY" || d.deliveryMode === "VOLUNTEER_DELIVERY";
    const isValidStatus = ["PENDING", "VOLUNTEER_ASSIGNED", "REQUESTED"].includes(d.status) || (d.status === "ACCEPTED" && d.volunteerRequired === true);

    return isVolunteerType && isValidStatus;
  });

  // My active tasks assigned to this volunteer
  const myPickups = allDonations.filter(
    (d) =>
      (d.volunteer_id === uid || d.assignedVolunteer === currentUser?.name) &&
      ["VOLUNTEER_ASSIGNED", "PICKUP_STARTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"].includes(d.status)
  );

  const completedCount = allDonations.filter(
    (d) =>
      (d.volunteer_id === uid || d.assignedVolunteer === currentUser?.name) &&
      d.status === "COMPLETED"
  ).length;

  // Live GPS tracking watcher for active volunteer deliveries
  useEffect(() => {
    let watchId = null;
    const activeTask = myPickups.find((t) =>
      ["VOLUNTEER_ASSIGNED", "PICKUP_STARTED", "EN_ROUTE_TO_DONOR", "PICKED_UP", "IN_TRANSIT", "EN_ROUTE_TO_DESTINATION"].includes(t.status)
    );

    if (activeTask && "geolocation" in navigator) {
      setGpsStatus("Requesting GPS permission...");
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const posObj = { lat: latitude, lng: longitude };
          setCurrentVolunteerPos(posObj);
          const timeStr = new Date().toLocaleTimeString();
          setLastGpsTime(timeStr);
          setGpsStatus(`🟢 Live GPS Tracking Active (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) • Updated ${timeStr}`);

          try {
            const taskId = activeTask.id || activeTask._id;
            await updateVolunteerLocationApi(taskId, {
              latitude,
              longitude,
              volunteerId: uid,
              address: activeTask.address,
            });
          } catch (e) {
            console.warn("Volunteer location update notice:", e.message);
          }
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setGpsStatus("⚠️ GPS Permission Denied — Enable location in browser to broadcast live position.");
          } else {
            setGpsStatus("⚠️ GPS Signal Unavailable / Stale Location.");
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 15000,
        }
      );
    } else {
      setGpsStatus("Idle (No Active Task in Progress)");
    }

    return () => {
      if (watchId !== null && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [myPickups, uid]);

  const handleAcceptPickup = async (donationId) => {
    setLoading(true);
    try {
      const res = await assignVolunteer({
        donationId,
        volunteerId: uid,
        volunteerName: currentUser?.name || "Volunteer",
      });
      setLoading(false);
      if (res.success) {
        alert("Pickup accepted! Task added to your active delivery list.");
        fetchDonations();
      } else {
        alert(res.message || "Failed to accept pickup task.");
      }
    } catch (err) {
      setLoading(false);
      alert("Failed to accept pickup task.");
    }
  };

  const handleStatusChange = async (donationId, stage, taskObj = null) => {
    setLoading(true);
    try {
      const res = await updateDeliveryStage(donationId, stage);
      setLoading(false);
      if (res.success) {
        alert(`Status updated to ${stage.replace('_', ' ')}!`);
        if ((stage === "PICKUP_STARTED" || stage === "IN_TRANSIT") && taskObj) {
          const mapsUrl = getGoogleMapsDirectionsUrl(taskObj);
          window.open(mapsUrl, "_blank");
        }
        fetchDonations();
      } else {
        alert(res.message || "Failed to update delivery status.");
      }
    } catch (err) {
      setLoading(false);
      alert("Failed to update status.");
    }
  };

  const getGoogleMapsDirectionsUrl = (task) => {
    const pickupAddr = task.address || "Donor Pickup Location";
    const recipientAddr = task.recipientAddress || task.claimedBy?.address || "";

    const isPickupStage = ["VOLUNTEER_ASSIGNED", "PICKUP_STARTED", "ACCEPTED"].includes(task.status);

    if (isPickupStage) {
      // Stage 1: Volunteer traveling to Donor Pickup Address (e.g. Manval Nagar, Tiruvallur)
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pickupAddr)}&dir_action=navigate`;
    } else {
      // Stage 2: Volunteer traveling from Donor Pickup Address to Recipient Address
      if (recipientAddr && recipientAddr !== "Recipient Address" && recipientAddr !== "Recipient Location") {
        return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickupAddr)}&destination=${encodeURIComponent(recipientAddr)}&dir_action=navigate`;
      }
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pickupAddr)}&dir_action=navigate`;
    }
  };

  return (
    <div style={styles.container}>
      <NavbarHeader
        title={`🚴 ${currentUser?.name || "Volunteer Dashboard"}`}
        subtitle="Rescue surplus food & deliver to local communities"
      />

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3>{availablePickups.length}</h3>
          <p>{t("pickupRequests")}</p>
        </div>
        <div style={styles.statCard}>
          <h3>{myPickups.length}</h3>
          <p>{t("acceptedPickups")}</p>
        </div>
        <div style={styles.statCard}>
          <h3>{completedCount}</h3>
          <p>{t("completedDeliveries")}</p>
        </div>
      </div>

      <div style={{ backgroundColor: "#ffffff", padding: "12px 18px", borderRadius: "12px", margin: "0 20px 15px 20px", borderLeft: "5px solid #1565c0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>📡 Live Volunteer GPS Telemetry Status:</span>
          <p style={{ margin: "2px 0 0 0", fontSize: "14px", fontWeight: "bold", color: gpsStatus.includes("🟢") ? "#2e7d32" : (gpsStatus.includes("Idle") ? "#555" : "#d32f2f") }}>
            {gpsStatus}
          </p>
        </div>
        {lastGpsTime && (
          <span style={{ backgroundColor: "#e3f2fd", color: "#1565c0", padding: "4px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: "bold" }}>
            ⏱️ Last Ping: {lastGpsTime}
          </span>
        )}
      </div>

      <div style={styles.section}>
        <LocationMap
          title="Volunteer Live Route Navigation Map"
          volunteerCoords={currentVolunteerPos ? {
            lat: currentVolunteerPos.lat,
            lng: currentVolunteerPos.lng,
            name: currentUser?.name || "Volunteer"
          } : {
            lat: currentUser?.roleProfiles?.volunteer?.address?.latitude || 17.3850,
            lng: currentUser?.roleProfiles?.volunteer?.address?.longitude || 78.4867,
            name: currentUser?.name || "Volunteer"
          }}
          pickupCoords={myPickups[0] ? {
            lat: myPickups[0]?.pickupLocation?.coordinates?.[1] || 17.3850,
            lng: myPickups[0]?.pickupLocation?.coordinates?.[0] || 78.4867,
            address: myPickups[0]?.address
          } : null}
          dropoffCoords={myPickups[0] ? {
            lat: myPickups[0]?.dropoffLocation?.coordinates?.[1] || myPickups[0]?.pickupLocation?.coordinates?.[1] || 13.0280,
            lng: myPickups[0]?.dropoffLocation?.coordinates?.[0] || myPickups[0]?.pickupLocation?.coordinates?.[0] || 80.0158,
            address: myPickups[0]?.recipientAddress || myPickups[0]?.claimedBy?.address
          } : null}
          routeLabel={myPickups[0] ? `Route: Pickup ${myPickups[0]?.food_name || "Food"} -> Deliver to Recipient` : "Live Delivery Route"}
        />
      </div>

      {/* Active Tasks in Progress */}
      {myPickups.length > 0 && (
        <div style={styles.activeBox}>
          <h3 style={{ margin: "0 0 12px 0", color: "#1565c0" }}>🚨 My Active Delivery Tasks ({myPickups.length})</h3>
          {myPickups.map((task) => {
            const taskId = task.id || task._id;
            const recipientName = task.recipientName || "Pending Recipient";
            const recipientRole = task.recipientRole || "Recipient";
            const isPickupStage = ["VOLUNTEER_ASSIGNED", "PICKUP_STARTED", "ACCEPTED"].includes(task.status);

            return (
              <div key={taskId} style={styles.taskCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <h4 style={{ margin: 0, color: "#1565c0", fontSize: "16px" }}>
                    {task.food_name || task.foodName} ({task.quantity} {task.unit || "Packs"})
                  </h4>
                  <span style={styles.statusBadge(task.status)}>{task.status}</span>
                </div>

                {/* Donor & Recipient Details */}
                <div style={styles.partyGrid}>
                  <div style={styles.partyCol}>
                    <span style={styles.partyTitle}>📍 Pickup From Donor</span>
                    <p style={{ margin: "2px 0", fontSize: "13px", fontWeight: "bold" }}>{task.donor_name}</p>
                    {task.donor_phone && <p style={{ margin: "2px 0", fontSize: "12px", color: "#555" }}>📞 {task.donor_phone}</p>}
                    <p style={{ margin: "2px 0", fontSize: "12px", color: "#666" }}>Address: {task.address}</p>
                  </div>

                  <div style={styles.partyCol}>
                    <span style={styles.partyTitle}>📦 Deliver To Recipient</span>
                    <p style={{ margin: "2px 0", fontSize: "13px", fontWeight: "bold" }}>{recipientName} ({recipientRole})</p>
                    {task.recipientPhone && <p style={{ margin: "2px 0", fontSize: "12px", color: "#555" }}>📞 {task.recipientPhone}</p>}
                    <p style={{ margin: "2px 0", fontSize: "12px", color: "#666" }}>Address: {task.recipientAddress || "Recipient Address"}</p>
                  </div>
                </div>

                {/* Turn-by-Turn Google Maps Navigation Link */}
                <div style={{ margin: "12px 0 14px 0" }}>
                  <a
                    href={getGoogleMapsDirectionsUrl(task)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#1565c0",
                      color: "white",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    🗺️ {isPickupStage ? `Get Directions to Donor Pickup: ${task.address || "Donor Location"}` : `Get Directions to Recipient: ${task.recipientAddress || "Recipient Location"}`}
                  </a>
                </div>

                {/* Workflow Buttons */}
                <div style={styles.btnRow}>
                  {task.status === "VOLUNTEER_ASSIGNED" && (
                    <button
                      style={styles.actionBtn("#1565c0")}
                      onClick={() => handleStatusChange(taskId, "PICKUP_STARTED", task)}
                      disabled={loading}
                    >
                      🚀 1. Start Pickup Route
                    </button>
                  )}

                  {(task.status === "VOLUNTEER_ASSIGNED" || task.status === "PICKUP_STARTED") && (
                    <button
                      style={styles.actionBtn("#e65100")}
                      onClick={() => handleStatusChange(taskId, "PICKED_UP", task)}
                      disabled={loading}
                    >
                      📦 2. Mark "Picked Up From Donor"
                    </button>
                  )}

                  {task.status === "PICKED_UP" && (
                    <button
                      style={styles.actionBtn("#1565c0")}
                      onClick={() => handleStatusChange(taskId, "IN_TRANSIT", task)}
                      disabled={loading}
                    >
                      🚚 3. Start Delivery (In Transit)
                    </button>
                  )}

                  {(task.status === "IN_TRANSIT" || task.status === "DELIVERED") && (
                    <button
                      style={styles.actionBtn("#2e7d32")}
                      onClick={() => handleStatusChange(taskId, "DELIVERED")}
                      disabled={loading}
                    >
                      ✅ 4. Mark "Delivered To NGO/Receiver"
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Available Pickup Tasks */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📦 Available Open Pickup Tasks ({availablePickups.length})</h3>

        {availablePickups.length === 0 ? (
          <div style={styles.emptyCard}>
            <p>No available pickup requests requiring volunteer support right now.</p>
          </div>
        ) : (
          availablePickups.map((donation) => {
            const donId = donation.id || donation._id;
            const recipientName = donation.recipientName || "Open Recipient";
            const recipientRole = donation.recipientRole || "NGO / Receiver";

            return (
              <div key={donId} style={styles.donationCard}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: "#2e7d32", fontSize: "16px" }}>{donation.food_name || donation.foodName}</h4>
                  <p style={{ margin: "4px 0", color: "#555", fontSize: "13px" }}>
                    Quantity: <strong>{donation.quantity} {donation.unit || "Packs"}</strong> • Category: {donation.category}
                  </p>
                  <p style={{ margin: "2px 0", color: "#333", fontSize: "12px" }}>
                    📍 <strong>Pickup Address:</strong> {donation.address} (Donor: {donation.donor_name})
                  </p>
                  <p style={{ margin: "2px 0", color: "#1565c0", fontSize: "12px" }}>
                    📦 <strong>Intended Recipient:</strong> {recipientName} ({recipientRole})
                  </p>
                </div>

                <button
                  style={styles.acceptBtn}
                  onClick={() => handleAcceptPickup(donId)}
                  disabled={loading}
                >
                  ✓ Accept Task
                </button>
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
  statsGrid: {
    display: "flex",
    gap: "12px",
    padding: "20px",
  },
  statCard: {
    flex: 1,
    background: "white",
    padding: "16px 10px",
    borderRadius: "14px",
    textAlign: "center",
    boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
  },
  section: {
    padding: "0 20px",
    marginBottom: "20px",
  },
  sectionTitle: {
    marginBottom: "15px",
    color: "#1565c0",
  },
  activeBox: {
    margin: "0 20px 20px 20px",
    background: "#e3f2fd",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid #bbdefb",
  },
  taskCard: {
    background: "white",
    padding: "16px",
    borderRadius: "14px",
    marginBottom: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  partyGrid: {
    display: "flex",
    gap: "12px",
    background: "#f8fafd",
    padding: "12px",
    borderRadius: "10px",
    margin: "10px 0",
    border: "1px solid #e1eaf5",
  },
  partyCol: {
    flex: 1,
  },
  partyTitle: {
    fontSize: "11px",
    fontWeight: "bold",
    color: "#1565c0",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "4px",
  },
  btnRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "12px",
  },
  actionBtn: (bgColor) => ({
    padding: "10px 16px",
    backgroundColor: bgColor,
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "13px",
  }),
  statusBadge: (status) => ({
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "bold",
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
  }),
  emptyCard: {
    background: "white",
    padding: "25px",
    borderRadius: "14px",
    textAlign: "center",
    color: "#666",
  },
  donationCard: {
    background: "white",
    padding: "18px",
    borderRadius: "14px",
    marginBottom: "15px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
  },
  acceptBtn: {
    padding: "11px 18px",
    backgroundColor: "#1565c0",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },
};

export default VolunteerDashboard;
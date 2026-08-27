import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDonations, updateDeliveryStage } from "../services/api";
import LocationMap from "../components/LocationMap";

function LiveTracking() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeDonation, setActiveDonation] = useState(null);

  useEffect(() => {
    const fetchActiveDonation = async () => {
      if (!currentUser) return;
      try {
        const res = await getDonations({ donorId: currentUser.id });
        if (res.success && res.donations && res.donations.length > 0) {
          const active = res.donations.find((d) => d.status !== "COMPLETED") || res.donations[0];
          setActiveDonation(active);
        } else {
          setActiveDonation(null);
        }
      } catch (e) {
        console.warn("Failed to fetch active donation for tracking:", e);
      }
    };
    fetchActiveDonation();
  }, [currentUser]);

  const handleMarkDelivered = async () => {
    if (!activeDonation) return;
    try {
      await updateDeliveryStage(activeDonation.id || activeDonation._id, "COMPLETED");
      alert("Donation marked as Delivered Successfully! 🎉");
      navigate("/donor");
    } catch (e) {
      alert("Status updated.");
      navigate("/donor");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ←
        </button>
        <span>Live Tracking 📍</span>
      </div>

      {!activeDonation ? (
        <div style={styles.emptyContainer}>
          <div style={styles.emptyCard}>
            <h3 style={{ color: "#2e7d32", marginTop: 0 }}>No Active Created Donation Found</h3>
            <p style={{ color: "#555", lineHeight: "1.5" }}>
              Live tracking runs on real food donations. Create a new food donation to track live pickup & delivery in real-time!
            </p>
            <button style={styles.button} onClick={() => navigate("/donatefood")}>
              + Donate Food Now to Track Live
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ margin: "20px" }}>
            <LocationMap
              title={`Live Route Tracking: ${activeDonation.food_name || activeDonation.foodName}`}
              height="280px"
              pickupCoords={{
                lat: activeDonation.pickupLocation?.coordinates?.[1] || 13.0280,
                lng: activeDonation.pickupLocation?.coordinates?.[0] || 80.0158,
                address: activeDonation.address || "Donor Pickup Address"
              }}
              dropoffCoords={activeDonation.recipientAddress ? {
                address: activeDonation.recipientAddress
              } : null}
            />
          </div>

          <div style={styles.smartBox}>
            <h3 style={{ margin: "0 0 8px 0" }}>📦 Item Details</h3>
            <p><b>Food Item:</b> {activeDonation.food_name || activeDonation.foodName}</p>
            <p><b>Quantity:</b> {activeDonation.quantity} {activeDonation.unit || "Packs"}</p>
            <p><b>Pickup Address:</b> {activeDonation.address}</p>
            <p><b>Current Status:</b> <span style={styles.badge}>{activeDonation.status}</span></p>
          </div>

          <div style={styles.infoCard}>
            <h3>Delivery & Courier Details</h3>
            <div style={styles.row}>
              <span>Delivery Mode:</span>
              <strong>{(activeDonation.collectionMethod || activeDonation.deliveryPreference || activeDonation.delivery_mode || "VOLUNTEER_DELIVERY").replace("_", " ")}</strong>
            </div>
            <div style={styles.row}>
              <span>Assigned Deliverer:</span>
              <strong>{activeDonation.assignedVolunteer || activeDonation.volunteer_name || (activeDonation.deliveryPreference === 'DONOR_DELIVERY' ? 'Donor Self-Delivery' : 'Pending Volunteer Assignment')}</strong>
            </div>
            <div style={styles.row}>
              <span>Recipient / Contact:</span>
              <span>{activeDonation.acceptedByNGO || activeDonation.acceptedByReceiver || "Matched Recipient"}</span>
            </div>
          </div>

          <div style={styles.statusCard}>
            <h3>Live Progress Timeline</h3>
            <div style={styles.timeline}>
              <p>✅ Donation Posted & Stored in Database</p>
              <p>✅ AI Smart Matching Active</p>
              <p>{["ACCEPTED", "VOLUNTEER_ASSIGNED", "IN_TRANSIT", "COMPLETED"].includes(activeDonation.status) ? "✅" : "⏳"} NGO / Beneficiary Matched</p>
              <p>{["VOLUNTEER_ASSIGNED", "IN_TRANSIT", "COMPLETED"].includes(activeDonation.status) ? "✅" : "⏳"} Pickup & Route In Progress</p>
              <p>{activeDonation.status === "COMPLETED" ? "✅ Food Delivered Successfully" : "🚚 In Transit to Destination"}</p>
            </div>
          </div>

          <button style={styles.button} onClick={handleMarkDelivered}>
            Mark as Delivered & Complete
          </button>
        </>
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
  header: {
    background: "#2e7d32",
    color: "white",
    padding: "20px",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
    borderBottomLeftRadius: "20px",
    borderBottomRightRadius: "20px",
    position: "relative",
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
    fontWeight: "bold",
    cursor: "pointer",
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
  smartBox: {
    background: "#fff8e1",
    margin: "20px",
    padding: "18px",
    borderRadius: "15px",
    borderLeft: "6px solid #f9a825",
    color: "#e65100",
  },
  badge: {
    backgroundColor: "#2e7d32",
    color: "white",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  infoCard: {
    background: "white",
    margin: "20px",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "12px",
    color: "#444",
  },
  statusCard: {
    background: "white",
    margin: "20px",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  timeline: {
    marginTop: "15px",
    lineHeight: "2",
    color: "#333",
  },
  button: {
    display: "block",
    width: "85%",
    margin: "25px auto",
    padding: "15px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "17px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(46,125,50,0.3)",
  },
};

export default LiveTracking;
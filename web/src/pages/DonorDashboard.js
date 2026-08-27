import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getDonations, getPersonalStats } from "../services/api";
import { getSocket, joinUserRoom, joinRoleRoom } from "../services/socket";
import LocationMap from "../components/LocationMap";
import NavbarHeader from "../components/NavbarHeader";

function DonorDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    completedDonations: 0,
    foodSavedKg: 0,
    peopleHelped: 0,
  });

  const fetchData = async () => {
    if (!currentUser) return;
    try {
      const uid = currentUser.id || currentUser._id;
      const resD = await getDonations({ donorId: uid });
      if (resD.success) setDonations(resD.donations);

      const resS = await getPersonalStats(uid);
      if (resS.success) setStats(resS.stats);
    } catch (e) {
      console.warn("Failed to fetch donor data:", e);
    }
  };

  const donorProfileAddr = currentUser?.roleProfiles?.donor?.address?.formattedAddress || currentUser?.donorAddress || "";

  useEffect(() => {
    if (currentUser && !donorProfileAddr) {
      navigate("/donorsetup");
    }
  }, [currentUser, donorProfileAddr, navigate]);

  useEffect(() => {
    fetchData();

    const socket = getSocket();
    const uid = currentUser?.id || currentUser?._id;
    if (uid) {
      joinUserRoom(uid);
      joinRoleRoom("DONOR");
    }

    const handleRealtimeUpdate = () => {
      fetchData();
    };

    socket.on("donation:claimed", handleRealtimeUpdate);
    socket.on("delivery:status_change", handleRealtimeUpdate);
    socket.on("donation:completed", handleRealtimeUpdate);
    socket.on("notification:new", handleRealtimeUpdate);

    return () => {
      socket.off("donation:claimed", handleRealtimeUpdate);
      socket.off("delivery:status_change", handleRealtimeUpdate);
      socket.off("donation:completed", handleRealtimeUpdate);
      socket.off("notification:new", handleRealtimeUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const selfModes = ["BENEFICIARY_SELF_PICKUP", "SELF_COLLECTION", "DONOR_DELIVERY", "SELF_DELIVERY", "RECEIVER_PICKUP"];
  const activeDonationsList = donations.filter((d) => d.status !== "COMPLETED");
  const activeTaskInPickup = donations.find(
    (d) =>
      d.volunteerRequired !== false &&
      !selfModes.includes(d.collectionMethod) &&
      !selfModes.includes(d.deliveryPreference) &&
      ["VOLUNTEER_ASSIGNED", "PICKUP_STARTED", "PICKED_UP", "IN_TRANSIT"].includes(d.status)
  );

  return (
    <div style={styles.container}>
      <NavbarHeader
        title={`Welcome, ${currentUser?.name || "Donor"}`}
        subtitle="Manage your food donations & track rescue progress"
      />

      <div style={styles.statsContainer}>
        <div style={styles.card}>
          <h3>{stats.totalDonations}</h3>
          <p>{t("totalDonations")}</p>
        </div>

        <div style={styles.card}>
          <h3>{stats.foodSavedKg} Kg</h3>
          <p>{t("foodSavedKg")}</p>
        </div>

        <div style={styles.card}>
          <h3>{stats.peopleHelped}</h3>
          <p>{t("peopleHelped")}</p>
        </div>
      </div>

      <button style={styles.donateBtn} onClick={() => navigate("/donatefood")}>
        + {t("donateFoodBtn")}
      </button>

      <div style={styles.quickContainer}>
        <div style={styles.quickCard} onClick={() => navigate("/activedonations")}>
          📦
          <p>{t("activeDonations")} ({activeDonationsList.length})</p>
        </div>

        <div style={styles.quickCard} onClick={() => navigate("/livetracking")}>
          📍
          <p>{t("liveTracking")}</p>
        </div>

        <div style={styles.quickCard} onClick={() => navigate("/history")}>
          📜
          <p>{t("donationHistory")}</p>
        </div>

        <div style={styles.quickCard} onClick={() => navigate("/gallery")}>
          📸
          <p>{t("communityTrust")}</p>
        </div>
      </div>

      {activeTaskInPickup && (
        <div style={styles.volunteerTrackingBanner}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h4 style={{ margin: 0, color: "#1565c0", fontSize: "15px", fontWeight: "bold" }}>
                {(activeTaskInPickup.collectionMethod === 'DONOR_DELIVERY' || activeTaskInPickup.deliveryPreference === 'DONOR_DELIVERY')
                  ? `🚗 Delivery Status: ${activeTaskInPickup.status.replace("_", " ")} (Donor Self-Delivery)`
                  : `🚴 Volunteer Status: ${activeTaskInPickup.status.replace("_", " ")}`}
              </h4>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#333" }}>
                <strong>Food Item:</strong> {activeTaskInPickup.food_name || activeTaskInPickup.foodName} | 
                <strong> Mode:</strong> {(activeTaskInPickup.collectionMethod === 'DONOR_DELIVERY' || activeTaskInPickup.deliveryPreference === 'DONOR_DELIVERY') ? "Donor Self-Delivery" : `Volunteer (${activeTaskInPickup.assignedVolunteer || "Assigning..."})`} | 
                <strong> Pickup:</strong> {activeTaskInPickup.address}
              </p>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(activeTaskInPickup.address)}&destination=${encodeURIComponent((activeTaskInPickup.recipientAddress && activeTaskInPickup.recipientAddress !== 'Recipient Location' && activeTaskInPickup.recipientAddress !== 'Recipient Address') ? activeTaskInPickup.recipientAddress : '')}&travelmode=driving`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.gmapsTrackBtn}
            >
              🗺️ {(activeTaskInPickup.collectionMethod === 'DONOR_DELIVERY' || activeTaskInPickup.deliveryPreference === 'DONOR_DELIVERY') ? "Open Navigation to Recipient" : "Track Volunteer Live Navigation"}
            </a>
          </div>
        </div>
      )}

      <div style={styles.section}>
        <LocationMap
          title="My Donor Location & Nearby Food Rescue Points"
          pickupCoords={activeTaskInPickup ? {
            lat: activeTaskInPickup.pickupLocation?.coordinates?.[1] || currentUser?.roleProfiles?.donor?.address?.latitude || 17.3850,
            lng: activeTaskInPickup.pickupLocation?.coordinates?.[0] || currentUser?.roleProfiles?.donor?.address?.longitude || 78.4867,
            address: activeTaskInPickup.address
          } : {
            lat: currentUser?.roleProfiles?.donor?.address?.latitude || 17.3850,
            lng: currentUser?.roleProfiles?.donor?.address?.longitude || 78.4867,
            address: donorProfileAddr || "Donor Address"
          }}
        />
        <h3 style={styles.sectionTitle}>{t("recentDonations")}</h3>

        {donations.length === 0 ? (
          <div style={styles.emptyCard}>
            <p>No donations posted yet. Click "+ Donate Food Now" to make your first donation!</p>
          </div>
        ) : (
          donations.slice(0, 5).map((donation) => {
            const isSelfColl =
              selfModes.includes(donation.collectionMethod) ||
              selfModes.includes(donation.deliveryPreference) ||
              selfModes.includes(donation.deliveryMode) ||
              donation.volunteerRequired === false ||
              donation.status === 'ACCEPTED_SELF_COLLECTION';

            const recipientText = donation.recipientName
              ? `${donation.recipientRole || 'Recipient'}: ${donation.recipientName}`
              : donation.intendedRecipient === 'NGO'
              ? 'Intended for NGOs'
              : donation.intendedRecipient === 'RECEIVER'
              ? 'Intended for Receivers'
              : 'Open to All';

            const volunteerText = isSelfColl
              ? ' | Volunteer: Not required'
              : donation.assignedVolunteer
              ? ` | Volunteer: ${donation.assignedVolunteer}`
              : ' | Volunteer: Pending Assignment';

            const deliveryModeDisplay = isSelfColl
              ? 'Beneficiary Self Collection'
              : (donation.deliveryPreference || donation.deliveryMode || '').replace('_', ' ');

            return (
              <div
                key={donation.id || donation._id}
                style={styles.donationCard}
                onClick={() => navigate("/activedonations")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ margin: 0, color: "#2e7d32", fontSize: "16px" }}>{donation.food_name || donation.foodName}</h4>
                    <p style={{ margin: "4px 0", color: "#555", fontSize: "13px" }}>
                      Quantity: <strong>{donation.quantity} {donation.unit || "Packs"}</strong> • Delivery: <strong>{deliveryModeDisplay}</strong>
                    </p>
                    <p style={{ margin: "4px 0", color: "#444", fontSize: "13px" }}>
                      🤝 <strong>{recipientText}</strong>{volunteerText}
                    </p>
                    <p style={{ margin: "4px 0", color: "#777", fontSize: "12px" }}>
                      📍 {donation.address}
                    </p>
                  </div>
                  <span style={styles.statusBadge(donation.status)}>
                    {donation.status === 'ACCEPTED_SELF_COLLECTION' ? 'SELF COLLECTION' : donation.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={styles.banner}>
        🌍 Together we have saved {stats.foodSavedKg} Kg of food from being wasted!
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
    background: "linear-gradient(to right, #2e7d32, #66bb6a)",
    padding: "25px",
    borderBottomLeftRadius: "25px",
    borderBottomRightRadius: "25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white",
  },
  welcome: {
    margin: 0,
    fontSize: "24px",
  },
  subtitle: {
    marginTop: "8px",
    color: "#e8f5e9",
    fontSize: "14px",
  },
  roleBtn: {
    marginTop: "12px",
    padding: "7px 14px",
    background: "white",
    color: "#2e7d32",
    border: "none",
    borderRadius: "20px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "13px",
  },
  rightIcons: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  impactIcon: {
    fontSize: "26px",
    cursor: "pointer",
  },
  notifyIcon: {
    fontSize: "26px",
    cursor: "pointer",
  },
  profile: {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    border: "3px solid white",
    objectFit: "cover",
    cursor: "pointer",
  },
  statsContainer: {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    marginTop: "20px",
    gap: "15px",
    padding: "0 15px",
  },
  card: {
    background: "white",
    flex: "1",
    minWidth: "90px",
    padding: "15px 10px",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },
  donateBtn: {
    display: "block",
    width: "85%",
    margin: "25px auto",
    padding: "15px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "15px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(46,125,50,0.4)",
  },
  quickContainer: {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    padding: "0 15px",
    marginBottom: "20px",
    gap: "10px",
  },
  quickCard: {
    background: "white",
    flex: "1",
    minWidth: "75px",
    padding: "15px 8px",
    borderRadius: "14px",
    textAlign: "center",
    boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#2e7d32",
    fontSize: "13px",
  },
  section: {
    padding: "0 20px",
  },
  sectionTitle: {
    marginBottom: "15px",
    color: "#2e7d32",
  },
  emptyCard: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    color: "#777",
  },
  donationCard: {
    background: "white",
    padding: "16px",
    borderRadius: "14px",
    marginBottom: "12px",
    boxShadow: "0 3px 8px rgba(0,0,0,0.06)",
    cursor: "pointer",
  },
  statusBadge: (status) => ({
    padding: "5px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
    backgroundColor:
      status === "COMPLETED" ? "#e8f5e9" : status === "PENDING" ? "#fff3e0" : "#e3f2fd",
    color:
      status === "COMPLETED" ? "#2e7d32" : status === "PENDING" ? "#e65100" : "#1565c0",
  }),
  banner: {
    background: "#c8e6c9",
    margin: "20px",
    padding: "16px",
    borderRadius: "15px",
    textAlign: "center",
    fontWeight: "bold",
    color: "#1b5e20",
    fontSize: "14px",
  },
  volunteerTrackingBanner: {
    backgroundColor: "#e3f2fd",
    border: "2px solid #1565c0",
    borderRadius: "16px",
    margin: "15px 20px",
    padding: "16px",
    boxShadow: "0 4px 12px rgba(21, 101, 192, 0.15)",
  },
  gmapsTrackBtn: {
    backgroundColor: "#1565c0",
    color: "white",
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "bold",
    textDecoration: "none",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    display: "inline-flex",
    alignItems: "center",
  },
};

export default DonorDashboard;
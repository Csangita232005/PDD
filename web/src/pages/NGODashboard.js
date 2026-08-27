import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getDonations, claimDonationApi, updateDeliveryStage } from "../services/api";
import { getSocket, joinUserRoom, joinRoleRoom } from "../services/socket";
import LocationMap from "../components/LocationMap";
import NavbarHeader from "../components/NavbarHeader";

function NGODashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Accept Modal State
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [collectionMethod, setCollectionMethod] = useState("VOLUNTEER_DELIVERY");

  const ngoProfileAddr = currentUser?.roleProfiles?.ngo?.address?.formattedAddress || currentUser?.ngoAddress || "";

  useEffect(() => {
    if (currentUser && !ngoProfileAddr) {
      navigate("/ngosetup");
    }
  }, [currentUser, ngoProfileAddr, navigate]);

  const fetchDonations = async () => {
    try {
      const res = await getDonations();
      if (res.success) setAllDonations(res.donations || []);
    } catch (e) {
      console.warn("Failed to fetch donations for NGO:", e);
    }
  };

  useEffect(() => {
    fetchDonations();

    const socket = getSocket();
    const uid = currentUser?.id || currentUser?._id;
    if (uid) {
      joinUserRoom(uid);
      joinRoleRoom("NGO");
    }

    const handleRealtimeUpdate = () => fetchDonations();

    socket.on("donation:created", handleRealtimeUpdate);
    socket.on("donation:claimed", handleRealtimeUpdate);
    socket.on("delivery:status_change", handleRealtimeUpdate);
    socket.on("donation:completed", handleRealtimeUpdate);
    socket.on("notification:new", handleRealtimeUpdate);

    return () => {
      socket.off("donation:created", handleRealtimeUpdate);
      socket.off("donation:claimed", handleRealtimeUpdate);
      socket.off("delivery:status_change", handleRealtimeUpdate);
      socket.off("donation:completed", handleRealtimeUpdate);
      socket.off("notification:new", handleRealtimeUpdate);
    };
  }, [currentUser]);

  const uid = currentUser?.id || currentUser?._id;

  // Filter available donations intended for NGOs or ALL
  const availableDonations = allDonations.filter(
    (d) =>
      d.status === "PENDING" &&
      (!d.ngo_id || d.ngo_id === "") &&
      (!d.receiver_id || d.receiver_id === "") &&
      (d.intendedRecipient === "NGO" || d.intendedRecipient === "ALL" || !d.intendedRecipient)
  );

  // Filter donations accepted by this NGO
  const ngoAcceptedDonations = allDonations.filter(
    (d) =>
      (d.ngo_id === uid ||
        (d.claimedBy?.role === "NGO" && d.claimedBy?.userId === uid) ||
        d.acceptedByNGO === currentUser?.name) &&
      d.status !== "COMPLETED"
  );

  const completedDeliveries = allDonations.filter(
    (d) =>
      (d.ngo_id === uid ||
        (d.claimedBy?.role === "NGO" && d.claimedBy?.userId === uid) ||
        d.acceptedByNGO === currentUser?.name) &&
      d.status === "COMPLETED"
  );

  const handleOpenAcceptModal = (donation) => {
    setSelectedDonation(donation);
    const isDonorSelf =
      donation.deliveryPreference === "DONOR_DELIVERY" ||
      donation.deliveryMode === "DONOR_DELIVERY" ||
      donation.deliveryPreference === "SELF_DELIVERY" ||
      donation.deliveryMode === "SELF_DELIVERY";
    setCollectionMethod(isDonorSelf ? "DONOR_DELIVERY" : "VOLUNTEER_DELIVERY");
  };

  const handleConfirmAccept = async () => {
    if (!selectedDonation) return;
    setLoading(true);
    try {
      const donId = selectedDonation.id || selectedDonation._id;
      const res = await claimDonationApi(donId, {
        userRole: "NGO",
        userId: uid,
        userName: currentUser?.name || "NGO Partner",
        collectionMethod,
        userPhone: currentUser?.mobile || "",
        userAddress: currentUser?.ngoAddress || currentUser?.address || "",
      });
      setLoading(false);
      setSelectedDonation(null);
      if (res.success) {
        alert("Donation accepted successfully!");
        fetchDonations();
      } else {
        alert(res.message || "Failed to accept donation.");
      }
    } catch (err) {
      setLoading(false);
      alert("Failed to accept donation.");
    }
  };

  const handleConfirmReceived = async (donationId) => {
    setLoading(true);
    try {
      const res = await updateDeliveryStage(donationId, "COMPLETED");
      setLoading(false);
      if (res.success) {
        alert("Food Receipt Confirmed! 🎉 Thank you for rescuing food.");
        fetchDonations();
      } else {
        alert(res.message || "Failed to confirm receipt.");
      }
    } catch (e) {
      setLoading(false);
      alert("Failed to confirm receipt.");
    }
  };

  return (
    <div style={styles.container}>
      <NavbarHeader
        title={`🏛️ ${currentUser?.name || "NGO Dashboard"}`}
        subtitle="Connecting surplus food to local shelters & communities"
      />

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3>{availableDonations.length}</h3>
          <p>{t("availableDonations")}</p>
        </div>

        <div style={styles.statCard}>
          <h3>{ngoAcceptedDonations.length}</h3>
          <p>{t("acceptedDonations")}</p>
        </div>

        <div style={styles.statCard}>
          <h3>{completedDeliveries.length}</h3>
          <p>{t("completedDeliveries")}</p>
        </div>
      </div>

      {/* NGO Accepted Donations Section */}
      {ngoAcceptedDonations.length > 0 && (
        <div style={styles.acceptedSection}>
          <h3 style={{ margin: "0 0 12px 0", color: "#1b5e20" }}>📋 Accepted NGO Food Deliveries ({ngoAcceptedDonations.length})</h3>
          {ngoAcceptedDonations.map((item) => {
            const donId = item.id || item._id;
            return (
              <div key={donId} style={styles.acceptedCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h4 style={{ margin: 0, color: "#2e7d32", fontSize: "16px" }}>{item.food_name || item.foodName}</h4>
                    <p style={{ margin: "4px 0", fontSize: "13px" }}>
                      Quantity: <strong>{item.quantity} {item.unit || "Packs"}</strong> • Category: {item.category}
                    </p>
                    <p style={{ margin: "4px 0", fontSize: "13px", color: "#333" }}>
                      👤 <strong>Donor:</strong> {item.donor_name} {item.donor_phone && `(📞 ${item.donor_phone})`}
                    </p>
                    <p style={{ margin: "4px 0", fontSize: "13px", color: "#333" }}>
                      📍 <strong>Pickup Address:</strong> {item.address}
                    </p>
                    <p style={{ margin: "4px 0", fontSize: "13px", color: "#1565c0" }}>
                      🚚 <strong>Collection Method:</strong> {(item.collectionMethod || item.deliveryPreference || '').replace('_', ' ')}
                    </p>
                    {item.assignedVolunteer && (
                      <p style={{ margin: "4px 0", fontSize: "13px", color: "#1565c0" }}>
                        🚴 <strong>Volunteer:</strong> {item.assignedVolunteer} {item.volunteerPhone && `(📞 ${item.volunteerPhone})`}
                      </p>
                    )}
                    <p style={{ margin: "4px 0", fontSize: "12px", color: "#555" }}>
                      Current Status: <strong style={{ color: "#2e7d32" }}>{item.status}</strong>
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(item.address || 'Donor Location')}&destination=${encodeURIComponent((item.recipientAddress && item.recipientAddress !== 'NGO Center Location' && item.recipientAddress !== 'Recipient Location') ? item.recipientAddress : (currentUser?.address || ''))}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: "#2e7d32",
                        color: "white",
                        padding: "8px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      🗺️ {item.collectionMethod === 'DONOR_DELIVERY' || item.deliveryPreference === 'DONOR_DELIVERY' ? '🚗 Track Incoming Donor Route' : '🚴 Track Incoming Delivery Route'}
                    </a>

                    <button
                      style={styles.confirmBtn}
                      onClick={() => handleConfirmReceived(donId)}
                      disabled={loading}
                    >
                      ✓ Confirm Food Received
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Available Food Listings */}
      <div style={styles.section}>
        <LocationMap
          title={ngoAcceptedDonations[0] ? `Live Delivery Map: ${ngoAcceptedDonations[0].food_name || 'Food Claim'} (${ngoAcceptedDonations[0].status})` : "NGO Service Area & Live Food Listings Map"}
          pickupCoords={ngoAcceptedDonations[0] ? {
            lat: ngoAcceptedDonations[0].pickupLocation?.coordinates?.[1] || currentUser?.roleProfiles?.ngo?.address?.latitude || 17.3850,
            lng: ngoAcceptedDonations[0].pickupLocation?.coordinates?.[0] || currentUser?.roleProfiles?.ngo?.address?.longitude || 78.4867,
            address: ngoAcceptedDonations[0].address || "Donor Pickup Address"
          } : {
            lat: currentUser?.roleProfiles?.ngo?.address?.latitude || 17.3850,
            lng: currentUser?.roleProfiles?.ngo?.address?.longitude || 78.4867,
            address: ngoProfileAddr || "NGO Address"
          }}
          dropoffCoords={ngoAcceptedDonations[0] ? {
            address: (ngoAcceptedDonations[0].recipientAddress && ngoAcceptedDonations[0].recipientAddress !== 'NGO Center Location' && ngoAcceptedDonations[0].recipientAddress !== 'Recipient Location') ? ngoAcceptedDonations[0].recipientAddress : (ngoProfileAddr || 'NGO Location')
          } : (ngoProfileAddr ? { address: ngoProfileAddr } : null)}
          role="NGO"
        />
        <h3 style={styles.sectionTitle}>🔥 {t("availableDonations")} (Intended for NGOs)</h3>

        {availableDonations.length === 0 ? (
          <div style={styles.emptyCard}>
            <p>No available pending donations intended for NGOs right now. Check back soon!</p>
          </div>
        ) : (
          availableDonations.map((donation) => {
            const donId = donation.id || donation._id;
            return (
              <div key={donId} style={styles.donationCard}>
                {donation.imageUrl && (
                  <img src={donation.imageUrl} alt="food" style={styles.foodImg} />
                )}
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: "#2e7d32", fontSize: "17px" }}>{donation.food_name || donation.foodName}</h4>
                  <p style={{ margin: "4px 0", color: "#444", fontSize: "14px" }}>
                    Quantity: <strong>{donation.quantity} {donation.unit || "Packs"}</strong> • Category: {donation.category}
                  </p>
                  <p style={{ margin: "4px 0", color: "#666", fontSize: "13px" }}>
                    📍 {donation.address}
                  </p>
                  <p style={{ margin: "4px 0", color: "#777", fontSize: "12px" }}>
                    Donor: <strong>{donation.donor_name || "Donor"}</strong> ({donation.donor_phone || "Contact active"})
                  </p>
                </div>

                <div style={styles.actionCol}>
                  <button
                    style={styles.acceptBtn}
                    onClick={() => handleOpenAcceptModal(donation)}
                    disabled={loading}
                  >
                    ✓ Accept Donation
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Accept Donation Modal */}
      {selectedDonation && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: "0 0 10px 0", color: "#2e7d32" }}>Accept Donation Request 🍱</h3>
            <p style={{ fontSize: "14px", margin: "4px 0" }}>
              <strong>Item:</strong> {selectedDonation.food_name || selectedDonation.foodName} ({selectedDonation.quantity} {selectedDonation.unit || "Packs"})
            </p>
            <p style={{ fontSize: "13px", margin: "4px 0", color: "#555" }}>
              <strong>Pickup Address:</strong> {selectedDonation.address}
            </p>

            {(selectedDonation.deliveryPreference === "DONOR_DELIVERY" ||
              selectedDonation.deliveryMode === "DONOR_DELIVERY" ||
              selectedDonation.deliveryPreference === "SELF_DELIVERY" ||
              selectedDonation.deliveryMode === "SELF_DELIVERY") ? (
              <div style={{ backgroundColor: "#e8f5e9", padding: "12px", borderRadius: "10px", margin: "12px 0", border: "1px solid #c8e6c9" }}>
                <strong style={{ color: "#2e7d32", fontSize: "13px", display: "block" }}>🚗 Donor Self-Delivery Confirmed</strong>
                <span style={{ fontSize: "12px", color: "#555" }}>
                  The donor will deliver this food directly to your address. No collection method selection is needed.
                </span>
              </div>
            ) : (
              <>
                <label style={styles.modalLabel}>Choose Collection Method *</label>
                <select
                  style={styles.modalSelect}
                  value={collectionMethod}
                  onChange={(e) => setCollectionMethod(e.target.value)}
                >
                  <option value="VOLUNTEER_DELIVERY">🚴 Request Volunteer Pickup (Volunteer will pick up & deliver)</option>
                  <option value="SELF_COLLECTION">🏛️ NGO Self-Collection (NGO will collect directly from donor)</option>
                </select>
              </>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button style={styles.modalConfirmBtn} onClick={handleConfirmAccept} disabled={loading}>
                {loading ? "Accepting..." : "Confirm & Accept"}
              </button>
              <button style={styles.modalCancelBtn} onClick={() => setSelectedDonation(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
  acceptedSection: {
    margin: "0 20px 20px 20px",
    background: "#e8f5e9",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid #c8e6c9",
  },
  acceptedCard: {
    background: "white",
    padding: "14px",
    borderRadius: "12px",
    marginBottom: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  confirmBtn: {
    padding: "10px 16px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "13px",
  },
  section: {
    padding: "0 20px",
  },
  sectionTitle: {
    color: "#2e7d32",
    marginBottom: "15px",
  },
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
    gap: "15px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  foodImg: {
    width: "70px",
    height: "70px",
    borderRadius: "12px",
    objectFit: "cover",
  },
  actionCol: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: "140px",
  },
  acceptBtn: {
    padding: "11px 16px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "15px",
  },
  modalContent: {
    background: "white",
    padding: "22px",
    borderRadius: "18px",
    maxWidth: "420px",
    width: "100%",
    boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
  },
  modalLabel: {
    display: "block",
    fontWeight: "bold",
    fontSize: "13px",
    marginTop: "12px",
    marginBottom: "4px",
  },
  modalSelect: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "13px",
  },
  modalConfirmBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  modalCancelBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#eee",
    color: "#333",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default NGODashboard;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getDonations, claimDonationApi, updateDeliveryStage } from "../services/api";
import { getSocket, joinUserRoom, joinRoleRoom } from "../services/socket";
import LocationMap from "../components/LocationMap";
import NavbarHeader from "../components/NavbarHeader";

function ReceiverDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [availableFood, setAvailableFood] = useState([]);
  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [collectionMethod, setCollectionMethod] = useState("VOLUNTEER_DELIVERY");

  const uid = currentUser?.id || currentUser?._id;
  const beneficiaryProfileAddr = currentUser?.roleProfiles?.beneficiary?.address?.formattedAddress || currentUser?.receiverAddress || "";

  useEffect(() => {
    if (currentUser && !beneficiaryProfileAddr) {
      navigate("/receiversetup");
    }
  }, [currentUser, beneficiaryProfileAddr, navigate]);

  const fetchDonations = async () => {
    try {
      const res = await getDonations();
      if (res.success) {
        setAllDonations(res.donations || []);
        const avail = (res.donations || []).filter(
          (d) =>
            d.status === "PENDING" &&
            (!d.ngo_id || d.ngo_id === "") &&
            (!d.receiver_id || d.receiver_id === "") &&
            (d.intendedRecipient === "RECEIVER" || d.intendedRecipient === "ALL" || !d.intendedRecipient)
        );
        setAvailableFood(avail);
      }
    } catch (e) {
      console.warn("Failed to fetch donations for Receiver:", e);
    }
  };

  useEffect(() => {
    fetchDonations();

    const socket = getSocket();
    if (uid) {
      joinUserRoom(uid);
      joinRoleRoom("RECEIVER");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const myRequestedDonations = allDonations.filter(
    (d) =>
      (d.receiver_id === uid ||
        (d.claimedBy?.role === "RECEIVER" && d.claimedBy?.userId === uid) ||
        d.acceptedByReceiver === currentUser?.name ||
        d.requests?.some((r) => r.userId === uid && r.userRole === "RECEIVER")) &&
      d.status !== "COMPLETED"
  );

  const myHistoryDonations = allDonations.filter(
    (d) =>
      (d.receiver_id === uid ||
        (d.claimedBy?.role === "RECEIVER" && d.claimedBy?.userId === uid) ||
        d.acceptedByReceiver === currentUser?.name) &&
      d.status === "COMPLETED"
  );

  const handleOpenRequestModal = (donation) => {
    setSelectedDonation(donation);
    const isDonorSelf =
      donation.deliveryPreference === "DONOR_DELIVERY" ||
      donation.deliveryMode === "DONOR_DELIVERY" ||
      donation.deliveryPreference === "SELF_DELIVERY" ||
      donation.deliveryMode === "SELF_DELIVERY";
    setCollectionMethod(isDonorSelf ? "DONOR_DELIVERY" : "VOLUNTEER_DELIVERY");
  };

  const handleConfirmRequest = async () => {
    if (!selectedDonation) return;
    setLoading(true);
    try {
      const donId = selectedDonation.id || selectedDonation._id;
      const res = await claimDonationApi(donId, {
        userRole: "RECEIVER",
        userId: uid,
        userName: currentUser?.name || "Receiver",
        collectionMethod,
        userPhone: currentUser?.mobile || "",
        userAddress: currentUser?.receiverAddress || currentUser?.address || "",
      });
      setLoading(false);
      setSelectedDonation(null);
      if (res.success) {
        alert("Food request submitted successfully!");
        fetchDonations();
      } else {
        alert(res.message || "Failed to request food.");
      }
    } catch (err) {
      setLoading(false);
      alert("Failed to request food.");
    }
  };

  const handleConfirmReceived = async (donationId) => {
    setLoading(true);
    try {
      const res = await updateDeliveryStage(donationId, "COMPLETED");
      setLoading(false);
      if (res.success) {
        navigate(`/thankyou?donationId=${donationId}`);
      }
    } catch (err) {
      setLoading(false);
      alert("Failed to confirm food.");
    }
  };

  return (
    <div style={styles.container}>
      <NavbarHeader
        title={`🤲 ${currentUser?.name || "Receiver Dashboard"}`}
        subtitle="Browse available food donations & track active requests"
      />

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3>{availableFood.length}</h3>
          <p>{t("availableFoodItems")}</p>
        </div>
        <div style={styles.statCard}>
          <h3>{myRequestedDonations.length}</h3>
          <p>My Active Requests</p>
        </div>
        <div style={styles.statCard}>
          <h3>{myHistoryDonations.length}</h3>
          <p>Meals Received</p>
        </div>
      </div>

      <div style={styles.section}>
        <LocationMap
          title={myRequestedDonations[0] ? `Live Delivery Map: ${myRequestedDonations[0].food_name || 'Food Request'} (${myRequestedDonations[0].status})` : "Nearby Available Food Supply & Drop-off Points Map"}
          pickupCoords={myRequestedDonations[0] ? {
            lat: myRequestedDonations[0].pickupLocation?.coordinates?.[1] || 13.0280,
            lng: myRequestedDonations[0].pickupLocation?.coordinates?.[0] || 80.0158,
            address: myRequestedDonations[0].address || "Donor Pickup Address"
          } : null}
          dropoffCoords={myRequestedDonations[0] ? {
            address: (myRequestedDonations[0].recipientAddress && myRequestedDonations[0].recipientAddress !== "Recipient Location" && myRequestedDonations[0].recipientAddress !== "Recipient Address")
              ? myRequestedDonations[0].recipientAddress
              : (currentUser?.address || "")
          } : (currentUser?.address ? { address: currentUser.address } : null)}
        />
      </div>

      {/* My Active Requested Food Section */}
      {myRequestedDonations.length > 0 && (
        <div style={styles.activeSection}>
          <h3 style={{ margin: "0 0 12px 0", color: "#e65100" }}>⏳ Active Requested Food ({myRequestedDonations.length})</h3>
          {myRequestedDonations.map((item) => {
            const donId = item.id || item._id;
            const recipientDestAddr = (item.recipientAddress && item.recipientAddress !== "Recipient Location" && item.recipientAddress !== "Recipient Address")
              ? item.recipientAddress
              : (currentUser?.address || "");

            const isSelfColl =
              item.collectionMethod === 'BENEFICIARY_SELF_PICKUP' ||
              item.collectionMethod === 'SELF_COLLECTION' ||
              item.status === 'ACCEPTED_SELF_COLLECTION' ||
              item.volunteerRequired === false;

            const isDonorDeliv =
              item.collectionMethod === 'DONOR_DELIVERY' ||
              item.deliveryPreference === 'DONOR_DELIVERY';

            const navUrl = isSelfColl
              ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(currentUser?.address || 'My Location')}&destination=${encodeURIComponent(item.address)}&travelmode=driving`
              : `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(item.address || 'Donor Location')}&destination=${encodeURIComponent(recipientDestAddr)}&travelmode=driving`;

            const navBtnText = isSelfColl
              ? '🗺️ Start Navigation to Donor (Self Pickup)'
              : isDonorDeliv
              ? '🚗 Track Incoming Donor Route'
              : '🚴 Track Incoming Delivery Route';

            return (
              <div key={donId} style={styles.activeCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h4 style={{ margin: 0, color: "#e65100", fontSize: "16px" }}>{item.food_name || item.foodName}</h4>
                    <p style={{ margin: "4px 0", fontSize: "13px" }}>
                      Quantity: <strong>{item.quantity} {item.unit || "Packs"}</strong> • Category: {item.category}
                    </p>
                    <p style={{ margin: "4px 0", fontSize: "13px", color: "#333" }}>
                      👤 <strong>Donor:</strong> {item.donor_name} {item.donor_phone && `(📞 ${item.donor_phone})`}
                    </p>
                    <p style={{ margin: "4px 0", fontSize: "13px", color: "#333" }}>
                      📍 <strong>Pickup Location:</strong> {item.address}
                    </p>
                    <p style={{ margin: "4px 0", fontSize: "13px", color: "#e65100" }}>
                      🚚 <strong>Collection Method:</strong> {isSelfColl ? "Beneficiary Self Collection" : (item.collectionMethod || item.deliveryPreference || '').replace('_', ' ')}
                    </p>
                    {!isSelfColl && item.assignedVolunteer && (
                      <p style={{ margin: "4px 0", fontSize: "13px", color: "#1565c0" }}>
                        🚴 <strong>Volunteer:</strong> {item.assignedVolunteer} {item.volunteerPhone && `(📞 ${item.volunteerPhone})`}
                      </p>
                    )}
                    {isSelfColl && (
                      <p style={{ margin: "4px 0", fontSize: "13px", color: "#2e7d32" }}>
                        🚴 <strong>Volunteer:</strong> Not required (Self Collection)
                      </p>
                    )}
                    <p style={{ margin: "4px 0", fontSize: "12px", color: "#555" }}>
                      Current Status: <strong style={{ color: "#e65100" }}>{item.status === 'ACCEPTED_SELF_COLLECTION' ? 'ACCEPTED (SELF PICKUP)' : item.status}</strong>
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                    <a
                      href={navUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: isSelfColl ? "#2e7d32" : "#e65100",
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
                      {navBtnText}
                    </a>

                    {["DELIVERED", "IN_TRANSIT", "ACCEPTED", "ACCEPTED_SELF_COLLECTION", "PICKED_UP"].includes(item.status) && (
                      <button
                        style={styles.confirmBtn}
                        onClick={() => handleConfirmReceived(donId)}
                        disabled={loading}
                      >
                        ✓ Confirm Food Received
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Available Food Items Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🍲 {t("availableFoodItems")} (Intended for Receivers)</h3>

        {availableFood.length === 0 ? (
          <div style={styles.emptyCard}>
            <p>No available food items intended for receivers at the moment. Check back soon!</p>
          </div>
        ) : (
          availableFood.map((donation) => {
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

                <button
                  style={styles.requestBtn}
                  onClick={() => handleOpenRequestModal(donation)}
                  disabled={loading}
                >
                  Request Food
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Request Food Modal */}
      {selectedDonation && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: "0 0 10px 0", color: "#e65100" }}>Request Food Donation 🍲</h3>
            <p style={{ fontSize: "14px", margin: "4px 0" }}>
              <strong>Item:</strong> {selectedDonation.food_name || selectedDonation.foodName} ({selectedDonation.quantity} {selectedDonation.unit || "Packs"})
            </p>
            <p style={{ fontSize: "13px", margin: "4px 0", color: "#555" }}>
              <strong>Donor Address:</strong> {selectedDonation.address}
            </p>

            {(selectedDonation.deliveryPreference === "DONOR_DELIVERY" ||
              selectedDonation.deliveryMode === "DONOR_DELIVERY" ||
              selectedDonation.deliveryPreference === "SELF_DELIVERY" ||
              selectedDonation.deliveryMode === "SELF_DELIVERY") ? (
              <div style={{ backgroundColor: "#fff3e0", padding: "12px", borderRadius: "10px", margin: "12px 0", border: "1px solid #ffe0b2" }}>
                <strong style={{ color: "#e65100", fontSize: "13px", display: "block" }}>🚗 Donor Self-Delivery Confirmed</strong>
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
                  <option value="VOLUNTEER_DELIVERY">🚴 Volunteer Delivery (Volunteer collects & delivers to you)</option>
                  <option value="SELF_COLLECTION">🤲 Self Pickup (You collect food directly from donor)</option>
                </select>
              </>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button style={styles.modalConfirmBtn} onClick={handleConfirmRequest} disabled={loading}>
                {loading ? "Submitting..." : "Confirm & Request"}
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
  activeSection: {
    margin: "0 20px 20px 20px",
    background: "#fff3e0",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid #ffe0b2",
  },
  activeCard: {
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
    color: "#e65100",
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
  requestBtn: {
    padding: "11px 18px",
    backgroundColor: "#e65100",
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
    backgroundColor: "#e65100",
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

export default ReceiverDashboard;
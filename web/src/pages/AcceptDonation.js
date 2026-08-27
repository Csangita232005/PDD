import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDonationById, claimDonationApi } from "../services/api";
import NavbarHeader from "../components/NavbarHeader";

function AcceptDonation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get("donationId");
  const { currentUser } = useAuth();

  const [donation, setDonation] = useState(null);
  const [collectionMethod, setCollectionMethod] = useState("VOLUNTEER_DELIVERY");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (donationId) {
      getDonationById(donationId).then((res) => {
        if (res.success) setDonation(res.donation);
      });
    }
  }, [donationId]);

  const handleAccept = async () => {
    if (!donationId) {
      alert("No donation selected.");
      return;
    }

    setLoading(true);
    try {
      const res = await claimDonationApi(donationId, {
        userRole: "NGO",
        userId: currentUser?.id || currentUser?._id,
        userName: currentUser?.name || "NGO Partner",
        collectionMethod,
        userPhone: currentUser?.mobile || "",
        userAddress: currentUser?.formattedAddress || currentUser?.address || "",
      });
      setLoading(false);
      if (res.success) {
        alert(`Donation accepted successfully! Collection method: ${collectionMethod.replace('_', ' ')}`);
        navigate("/ngo");
      } else {
        alert(res.message || "Failed to accept donation.");
      }
    } catch (err) {
      setLoading(false);
      alert("Failed to accept donation.");
    }
  };

  return (
    <div style={styles.container}>
      <NavbarHeader title="Accept Food Donation" subtitle="Select collection method for NGO food rescue" />

      <div style={styles.box}>
        <h2 style={{ margin: "0 0 10px 0", color: "#2e7d32" }}>Accept Donation 🍱</h2>

        {donation && (
          <div style={styles.infoCard}>
            <h4>{donation.food_name || donation.foodName}</h4>
            <p style={{ margin: "4px 0", fontSize: "13px" }}>Quantity: {donation.quantity} {donation.unit || "Packs"}</p>
            <p style={{ margin: "4px 0", fontSize: "13px" }}>Donor: {donation.donor_name || "Donor"}</p>
            <p style={{ margin: "4px 0", fontSize: "13px" }}>Pickup Address: {donation.address}</p>
          </div>
        )}

        <label style={styles.label}>Select Collection Method *</label>
        <select
          style={styles.select}
          value={collectionMethod}
          onChange={(e) => setCollectionMethod(e.target.value)}
        >
          <option value="VOLUNTEER_DELIVERY">🚴 Volunteer Collection (Request volunteer to pick up from donor)</option>
          <option value="SELF_COLLECTION">🏛️ NGO Self-Collection (NGO team collects directly from donor)</option>
        </select>

        <button style={styles.button} onClick={handleAccept} disabled={loading}>
          {loading ? "Processing..." : "Confirm & Accept Donation"}
        </button>

        <button style={styles.cancelBtn} onClick={() => navigate("/ngo")}>
          Cancel
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f5f5",
    paddingBottom: "40px",
  },
  box: {
    background: "white",
    maxWidth: "460px",
    margin: "30px auto",
    padding: "25px",
    borderRadius: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },
  infoCard: {
    background: "#f9fbf9",
    border: "1px solid #c8e6c9",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "15px",
    textAlign: "left",
  },
  label: {
    display: "block",
    fontWeight: "bold",
    fontSize: "13px",
    color: "#333",
    marginBottom: "6px",
    textAlign: "left",
  },
  select: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "14px",
    marginBottom: "20px",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
  },
  cancelBtn: {
    width: "100%",
    padding: "12px",
    background: "#eee",
    color: "#333",
    border: "none",
    borderRadius: "12px",
    marginTop: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default AcceptDonation;
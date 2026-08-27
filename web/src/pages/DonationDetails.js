import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getDonationById, acceptDonation } from "../services/api";

function DonationDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const donationId = queryParams.get("id");

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!donationId) {
        setLoading(false);
        return;
      }
      try {
        const res = await getDonationById(donationId);
        if (res.success) {
          setDonation(res.donation);
        }
      } catch (err) {
        console.warn("Failed to fetch donation details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [donationId]);

  const handleAccept = async () => {
    if (!donation) return;
    try {
      const res = await acceptDonation(donation._id || donation.id);
      if (res.success) {
        alert("Donation Accepted Successfully! Redirecting to Volunteer Assignment...");
        navigate("/assignvolunteer");
      } else {
        alert(res.message || "Failed to accept donation.");
      }
    } catch (err) {
      alert("Failed to accept donation.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ←
        </button>
        <h2>Donation Details 📋</h2>
      </div>

      <div style={styles.content}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#666" }}>Loading donation details...</p>
        ) : !donation ? (
          <div style={styles.card}>
            <p>Select a donation listing from the dashboard to view full details.</p>
          </div>
        ) : (
          <>
            <div style={styles.card}>
              <h3 style={styles.title}>Donor Food Details</h3>
              {donation.imageUrl && (
                <img src={donation.imageUrl} alt="food" style={styles.image} />
              )}
              <p><b>Food:</b> {donation.food_name || donation.foodName}</p>
              <p><b>Quantity:</b> {donation.quantity} {donation.unit || "Packs"}</p>
              <p><b>Expiry Time:</b> {donation.expiryTime || "4 Hours"}</p>
              <p><b>Pickup Location:</b> {donation.address}</p>
              <p><b>Status:</b> {donation.status} ✅</p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.title}>Requirement Match</h3>
              <p><b>Category:</b> {donation.category || "Cooked Meals"}</p>
              <p><b>Donor Contact:</b> {donation.donor_phone || "Protected"}</p>
              <p><b>Donor Name:</b> {donation.donor_name || donation.donor || "Donor"}</p>
            </div>

            <div style={styles.matchBox}>
              ✅ This food donation is ready in database for community rescue
            </div>

            <div style={styles.buttonContainer}>
              <button style={styles.homeBtn} onClick={() => navigate("/ngo")}>
                🏠 Dashboard
              </button>

              <button style={styles.acceptBtn} onClick={handleAccept}>
                Accept & Assign Volunteer
              </button>
            </div>
          </>
        )}
      </div>
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
    background: "linear-gradient(to right, #1b5e20, #66bb6a)",
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
    color: "#2e7d32",
    border: "none",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    fontSize: "22px",
    cursor: "pointer",
  },
  content: {
    maxWidth: "600px",
    margin: "20px auto",
    padding: "0 15px",
  },
  card: {
    background: "white",
    marginBottom: "15px",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    lineHeight: "1.8",
  },
  title: {
    color: "#2e7d32",
    marginBottom: "12px",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "15px",
    marginBottom: "15px",
  },
  matchBox: {
    background: "#c8e6c9",
    padding: "18px",
    borderRadius: "15px",
    textAlign: "center",
    color: "#1b5e20",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
  },
  homeBtn: {
    padding: "15px 25px",
    background: "#1565c0",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  acceptBtn: {
    padding: "15px 25px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default DonationDetails;
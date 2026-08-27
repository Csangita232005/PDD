import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getDonationById, createReview } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

function ThankYou() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get("donationId");
  const { t } = useLanguage();

  const [donation, setDonation] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (donationId) {
      getDonationById(donationId).then((res) => {
        if (res.success) setDonation(res.donation);
      });
    }
  }, [donationId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!donationId) return;

    try {
      await createReview({
        donationId: Number(donationId),
        toUserId: donation?.donor_id || null,
        rating,
        comment,
      });
      setReviewSubmitted(true);
    } catch (err) {
      alert("Failed to submit review.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>🎉</div>
        <h1 style={styles.title}>{t("thankYouTitle")}</h1>
        <p style={styles.subtitle}>{t("thankYouSubtitle")}</p>

        {donation && (
          <div style={styles.summaryBox}>
            <h3 style={{ margin: "0 0 8px 0", color: "#2e7d32" }}>{donation.food_name || donation.foodName}</h3>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#555" }}>
              Quantity: <strong>{donation.quantity} {donation.unit || "Packs"}</strong>
            </p>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#555" }}>
              People Helped: <strong>~{Number(donation.quantity) * 3} people</strong>
            </p>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#555" }}>
              Status: <span style={styles.badge}>{donation.status}</span>
            </p>
          </div>
        )}

        {!reviewSubmitted ? (
          <form style={styles.reviewBox} onSubmit={handleReviewSubmit}>
            <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>{t("rateExperience")}</h4>
            <div style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    fontSize: "30px",
                    cursor: "pointer",
                    color: star <= rating ? "#ffb300" : "#ccc",
                  }}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              placeholder="Leave a short comment..."
              style={styles.commentInput}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button type="submit" style={styles.reviewBtn}>
              {t("submitReviewBtn")}
            </button>
          </form>
        ) : (
          <div style={styles.thankReviewBox}>
            <p style={{ color: "#2e7d32", fontWeight: "bold", margin: 0 }}>
              ✓ Review submitted! Thank you for your feedback.
            </p>
          </div>
        )}

        <div style={styles.btnRow}>
          <button style={styles.impactBtn} onClick={() => navigate("/impact")}>
            🌍 {t("viewMyImpactBtn")}
          </button>

          <button style={styles.dashBtn} onClick={() => navigate("/roles")}>
            🏠 {t("backToDashboard")}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  card: {
    background: "white",
    padding: "35px 25px",
    borderRadius: "20px",
    maxWidth: "480px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
  },
  icon: {
    fontSize: "60px",
    marginBottom: "10px",
  },
  title: {
    color: "#2e7d32",
    margin: "0 0 8px 0",
    fontSize: "26px",
  },
  subtitle: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "20px",
  },
  summaryBox: {
    background: "#f9f9f9",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "20px",
    textAlign: "left",
    borderLeft: "4px solid #2e7d32",
  },
  badge: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    padding: "3px 8px",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "12px",
  },
  reviewBox: {
    background: "#fffde7",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "20px",
    border: "1px solid #fff59d",
  },
  starRow: {
    marginBottom: "10px",
  },
  commentInput: {
    width: "90%",
    height: "60px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "13px",
    marginBottom: "10px",
  },
  reviewBtn: {
    padding: "10px 20px",
    backgroundColor: "#f57f17",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
  },
  thankReviewBox: {
    background: "#e8f5e9",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  btnRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },
  impactBtn: {
    padding: "12px 18px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
  },
  dashBtn: {
    padding: "12px 18px",
    backgroundColor: "#37474f",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default ThankYou;
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ReviewRating() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    alert("Thank You For Your Feedback ❤️");
    setSubmitted(true);
  };

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        Review & Rating ⭐
      </div>

      <div style={styles.card}>

        {!submitted ? (
          <>
            <div style={styles.icon}>😊</div>

            <h2 style={styles.title}>
              How was your donation experience?
            </h2>

            <div style={styles.stars}>
              ⭐ ⭐ ⭐ ⭐ ⭐
            </div>

            <textarea
              placeholder="Write your feedback here..."
              style={styles.textarea}
            ></textarea>

            <label style={styles.label}>
              Upload Delivery Image (Optional)
            </label>

            <input
              type="file"
              accept="image/*"
              style={styles.fileInput}
            />

            <button
              style={styles.button}
              onClick={handleSubmit}
            >
              Submit Feedback
            </button>
          </>
        ) : (
          <>
            <div style={styles.icon}>✅</div>

            <h2 style={styles.title}>
              Feedback Submitted Successfully
            </h2>

            <p style={styles.message}>
              Thank you for helping us improve the donation experience.
            </p>

           <button
           style={styles.button}
           onClick={() => navigate("/impact")}
           >
           View Impact
           </button>

            <button
              style={styles.secondaryButton}
              onClick={() => navigate("/history")}
            >
              View Donation History
            </button>
          </>
        )}

      </div>

    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #e8f5e9, #ffffff)",
    paddingBottom: "40px",
  },

  header: {
    background: "#2e7d32",
    color: "white",
    padding: "22px",
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "bold",
    borderBottomLeftRadius: "22px",
    borderBottomRightRadius: "22px",
  },

  card: {
    background: "white",
    width: "90%",
    maxWidth: "420px",
    margin: "40px auto",
    padding: "30px",
    borderRadius: "22px",
    textAlign: "center",
    boxShadow: "0 5px 18px rgba(0,0,0,0.1)",
  },

  icon: {
    fontSize: "60px",
    marginBottom: "15px",
  },

  title: {
    color: "#2e7d32",
    marginBottom: "20px",
  },

  message: {
    color: "#555",
    marginBottom: "25px",
    lineHeight: "1.6",
  },

  stars: {
    fontSize: "35px",
    marginBottom: "25px",
    cursor: "pointer",
  },

  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #ccc",
    marginBottom: "20px",
    resize: "none",
    fontSize: "15px",
  },

  label: {
    display: "block",
    textAlign: "left",
    marginBottom: "10px",
    color: "#2e7d32",
    fontWeight: "bold",
  },

  fileInput: {
    width: "100%",
    marginBottom: "25px",
  },

  button: {
    width: "100%",
    padding: "15px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "17px",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "15px",
    boxShadow: "0 4px 12px rgba(46,125,50,0.3)",
  },

  secondaryButton: {
    width: "100%",
    padding: "15px",
    background: "white",
    color: "#2e7d32",
    border: "2px solid #2e7d32",
    borderRadius: "12px",
    fontSize: "17px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default ReviewRating;
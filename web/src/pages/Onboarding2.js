import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function Onboarding2() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div style={styles.container}>
      <img
        src="https://cdn-icons-png.flaticon.com/512/854/854878.png"
        alt="tracking"
        style={styles.image}
      />

      <h1 style={styles.title}>
        {t("liveTracking")}
      </h1>

      <p style={styles.text}>
        {t("liveTrackingDesc")}
      </p>

      <div style={styles.buttonContainer}>
        <button
          style={styles.skip}
          onClick={() => navigate("/login")}
        >
          {t("skip")}
        </button>

        <button
          style={styles.next}
          onClick={() => navigate("/onboarding3")}
        >
          {t("next")}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to bottom, #e8f5e9, #c8e6c9)",
    padding: "20px",
    textAlign: "center",
  },
  image: {
    width: "220px",
    marginBottom: "30px",
  },
  title: {
    fontSize: "38px",
    color: "#1b5e20",
  },
  text: {
    fontSize: "20px",
    color: "#2e7d32",
    maxWidth: "400px",
  },
  buttonContainer: {
    marginTop: "40px",
    display: "flex",
    gap: "20px",
  },
  skip: {
    padding: "12px 25px",
    border: "none",
    backgroundColor: "#9e9e9e",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
  },
  next: {
    padding: "12px 25px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default Onboarding2;
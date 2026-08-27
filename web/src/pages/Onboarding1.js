import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function Onboarding1() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div style={styles.container}>
      {/* Healthy Snack Image */}
      <img
        src="https://cdn-icons-png.flaticon.com/512/2153/2153788.png"
        alt="healthy snack"
        style={styles.image}
      />

      <h1 style={styles.title}>
        {t("donateFood")}
      </h1>

      <p style={styles.text}>
        {t("donateFoodDesc")}
      </p>

      {/* Indicator Dots */}
      <div style={styles.dotsContainer}>
        <span style={styles.activeDot}></span>
        <span style={styles.dot}></span>
        <span style={styles.dot}></span>
      </div>

      {/* Buttons */}
      <div style={styles.buttonContainer}>
        <button
          style={styles.skip}
          onClick={() => navigate("/login")}
        >
          {t("skip")}
        </button>

        <button
          style={styles.next}
          onClick={() => navigate("/onboarding2")}
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
    background: "linear-gradient(to bottom, #f1f8e9, #dcedc8)",
    padding: "20px",
    textAlign: "center",
  },
  image: {
    width: "240px",
    marginBottom: "25px",
  },
  title: {
    fontSize: "40px",
    color: "#e65100",
    fontWeight: "bold",
    marginBottom: "15px",
  },
  text: {
    fontSize: "20px",
    color: "#6d4c41",
    maxWidth: "420px",
    lineHeight: "32px",
  },
  dotsContainer: {
    display: "flex",
    marginTop: "35px",
    marginBottom: "35px",
  },
  activeDot: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    backgroundColor: "#fb8c00",
    margin: "0 5px",
  },
  dot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "#d7ccc8",
    margin: "0 5px",
  },
  buttonContainer: {
    display: "flex",
    gap: "20px",
  },
  skip: {
    padding: "12px 28px",
    border: "none",
    backgroundColor: "#a1887f",
    color: "white",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
  },
  next: {
    padding: "12px 30px",
    border: "none",
    backgroundColor: "#fb8c00",
    color: "white",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
  },
};

export default Onboarding1;
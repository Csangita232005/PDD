import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function Onboarding3() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div style={styles.container}>
      <img
        src="https://cdn-icons-png.flaticon.com/512/3176/3176363.png"
        alt="community help"
        style={styles.image}
      />

      <h1 style={styles.title}>
        {t("feedLives")}
      </h1>

      <p style={styles.text}>
        {t("feedLivesDesc")}
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
          onClick={() => navigate("/login")}
        >
          {t("getStarted")}
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
    background: "linear-gradient(to bottom, #e3f2fd, #bbdefb)",
    padding: "20px",
    textAlign: "center",
  },
  image: {
    width: "230px",
    marginBottom: "30px",
  },
  title: {
    fontSize: "38px",
    color: "#0d47a1",
  },
  text: {
    fontSize: "20px",
    color: "#1565c0",
    maxWidth: "420px",
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
    backgroundColor: "#1976d2",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default Onboarding3;
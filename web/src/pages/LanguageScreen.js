import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function LanguageSelection() {
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();
  const [selected, setSelected] = useState(language || "en");

  const handleContinue = () => {
    if (!selected) {
      alert("Please select a language / దయచేసి భాషను ఎంచుకోండి");
      return;
    }
    changeLanguage(selected);
    navigate("/onboarding1");
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>

      <div style={styles.box}>
        <div style={styles.icon}>🌍</div>

        <h1 style={styles.title}>{t("selectLanguage")}</h1>

        <p style={styles.subtitle}>{t("selectLanguageSub")}</p>

        <select
          style={styles.dropdown}
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="en">English</option>
          <option value="te">తెలుగు (Telugu)</option>
          <option value="ta">தமிழ் (Tamil)</option>
          <option value="hi">हिन्दी (Hindi)</option>
        </select>

        <button style={styles.button} onClick={handleContinue}>
          {t("continue")}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundImage:
      "url('https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  box: {
    position: "relative",
    zIndex: 2,
    background: "rgba(255,255,255,0.95)",
    padding: "45px",
    borderRadius: "20px",
    width: "350px",
    textAlign: "center",
    boxShadow: "0 5px 20px rgba(0,0,0,0.4)",
  },
  icon: {
    fontSize: "55px",
    marginBottom: "10px",
  },
  title: {
    color: "#2e7d32",
    marginBottom: "10px",
    fontSize: "28px",
  },
  subtitle: {
    color: "#666",
    marginBottom: "25px",
  },
  dropdown: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "16px",
    marginBottom: "20px",
  },
  button: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
};

export default LanguageSelection;
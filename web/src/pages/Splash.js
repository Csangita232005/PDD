import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Splash() {

  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/logo");
    }, 800);
  }, [navigate]);

  return (
    <div style={styles.container}>

      <div style={styles.logoBox}>
        🍱
      </div>

      <h1 style={styles.title}>ShareBite</h1>

      <p style={styles.subtitle}>
        Connecting Food with People
      </p>

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

    background:
      "linear-gradient(to right, #ffecd2, #fcb69f)",
  },

  logoBox: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    backgroundColor: "white",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    fontSize: "60px",

    boxShadow: "0px 4px 15px rgba(0,0,0,0.2)",
  },

  title: {
    marginTop: "20px",
    fontSize: "42px",
    color: "#333",
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: "18px",
    color: "#555",
  },
};

export default Splash;
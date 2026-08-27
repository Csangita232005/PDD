import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function LogoScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/name");
    }, 800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={styles.container}>
      {/* Dark overlay */}
      <div style={styles.overlay}></div>

      {/* Content */}
      <div style={styles.content}>
        <img
          src="/logo.png"
          alt="ShareBite Logo"
          style={styles.logo}
          onError={(e) => {
            e.target.style.display = "none";
            if (e.target.nextSibling) e.target.nextSibling.style.display = "block";
          }}
        />
        <span style={{ fontSize: "80px", display: "none" }}>🍱</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundImage:
      "linear-gradient(135deg, rgba(27, 94, 32, 0.55), rgba(10, 30, 14, 0.75)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    height: "100vh",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "radial-gradient(circle at center, rgba(76, 175, 80, 0.25) 0%, rgba(0, 0, 0, 0.6) 80%)",
  },
  content: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logo: {
    width: "170px",
    height: "170px",
    marginBottom: "20px",
    borderRadius: "50%",
    backgroundColor: "white",
    padding: "15px",
    boxShadow: "0px 0px 20px rgba(255,255,255,0.5)",
    objectFit: "contain",
  },
};

export default LogoScreen;
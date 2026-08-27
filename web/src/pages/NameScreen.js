import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function NameScreen() {

  const navigate = useNavigate();

  useEffect(() => {

    const timer = setTimeout(() => {
      navigate("/tagline");
    }, 800);

    return () => clearTimeout(timer);

  }, [navigate]);

  return (
    <div style={styles.container}>

      {/* Dark Overlay */}
      <div style={styles.overlay}></div>

      {/* Main Content */}
      <div style={styles.content}>
        <h1 style={styles.title}>
          ShareBite
        </h1>

        <p style={styles.subtitle}>
          Connecting Food with Humanity
        </p>

      </div>

    </div>
  );
}

const styles = {

  container: {
   backgroundImage:
 "url('https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1200')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",

    height: "100vh",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    position: "relative",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,

    width: "100%",
    height: "100%",

    backgroundColor: "rgba(0,0,0,0.55)",
  },

  content: {
    position: "relative",
    zIndex: 2,

    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  logoCircle: {
    width: "120px",
    height: "120px",

    borderRadius: "50%",
    backgroundColor: "white",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    fontSize: "55px",

    marginBottom: "25px",

    boxShadow: "0px 0px 25px rgba(255,255,255,0.5)",
  },

  title: {
    fontSize: "68px",
    color: "#ffffff",

    fontWeight: "bold",
    letterSpacing: "3px",

    margin: 0,

    textShadow: "3px 3px 15px rgba(0,0,0,0.7)",
  },

  subtitle: {
    fontSize: "24px",
    color: "#f5f5f5",

    marginTop: "15px",

    letterSpacing: "1px",

    textShadow: "2px 2px 10px rgba(0,0,0,0.6)",
  },
};

export default NameScreen;
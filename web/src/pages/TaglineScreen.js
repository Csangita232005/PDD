import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function TaglineScreen() {

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/language");
    }, 800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={styles.container}>

      <div style={styles.overlay}>

        <h1 style={styles.text}>
          Share Food ❤️ <br />
          Spread Smiles 😊
        </h1>

      </div>

    </div>
  );
}

const styles = {
  container: {
    backgroundImage:
   "url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: "100vh",
  },

  overlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "20px",
  },

  text: {
    color: "white",
    fontSize: "50px",
    lineHeight: "1.6",
    fontWeight: "bold",
  },
};

export default TaglineScreen;
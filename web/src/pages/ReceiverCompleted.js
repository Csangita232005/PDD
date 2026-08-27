import { useNavigate } from "react-router-dom";

function ReceiverCompleted() {

  const navigate = useNavigate();

  return (

    <div style={styles.container}>

      <div style={styles.card}>

        <h1>Food Received Successfully 🎉</h1>

        <p>Thank you for reducing food waste.</p>

        <button
          style={styles.button}
          onClick={() => navigate("/receiverhistory")}
        >
          View History
        </button>
<button
  style={styles.button}
  onClick={() => navigate("/thankyou")}
>
  Finish
</button>
      </div>

    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#fff8e1",
  },

  card: {
    background: "white",
    padding: "35px",
    borderRadius: "20px",
    textAlign: "center",
  },

  button: {
    width: "100%",
    padding: "15px",
    background: "#ef6c00",
    color: "white",
    border: "none",
    borderRadius: "12px",
    marginTop: "20px",
  },
};

export default ReceiverCompleted;
function Donor() {
  return (
    <div style={styles.container}>
      <h1>🍱 Donor Dashboard</h1>

      <div style={styles.card}>
        <h3>Welcome Donor!</h3>
        <p>You can donate extra food here.</p>

        <button style={styles.button}>Add Food Donation</button>
        <button style={styles.button}>View My Donations</button>
        <button style={styles.button}>Track Requests</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    fontFamily: "Arial",
  },
  card: {
    padding: "20px",
    background: "#e8f5e9",
    borderRadius: "12px",
  },
  button: {
    display: "block",
    marginTop: "10px",
    padding: "10px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default Donor;
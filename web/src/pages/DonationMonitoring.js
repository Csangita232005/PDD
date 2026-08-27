import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDonations } from "../services/api";

function DonationMonitoring() {
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await getDonations();
      if (res.success) setDonations(res.donations);
    } catch (e) {
      console.warn("Failed to fetch donations for monitoring:", e);
    }
  };

  const filteredDonations = donations.filter((d) => {
    const matchStatus = statusFilter === "ALL" || d.status === statusFilter;
    const matchSearch =
      (d.food_name || d.foodName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.donor_name || d.donorName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.address || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>📦 Platform Donation Audit & Monitoring</h2>
      </div>

      <div style={styles.content}>
        <div style={styles.filterRow}>
          <input
            type="text"
            placeholder="Search by food name, donor, or location..."
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            style={styles.selectInput}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="VOLUNTEER_ASSIGNED">Volunteer Assigned</option>
            <option value="PICKUP_STARTED">Pickup Started</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div style={styles.grid}>
          {filteredDonations.length === 0 ? (
            <div style={styles.emptyCard}>
              <p>No donations match the current filter criteria.</p>
            </div>
          ) : (
            filteredDonations.map((item) => (
              <div key={item.id} style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ margin: 0, color: "#2e7d32" }}>{item.food_name || item.foodName}</h3>
                    <p style={{ margin: "4px 0", color: "#555", fontSize: "14px" }}>
                      Quantity: <strong>{item.quantity} {item.unit || "Packs"}</strong> • Category: {item.category}
                    </p>
                  </div>
                  <span style={styles.badge(item.status)}>{item.status}</span>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "12px 0" }} />

                <div style={styles.detailRow}>
                  <span>👤 <strong>Donor:</strong> {item.donor_name || "Donor"}</span>
                  <span>🏛️ <strong>NGO:</strong> {item.ngo_name || "Not assigned"}</span>
                </div>

                <div style={styles.detailRow}>
                  <span>🚚 <strong>Volunteer:</strong> {item.volunteer_name || "Not assigned"}</span>
                  <span>🤝 <strong>Receiver:</strong> {item.receiver_name || "Not assigned"}</span>
                </div>

                <p style={{ margin: "8px 0 0 0", color: "#777", fontSize: "13px" }}>
                  📍 Address: {item.address}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#f0f2f5",
    minHeight: "100vh",
    paddingBottom: "40px",
  },
  header: {
    background: "#263238",
    color: "white",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  backBtn: {
    background: "rgba(255,255,255,0.2)",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  content: {
    maxWidth: "1000px",
    margin: "25px auto",
    padding: "0 20px",
  },
  filterRow: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
  },
  searchInput: {
    flex: 2,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  selectInput: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "18px",
  },
  emptyCard: {
    background: "white",
    padding: "30px",
    borderRadius: "14px",
    textAlign: "center",
    color: "#666",
    gridColumn: "1 / -1",
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#444",
    margin: "4px 0",
  },
  badge: (status) => ({
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
    backgroundColor:
      status === "COMPLETED" ? "#e8f5e9" : status === "PENDING" ? "#fff3e0" : "#e3f2fd",
    color:
      status === "COMPLETED" ? "#2e7d32" : status === "PENDING" ? "#e65100" : "#1565c0",
  }),
};

export default DonationMonitoring;
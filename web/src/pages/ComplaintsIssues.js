import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getComplaints, createComplaint, updateComplaintStatus } from "../services/api";

function ComplaintsIssues() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await getComplaints();
      if (res.success) setComplaints(res.complaints);
    } catch (e) {
      console.warn("Failed to fetch complaints:", e);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!subject || !description) {
      alert("Please fill in subject and description.");
      return;
    }

    setLoading(true);
    try {
      const res = await createComplaint({ subject, description });
      setLoading(false);
      if (res.success) {
        setSubject("");
        setDescription("");
        setShowAddForm(false);
        fetchComplaints();
        alert("Complaint registered successfully!");
      }
    } catch (err) {
      setLoading(false);
      alert("Failed to submit complaint.");
    }
  };

  const handleResolve = async (complaintId, status) => {
    setLoading(true);
    try {
      const res = await updateComplaintStatus(complaintId, { status });
      setLoading(false);
      if (res.success) {
        fetchComplaints();
      }
    } catch (err) {
      setLoading(false);
      alert("Failed to update complaint.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>⚠️ Complaints & Resolution Desk</h2>
      </div>

      <div style={styles.content}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, color: "#263238" }}>Ticket Management</h3>
          <button style={styles.addBtn} onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "+ Report Issue"}
          </button>
        </div>

        {showAddForm && (
          <form style={styles.formCard} onSubmit={handleCreate}>
            <h4 style={{ margin: "0 0 10px 0" }}>Report New Issue</h4>
            <input
              type="text"
              placeholder="Issue Subject (e.g. Delayed Pickup)"
              style={styles.input}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <textarea
              placeholder="Describe the complaint in detail..."
              style={{ ...styles.input, height: "70px" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              Submit Complaint
            </button>
          </form>
        )}

        <div style={styles.list}>
          {complaints.length === 0 ? (
            <div style={styles.emptyCard}>
              <p>No complaints reported yet.</p>
            </div>
          ) : (
            complaints.map((item) => (
              <div key={item.id} style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ margin: 0, color: "#c62828" }}>{item.subject}</h4>
                    <p style={{ margin: "4px 0 0 0", color: "#555", fontSize: "14px" }}>
                      {item.description}
                    </p>
                    <p style={{ margin: "6px 0 0 0", color: "#888", fontSize: "12px" }}>
                      Reported by: <strong>{item.user_name || "User"}</strong>
                    </p>
                  </div>
                  <span style={styles.badge(item.status)}>{item.status}</span>
                </div>

                {(item.status === "OPEN" || item.status === "PENDING") && (
                  <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                    <button
                      style={styles.actionBtn("#2e7d32")}
                      onClick={() => handleResolve(item.id, "RESOLVED")}
                      disabled={loading}
                    >
                      ✓ Mark Resolved
                    </button>
                    <button
                      style={styles.actionBtn("#757575")}
                      onClick={() => handleResolve(item.id, "CLOSED")}
                      disabled={loading}
                    >
                      ✕ Close Ticket
                    </button>
                  </div>
                )}
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
    maxWidth: "800px",
    margin: "25px auto",
    padding: "0 20px",
  },
  addBtn: {
    padding: "10px 16px",
    backgroundColor: "#c62828",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  formCard: {
    background: "white",
    padding: "20px",
    borderRadius: "14px",
    marginBottom: "20px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
  },
  input: {
    width: "96%",
    padding: "10px",
    margin: "6px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  submitBtn: {
    padding: "10px 18px",
    backgroundColor: "#c62828",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  emptyCard: {
    background: "white",
    padding: "25px",
    borderRadius: "14px",
    textAlign: "center",
    color: "#666",
  },
  card: {
    background: "white",
    padding: "18px",
    borderRadius: "14px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
  },
  actionBtn: (color) => ({
    padding: "6px 12px",
    backgroundColor: color,
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "13px",
  }),
  badge: (status) => ({
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
    backgroundColor: status === "RESOLVED" ? "#e8f5e9" : "#ffebee",
    color: status === "RESOLVED" ? "#2e7d32" : "#c62828",
  }),
};

export default ComplaintsIssues;
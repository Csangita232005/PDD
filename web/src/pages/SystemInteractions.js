import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SystemInteractions() {
  const navigate = useNavigate();
  const { switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState("FLOW");

  const handleSwitchRole = (rolePath, roleName) => {
    switchRole(roleName);
    navigate(rolePath);
  };

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ←
        </button>
        <h2 style={{ margin: 0 }}>⇄ System Interactions & Lifecycle Guide</h2>
        <p style={{ margin: "6px 0 0 0", opacity: 0.9, fontSize: "14px" }}>
          Complete end-to-end workflow between Donors, NGOs, Volunteers, Receivers, & Admins.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabRow}>
        <button
          style={styles.tabBtn(activeTab === "FLOW")}
          onClick={() => setActiveTab("FLOW")}
        >
          🔄 5-Step Lifecycle Flow
        </button>
        <button
          style={styles.tabBtn(activeTab === "ROLES")}
          onClick={() => setActiveTab("ROLES")}
        >
          👥 Role Responsibilities
        </button>
        <button
          style={styles.tabBtn(activeTab === "SIMULATE")}
          onClick={() => setActiveTab("SIMULATE")}
        >
          🚀 Live Role Switcher
        </button>
      </div>

      <div style={styles.contentBox}>
        {activeTab === "FLOW" && (
          <div>
            <h3 style={styles.sectionTitle}>✨ ShareBite Live Food Rescue Lifecycle</h3>
            <p style={{ color: "#555" }}>
              How data and notifications flow seamlessly across the platform in real-time:
            </p>

            <div style={styles.timeline}>
              <div style={styles.stepCard("#e8f5e9", "#2e7d32")}>
                <div style={styles.stepBadge("#2e7d32")}>Step 1</div>
                <h4>🍎 Donor Posts Food</h4>
                <p>
                  Donor enters meal details (e.g. 20 Veg Biryani Packs, Address). The donation is stored in the database with status <b>PENDING</b>.
                </p>
              </div>

              <div style={styles.stepCard("#fff3e0", "#e65100")}>
                <div style={styles.stepBadge("#e65100")}>Step 2</div>
                <h4>🔔 Instant Notification Dispatched</h4>
                <p>
                  The system generates a live alert to nearby <b>Volunteers</b> and <b>NGOs</b>: <i>"New Food Donation Posted!"</i>
                </p>
              </div>

              <div style={styles.stepCard("#e3f2fd", "#1565c0")}>
                <div style={styles.stepBadge("#1565c0")}>Step 3</div>
                <h4>🚴 Volunteer / NGO Accepts Pickup</h4>
                <p>
                  A Volunteer or NGO clicks <b>"Accept Pickup"</b>. Donation status updates to <b>VOLUNTEER_ASSIGNED</b> live across all dashboards.
                </p>
              </div>

              <div style={styles.stepCard("#f3e5f5", "#7b1fa2")}>
                <div style={styles.stepBadge("#7b1fa2")}>Step 4</div>
                <h4>📍 Live GPS Map Route Tracking</h4>
                <p>
                  Both Donor and Receiver view real-time location map tracking as the Volunteer picks up food and travels to the delivery location.
                </p>
              </div>

              <div style={styles.stepCard("#e0f2f1", "#00695c")}>
                <div style={styles.stepBadge("#00695c")}>Step 5</div>
                <h4>🤝 Delivery Confirmed & Impact Updated</h4>
                <p>
                  Receiver marks food received. Status updates to <b>COMPLETED</b>. Food saved (Kg) and meals served stats update platform-wide!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ROLES" && (
          <div>
            <h3 style={styles.sectionTitle}>👥 Overview of All 5 Platform Roles</h3>

            <div style={styles.grid}>
              <div style={styles.roleCard}>
                <div style={{ fontSize: "32px" }}>🍎</div>
                <h4>Donor Dashboard</h4>
                <p style={{ fontSize: "13px", color: "#555" }}>
                  • Post surplus cooked meals or packaged food.<br />
                  • View active donations and live map tracking.<br />
                  • Track personal impact (Kg food saved & people helped).
                </p>
                <button
                  style={styles.actionBtn("#2e7d32")}
                  onClick={() => handleSwitchRole("/donor", "DONOR")}
                >
                  Go to Donor Dashboard →
                </button>
              </div>

              <div style={styles.roleCard}>
                <div style={{ fontSize: "32px" }}>🏛️</div>
                <h4>NGO Dashboard</h4>
                <p style={{ fontSize: "13px", color: "#555" }}>
                  • Browse real-time available bulk food listings.<br />
                  • Claim food for community shelters.<br />
                  • Assign volunteers or arrange direct transport.
                </p>
                <button
                  style={styles.actionBtn("#1565c0")}
                  onClick={() => handleSwitchRole("/ngo", "NGO")}
                >
                  Go to NGO Dashboard →
                </button>
              </div>

              <div style={styles.roleCard}>
                <div style={{ fontSize: "32px" }}>🚴</div>
                <h4>Volunteer Dashboard</h4>
                <p style={{ fontSize: "13px", color: "#555" }}>
                  • Receive live pickup alerts.<br />
                  • Accept delivery tasks in your zone.<br />
                  • Update stage: Pickup Started ➔ Picked Up ➔ Delivered.
                </p>
                <button
                  style={styles.actionBtn("#e65100")}
                  onClick={() => handleSwitchRole("/volunteer", "VOLUNTEER")}
                >
                  Go to Volunteer Dashboard →
                </button>
              </div>

              <div style={styles.roleCard}>
                <div style={{ fontSize: "32px" }}>🍲</div>
                <h4>Receiver / Beneficiary</h4>
                <p style={{ fontSize: "13px", color: "#555" }}>
                  • View nearby available food items.<br />
                  • Submit instant meal requests.<br />
                  • Confirm receipt & provide ratings.
                </p>
                <button
                  style={styles.actionBtn("#c62828")}
                  onClick={() => handleSwitchRole("/receiver", "RECEIVER")}
                >
                  Go to Receiver Dashboard →
                </button>
              </div>

              <div style={styles.roleCard}>
                <div style={{ fontSize: "32px" }}>🛡️</div>
                <h4>Admin Dashboard</h4>
                <p style={{ fontSize: "13px", color: "#555" }}>
                  • System-wide live map & audit monitoring.<br />
                  • User role governance & account approval.<br />
                  • Review complaints & export impact reports.
                </p>
                <button
                  style={styles.actionBtn("#263238")}
                  onClick={() => handleSwitchRole("/admin", "ADMIN")}
                >
                  Go to Admin Dashboard →
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "SIMULATE" && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <h3 style={styles.sectionTitle}>🚀 Test & Switch Roles Live</h3>
            <p style={{ color: "#555", maxWidth: "500px", margin: "0 auto 25px auto" }}>
              Experience the app from any perspective! Click below to instantly test any dashboard:
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", justifyContent: "center" }}>
              <button
                style={styles.bigRoleBtn("#2e7d32")}
                onClick={() => handleSwitchRole("/donor", "DONOR")}
              >
                🍎 Test as Donor
              </button>
              <button
                style={styles.bigRoleBtn("#1565c0")}
                onClick={() => handleSwitchRole("/ngo", "NGO")}
              >
                🏛️ Test as NGO
              </button>
              <button
                style={styles.bigRoleBtn("#e65100")}
                onClick={() => handleSwitchRole("/volunteer", "VOLUNTEER")}
              >
                🚴 Test as Volunteer
              </button>
              <button
                style={styles.bigRoleBtn("#c62828")}
                onClick={() => handleSwitchRole("/receiver", "RECEIVER")}
              >
                🍲 Test as Receiver
              </button>
              <button
                style={styles.bigRoleBtn("#263238")}
                onClick={() => handleSwitchRole("/admin", "ADMIN")}
              >
                🛡️ Test as Admin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f4f6f8",
    paddingBottom: "40px",
  },
  header: {
    background: "#2e7d32",
    color: "white",
    padding: "25px 20px",
    textAlign: "center",
    position: "relative",
    borderBottomLeftRadius: "24px",
    borderBottomRightRadius: "24px",
  },
  backBtn: {
    position: "absolute",
    left: "20px",
    top: "22px",
    background: "white",
    color: "#2e7d32",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    fontSize: "22px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  tabRow: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "20px",
    padding: "0 15px",
    flexWrap: "wrap",
  },
  tabBtn: (active) => ({
    padding: "12px 20px",
    borderRadius: "25px",
    border: "none",
    backgroundColor: active ? "#2e7d32" : "#ffffff",
    color: active ? "#ffffff" : "#444444",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "all 0.2s ease",
  }),
  contentBox: {
    maxWidth: "900px",
    margin: "25px auto",
    padding: "0 20px",
  },
  sectionTitle: {
    color: "#2e7d32",
    fontSize: "22px",
    marginTop: 0,
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "20px",
  },
  stepCard: (bg, accent) => ({
    backgroundColor: bg,
    borderRadius: "16px",
    padding: "18px 22px",
    borderLeft: `6px solid ${accent}`,
    position: "relative",
    boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
  }),
  stepBadge: (accent) => ({
    display: "inline-block",
    backgroundColor: accent,
    color: "white",
    fontSize: "11px",
    fontWeight: "bold",
    padding: "3px 10px",
    borderRadius: "12px",
    marginBottom: "6px",
  }),
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
    marginTop: "20px",
  },
  roleCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  actionBtn: (color) => ({
    width: "100%",
    padding: "10px",
    backgroundColor: color,
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "12px",
    fontSize: "13px",
  }),
  bigRoleBtn: (color) => ({
    padding: "16px 24px",
    backgroundColor: color,
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  }),
};

export default SystemInteractions;

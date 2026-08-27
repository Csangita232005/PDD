import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleSelection() {
  const navigate = useNavigate();
  const { currentUser, switchRole, logout } = useAuth();
  const [errorMsg, setErrorMsg] = useState("");

  const rolesList = [
    { id: "DONOR", title: "Donor", icon: "🍱", color: "#2e7d32", bg: "#e8f5e9" },
    { id: "NGO", title: "NGO", icon: "🏛️", color: "#1565c0", bg: "#e3f2fd" },
    { id: "RECEIVER", title: "Receiver", icon: "🤲", color: "#ef6c00", bg: "#fff3e0" },
    { id: "VOLUNTEER", title: "Volunteer", icon: "🚴", color: "#7b1fa2", bg: "#f3e5f5" },
  ];

  const handleSelectRole = (selectedRole) => {
    setErrorMsg("");

    if (switchRole) switchRole(selectedRole);

    const isDonorCompleted = Boolean(currentUser?.roleProfiles?.donor?.isRegistered || currentUser?.donorAddress || currentUser?.address);
    const isNgoCompleted = Boolean(currentUser?.roleProfiles?.ngo?.isRegistered || currentUser?.ngoAddress || currentUser?.organizationName);
    const isVolCompleted = Boolean(currentUser?.roleProfiles?.volunteer?.isRegistered || currentUser?.volunteerAddress || currentUser?.vehicleType);
    const isRecCompleted = Boolean(currentUser?.roleProfiles?.beneficiary?.isRegistered || currentUser?.receiverAddress || currentUser?.receiverType);

    const isCompleted =
      selectedRole === "DONOR"
        ? isDonorCompleted
        : selectedRole === "NGO"
        ? isNgoCompleted
        : selectedRole === "VOLUNTEER"
        ? isVolCompleted
        : isRecCompleted;

    if (isCompleted) {
      const dashboardRoutes = {
        DONOR: "/donor/dashboard",
        NGO: "/ngo/dashboard",
        VOLUNTEER: "/volunteer/dashboard",
        RECEIVER: "/receiver/dashboard",
      };
      navigate(dashboardRoutes[selectedRole] || "/donor/dashboard");
    } else {
      const setupRoutes = {
        DONOR: "/donorsetup",
        NGO: "/ngosetup",
        VOLUNTEER: "/volunteersetup",
        RECEIVER: "/receiversetup",
      };
      navigate(setupRoutes[selectedRole] || "/donorsetup");
    }
  };

  const handleBackToLogin = () => {
    if (logout) logout();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>

      <div style={styles.box}>
        <h1 style={styles.title}>Select Your Role</h1>
        <p style={styles.subtitle}>Choose your account role to open your dashboard</p>

        {errorMsg && (
          <div
            style={{
              backgroundColor: "#ffebee",
              color: "#c62828",
              border: "1px solid #ffcdd2",
              padding: "10px 14px",
              borderRadius: "10px",
              marginBottom: "16px",
              fontSize: "13px",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        <div style={styles.grid}>
          {rolesList.map((item) => (
            <button
              key={item.id}
              style={{
                ...styles.roleBtn,
                backgroundColor: item.bg,
                borderColor: item.color,
                color: item.color,
              }}
              onClick={() => handleSelectRole(item.id)}
            >
              <span style={styles.icon}>{item.icon}</span>
              <span style={styles.roleTitle}>{item.title}</span>
            </button>
          ))}
        </div>

        <div style={styles.footerRow}>
          <span style={styles.link} onClick={handleBackToLogin}>
            ← Back to Login
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundImage:
      "url('https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1400')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    position: "relative",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    backdropFilter: "blur(3px)",
  },
  box: {
    position: "relative",
    zIndex: 2,
    background: "rgba(255, 255, 255, 0.96)",
    padding: "36px 28px",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
  },
  title: {
    color: "#1b5e20",
    margin: "0 0 6px 0",
    fontSize: "28px",
    fontWeight: "800",
  },
  subtitle: {
    color: "#666",
    margin: "0 0 24px 0",
    fontSize: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "24px",
  },
  roleBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 14px",
    borderRadius: "14px",
    border: "2px solid",
    cursor: "pointer",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    outline: "none",
  },
  icon: {
    fontSize: "36px",
    marginBottom: "8px",
  },
  roleTitle: {
    fontSize: "16px",
    fontWeight: "800",
  },
  footerRow: {
    marginTop: "8px",
  },
  link: {
    color: "#2e7d32",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
  },
};

export default RoleSelection;
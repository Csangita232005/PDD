import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminLoginUser } from "../services/api";

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    const targetEmail = email.trim().toLowerCase();
    const targetPass = password;

    if (!targetEmail || !targetPass) {
      setErrorMsg("Invalid admin email or password.");
      return;
    }

    setLoading(true);
    try {
      const res = await adminLoginUser({ email: targetEmail, password: targetPass });
      setLoading(false);
      if (res && res.success && res.user) {
        const uRole = (res.user.role || "").toUpperCase();
        if (uRole === "ADMIN" || res.isAdmin) {
          login(res.token, { ...res.user, role: "ADMIN" }, { sessionMode: "admin", role: "ADMIN" });
          navigate("/admin/dashboard");
        } else {
          setErrorMsg("Access denied. Account does not have administrator privileges.");
        }
      } else {
        setErrorMsg(res?.message || "Invalid admin email address or password.");
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || err.message || "Invalid admin email address or password.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>

      <div style={styles.box}>
        <div style={styles.icon}>🛡️</div>

        <h1 style={styles.title}>Admin Control Center</h1>
        <p style={styles.subtitle}>Enter administrator credentials to proceed</p>

        {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

        <form onSubmit={handleAdminLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Admin Email Address</label>
            <input
              type="email"
              placeholder="e.g. admin@sharebite.org"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Admin Password</label>
            <input
              type="password"
              placeholder="Enter password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" style={styles.loginBtn} disabled={loading}>
            {loading ? "Authenticating..." : "Login to Admin Dashboard"}
          </button>
        </form>

        <button
          type="button"
          style={styles.backBtn}
          onClick={() => navigate("/login")}
        >
          ← Back to User Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundImage:
      "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(4px)",
  },
  box: {
    position: "relative",
    zIndex: 2,
    background: "rgba(255, 255, 255, 0.96)",
    padding: "36px 32px",
    borderRadius: "20px",
    width: "360px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
  },
  icon: {
    fontSize: "44px",
    marginBottom: "4px",
  },
  title: {
    color: "#1e293b",
    margin: "4px 0",
    fontSize: "24px",
    fontWeight: "700",
  },
  subtitle: {
    color: "#64748b",
    margin: "0 0 20px 0",
    fontSize: "13px",
  },
  errorBox: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    border: "1px solid #ffcdd2",
    padding: "10px 14px",
    borderRadius: "10px",
    marginBottom: "16px",
    fontSize: "13px",
    fontWeight: "600",
    textAlign: "left",
  },
  inputGroup: {
    textAlign: "left",
    marginBottom: "14px",
  },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "5px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1.5px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
  },
  loginBtn: {
    width: "100%",
    padding: "14px",
    background: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.3)",
    marginTop: "8px",
  },
  backBtn: {
    width: "100%",
    padding: "11px",
    background: "#f1f5f9",
    color: "#334155",
    border: "none",
    borderRadius: "10px",
    marginTop: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "13px",
  },
};

export default AdminLogin;
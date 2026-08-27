import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { resetPasswordDirectApi } from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !newPassword || !confirmPassword) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (!trimmedEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Confirm password does not match new password.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordDirectApi(trimmedEmail, newPassword);
      setLoading(false);

      if (res && res.success) {
        navigate("/login", {
          state: {
            email: trimmedEmail,
            successMsg: "Password reset successfully. Please login with your new password.",
          },
        });
      } else {
        setErrorMsg(res?.message || "Failed to reset password. Please check registered email address.");
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || "No account found with this email address.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>

      <div style={styles.box}>
        <div style={styles.icon}>🔑</div>
        <h1 style={styles.title}>{t("appName") || "FoodBridge"}</h1>
        <p style={styles.subtitle}>Reset Account Password</p>
        <p style={styles.desc}>Enter your registered email address and choose a new password.</p>

        {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

        <form onSubmit={handleResetPassword}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Registered Email Address *</label>
            <input
              type="email"
              placeholder="e.g. user@domain.com"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password * (min 6 chars)</label>
            <input
              type="password"
              placeholder="Enter new password"
              style={styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password *</label>
            <input
              type="password"
              placeholder="Re-enter new password"
              style={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Resetting Password..." : "Reset Password & Login"}
          </button>
        </form>

        <p style={{ marginTop: "20px" }}>
          <span style={styles.link} onClick={() => navigate("/login")}>
            ← Back to Login
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundImage:
      "url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1400')",
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
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    backdropFilter: "blur(3px)",
  },
  box: {
    position: "relative",
    zIndex: 2,
    background: "rgba(255, 255, 255, 0.96)",
    padding: "36px 32px",
    borderRadius: "20px",
    width: "360px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
  },
  icon: {
    fontSize: "40px",
    marginBottom: "4px",
  },
  title: {
    color: "#1b5e20",
    margin: "0 0 4px 0",
    fontSize: "28px",
    fontWeight: "800",
  },
  subtitle: {
    color: "#333",
    fontWeight: "700",
    fontSize: "18px",
    margin: "0 0 6px 0",
  },
  desc: {
    color: "#666",
    fontSize: "13px",
    marginBottom: "18px",
    lineHeight: "1.4",
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
    marginBottom: "12px",
  },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: "700",
    color: "#333",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: "9px",
    border: "1.5px solid #d0d7de",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    marginTop: "8px",
    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
  },
  link: {
    color: "#2e7d32",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
  },
};

export default ForgotPassword;
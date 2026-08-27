import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (location.state?.successMsg) {
      setSuccessMsg(location.state.successMsg);
    }
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);



  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim() || !password) {
      setErrorMsg("Please enter email address and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({ email: email.trim().toLowerCase(), password });
      setLoading(false);
      if (res.success && res.user) {
        login(res.token, res.user);
        navigate("/select-role", { replace: true });
      } else {
        setErrorMsg(res.message || "Invalid email address or password.");
      }
    } catch (error) {
      setLoading(false);
      setErrorMsg(error.response?.data?.message || "Invalid email address or password.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>

      <div style={styles.box}>
        <div style={styles.logoBadge}>🍲</div>
        <h1 style={styles.title}>{t("appName") || "FoodBridge"}</h1>
        <p style={styles.subtitle}>{t("welcomeBack") || "Sign in to continue"}</p>

        {successMsg && <div style={styles.successBox}>{successMsg}</div>}
        {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

        <form onSubmit={handleLogin} autoComplete="on">
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              id="login-email"
              autoComplete="username"
              placeholder="Enter your email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              id="login-password"
              autoComplete="current-password"
              placeholder="Enter your password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={styles.forgotWrapper}>
            <span style={styles.forgot} onClick={() => navigate("/forgot-password")}>
              Forgot Password?
            </span>
          </div>

          <button type="submit" style={styles.loginBtn} disabled={loading}>
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <div style={styles.footerRow}>
          <p style={styles.footerText}>
            Don't have an account?{" "}
            <span
              style={styles.link}
              onClick={() => {
                logout();
                navigate("/register");
              }}
            >
              Create Account
            </span>
          </p>
        </div>

        <div style={styles.adminRow}>
          <span style={styles.adminLink} onClick={() => navigate("/admin-login")}>
            🔒 Admin Login
          </span>
        </div>
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
  logoBadge: {
    fontSize: "42px",
    marginBottom: "4px",
  },
  title: {
    color: "#1b5e20",
    margin: "0 0 4px 0",
    fontSize: "30px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#666",
    margin: "0 0 22px 0",
    fontSize: "14px",
  },
  successBox: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    border: "1px solid #c8e6c9",
    padding: "10px 14px",
    borderRadius: "10px",
    marginBottom: "16px",
    fontSize: "13px",
    fontWeight: "600",
    textAlign: "left",
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
    color: "#333",
    marginBottom: "5px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1.5px solid #d0d7de",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  forgotWrapper: {
    textAlign: "right",
    marginBottom: "18px",
  },
  forgot: {
    color: "#2e7d32",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  loginBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
    transition: "background-color 0.2s ease",
  },
  footerRow: {
    marginTop: "20px",
  },
  footerText: {
    margin: 0,
    fontSize: "14px",
    color: "#555",
  },
  link: {
    color: "#2e7d32",
    cursor: "pointer",
    fontWeight: "700",
  },
  adminRow: {
    marginTop: "16px",
    paddingTop: "14px",
    borderTop: "1px solid #eee",
  },
  adminLink: {
    color: "#455a64",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
};

export default Login;
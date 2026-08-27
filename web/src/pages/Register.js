import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

function Register() {
  const navigate = useNavigate();

  // Basic Account Creation Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || !email.trim() || !mobile.trim() || !password || !confirmPassword) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (mobile.trim().length < 7) {
      setErrorMsg("Please enter a valid mobile number.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        password,
      };

      const res = await registerUser(payload);
      setLoading(false);

      if (res.success) {
        setRegisterSuccess(true);
      } else {
        setErrorMsg(res.message || "Registration failed.");
      }
    } catch (error) {
      setLoading(false);
      setErrorMsg(error.response?.data?.message || "Registration failed. Email address may already be registered.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>

      <div style={styles.box}>
        {registerSuccess ? (
          <div style={{ textAlign: "center", padding: "12px 6px" }}>
            <div style={{ fontSize: "52px", marginBottom: "12px" }}>🎉</div>
            <h2 style={{ color: "#1b5e20", margin: "0 0 10px 0", fontSize: "24px", fontWeight: "700" }}>
              Account Created Successfully!
            </h2>
            <p style={{ color: "#555", fontSize: "14px", marginBottom: "24px", lineHeight: "1.5" }}>
              Your account has been created. Click below to return to the Login screen, sign in with your email and password, and select your role.
            </p>
            <button
              onClick={() =>
                navigate("/login", {
                  state: {
                    email: email.trim().toLowerCase(),
                    successMsg: "Account created successfully! Please log in to continue.",
                  },
                })
              }
              style={styles.registerBtn}
            >
              ← Back to Login
            </button>
          </div>
        ) : (
          <>
            <div style={styles.headerBadge}>
              <span style={{ fontSize: "36px" }}>👤</span>
            </div>
            <h1 style={{ ...styles.title, color: "#1b5e20" }}>Create Account</h1>
            <p style={styles.subtitle}>Enter your details to create your account</p>

        {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

        <form onSubmit={handleRegister} autoComplete="on">
          <div style={styles.sectionHeader}>📋 Account Information</div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              placeholder="Enter full name"
              style={styles.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address *</label>
            <input
              type="email"
              placeholder="name@example.com"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mobile Number *</label>
            <input
              type="tel"
              placeholder="Enter mobile number"
              style={styles.input}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password * (min 6 characters)</label>
            <input
              type="password"
              placeholder="Create password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password *</label>
            <input
              type="password"
              placeholder="Re-enter password"
              style={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            style={{ ...styles.registerBtn, backgroundColor: "#2e7d32" }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

            <p style={{ marginTop: "20px", fontSize: "14px", color: "#555" }}>
              Already have an account?{" "}
              <span style={styles.link} onClick={() => navigate("/login")}>
                Sign In Here
              </span>
            </p>
          </>
        )}
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
    padding: "30px 20px",
    position: "relative",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(3px)",
  },
  box: {
    position: "relative",
    zIndex: 2,
    background: "rgba(255, 255, 255, 0.97)",
    padding: "32px 28px",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "460px",
    textAlign: "center",
    boxShadow: "0 12px 35px rgba(0, 0, 0, 0.35)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  headerBadge: {
    marginBottom: "4px",
  },
  title: {
    margin: "0 0 4px 0",
    fontSize: "26px",
    fontWeight: "800",
  },
  subtitle: {
    color: "#666",
    margin: "0 0 18px 0",
    fontSize: "14px",
  },
  sectionHeader: {
    textAlign: "left",
    fontWeight: "800",
    fontSize: "12px",
    color: "#1b5e20",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginTop: "16px",
    marginBottom: "10px",
    paddingBottom: "4px",
    borderBottom: "1.5px solid #e8f5e9",
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
  registerBtn: {
    width: "100%",
    padding: "13px",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    marginTop: "16px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  },
  link: {
    color: "#2e7d32",
    cursor: "pointer",
    fontWeight: "700",
  },
};

export default Register;
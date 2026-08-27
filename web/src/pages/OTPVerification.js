import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { sendOtpApi, verifyOtpApi } from "../services/api";

function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const userEmail = location.state?.email || "";
  const initialMsg = location.state?.initialMsg || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState(initialMsg);

  // 60-second cooldown timer for Resend OTP
  const [resendTimer, setResendTimer] = useState(60);

  // 5-minute expiry countdown timer (300 seconds)
  const [expiryTimer, setExpiryTimer] = useState(300);

  useEffect(() => {
    if (!userEmail) {
      navigate("/forgot");
    }
  }, [userEmail, navigate]);

  // Resend Cooldown Countdown
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // OTP Expiry Countdown
  useEffect(() => {
    let timer;
    if (expiryTimer > 0) {
      timer = setInterval(() => setExpiryTimer((prev) => prev - 1), 1000);
    } else {
      setError("OTP expired. Please request a new OTP.");
    }
    return () => clearInterval(timer);
  }, [expiryTimer]);

  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) return;

    setLoading(true);
    setError("");
    setInfoMsg("");

    try {
      const res = await sendOtpApi(userEmail);
      setLoading(false);

      if (res && res.success) {
        setInfoMsg(res.message || "OTP sent successfully to your email.");
        setResendTimer(60);
        setExpiryTimer(300);
      } else {
        setError(res?.message || "Unable to resend OTP. Please try again.");
      }
    } catch (e) {
      setLoading(false);
      setError(e.response?.data?.message || "Unable to resend OTP. Please try again.");
    }
  };

  const handleVerify = async () => {
    setError("");
    setInfoMsg("");

    if (!otp || otp.length !== 6) {
      setError("Please enter the exact 6-digit OTP code received in your email.");
      return;
    }

    if (expiryTimer <= 0) {
      setError("OTP expired. Please request a new OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtpApi(userEmail, otp.trim());
      setLoading(false);

      if (res && res.success) {
        navigate("/reset", {
          state: {
            email: userEmail,
            resetToken: res.resetToken,
          },
        });
      } else {
        setError(res?.message || "Invalid OTP code. Please check your email inbox (and Spam folder).");
      }
    } catch (e) {
      setLoading(false);
      setError(e.response?.data?.message || "Invalid OTP code. Please check your email inbox (and Spam folder).");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>

      <div style={styles.box}>
        <h1 style={styles.title}>{t("appName") || "SHAREBITE"}</h1>
        <h2 style={styles.heading}>Verify OTP</h2>

        <p style={styles.subtitle}>
          Enter the 6-digit OTP sent to your registered email:<br />
          <strong style={{ color: "#2e7d32" }}>{userEmail}</strong>
        </p>

        {infoMsg && <div style={styles.infoBox}>📩 {infoMsg}</div>}
        {error && <div style={styles.errorBox}>❌ {error}</div>}

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          style={styles.input}
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
          disabled={loading || expiryTimer <= 0}
        />

        <button style={styles.button} onClick={handleVerify} disabled={loading || expiryTimer <= 0}>
          {loading ? "Verifying OTP..." : "Verify OTP"}
        </button>

        <div style={{ marginTop: "18px" }}>
          {resendTimer > 0 ? (
            <span style={{ color: "#777", fontSize: "14px" }}>
              Resend OTP in <b>{resendTimer} seconds</b>
            </span>
          ) : (
            <button style={styles.resendBtn} onClick={handleResendOtp} disabled={loading}>
              🔄 Resend OTP
            </button>
          )}
        </div>

        <div style={styles.expiryRow}>
          OTP expires in: <span style={{ fontWeight: "bold", color: expiryTimer < 60 ? "#c62828" : "#2e7d32" }}>{formatTime(expiryTimer)}</span>
        </div>

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
      "url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    padding: "20px",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  box: {
    position: "relative",
    zIndex: 2,
    background: "rgba(255,255,255,0.96)",
    padding: "35px",
    borderRadius: "18px",
    width: "360px",
    textAlign: "center",
    boxShadow: "0 5px 20px rgba(0,0,0,0.4)",
  },
  title: {
    color: "#2e7d32",
    marginBottom: "5px",
    fontSize: "36px",
  },
  heading: {
    color: "#333",
    fontSize: "22px",
    margin: "10px 0 6px 0",
  },
  subtitle: {
    color: "#555",
    fontSize: "14px",
    marginBottom: "16px",
    lineHeight: "1.4",
  },
  infoBox: {
    backgroundColor: "#e8f5e9",
    color: "#1b5e20",
    padding: "10px 12px",
    borderRadius: "10px",
    marginBottom: "16px",
    fontSize: "13px",
    lineHeight: "1.4",
    border: "1px solid #c8e6c9",
  },
  errorBox: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
    fontSize: "14px",
    border: "1px solid #ef9a9a",
  },
  input: {
    width: "92%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "22px",
    textAlign: "center",
    letterSpacing: "6px",
    fontWeight: "bold",
  },
  button: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
  resendBtn: {
    background: "none",
    border: "none",
    color: "#2e7d32",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
    textDecoration: "underline",
  },
  expiryRow: {
    marginTop: "14px",
    fontSize: "13px",
    color: "#666",
  },
  link: {
    color: "#2e7d32",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default OTPVerification;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNotifications, updateUserProfile } from "../services/api";
import { getSocket, joinUserRoom, joinRoleRoom } from "../services/socket";
import GooglePlaceAutocomplete from "./GooglePlaceAutocomplete";

function NavbarHeader({ title, subtitle, onNotificationClick }) {
  const navigate = useNavigate();
  const { currentUser, role, switchRole, logout, refreshUserProfile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const getRoleAddress = () => {
    if (role === "NGO") return currentUser?.ngoAddress || currentUser?.formattedAddress || currentUser?.address || "";
    if (role === "RECEIVER") return currentUser?.receiverAddress || currentUser?.formattedAddress || currentUser?.address || "";
    if (role === "VOLUNTEER") return currentUser?.volunteerAddress || currentUser?.formattedAddress || currentUser?.address || "";
    return currentUser?.donorAddress || currentUser?.formattedAddress || currentUser?.address || "";
  };

  const userAddress = getRoleAddress();
  const [editingAddress, setEditingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(userAddress);
  const [newCoords, setNewCoords] = useState({
    lat: currentUser?.latitude || 17.3850,
    lng: currentUser?.longitude || 78.4867,
    placeId: currentUser?.placeId || "",
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    setNewAddress(getRoleAddress());
    if (currentUser?.latitude && currentUser?.longitude) {
      setNewCoords({
        lat: currentUser.latitude,
        lng: currentUser.longitude,
        placeId: currentUser.placeId || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, role]);

  const fetchUnread = async () => {
    if (!currentUser?.id && !currentUser?._id) return;
    try {
      const uid = currentUser.id || currentUser._id;
      const res = await getNotifications(role === "ADMIN" ? null : uid);
      if (res.success && Array.isArray(res.notifications)) {
        const unread = res.notifications.filter((n) => !n.isRead && !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (e) {
      console.warn("Failed to fetch notification count:", e);
    }
  };

  useEffect(() => {
    fetchUnread();

    const socket = getSocket();
    const uid = currentUser?.id || currentUser?._id;
    if (uid) {
      joinUserRoom(uid);
      if (role) joinRoleRoom(role);
    }

    const handleNotifUpdate = () => {
      fetchUnread();
    };

    socket.on("notification:new", handleNotifUpdate);
    socket.on("donation:claimed", handleNotifUpdate);
    socket.on("delivery:status_change", handleNotifUpdate);
    socket.on("donation:completed", handleNotifUpdate);

    return () => {
      socket.off("notification:new", handleNotifUpdate);
      socket.off("donation:claimed", handleNotifUpdate);
      socket.off("delivery:status_change", handleNotifUpdate);
      socket.off("donation:completed", handleNotifUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, role]);

  const getNotifRoute = () => {
    if (role === "NGO") return "/ngonotifications";
    if (role === "RECEIVER") return "/receivernotifications";
    if (role === "VOLUNTEER") return "/volunteernotifications";
    return "/notifications";
  };

  const getBgGradient = () => {
    if (role === "NGO") return "linear-gradient(135deg, #1b5e20, #2e7d32)";
    if (role === "RECEIVER") return "linear-gradient(135deg, #d84315, #f57c00)";
    if (role === "VOLUNTEER") return "linear-gradient(135deg, #1565c0, #1976d2)";
    if (role === "ADMIN") return "linear-gradient(135deg, #263238, #37474f)";
    return "linear-gradient(135deg, #2e7d32, #43a047)";
  };

  const getGreeting = () => {
    const roleLabel =
      role === "NGO"
        ? "NGO"
        : role === "RECEIVER"
        ? "Beneficiary"
        : role === "VOLUNTEER"
        ? "Volunteer"
        : role === "ADMIN"
        ? "Admin"
        : "Donor";
    const name = currentUser?.name ? ` ${currentUser.name}` : "";
    return `Welcome, ${roleLabel}${name}`;
  };

  const handleRoleSwitch = (targetRole) => {
    if (switchRole) switchRole(targetRole);
    setShowProfileModal(false);

    const hasTargetAddress =
      targetRole === "NGO"
        ? currentUser?.ngoAddress
        : targetRole === "RECEIVER"
        ? currentUser?.receiverAddress
        : targetRole === "VOLUNTEER"
        ? currentUser?.volunteerAddress
        : currentUser?.donorAddress || currentUser?.address;

    if (!hasTargetAddress) {
      const setupRoutes = {
        DONOR: "/donorsetup",
        NGO: "/ngosetup",
        VOLUNTEER: "/volunteersetup",
        RECEIVER: "/receiversetup",
      };
      navigate(setupRoutes[targetRole] || "/donorsetup");
    } else {
      const routes = {
        DONOR: "/donor/dashboard",
        NGO: "/ngo/dashboard",
        VOLUNTEER: "/volunteer/dashboard",
        RECEIVER: "/receiver/dashboard",
        ADMIN: "/admin/dashboard",
      };
      navigate(routes[targetRole] || (targetRole === "ADMIN" ? "/admin/dashboard" : "/donor/dashboard"));
    }
  };

  const handleSaveAddress = async () => {
    if (!newAddress.trim()) {
      alert("Please enter a valid address.");
      return;
    }
    setSavingAddress(true);
    try {
      const uid = currentUser?.id || currentUser?._id;
      const res = await updateUserProfile({
        userId: uid,
        email: currentUser?.email,
        activeRole: role,
        role: role,
        address: newAddress.trim(),
        formattedAddress: newAddress.trim(),
        latitude: newCoords.lat,
        longitude: newCoords.lng,
        placeId: newCoords.placeId,
      });
      setSavingAddress(false);
      if (res.success) {
        alert(`${role} address updated successfully! 📍`);
        await refreshUserProfile();
        setEditingAddress(false);
      } else {
        alert(res.message || "Failed to update address.");
      }
    } catch (e) {
      setSavingAddress(false);
      alert("Failed to update address.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header style={{ ...styles.header, background: getBgGradient() }}>
      <div style={styles.topRow}>
        <div style={styles.brandGroup}>
          <span style={styles.roleIcon}>
            {role === "NGO"
              ? "🏛️"
              : role === "RECEIVER"
              ? "🤲"
              : role === "VOLUNTEER"
              ? "🚴"
              : role === "ADMIN"
              ? "🛡️"
              : "🍱"}
          </span>
          <div>
            <h1 style={styles.greetingText}>{getGreeting()}</h1>
            {title && <span style={styles.pageTitle}>{title}</span>}
          </div>
        </div>

        <div style={styles.rightGroup}>
          {/* Notification Bell with Badge */}
          <div
            style={styles.bellContainer}
            onClick={() => {
              setUnreadCount(0);
              if (onNotificationClick) {
                onNotificationClick();
              } else {
                navigate(getNotifRoute());
              }
            }}
            title="Notifications"
          >
            <span style={styles.bellIcon}>🔔</span>
            {unreadCount > 0 && (
              <span style={styles.badge}>{unreadCount > 99 ? "99+" : unreadCount}</span>
            )}
          </div>

          {/* User Profile Avatar */}
          <div
            style={styles.profileBtn}
            onClick={() => setShowProfileModal(!showProfileModal)}
            title="View Profile & Options"
          >
            <span style={styles.avatarEmoji}>
              {role === "NGO"
                ? "🏛️"
                : role === "RECEIVER"
                ? "🤲"
                : role === "VOLUNTEER"
                ? "🚴"
                : role === "ADMIN"
                ? "🛡️"
                : "👤"}
            </span>
          </div>
        </div>
      </div>

      {subtitle && (
        <div style={styles.bottomRow}>
          <p style={styles.subtitle}>{subtitle}</p>
        </div>
      )}

      {/* Profile Info Modal Dropdown */}
      {showProfileModal && (
        <div style={styles.modalOverlay} onClick={() => setShowProfileModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, color: "#263238" }}>
                {role === "ADMIN" ? "🛡️ Administrator Profile" : "👤 User Profile"}
              </h3>
              <span style={styles.closeBtn} onClick={() => setShowProfileModal(false)}>
                ✕
              </span>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Name:</span>
                <span style={styles.infoValue}>{currentUser?.name || "Administrator"}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Email:</span>
                <span style={styles.infoValue}>{currentUser?.email || "N/A"}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Active Role:</span>
                <span style={styles.roleBadge}>{role || "DONOR"}</span>
              </div>
              {currentUser?.mobile && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Mobile:</span>
                  <span style={styles.infoValue}>{currentUser.mobile}</span>
                </div>
              )}

              {/* Switch Role Option */}
              <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed #e0e0e0" }}>
                <span style={styles.infoLabel}>🔄 Switch Active Role:</span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                  {["DONOR", "NGO", "VOLUNTEER", "RECEIVER"].map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleSwitch(r)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        border: role === r ? "2px solid #2e7d32" : "1px solid #ccc",
                        backgroundColor: role === r ? "#e8f5e9" : "#f9f9f9",
                        color: role === r ? "#2e7d32" : "#333",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>


              <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed #e0e0e0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={styles.infoLabel}>📍 {role} Address:</span>
                  {!editingAddress && (
                    <button
                      style={{ backgroundColor: "#e8f5e9", color: "#2e7d32", border: "1px solid #c8e6c9", borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                      onClick={() => {
                        setNewAddress(getRoleAddress());
                        setEditingAddress(true);
                      }}
                    >
                      ✏️ Edit {role} Address
                    </button>
                  )}
                </div>

                {!editingAddress ? (
                  <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#333", fontWeight: "600", wordBreak: "break-word" }}>
                    {userAddress || `No ${role} address configured yet.`}
                  </p>
                ) : (
                  <div style={{ marginTop: "6px" }}>
                    <GooglePlaceAutocomplete
                      value={newAddress}
                      onChange={(val) => setNewAddress(val)}
                      onPlaceSelect={(place) => {
                        setNewAddress(place.formattedAddress || place.address);
                        setNewCoords({ lat: place.lat, lng: place.lng, placeId: place.placeId });
                      }}
                      placeholder={`Search ${role} address...`}
                      style={{ marginBottom: "8px" }}
                    />
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={handleSaveAddress}
                        disabled={savingAddress}
                        style={{ flex: 1, backgroundColor: "#2e7d32", color: "white", border: "none", borderRadius: "6px", padding: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        {savingAddress ? "Saving..." : `✓ Save ${role} Address`}
                      </button>
                      <button
                        onClick={() => setEditingAddress(false)}
                        style={{ backgroundColor: "#f5f5f5", color: "#666", border: "1px solid #ccc", borderRadius: "6px", padding: "6px 10px", fontSize: "12px", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button style={styles.modalLogoutBtn} onClick={handleLogout}>
              🚪 Sign Out / Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

const styles = {
  header: {
    padding: "16px 20px 14px 20px",
    color: "white",
    borderBottomLeftRadius: "20px",
    borderBottomRightRadius: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
    position: "relative",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  roleIcon: {
    fontSize: "28px",
  },
  greetingText: {
    margin: 0,
    fontSize: "19px",
    fontWeight: "bold",
    letterSpacing: "0.4px",
  },
  pageTitle: {
    fontSize: "12px",
    opacity: 0.9,
    display: "block",
  },
  rightGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  bellContainer: {
    position: "relative",
    cursor: "pointer",
    background: "rgba(255,255,255,0.22)",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bellIcon: {
    fontSize: "18px",
  },
  badge: {
    position: "absolute",
    top: "-3px",
    right: "-3px",
    backgroundColor: "#d32f2f",
    color: "white",
    fontSize: "11px",
    fontWeight: "bold",
    borderRadius: "10px",
    padding: "2px 6px",
    border: "2px solid white",
    minWidth: "16px",
    textAlign: "center",
  },
  profileBtn: {
    background: "rgba(255,255,255,0.22)",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  avatarEmoji: {
    fontSize: "18px",
  },
  bottomRow: {
    marginTop: "10px",
  },
  subtitle: {
    margin: 0,
    fontSize: "13px",
    opacity: 0.95,
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    width: "320px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
    color: "#333",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  closeBtn: {
    cursor: "pointer",
    fontSize: "16px",
    color: "#888",
    fontWeight: "bold",
  },
  modalBody: {
    marginBottom: "20px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontSize: "14px",
  },
  infoLabel: {
    color: "#666",
    fontWeight: "600",
  },
  infoValue: {
    color: "#222",
    fontWeight: "700",
  },
  roleBadge: {
    background: "#e8f5e9",
    color: "#2e7d32",
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  modalLogoutBtn: {
    width: "100%",
    padding: "12px",
    background: "#c62828",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
  },
};

export default NavbarHeader;

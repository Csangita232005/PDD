import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getAdminStatsApi,
  getAdminUsersApi,
  toggleUserStatusApi,
  getDonations,
  cancelFlagDonationApi,
  getAuditTrailApi,
  getNotifications,
  getActiveDeliveriesAdminApi,
} from "../services/api";
import { getSocket, joinUserRoom, joinRoleRoom } from "../services/socket";
import LocationMap from "../components/LocationMap";
import NavbarHeader from "../components/NavbarHeader";

function AdminDashboard() {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState("overview"); // overview, users, donations, deliveries, notifications, audit
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDeliveryIndex, setSelectedDeliveryIndex] = useState(0);

  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userSearch, setUserSearch] = useState("");
  const [donationStatusFilter, setDonationStatusFilter] = useState("ALL");
  const [donationSearch, setDonationSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const uid = currentUser?.id || currentUser?._id;

  const fetchAdminData = async () => {
    try {
      const resStats = await getAdminStatsApi();
      if (resStats.success) setStats(resStats.stats || {});

      const resUsers = await getAdminUsersApi();
      if (resUsers.success) setUsers(resUsers.users || []);

      const resDonations = await getDonations();
      if (resDonations.success) setDonations(resDonations.donations || []);

      const resAudit = await getAuditTrailApi();
      if (resAudit.success) setAuditTrail(resAudit.auditTrail || []);

      const resNotif = await getNotifications();
      if (resNotif.success) setNotifications(resNotif.notifications || []);

      const resDeliv = await getActiveDeliveriesAdminApi();
      if (resDeliv.success) setDeliveries(resDeliv.deliveries || []);
    } catch (e) {
      console.warn("Failed to fetch admin dashboard data:", e);
    }
  };

  useEffect(() => {
    fetchAdminData();

    const socket = getSocket();
    if (uid) {
      joinUserRoom(uid);
      joinRoleRoom("ADMIN");
    }

    const handleRealtimeUpdate = () => fetchAdminData();

    socket.on("donation:created", handleRealtimeUpdate);
    socket.on("donation:claimed", handleRealtimeUpdate);
    socket.on("delivery:status_change", handleRealtimeUpdate);
    socket.on("donation:completed", handleRealtimeUpdate);
    socket.on("notification:new", handleRealtimeUpdate);

    return () => {
      socket.off("donation:created", handleRealtimeUpdate);
      socket.off("donation:claimed", handleRealtimeUpdate);
      socket.off("delivery:status_change", handleRealtimeUpdate);
      socket.off("donation:completed", handleRealtimeUpdate);
      socket.off("notification:new", handleRealtimeUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleToggleUserStatus = async (userId) => {
    setLoading(true);
    try {
      const res = await toggleUserStatusApi(userId);
      setLoading(false);
      if (res.success) {
        alert(res.message || "User status updated.");
        fetchAdminData();
      } else {
        alert(res.message || "Failed to update user status.");
      }
    } catch (e) {
      setLoading(false);
      alert("Failed to toggle status.");
    }
  };

  const handleCancelFlagDonation = async (donationId) => {
    const reason = window.prompt("Enter reason for cancelling / flagging this donation request:", "Invalid or duplicate request");
    if (reason === null) return; // Cancelled prompt

    setLoading(true);
    try {
      const res = await cancelFlagDonationApi(donationId, reason);
      setLoading(false);
      if (res.success) {
        alert("Donation flagged and status updated to CANCELLED.");
        fetchAdminData();
      } else {
        alert(res.message || "Failed to cancel donation.");
      }
    } catch (e) {
      setLoading(false);
      alert("Failed to cancel donation.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const rolesList = u.registeredRoles || [u.role];
    const matchRole =
      userRoleFilter === "ALL" ||
      u.role === userRoleFilter ||
      rolesList.includes(userRoleFilter);
    const matchSearch =
      (u.name || "").toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.mobile || "").includes(userSearch);
    return matchRole && matchSearch;
  });

  const filteredDonations = donations.filter((d) => {
    const matchStatus = donationStatusFilter === "ALL" || d.status === donationStatusFilter;
    const matchSearch =
      (d.food_name || d.foodName || "").toLowerCase().includes(donationSearch.toLowerCase()) ||
      (d.donor_name || d.donorName || "").toLowerCase().includes(donationSearch.toLowerCase()) ||
      (d.address || "").toLowerCase().includes(donationSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const activeDeliveriesList = donations.filter((d) =>
    ["VOLUNTEER_ASSIGNED", "PICKUP_STARTED", "PICKED_UP", "IN_TRANSIT"].includes(d.status)
  );
  const currentTrackedDonation = activeDeliveriesList[selectedDeliveryIndex] || activeDeliveriesList[0] || donations[0];

  return (
    <div style={styles.container}>
      <NavbarHeader
        title="Admin Control Center & Monitoring System"
        subtitle="Full visibility over users, donations, deliveries & system audit trail"
        onNotificationClick={() => setActiveTab("notifications")}
      />

      {/* Tab Navigation */}
      <div style={styles.tabsBar}>
        <button
          style={activeTab === "overview" ? styles.activeTabBtn : styles.tabBtn}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button
          style={activeTab === "users" ? styles.activeTabBtn : styles.tabBtn}
          onClick={() => setActiveTab("users")}
        >
          👤 Users ({users.length})
        </button>
        <button
          style={activeTab === "donations" ? styles.activeTabBtn : styles.tabBtn}
          onClick={() => setActiveTab("donations")}
        >
          📦 Food Requests ({donations.length})
        </button>
        <button
          style={activeTab === "deliveries" ? styles.activeTabBtn : styles.tabBtn}
          onClick={() => setActiveTab("deliveries")}
        >
          🚴 Deliveries ({deliveries.length})
        </button>

        <button
          style={activeTab === "notifications" ? styles.activeTabBtn : styles.tabBtn}
          onClick={() => setActiveTab("notifications")}
        >
          🔔 System Notifications ({notifications.length})
        </button>
        <button
          style={activeTab === "audit" ? styles.activeTabBtn : styles.tabBtn}
          onClick={() => setActiveTab("audit")}
        >
          📜 Audit Trail ({auditTrail.length})
        </button>
      </div>

      <div style={styles.content}>
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div>
            <div style={styles.statsGrid}>
              <div
                style={{ ...styles.statCard, cursor: "pointer" }}
                onClick={() => {
                  setActiveTab("users");
                  setUserRoleFilter("DONOR");
                }}
                title="View All Donors"
              >
                <h3 style={{ color: "#2e7d32" }}>{stats.donorsCount || 0}</h3>
                <p>Donors 🍱</p>
              </div>

              <div
                style={{ ...styles.statCard, cursor: "pointer" }}
                onClick={() => {
                  setActiveTab("users");
                  setUserRoleFilter("NGO");
                }}
                title="View All NGOs"
              >
                <h3 style={{ color: "#1b5e20" }}>{stats.ngosCount || 0}</h3>
                <p>NGOs 🏛️</p>
              </div>

              <div
                style={{ ...styles.statCard, cursor: "pointer" }}
                onClick={() => {
                  setActiveTab("users");
                  setUserRoleFilter("RECEIVER");
                }}
                title="View All Receivers"
              >
                <h3 style={{ color: "#e65100" }}>{stats.receiversCount || 0}</h3>
                <p>Receivers 🤲</p>
              </div>

              <div
                style={{ ...styles.statCard, cursor: "pointer" }}
                onClick={() => {
                  setActiveTab("users");
                  setUserRoleFilter("VOLUNTEER");
                }}
                title="View All Volunteers"
              >
                <h3 style={{ color: "#1565c0" }}>{stats.volunteersCount || 0}</h3>
                <p>Volunteers 🚴</p>
              </div>

              <div
                style={{ ...styles.statCard, cursor: "pointer" }}
                onClick={() => {
                  setActiveTab("donations");
                  setDonationStatusFilter("ALL");
                }}
                title="View All Food Requests"
              >
                <h3 style={{ color: "#333" }}>{stats.totalDonations || 0}</h3>
                <p>Total Food Requests 📦</p>
              </div>

              <div
                style={{ ...styles.statCard, cursor: "pointer" }}
                onClick={() => setActiveTab("deliveries")}
                title="View Active Deliveries"
              >
                <h3 style={{ color: "#1565c0" }}>{stats.activeDeliveries || 0}</h3>
                <p>Active Deliveries 🚚</p>
              </div>

              <div
                style={{ ...styles.statCard, cursor: "pointer" }}
                onClick={() => {
                  setActiveTab("donations");
                  setDonationStatusFilter("COMPLETED");
                }}
                title="View Completed Deliveries"
              >
                <h3 style={{ color: "#2e7d32" }}>{stats.completedDonations || 0}</h3>
                <p>Food Received / Completed ✅</p>
              </div>

              <div
                style={{ ...styles.statCard, cursor: "pointer" }}
                onClick={() => {
                  setActiveTab("donations");
                  setDonationStatusFilter("CANCELLED");
                }}
                title="View Cancelled Requests"
              >
                <h3 style={{ color: "#c62828" }}>{stats.cancelledCount || 0}</h3>
                <p>Cancelled Requests 🚫</p>
              </div>
            </div>

            {/* Live Delivery Monitoring Section */}
            <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "18px", marginBottom: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.06)", border: "1px solid #e3f2fd" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ margin: 0, color: "#1565c0", fontSize: "18px", fontWeight: "bold" }}>
                    📡 Live Delivery Monitoring System
                  </h3>
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    Real-time fleet tracking, active routes & live telemetry pings
                  </span>
                </div>
                {activeDeliveriesList.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#1565c0" }}>Active Task:</label>
                    <select
                      style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #1565c0", fontSize: "13px", fontWeight: "bold", color: "#1565c0" }}
                      value={selectedDeliveryIndex}
                      onChange={(e) => setSelectedDeliveryIndex(Number(e.target.value))}
                    >
                      {activeDeliveriesList.map((d, index) => (
                        <option key={d.id || d._id} value={index}>
                          Task #{d.id || d._id}: {d.food_name || d.foodName} ({d.status})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {currentTrackedDonation && (
                <div style={{ backgroundColor: "#f8fafd", padding: "14px", borderRadius: "12px", marginBottom: "14px", border: "1px solid #e1eaf5", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Task ID / Food:</span>
                    <p style={{ margin: "2px 0 0 0", fontSize: "13px", fontWeight: "bold", color: "#1565c0" }}>
                      #{currentTrackedDonation.id || currentTrackedDonation._id} — {currentTrackedDonation.food_name || currentTrackedDonation.foodName}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Donor Pickup:</span>
                    <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#333" }}>{currentTrackedDonation.address}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Recipient / Drop-off:</span>
                    <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#333" }}>{currentTrackedDonation.recipientAddress || "Destination Pending"}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Deliverer / Status:</span>
                    <p style={{ margin: "2px 0 0 0", fontSize: "13px", fontWeight: "bold", color: "#2e7d32" }}>
                      {currentTrackedDonation.assignedVolunteer || "Volunteer / Self"} ({currentTrackedDonation.status})
                    </p>
                  </div>
                </div>
              )}

              <LocationMap
                title={currentTrackedDonation ? `Live Route Monitoring: ${currentTrackedDonation.food_name || 'Food Rescue'} (${currentTrackedDonation.status})` : "System Live Geographic Operations Map"}
                pickupCoords={currentTrackedDonation ? {
                  lat: currentTrackedDonation.pickupLocation?.coordinates?.[1] || 13.0280,
                  lng: currentTrackedDonation.pickupLocation?.coordinates?.[0] || 80.0158,
                  address: currentTrackedDonation.address || "Pickup Location"
                } : null}
                dropoffCoords={currentTrackedDonation?.recipientAddress && currentTrackedDonation.recipientAddress !== "Recipient Address" ? {
                  address: currentTrackedDonation.recipientAddress
                } : null}
                deliveryType={currentTrackedDonation?.collectionMethod || currentTrackedDonation?.deliveryPreference || "VOLUNTEER_DELIVERY"}
                role="ADMIN"
              />
            </div>

            {/* Recent System Activity Feed */}
            <div style={styles.sectionCard}>
              <h3 style={{ margin: "0 0 15px 0", color: "#263238" }}>⚡ Recent Real-Time Activity Feed</h3>
              {auditTrail.slice(0, 8).map((item) => (
                <div key={item.id} style={styles.feedItem}>
                  <div>
                    <strong>{item.actor}</strong> ({item.status}) — <span>{item.foodName}</span>
                    <p style={{ margin: "2px 0", fontSize: "12px", color: "#666" }}>{item.notes}</p>
                  </div>
                  <span style={{ fontSize: "11px", color: "#888" }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div style={styles.sectionCard}>
            <div style={styles.filterRow}>
              <input
                type="text"
                placeholder="Search user name, email, or mobile..."
                style={styles.searchInput}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <select
                style={styles.selectInput}
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                <option value="DONOR">Donors</option>
                <option value="NGO">NGOs</option>
                <option value="RECEIVER">Receivers</option>
                <option value="VOLUNTEER">Volunteers</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Mobile</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={styles.td}><strong>{u.name}</strong></td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>{u.mobile || "N/A"}</td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {(u.registeredRoles || [u.role]).map((r) => (
                            <span key={r} style={styles.roleTag}>
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{ color: u.isActive ? "#2e7d32" : "#c62828", fontWeight: "bold" }}>
                          {u.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          style={{
                            padding: "6px 12px",
                            backgroundColor: u.isActive ? "#c62828" : "#2e7d32",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                          onClick={() => handleToggleUserStatus(u.id)}
                          disabled={loading}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FOOD REQUESTS TAB */}
        {activeTab === "donations" && (
          <div style={styles.sectionCard}>
            <div style={styles.filterRow}>
              <input
                type="text"
                placeholder="Search food item, donor, or location..."
                style={styles.searchInput}
                value={donationSearch}
                onChange={(e) => setDonationSearch(e.target.value)}
              />
              <select
                style={styles.selectInput}
                value={donationStatusFilter}
                onChange={(e) => setDonationStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="VOLUNTEER_ASSIGNED">Volunteer Assigned</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div style={{ overflowX: "auto" }}>
              {filteredDonations.map((item) => {
                const donId = item.id || item._id;
                return (
                  <div key={donId} style={styles.requestCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <h4 style={{ margin: 0, color: "#2e7d32", fontSize: "16px" }}>{item.food_name || item.foodName} ({item.quantity} {item.unit || "Packs"})</h4>
                        <p style={{ margin: "4px 0", fontSize: "13px" }}>
                          👤 <strong>Donor:</strong> {item.donor_name} ({item.donor_phone || "Contact active"})
                        </p>
                        <p style={{ margin: "4px 0", fontSize: "13px" }}>
                          📍 <strong>Pickup Address:</strong> {item.address}
                        </p>
                        <p style={{ margin: "4px 0", fontSize: "13px", color: "#1565c0" }}>
                          🚚 <strong>Delivery Method:</strong> {(item.collectionMethod || item.deliveryPreference || '').replace('_', ' ')}
                        </p>
                        {item.recipientName && (
                          <p style={{ margin: "4px 0", fontSize: "13px", color: "#1b5e20" }}>
                            🤝 <strong>Recipient ({item.recipientRole}):</strong> {item.recipientName} {item.recipientPhone && `(📞 ${item.recipientPhone})`}
                          </p>
                        )}
                        {item.assignedVolunteer && (
                          <p style={{ margin: "4px 0", fontSize: "13px", color: "#1565c0" }}>
                            🚴 <strong>Volunteer:</strong> {item.assignedVolunteer} {item.volunteerPhone && `(📞 ${item.volunteerPhone})`}
                          </p>
                        )}
                        <p style={{ margin: "4px 0", fontSize: "12px", color: "#777" }}>
                          Posted on: {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <span style={styles.statusBadge(item.status)}>{item.status}</span>
                        {item.status !== "CANCELLED" && item.status !== "COMPLETED" && (
                          <button
                            style={styles.flagBtn}
                            onClick={() => handleCancelFlagDonation(donId)}
                            disabled={loading}
                          >
                            ⚠️ Flag / Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DELIVERIES TAB */}
        {activeTab === "deliveries" && (
          <div style={styles.sectionCard}>
            <h3 style={{ margin: "0 0 15px 0", color: "#1565c0" }}>🚴 Active Volunteer Deliveries ({activeDeliveriesList.length})</h3>
            {activeDeliveriesList.length === 0 ? (
              <p style={{ color: "#666", textAlign: "center", padding: "20px 0" }}>No active volunteer delivery tasks in progress.</p>
            ) : (
              activeDeliveriesList.map((del, idx) => (
                <div key={del.id || del._id} style={styles.requestCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <h4 style={{ margin: 0, color: "#1565c0" }}>Delivery Task #{idx + 1}: {del.food_name || del.foodName}</h4>
                      <p style={{ margin: "4px 0", fontSize: "13px" }}>
                        Volunteer: <strong>{del.assignedVolunteer || "Assigned Volunteer"}</strong> • Status: <span style={{ color: "#2e7d32", fontWeight: "bold" }}>{del.status.replace("_", " ")}</span>
                      </p>
                      <p style={{ margin: "4px 0", fontSize: "13px" }}>
                        📍 <strong>Pickup:</strong> {del.address || "Donor Pickup Address"}
                      </p>
                      <p style={{ margin: "4px 0", fontSize: "13px" }}>
                        🏁 <strong>Destination:</strong> {del.recipientAddress || "Recipient Address"}
                      </p>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(del.address || 'Donor Location')}&destination=${encodeURIComponent(del.recipientAddress || 'Recipient Location')}&dir_action=navigate`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: "#1565c0",
                        color: "white",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      🗺️ View Volunteer Route on Google Maps
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SYSTEM NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <div style={styles.sectionCard}>
            <h3 style={{ margin: "0 0 15px 0", color: "#263238" }}>
              🔔 System Notifications Audit Log ({notifications.length})
            </h3>
            {notifications.length === 0 ? (
              <p style={{ color: "#777", textAlign: "center", padding: "20px 0" }}>
                No system notifications yet. New activity notifications will appear here in real-time.
              </p>
            ) : (
              notifications.map((n) => (
                <div key={n._id || n.id} style={styles.feedItem}>
                  <div>
                    <strong style={{ color: "#1565c0", fontSize: "14px" }}>{n.title}</strong>
                    <p style={{ margin: "4px 0", fontSize: "13px", color: "#333" }}>{n.message}</p>
                    {n.userRole && (
                      <span style={{ fontSize: "11px", backgroundColor: "#e8f5e9", color: "#2e7d32", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                        Target Role: {n.userRole}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "11px", color: "#888", whiteSpace: "nowrap", marginLeft: "10px" }}>
                    {new Date(n.createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* AUDIT TRAIL TAB */}
        {activeTab === "audit" && (
          <div style={styles.sectionCard}>
            <h3 style={{ margin: "0 0 15px 0", color: "#263238" }}>📜 Complete Platform Audit Trail & History</h3>
            {auditTrail.length === 0 ? (
              <p style={{ color: "#777", textAlign: "center", padding: "20px 0" }}>
                No platform audit history yet. Activity logs will be recorded here live as food donations, claims, and deliveries occur.
              </p>
            ) : (
              auditTrail.map((item) => (
                <div key={item.id} style={styles.auditRow}>
                  <div>
                    <strong>{item.actor}</strong> changed status to <span style={{ color: "#2e7d32", fontWeight: "bold" }}>{item.status}</span> for <strong>"{item.foodName}"</strong>
                    <p style={{ margin: "2px 0", fontSize: "12px", color: "#555" }}>{item.notes}</p>
                  </div>
                  <span style={{ fontSize: "11px", color: "#888" }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
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
  tabsBar: {
    display: "flex",
    gap: "10px",
    background: "#ffffff",
    padding: "12px 20px",
    overflowX: "auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  tabBtn: {
    padding: "8px 16px",
    background: "#f5f5f5",
    color: "#555",
    border: "1px solid #ddd",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  activeTabBtn: {
    padding: "8px 16px",
    background: "#263238",
    color: "white",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  content: {
    maxWidth: "1050px",
    margin: "20px auto",
    padding: "0 15px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  statCard: {
    background: "white",
    padding: "14px",
    borderRadius: "14px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  sectionCard: {
    background: "white",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "20px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
  },
  feedItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },
  filterRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
  },
  searchInput: {
    flex: 2,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  selectInput: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "10px",
    fontSize: "13px",
    borderBottom: "2px solid #ddd",
  },
  td: {
    padding: "10px",
    fontSize: "13px",
  },
  roleTag: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    padding: "3px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  requestCard: {
    background: "#fafafa",
    border: "1px solid #eee",
    padding: "14px",
    borderRadius: "12px",
    marginBottom: "12px",
  },
  statusBadge: (status) => ({
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "bold",
    backgroundColor: status === "COMPLETED" ? "#e8f5e9" : status === "CANCELLED" ? "#ffebee" : "#e3f2fd",
    color: status === "COMPLETED" ? "#2e7d32" : status === "CANCELLED" ? "#c62828" : "#1565c0",
    display: "inline-block",
    marginBottom: "8px",
  }),
  flagBtn: {
    display: "block",
    marginTop: "8px",
    padding: "6px 12px",
    backgroundColor: "#c62828",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "11px",
    cursor: "pointer",
  },
  auditRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
    fontSize: "13px",
  },
};

export default AdminDashboard;
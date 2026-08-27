import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminUsers, updateAdminUserStatus } from "../services/api";

function UserManagement() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getAdminUsers();
      if (res.success) setUsers(res.users);
    } catch (e) {
      console.warn("Failed to fetch admin users:", e);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "INACTIVE" ? true : false;
    setLoading(true);
    try {
      const res = await updateAdminUserStatus(userId, nextStatus);
      setLoading(false);
      if (res.success) {
        fetchUsers();
      }
    } catch (err) {
      setLoading(false);
      alert("Failed to update user status.");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>👤 User Registry Management</h2>
      </div>

      <div style={styles.content}>
        <div style={styles.filterRow}>
          <input
            type="text"
            placeholder="Search by name or email..."
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            style={styles.selectInput}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="DONOR">Donors</option>
            <option value="NGO">NGOs</option>
            <option value="VOLUNTEER">Volunteers</option>
            <option value="RECEIVER">Receivers</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Mobile</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={styles.td}>
                      <strong>{user.name}</strong>
                    </td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>{user.mobile || "N/A"}</td>
                    <td style={styles.td}>
                      <span style={styles.roleTag}>{user.role || "DONOR"}</span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          color: user.status === "INACTIVE" ? "#c62828" : "#2e7d32",
                          fontWeight: "bold",
                        }}
                      >
                        {user.status || "ACTIVE"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={{
                          padding: "6px 12px",
                          backgroundColor: user.status === "INACTIVE" ? "#2e7d32" : "#c62828",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        disabled={loading}
                      >
                        {user.status === "INACTIVE" ? "Activate" : "Deactivate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
    maxWidth: "1000px",
    margin: "25px auto",
    padding: "0 20px",
  },
  filterRow: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
  },
  searchInput: {
    flex: 2,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  selectInput: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  tableCard: {
    background: "white",
    borderRadius: "14px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "14px 16px",
    borderBottom: "2px solid #ddd",
    fontSize: "14px",
  },
  td: {
    padding: "12px 16px",
    fontSize: "14px",
  },
  roleTag: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    padding: "4px 8px",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "12px",
  },
};

export default UserManagement;
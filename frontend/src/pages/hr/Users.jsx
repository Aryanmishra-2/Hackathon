import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import UserCard from "./UserCard";
import CreateUserModal from "./CreateUserModal";

import {
  getUsers,
  getArchivedUsers,
} from "../../api/user.api";

import api from "../../api/api";

export default function Users() {

  const [activeTab, setActiveTab] = useState("active"); // "active" or "archived"

  const [users, setUsers] = useState([]);

  const [archivedUsers, setArchivedUsers] = useState([]);

  const [filteredUsers, setFilteredUsers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [openModal, setOpenModal] = useState(false);

  const [editingUser, setEditingUser] = useState(null);

  const [downloadingUserId, setDownloadingUserId] = useState(null);

  const loadUsers = async () => {

    try {

      setLoading(true);

      const data = await getUsers();

      setUsers(data);

      if (activeTab === "active") {
        setFilteredUsers(data);
      }

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to load users."
      );

    } finally {

      setLoading(false);

    }

  };

  const loadArchivedUsers = async () => {

    try {

      setLoading(true);

      const data = await getArchivedUsers();

      setArchivedUsers(data);

      if (activeTab === "archived") {
        setFilteredUsers(data);
      }

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to load archived users."
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    if (activeTab === "active") {
      loadUsers();
    } else {
      loadArchivedUsers();
    }

  }, [activeTab]);

  useEffect(() => {

    const keyword = search.toLowerCase();

    const sourceUsers = activeTab === "active" ? users : archivedUsers;

    setFilteredUsers(

      sourceUsers.filter((user) =>

        user.name?.toLowerCase().includes(keyword) ||

        user.email?.toLowerCase().includes(keyword) ||

        user.role?.toLowerCase().includes(keyword)

      )

    );

  }, [search, users, archivedUsers, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setError("");
  };

  const handleEdit = (user) => {

    setEditingUser(user);
    setOpenModal(true);

  };

  const handleDelete = async (id) => {

    if (!window.confirm("Are you sure you want to archive this user? The user account will be deactivated and moved to Archived Users. All historical performance data will be preserved.")) return;

    try {

      const { deleteUser } = await import("../../api/user.api");

      const result = await deleteUser(id);

      alert(result.message || "User archived successfully.");

      loadUsers();

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Failed to archive user."
      );

    }

  };

  const handleRestore = async (id) => {

    if (!window.confirm("Are you sure you want to restore this user? The user will be able to log in again.")) return;

    try {

      const { restoreUser } = await import("../../api/user.api");

      const result = await restoreUser(id);

      alert(result.message || "User restored successfully.");

      loadArchivedUsers();
      loadUsers(); // Refresh active users too

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Failed to restore user."
      );

    }

  };

  const handleDownloadReport = async (userId, userName) => {

    try {

      setDownloadingUserId(userId);

      // Call the API to download the PDF
      const response = await api.get(`/hr/report/${userId}/download`, {
        responseType: "blob",
      });

      // Create a blob from the response
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Performance_Report_${userName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(`Performance report for ${userName} downloaded successfully!`);

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Failed to download performance report."
      );

    } finally {

      setDownloadingUserId(null);

    }

  };

  const handleModalClose = () => {
    setOpenModal(false);
    setEditingUser(null);
  };

  const handleModalSuccess = () => {
    loadUsers();
    setEditingUser(null);
  };

  return (

    <DashboardLayout>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >

        <h1>Users Management</h1>

        {activeTab === "active" && (
          <button

            onClick={() => setOpenModal(true)}

            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              cursor: "pointer",
            }}

          >

            + Create User

          </button>
        )}

      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          borderBottom: "2px solid #e5e7eb",
        }}
      >
        <button
          onClick={() => handleTabChange("active")}
          style={{
            background: activeTab === "active" ? "#2563eb" : "transparent",
            color: activeTab === "active" ? "#fff" : "#6b7280",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            fontWeight: activeTab === "active" ? "600" : "400",
            fontSize: "15px",
            transition: "all 0.2s",
          }}
        >
          Active Users
        </button>
        <button
          onClick={() => handleTabChange("archived")}
          style={{
            background: activeTab === "archived" ? "#2563eb" : "transparent",
            color: activeTab === "archived" ? "#fff" : "#6b7280",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            fontWeight: activeTab === "archived" ? "600" : "400",
            fontSize: "15px",
            transition: "all 0.2s",
          }}
        >
          Archived Users
        </button>
      </div>

      <input

        type="text"

        placeholder={`Search ${activeTab === "active" ? "Active" : "Archived"} Users`}

        value={search}

        onChange={(e) => setSearch(e.target.value)}

        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "25px",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}

      />

      {loading && (

        <h2>Loading Users...</h2>

      )}

      {error && (

        <h2 style={{ color: "red" }}>
          {error}
        </h2>

      )}

      {!loading &&
        !error &&
        filteredUsers.length === 0 && (

          <h3>No {activeTab === "active" ? "Active" : "Archived"} Users Found.</h3>

      )}

      {!loading &&
        !error &&
        filteredUsers.map((user) => (

          <UserCard

            key={user.id}

            user={user}

            onEdit={activeTab === "active" ? handleEdit : null}

            onDelete={activeTab === "active" ? handleDelete : null}

            onRestore={activeTab === "archived" ? handleRestore : null}

            onDownloadReport={handleDownloadReport}

            isDownloading={downloadingUserId === user.id}

            isArchived={activeTab === "archived"}

          />

        ))}

      <CreateUserModal

        open={openModal}

        onClose={handleModalClose}

        onSuccess={handleModalSuccess}

        editUser={editingUser}

      />

    </DashboardLayout>

  );

}
import { useEffect, useState } from "react";
import { FaBell, FaSearch } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import "./Header.css";

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  const pageName =
    location.pathname.split("/").pop().charAt(0).toUpperCase() +
    location.pathname.split("/").pop().slice(1);

  // Only employees have the notifications endpoint
  useEffect(() => {

    if (user?.role !== "EMPLOYEE") return;

    const fetchUnread = async () => {
      try {
        const response = await api.get("/employee/notifications");
        const notifications = response.data?.data || [];
        const unread = notifications.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      } catch {
        // silently fail — bell is non-critical
      }
    };

    fetchUnread();

    // Refresh every 60 seconds
    const interval = setInterval(fetchUnread, 60000);

    return () => clearInterval(interval);

  }, [user?.role, location.pathname]);

  const handleBellClick = () => {
    if (user?.role === "EMPLOYEE") {
      navigate("/employee/notifications");
    }
  };

  return (
    <header className="header">

      <div className="header-left">
        <h1>{pageName}</h1>
      </div>

      <div className="header-center">

        <div className="search-box">

          <FaSearch className="search-icon" />

          <input
            type="text"
            placeholder={`Search ${pageName}...`}
          />

        </div>

      </div>

      <div className="header-right">

        {user?.role === "EMPLOYEE" && (

          <button
            className="notification-btn"
            onClick={handleBellClick}
            title="Notifications"
          >

            <FaBell />

            {unreadCount > 0 && (
              <span className="notification-count">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}

          </button>

        )}

        <div className="profile">

          <div className="avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="profile-info">

            <h4>{user?.name}</h4>

            <span>{user?.role}</span>

          </div>

        </div>

      </div>

    </header>
  );
}

import {
  FaHome,
  FaBullseye,
  FaChartLine,
  FaClock,
  FaClipboardCheck,
  FaFileAlt,
  FaBell,
  FaUsers,
  FaUserFriends,
  FaSignOutAlt,
  FaCalendarAlt,
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const EMPLOYEE_MENU = [
  { name: "Dashboard",      icon: <FaHome />,          path: "/employee/dashboard" },
  { name: "My Goals",       icon: <FaBullseye />,      path: "/employee/goals" },
  { name: "Progress",       icon: <FaChartLine />,     path: "/employee/progress" },
  { name: "Timeline",       icon: <FaClock />,         path: "/employee/timeline" },
  { name: "Reviews",        icon: <FaClipboardCheck />,path: "/employee/reviews" },
  { name: "Leave & WFH",    icon: <FaCalendarAlt />,   path: "/employee/leave-wfh" },
  { name: "Notifications",  icon: <FaBell />,          path: "/employee/notifications" },
  { name: "Reports",        icon: <FaFileAlt />,       path: "/employee/reports" },
];

const MANAGER_MENU = [
  { name: "Dashboard",      icon: <FaHome />,          path: "/manager/dashboard" },
  { name: "My Team",        icon: <FaUserFriends />,   path: "/manager/team" },
  { name: "Team Goals",     icon: <FaBullseye />,      path: "/manager/goals" },
  { name: "Leave Requests", icon: <FaCalendarAlt />,   path: "/manager/leave-requests" },
  { name: "Timeline",       icon: <FaClock />,         path: "/manager/timeline" },
  { name: "Notifications",  icon: <FaBell />,          path: "/manager/notifications" },
  { name: "Reviews",        icon: <FaClipboardCheck />,path: "/manager/reviews" },
  { name: "Reports",        icon: <FaFileAlt />,       path: "/manager/reports" },
];

const HR_MENU = [
  { name: "Dashboard",  icon: <FaHome />,          path: "/hr/dashboard" },
  { name: "Users",      icon: <FaUsers />,         path: "/hr/users" },
  { name: "Goals",      icon: <FaBullseye />,      path: "/hr/goals" },
  { name: "Reviews",    icon: <FaClipboardCheck />,path: "/hr/reviews" },
  { name: "Analytics",  icon: <FaChartLine />,     path: "/hr/analytics" },
];

const MENU_BY_ROLE = {
  EMPLOYEE: EMPLOYEE_MENU,
  MANAGER:  MANAGER_MENU,
  HR:       HR_MENU,
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menu = MENU_BY_ROLE[user?.role] || EMPLOYEE_MENU;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="sidebar">

      <div className="logo">
        <div className="logo-container">
          <img 
            src="https://media.licdn.com/dms/image/v2/D560BAQEJpEejf1rytQ/company-logo_200_200/B56Z4aqQfEHMAE-/0/1778563745944/opstree_solutions_logo?e=2147483647&v=beta&t=ZVR41G_F8GeBZRIXWTdC4ZDuHNdCqkERRjfrconFWEc" 
            alt="Opstree Logo" 
            className="opstree-logo"
          />
        </div>
        <span>Performance Management System</span>
      </div>

      <div className="role-box">
        <small>ROLE</small>
        <div className="role">
          {user?.role?.toUpperCase() || "EMPLOYEE"}
        </div>
      </div>

      <ul className="menu">
        {menu.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <button
        className="logout-btn"
        onClick={handleLogout}
      >
        <FaSignOutAlt />
        Logout
      </button>

    </aside>
  );
}

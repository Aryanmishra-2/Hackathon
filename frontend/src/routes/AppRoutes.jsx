import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";

// =========================
// Employee
// =========================

import EmployeeDashboard from "../pages/employee/Dashboard";
import EmployeeGoals from "../pages/employee/Goals";
import EmployeeProgress from "../pages/employee/Progress";
import EmployeeTimeline from "../pages/employee/Timeline";
import EmployeeReviews from "../pages/employee/Reviews";
import EmployeeReports from "../pages/employee/Reports";
import EmployeeNotifications from "../pages/employee/Notifications";
import EmployeeLeaveWFH from "../pages/employee/LeaveWFH";

// =========================
// Manager
// =========================

import ManagerDashboard from "../pages/manager/Dashboard";
import ManagerGoals from "../pages/manager/Goals";
import ManagerReviews from "../pages/manager/Reviews";
import ManagerTeam from "../pages/manager/Team";
import ManagerReports from "../pages/manager/Reports";
import ManagerLeaveRequests from "../pages/manager/LeaveRequests";
import ManagerNotifications from "../pages/manager/Notifications";
import ManagerTimeline from "../pages/manager/Timeline";

// =========================
// HR
// =========================

import HRDashboard from "../pages/hr/Dashboard";
import HRGoals from "../pages/hr/Goals";
import HRUsers from "../pages/hr/Users";
import HRAnalytics from "../pages/hr/Analytics";
import HRReviews from "../pages/hr/Reviews";

export default function AppRoutes() {

  return (

    <Routes>

      {/* Login */}

      <Route
        path="/"
        element={<Login />}
      />

      {/* ================================= */}
      {/* Employee Routes */}
      {/* ================================= */}

      <Route
        path="/employee/dashboard"
        element={<EmployeeDashboard />}
      />

      <Route
        path="/employee/goals"
        element={<EmployeeGoals />}
      />

      <Route
        path="/employee/progress"
        element={<EmployeeProgress />}
      />

      <Route
        path="/employee/timeline"
        element={<EmployeeTimeline />}
      />

      <Route
        path="/employee/reviews"
        element={<EmployeeReviews />}
      />

      <Route
        path="/employee/reports"
        element={<EmployeeReports />}
      />

      <Route
        path="/employee/notifications"
        element={<EmployeeNotifications />}
      />

      <Route
        path="/employee/leave-wfh"
        element={<EmployeeLeaveWFH />}
      />

      {/* ================================= */}
      {/* Manager Routes */}
      {/* ================================= */}

      <Route
        path="/manager/dashboard"
        element={<ManagerDashboard />}
      />

      <Route
        path="/manager/team"
        element={<ManagerTeam />}
      />

      <Route
        path="/manager/goals"
        element={<ManagerGoals />}
      />

      <Route
        path="/manager/reviews"
        element={<ManagerReviews />}
      />

      <Route
        path="/manager/reports"
        element={<ManagerReports />}
      />

      <Route
        path="/manager/leave-requests"
        element={<ManagerLeaveRequests />}
      />

      <Route
        path="/manager/notifications"
        element={<ManagerNotifications />}
      />

      <Route
        path="/manager/timeline"
        element={<ManagerTimeline />}
      />

      {/* ================================= */}
      {/* HR Routes */}
      {/* ================================= */}

      <Route
        path="/hr/dashboard"
        element={<HRDashboard />}
      />

      <Route
        path="/hr/users"
        element={<HRUsers />}
      />

      <Route
        path="/hr/goals"
        element={<HRGoals />}
      />

      <Route
        path="/hr/reviews"
        element={<HRReviews />}
      />

      <Route
        path="/hr/analytics"
        element={<HRAnalytics />}
      />

      {/* ================================= */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>

  );

}

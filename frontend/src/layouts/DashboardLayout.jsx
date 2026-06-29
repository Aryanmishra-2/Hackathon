import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import "./DashboardLayout.css";

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard">

      <Sidebar />

      <div className="dashboard-container">

        <Header />

        <main className="dashboard-content">
          {children}
        </main>

      </div>

    </div>
  );
}
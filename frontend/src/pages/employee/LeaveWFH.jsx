import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { createLeaveRequest, getEmployeeLeaveRequests } from "../../api/leave.api";
import "./LeaveWFH.css";

export default function LeaveWFH() {

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    requestType: "LEAVE",
    leaveType: "CASUAL_LEAVE",
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      const data = await getEmployeeLeaveRequests();
      setLeaveRequests(data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load leave requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      await createLeaveRequest(form);

      alert("Leave request submitted successfully!");

      setOpenModal(false);

      setForm({
        requestType: "LEAVE",
        leaveType: "CASUAL_LEAVE",
        startDate: "",
        endDate: "",
        reason: "",
      });

      loadLeaveRequests();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: "#f59e0b", bg: "#fef3c7", label: "Pending" },
      APPROVED: { color: "#10b981", bg: "#d1fae5", label: "Approved" },
      REJECTED: { color: "#ef4444", bg: "#fee2e2", label: "Rejected" },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span
        style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "13px",
          fontWeight: "600",
          color: config.color,
          background: config.bg,
        }}
      >
        {config.label}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="leave-wfh-container">
        <div className="leave-header">
          <h1>Leave & Work From Home</h1>
          <button
            onClick={() => setOpenModal(true)}
            className="btn-primary"
          >
            + New Request
          </button>
        </div>

        {loading && <p>Loading...</p>}

        {!loading && leaveRequests.length === 0 && (
          <div className="empty-state">
            <h3>No Leave Requests</h3>
            <p>You haven't submitted any leave or WFH requests yet.</p>
          </div>
        )}

        {!loading && leaveRequests.length > 0 && (
          <div className="leave-list">
            {leaveRequests.map((request) => (
              <div key={request.id} className="leave-card">
                <div className="leave-card-header">
                  <div>
                    <h3>
                      {request.requestType === "LEAVE" ? "Leave Request" : "Work From Home"}
                    </h3>
                    {request.leaveType && (
                      <span className="leave-type">
                        {request.leaveType.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="leave-dates">
                  <div>
                    <span className="label">From:</span>
                    <span className="date">{new Date(request.startDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="label">To:</span>
                    <span className="date">{new Date(request.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="leave-reason">
                  <strong>Reason:</strong> {request.reason}
                </div>

                {request.managerComment && (
                  <div className="manager-comment">
                    <strong>Manager's Comment:</strong> {request.managerComment}
                  </div>
                )}

                <div className="leave-footer">
                  <span className="manager-name">Manager: {request.manager.name}</span>
                  <span className="submitted-date">
                    Submitted: {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {openModal && (
        <div className="modal-overlay" onClick={() => setOpenModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>New Leave / WFH Request</h2>

            <form onSubmit={handleSubmit}>
              <label>Request Type</label>
              <select
                name="requestType"
                value={form.requestType}
                onChange={handleChange}
                required
              >
                <option value="LEAVE">Leave</option>
                <option value="WFH">Work From Home</option>
              </select>

              {form.requestType === "LEAVE" && (
                <>
                  <label>Leave Type</label>
                  <select
                    name="leaveType"
                    value={form.leaveType}
                    onChange={handleChange}
                    required
                  >
                    <option value="CASUAL_LEAVE">Casual Leave</option>
                    <option value="SICK_LEAVE">Sick Leave</option>
                    <option value="ANNUAL_LEAVE">Annual Leave</option>
                    <option value="MATERNITY_LEAVE">Maternity Leave</option>
                    <option value="PATERNITY_LEAVE">Paternity Leave</option>
                    <option value="UNPAID_LEAVE">Unpaid Leave</option>
                  </select>
                </>
              )}

              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />

              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
              />

              <label>Reason</label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Explain your reason..."
                rows="4"
                required
              />

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

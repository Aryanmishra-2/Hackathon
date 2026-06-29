import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getManagerLeaveRequests, updateLeaveRequestStatus } from "../../api/leave.api";
import "./LeaveRequests.css";

export default function LeaveRequests() {

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [managerComment, setManagerComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  useEffect(() => {
    // Filter requests based on search query
    if (searchQuery.trim() === "") {
      setFilteredRequests(leaveRequests);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = leaveRequests.filter((request) =>
        request.employee.name.toLowerCase().includes(query)
      );
      setFilteredRequests(filtered);
    }
  }, [searchQuery, leaveRequests]);

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      const data = await getManagerLeaveRequests();
      setLeaveRequests(data);
      setFilteredRequests(data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load leave requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setManagerComment("");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRequest(null);
    setActionType("");
    setManagerComment("");
  };

  const handleSubmitDecision = async (e) => {
    e.preventDefault();

    try {
      setProcessingId(selectedRequest.id);

      await updateLeaveRequestStatus(selectedRequest.id, {
        status: actionType,
        managerComment: managerComment.trim() || undefined,
      });

      alert(`Leave request ${actionType.toLowerCase()} successfully!`);

      handleCloseModal();
      loadLeaveRequests();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update leave request.");
    } finally {
      setProcessingId(null);
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

  const pendingRequests = filteredRequests.filter(req => req.status === "PENDING");
  const processedRequests = filteredRequests.filter(req => req.status !== "PENDING");

  return (
    <DashboardLayout>
      <div className="manager-leave-container">
        <h1>Team Leave Requests</h1>

        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by employee name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {loading && <p>Loading...</p>}

        {!loading && filteredRequests.length === 0 && leaveRequests.length === 0 && (
          <div className="empty-state">
            <h3>No Leave Requests</h3>
            <p>Your team hasn't submitted any leave requests yet.</p>
          </div>
        )}

        {!loading && filteredRequests.length === 0 && leaveRequests.length > 0 && (
          <div className="empty-state">
            <h3>No leave requests found</h3>
            <p>No matching employee found for "{searchQuery}"</p>
          </div>
        )}

        {!loading && pendingRequests.length > 0 && (
          <div className="leave-section">
            <h2 className="section-title">Pending Requests ({pendingRequests.length})</h2>
            <div className="leave-list">
              {pendingRequests.map((request) => (
                <div key={request.id} className="leave-card pending-card">
                  <div className="leave-card-header">
                    <div className="employee-info">
                      <h3>{request.employee.name}</h3>
                      <p className="employee-details">
                        {request.employee.designation} • {request.employee.department}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="request-type">
                    {request.requestType === "LEAVE" ? "Leave Request" : "Work From Home"}
                    {request.leaveType && (
                      <span className="leave-type-badge">
                        {request.leaveType.replace(/_/g, " ")}
                      </span>
                    )}
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
                    <div>
                      <span className="label">Duration:</span>
                      <span className="date">
                        {Math.ceil((new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)
                      </span>
                    </div>
                  </div>

                  <div className="leave-reason">
                    <strong>Reason:</strong>
                    <p>{request.reason}</p>
                  </div>

                  <div className="leave-footer">
                    <span className="submitted-date">
                      Submitted: {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleOpenModal(request, "REJECTED")}
                        className="btn-reject"
                        disabled={processingId === request.id}
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleOpenModal(request, "APPROVED")}
                        className="btn-approve"
                        disabled={processingId === request.id}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && processedRequests.length > 0 && (
          <div className="leave-section">
            <h2 className="section-title">Processed Requests ({processedRequests.length})</h2>
            <div className="leave-list">
              {processedRequests.map((request) => (
                <div key={request.id} className="leave-card">
                  <div className="leave-card-header">
                    <div className="employee-info">
                      <h3>{request.employee.name}</h3>
                      <p className="employee-details">
                        {request.employee.designation} • {request.employee.department}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="request-type">
                    {request.requestType === "LEAVE" ? "Leave Request" : "Work From Home"}
                    {request.leaveType && (
                      <span className="leave-type-badge">
                        {request.leaveType.replace(/_/g, " ")}
                      </span>
                    )}
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
                    <strong>Reason:</strong>
                    <p>{request.reason}</p>
                  </div>

                  {request.managerComment && (
                    <div className="manager-comment">
                      <strong>Your Comment:</strong>
                      <p>{request.managerComment}</p>
                    </div>
                  )}

                  <div className="leave-footer">
                    <span className="submitted-date">
                      Submitted: {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                    <span className="processed-date">
                      Processed: {new Date(request.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {openModal && selectedRequest && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>
              {actionType === "APPROVED" ? "Approve" : "Reject"} Leave Request
            </h2>

            <div className="modal-employee">
              <strong>{selectedRequest.employee.name}</strong>
              <p>
                {selectedRequest.requestType === "LEAVE" ? "Leave" : "WFH"} from{" "}
                {new Date(selectedRequest.startDate).toLocaleDateString()} to{" "}
                {new Date(selectedRequest.endDate).toLocaleDateString()}
              </p>
            </div>

            <form onSubmit={handleSubmitDecision}>
              <label>Comment (Optional)</label>
              <textarea
                value={managerComment}
                onChange={(e) => setManagerComment(e.target.value)}
                placeholder="Add a comment..."
                rows="4"
              />

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === selectedRequest.id}
                  className={actionType === "APPROVED" ? "btn-approve" : "btn-reject"}
                >
                  {processingId === selectedRequest.id
                    ? "Processing..."
                    : actionType === "APPROVED"
                    ? "Approve"
                    : "Reject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

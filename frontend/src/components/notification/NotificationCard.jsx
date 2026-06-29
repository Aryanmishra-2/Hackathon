import { FaBell } from "react-icons/fa";

import { markAsRead } from "../../api/notification.api";

import "./NotificationCard.css";

export default function NotificationCard({
  notification,
  refresh,
}) {

  const handleRead = async () => {

    try {

      await markAsRead(notification.id);

      refresh();

    } catch (err) {

      console.error(err);

      alert("Failed to update notification.");

    }

  };

  return (

    <div
      className={`notification-card ${
        notification.isRead
          ? "read"
          : "unread"
      }`}
    >

      <div className="notification-icon">

        <FaBell />

      </div>

      <div className="notification-content">

        <h3>

          {notification.title}

        </h3>

        <p>

          {notification.message}

        </p>

        <small>

          {new Date(
            notification.createdAt
          ).toLocaleString()}

        </small>

      </div>

      {!notification.isRead && (

        <button
          className="read-btn"
          onClick={handleRead}
        >

          Mark Read

        </button>

      )}

    </div>

  );

}
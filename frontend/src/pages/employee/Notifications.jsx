import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import NotificationCard from "../../components/notification/NotificationCard";

import {
  getMyNotifications,
  markAllAsRead,
} from "../../api/notification.api";

export default function Notifications() {

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadNotifications = async () => {

    try {

      setLoading(true);

      const data = await getMyNotifications();

      setNotifications(data);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to load notifications."
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadNotifications();

  }, []);

  const handleMarkAll = async () => {

    try {

      await markAllAsRead();

      loadNotifications();

    } catch (err) {

      console.error(err);

      alert("Failed to mark all notifications.");

    }

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

        <h1>Notifications</h1>

        <button
          onClick={handleMarkAll}
        >
          Mark All Read
        </button>

      </div>

      {loading && (

        <h2>Loading...</h2>

      )}

      {error && (

        <h2
          style={{
            color: "red",
          }}
        >
          {error}
        </h2>

      )}

      {!loading &&
        !error &&
        notifications.length === 0 && (

          <h3>No Notifications</h3>

      )}

      {!loading &&
        !error &&
        notifications.map((notification) => (

          <NotificationCard

            key={notification.id}

            notification={notification}

            refresh={loadNotifications}

          />

        ))}

    </DashboardLayout>

  );

}
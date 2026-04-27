"use client";

import { useNotifications } from "./NotificationContext";

export default function NotificationBar() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        zIndex: 50,
      }}
    >
      {notifications.map((n) => {
        let bg = "rgba(37,99,235,0.95)"; // info
        if (n.type === "success") bg = "rgba(22,163,74,0.95)";
        if (n.type === "error") bg = "rgba(220,38,38,0.95)";

        return (
          <div
            key={n.id}
            style={{
              minWidth: "220px",
              maxWidth: "320px",
              padding: "0.6rem 0.8rem",
              borderRadius: "0.75rem",
              background: bg,
              color: "#f9fafb",
              fontSize: 13,
              boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "0.5rem",
            }}
          >
            <span style={{ flex: 1 }}>{n.message}</span>
            <button
              onClick={() => removeNotification(n.id)}
              style={{
                border: "none",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
                fontSize: 14,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

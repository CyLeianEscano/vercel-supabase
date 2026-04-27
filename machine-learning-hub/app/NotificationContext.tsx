"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type NotificationType = "info" | "success" | "error";

export type Notification = {
  id: number;
  type: NotificationType;
  message: string;
};

type NotificationContextValue = {
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string) => void;
  removeNotification: (id: number) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: NotificationType, message: string) => {
    setNotifications((prev) => {
      const id = Date.now() + Math.random();
      const next = [...prev, { id, type, message }];

      // auto-remove after 5s
      setTimeout(() => {
        setNotifications((curr) => curr.filter((n) => n.id !== id));
      }, 5000);

      return next;
    });
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }
  return ctx;
}

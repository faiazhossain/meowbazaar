"use client";

import { useEffect, useCallback, useRef } from "react";
import { pusherClient, ADMIN_NOTIFICATIONS_CHANNEL, NEW_ORDER_EVENT } from "@/lib/pusher-client";
import { getAdminNotifications, getUnreadNotificationCount, AdminNotification } from "@/lib/actions/notifications";
import { use } from "react";

export interface NewOrderPayload {
  id: string;
  orderId: string;
  orderNumber: string;
  type: "NEW_ORDER";
  title: string;
  message: string;
  total: number;
  customerName: string;
  createdAt: string;
}

interface UseRealtimeNotificationsReturn {
  notifications: AdminNotification[];
  unreadCount: number;
  addNotification: (notification: AdminNotification) => void;
  decrementUnreadCount: () => void;
  refreshNotifications: () => Promise<void>;
}

export function useRealtimeNotifications(
  initialNotifications: Promise<AdminNotification[]>,
  initialUnreadCount: Promise<number>
): UseRealtimeNotificationsReturn {
  const notifications = use(initialNotifications);
  const unreadCount = use(initialUnreadCount);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/sounds/notification.mp3");
    audioRef.current.volume = 0.5;
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.error("Failed to play notification sound:", error);
      });
    }
  }, []);

  useEffect(() => {
    const channel = pusherClient.subscribe(ADMIN_NOTIFICATIONS_CHANNEL);

    channel.bind(NEW_ORDER_EVENT, (data: NewOrderPayload) => {
      playNotificationSound();

      // Trigger a refresh by dispatching a custom event
      window.dispatchEvent(
        new CustomEvent("new-admin-notification", { detail: data })
      );
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(ADMIN_NOTIFICATIONS_CHANNEL);
    };
  }, [playNotificationSound]);

  return {
    notifications,
    unreadCount,
    addNotification: () => {},
    decrementUnreadCount: () => {},
    refreshNotifications: async () => {},
  };
}

import Pusher from "pusher";

declare global {
  // eslint-disable-next-line no-var
  var pusher: Pusher | undefined;
}

export const pusher =
  globalThis.pusher ||
  new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.pusher = pusher;
}

export const ADMIN_NOTIFICATIONS_CHANNEL = "admin-notifications";
export const NEW_ORDER_EVENT = "new-order";

export interface NewOrderNotificationPayload {
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

export async function triggerNewOrderNotification(
  payload: NewOrderNotificationPayload
) {
  try {
    await pusher.trigger(ADMIN_NOTIFICATIONS_CHANNEL, NEW_ORDER_EVENT, payload);
  } catch (error) {
    console.error("Failed to trigger Pusher notification:", error);
  }
}

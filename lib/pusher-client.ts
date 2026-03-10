import Pusher from "pusher-js";

declare global {
  // eslint-disable-next-line no-var
  var pusherClient: Pusher | undefined;
}

export const pusherClient =
  globalThis.pusherClient ||
  new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.pusherClient = pusherClient;
}

export const ADMIN_NOTIFICATIONS_CHANNEL = "admin-notifications";
export const NEW_ORDER_EVENT = "new-order";

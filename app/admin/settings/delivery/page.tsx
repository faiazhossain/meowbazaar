import { getAllDeliverySettings } from "@/lib/actions/settings";
import { DeliverySettingsClient } from "./delivery-settings-client";

export default async function DeliverySettingsPage() {
  const deliverySettings = await getAllDeliverySettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          ডেলিভারি সেটিংস
        </h1>
        <p className="text-muted-foreground mt-2">
          ডেলিভারি ফি এবং ফ্রি ডেলিভারি সেটিংস ম্যানেজ করুন
        </p>
      </div>

      <DeliverySettingsClient initialSettings={deliverySettings} />
    </div>
  );
}

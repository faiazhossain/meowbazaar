import { Suspense } from "react";
import { getAdminOffers } from "@/lib/actions/admin";
import { OffersClient } from "./offers-client";

export default async function AdminOffersPage() {
  const offers = await getAdminOffers();

  return (
    <Suspense fallback={<OffersLoading />}>
      <OffersClient initialOffers={offers} />
    </Suspense>
  );
}

function OffersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="h-10 w-40 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}

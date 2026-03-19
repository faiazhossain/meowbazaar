import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminBrands } from "@/lib/actions/admin";
import { BrandsClient } from "./brands-client";

export default async function BrandsPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const brands = await getAdminBrands();

  return <BrandsClient initialBrands={brands} />;
}

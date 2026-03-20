import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { FosterRegistrationForm } from "@/components/foster/registration-form";
import { getMyFosterProfile } from "@/lib/actions/foster-registration";
import { Navbar } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";

export const dynamic = "force-dynamic";

export default async function FosterRegisterPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/foster/register");
  }

  const existingProfile = await getMyFosterProfile();

  if (existingProfile.success && existingProfile.data) {
    if (existingProfile.data.status === "APPROVED") {
      redirect("/foster/dashboard");
    } else if (existingProfile.data.status === "PENDING") {
      return (
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <h1 className="text-2xl font-bold text-yellow-800 mb-4">
                  আপনার আবেদন পর্যালোচনাধীন / Your Application is Under Review
                </h1>
                <p className="text-yellow-700 mb-6">
                  আপনার ফস্টার হোম আবেদন পর্যালোচনা করা হচ্ছে। আমরা যত দ্রুত সম্ভব আপনাকে জানাবো।
                  <br />
                  Your foster home application is being reviewed. We will notify you as soon as possible.
                </p>
                <div className="text-sm text-yellow-600">
                  আবেদনের তারিখ / Application Date:{" "}
                  {new Date(existingProfile.data.createdAt).toLocaleDateString("bn-BD")}
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      );
    } else if (existingProfile.data.status === "REJECTED") {
      return (
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <h1 className="text-2xl font-bold text-red-800 mb-4">
                  আপনার আবেদন প্রত্যাখ্যান করা হয়েছে / Your Application was Rejected
                </h1>
                <p className="text-red-700 mb-6">
                  দুঃখিত, আপনার আবেদন প্রত্যাখ্যান করা হয়েছে। দয়া করে আবার আবেদন করার আগে প্রয়োজনীয় তথ্য পর্যালোচনা করুন।
                  <br />
                  Sorry, your application was rejected. Please review the requirements before applying again.
                </p>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-4">
              ফস্টার হোম হিসেবে নিবন্ধন করুন
              <br />
              <span className="text-xl text-muted-foreground">
                Register as a Foster Home
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              বিড়ালদের জন্য একটি নিরাপদ এবং যত্নশীল পরিবেশ প্রদান করুন এবং উপার্জন করুন।
              <br />
              Provide a safe and caring environment for cats and earn income.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-blue-900 mb-3">
              নিবন্ধনের পূর্বে / Before Registration
            </h2>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ আপনার ব্যবসার নিবন্ধন নথি প্রস্তুত রাখুন / Prepare your business registration documents</li>
              <li>✓ ফস্টার হোমের ছবি সংগ্রহ করুন / Collect photos of your foster home</li>
              <li>✓ আপনার যোগাযোগ তথ্য প্রস্তুত রাখুন / Prepare your contact information</li>
              <li>✓ সেবা এবং সুযোগসুবিধা তালিকা তৈরি করুন / Create a list of services and facilities</li>
              <li>✓ প্রতিদিনের মূল্য নির্ধারণ করুন / Set your daily rates</li>
            </ul>
          </div>

          <FosterRegistrationForm />

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              নিবন্ধন করার মাধ্যমে আপনি আমাদের{" "}
              <Link href="/terms" className="underline hover:text-primary">
                শর্তাবলী
              </Link>{" "}
              এবং{" "}
              <Link href="/privacy" className="underline hover:text-primary">
                গোপনীয়তা নীতি
              </Link>{" "}
              গ্রহণ করছেন।
              <br />
              By registering, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { Navbar } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { FosterCard } from "@/components/foster/foster-card";
import { getFosterHomes, getFeaturedFosterHomes, getFosterDivisions } from "@/lib/actions/foster-directory";
import { FosterFilters } from "@/components/foster/foster-filters";
import { SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Users, Star } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Revalidate every 5 minutes

export default async function FosterPage({
  searchParams,
}: {
  searchParams: {
    division?: string;
    area?: string;
    minPrice?: string;
    maxPrice?: string;
    acceptsKittens?: string;
    services?: string;
    minRating?: string;
    verified?: string;
    page?: string;
  };
}) {
  const filters = {
    division: searchParams.division,
    area: searchParams.area,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
    acceptsKittens: searchParams.acceptsKittens === "true",
    services: searchParams.services?.split(","),
    minRating: searchParams.minRating ? parseFloat(searchParams.minRating) : undefined,
    verified: searchParams.verified === "true",
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 12,
  };

  const [fosterHomesResult, featuredHomesResult, divisionsResult] = await Promise.all([
    getFosterHomes(filters),
    getFeaturedFosterHomes(6),
    getFosterDivisions(),
  ]);

  const fosterHomes = fosterHomesResult.success ? fosterHomesResult.data : [];
  const featuredHomes = featuredHomesResult.success ? featuredHomesResult.data : [];
  const divisions = divisionsResult.success ? divisionsResult.data : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary/90 to-accent py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                বিড়ালের জন্য ফস্টার হোম খুঁজুন
                <br />
                <span className="text-2xl md:text-3xl font-normal">
                  Find Foster Homes for Your Cat
                </span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90">
                জরুরি পরিস্থিতিতে আপনার বিড়ালকে নিরাপদ এবং যত্নশীল হাতে তুলে দিন।
                <br />
                Give your cat safe and caring hands during emergencies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/foster?verified=true">
                    <Search className="h-5 w-5 mr-2" />
                    ফস্টার হোম খুঁজুন / Search Foster Homes
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30" asChild>
                  <Link href="/foster/register">
                    ফস্টার হোম হিসেবে নিবন্ধন করুন / Register as Foster Home
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-muted/50 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {divisions.length}+
                </div>
                <div className="text-sm text-muted-foreground">
                  বিভাগে উপলব্ধ / Available in Divisions
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {fosterHomes.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  নিবন্ধিত ফস্টার হোম / Registered Foster Homes
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">
                  সহায়তা উপলব্ধ / Support Available
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Foster Homes */}
        {featuredHomes.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <SectionHeader
                title="ফিচার্ড ফস্টার হোম / Featured Foster Homes"
                description="সর্বোচ্চ রেটিং প্রাপ্ত ফস্টার হোম / Top-rated foster homes"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredHomes.map((foster: any) => (
                  <FosterCard key={foster.id} {...foster} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Main Directory */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">
                ফস্টার হোম ডিরেক্টরি / Foster Home Directory
              </h2>
              <p className="text-muted-foreground">
                আপনার প্রয়োজন অনুযায়ী উপযুক্ত ফস্টার হোম খুঁজুন / Find the right foster home for your needs
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <aside className="lg:col-span-1">
                <FosterFilters divisions={divisions.map((d: any) => d.division)} />
              </aside>

              {/* Foster Homes Grid */}
              <div className="lg:col-span-3">
                {fosterHomes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      কোনো ফস্টার হোম পাওয়া যায়নি / No Foster Homes Found
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      অন্য ফিল্টার ব্যবহার করে আবার চেষ্টা করুন / Try with different filters
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/foster">সব ফিল্টার সাফ করুন / Clear All Filters</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {fosterHomesResult.success && fosterHomesResult.data
                          ? `${fosterHomesResult.data.length} টি ফস্টার হোম / ${fosterHomesResult.data.length} foster homes`
                          : ""}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {fosterHomes.map((foster: any) => (
                        <FosterCard key={foster.id} {...foster} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {fosterHomesResult.success && fosterHomesResult.data && fosterHomesResult.data.pagination && (
                      <div className="mt-8 flex justify-center gap-2">
                        {Array.from({
                          length: fosterHomesResult.data.pagination.totalPages,
                        }).map((_, index) => (
                          <Button
                            key={index}
                            variant={
                              index + 1 === filters.page ? "default" : "outline"
                            }
                            size="sm"
                            asChild
                          >
                            <Link
                              href={{
                                pathname: "/foster",
                                query: {
                                  ...searchParams,
                                  page: (index + 1).toString(),
                                },
                              }}
                            >
                              {index + 1}
                            </Link>
                          </Button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                কীভাবে কাজ করে? / How It Works?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                মাত্র কয়েকটি সহজ ধাপে আপনার বিড়ালের জন্য ফস্টার হোম বুক করুন
                <br />
                Book a foster home for your cat in just a few easy steps
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold mb-4">
                  1
                </div>
                <h3 className="font-semibold mb-2">অনুসন্ধান করুন / Search</h3>
                <p className="text-sm text-muted-foreground">
                  আপনার অবস্থান এবং প্রয়োজন অনুযায়ী ফস্টার হোম খুঁজুন
                  <br />
                  Find foster homes based on your location and needs
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold mb-4">
                  2
                </div>
                <h3 className="font-semibold mb-2">বুক করুন / Book</h3>
                <p className="text-sm text-muted-foreground">
                  তারিখ নির্বাচন করুন এবং পেমেন্ট সম্পন্ন করুন
                  <br />
                  Select dates and complete payment
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold mb-4">
                  3
                </div>
                <h3 className="font-semibold mb-2">বিড়াল দিন / Drop Off</h3>
                <p className="text-sm text-muted-foreground">
                  আপনার বিড়ালকে ফস্টার হোমে নিয়ে যান
                  <br />
                  Drop off your cat at the foster home
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 md:p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">
                ফস্টার হোম মালিক হিসেবে যোগ দিন
                <br />
                <span className="text-2xl font-normal">
                  Join as a Foster Home Owner
                </span>
              </h2>
              <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
                বিড়ালদের ভালোবাসা এবং যত্ন দিন এবং উপার্জন করুন।
                <br />
                Love and care for cats while earning income.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/foster/register">
                  আজই নিবন্ধন করুন / Register Today
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

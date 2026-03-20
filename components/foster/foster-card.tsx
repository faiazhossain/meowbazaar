import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Users, CheckCircle, Cat } from "lucide-react";

export interface FosterCardProps {
  id: string;
  businessName: string;
  businessNameEn?: string;
  description: string;
  descriptionEn?: string;
  division: string;
  area: string;
  maxCapacity: number;
  currentOccupancy: number;
  acceptsKittens: boolean;
  acceptsCats: boolean;
  basePricePerDay: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  coverImage?: string;
  services?: string[];
  facilities?: string[];
}

export function FosterCard({
  id,
  businessName,
  businessNameEn,
  description,
  descriptionEn,
  division,
  area,
  maxCapacity,
  currentOccupancy,
  acceptsKittens,
  acceptsCats,
  basePricePerDay,
  rating,
  reviewCount,
  verified,
  coverImage,
  services,
  facilities,
}: FosterCardProps) {
  const displayName = businessNameEn ? `${businessName} (${businessNameEn})` : businessName;
  const displayDescription = descriptionEn ? description : description;
  const availableCapacity = maxCapacity - currentOccupancy;
  const parsedServices = services ? JSON.parse(services as string) : [];
  const parsedFacilities = facilities ? JSON.parse(facilities as string) : [];

  const getPetTypeBadges = () => {
    const badges = [];
    if (acceptsCats) badges.push({ icon: Cat, label: "বিড়াল / Cats", variant: "default" as const });
    if (acceptsKittens) badges.push({ icon: Cat, label: "বিড়ালছানা / Kittens", variant: "secondary" as const });
    return badges;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10">
        {coverImage ? (
          <img
            src={coverImage}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Cat className="h-16 w-16 text-primary/30" />
          </div>
        )}
        {verified && (
          <div className="absolute top-2 right-2">
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              যাচাইকৃত / Verified
            </Badge>
          </div>
        )}
        {/* Rating Badge */}
        {reviewCount > 0 && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
              {rating.toFixed(1)} ({reviewCount})
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Title */}
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{displayName}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {displayDescription}
          </p>
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="truncate">
            {area}, {division}
          </span>
        </div>

        {/* Capacity */}
        <div className="flex items-center text-sm">
          <Users className="h-4 w-4 mr-1 text-muted-foreground" />
          <span className="text-muted-foreground">
            {currentOccupancy}/{maxCapacity}
          </span>
          <Badge variant={availableCapacity > 0 ? "default" : "destructive"} className="ml-2">
            {availableCapacity > 0 ? `${availableCapacity} উপলব্ধ / Available` : "পূর্ণ / Full"}
          </Badge>
        </div>

        {/* Pet Types */}
        <div className="flex flex-wrap gap-2">
          {getPetTypeBadges().map((badge, index) => (
            <Badge key={index} variant={badge.variant} className="text-xs">
              <badge.icon className="h-3 w-3 mr-1" />
              {badge.label}
            </Badge>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold">৳{basePricePerDay}</span>
            <span className="text-sm text-muted-foreground ml-1">/দিন / day</span>
          </div>
        </div>

        {/* Services Preview */}
        {parsedServices.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {parsedServices.slice(0, 3).map((service: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {service}
              </Badge>
            ))}
            {parsedServices.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{parsedServices.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/foster/${id}`} className="w-full">
          <Button className="w-full">
            বিস্তারিত দেখুন / View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

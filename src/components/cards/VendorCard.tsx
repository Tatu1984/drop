'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, MapPin, BadgeCheck } from 'lucide-react';
import { cn, formatDistance, isOpen } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface VendorCardVendor {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  type: string;
  rating: number;
  totalRatings?: number;
  address?: string;
  avgDeliveryTime?: number;
  minimumOrder?: number;
  isVerified?: boolean;
  openingTime?: string;
  closingTime?: string;
}

interface VendorCardProps {
  vendor: VendorCardVendor;
  variant?: 'default' | 'compact' | 'horizontal';
  distance?: number; // in meters
}

export default function VendorCard({
  vendor,
  variant = 'default',
  distance,
}: VendorCardProps) {
  const isCurrentlyOpen = vendor.openingTime && vendor.closingTime
    ? isOpen(vendor.openingTime, vendor.closingTime)
    : true;

  const vendorTypeLabels: Record<string, string> = {
    RESTAURANT: 'Restaurant',
    GROCERY: 'Grocery',
    WINE_SHOP: 'Wine & Spirits',
    PHARMACY: 'Pharmacy',
    MEAT_SHOP: 'Meat & Fish',
    MILK_DAIRY: 'Dairy',
    PET_SUPPLIES: 'Pet Store',
    FLOWERS: 'Flowers',
    GENERAL_STORE: 'Store',
  };

  if (variant === 'compact') {
    return (
      <Link href={`/store/${vendor.id}`}>
        <Card hoverable padding="sm" className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <Image
              src={vendor.logo || '/placeholder-store.jpg'}
              alt={vendor.name}
              fill
              className="object-cover rounded-full"
            />
            {vendor.isVerified && (
              <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 text-blue-500 bg-white rounded-full" />
            )}
          </div>
          <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
            {vendor.name}
          </h3>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-600">{vendor.rating}</span>
          </div>
        </Card>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link href={`/store/${vendor.id}`}>
        <Card hoverable padding="none" className="flex overflow-hidden">
          {/* Image */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={vendor.logo || '/placeholder-store.jpg'}
              alt={vendor.name}
              fill
              className="object-cover"
            />
            {!isCurrentlyOpen && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xs font-medium">Closed</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                    {vendor.name}
                  </h3>
                  {vendor.isVerified && (
                    <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {vendorTypeLabels[vendor.type]}
                </p>
              </div>
              <Badge
                variant={isCurrentlyOpen ? 'success' : 'error'}
                size="sm"
              >
                {isCurrentlyOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{vendor.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{vendor.avgDeliveryTime} min</span>
              </div>
              {distance && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{formatDistance(distance)}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/store/${vendor.id}`}>
      <Card hoverable padding="none" className="overflow-hidden">
        {/* Cover Image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={vendor.coverImage || vendor.logo || '/placeholder-store.jpg'}
            alt={vendor.name}
            fill
            className="object-cover"
          />
          {!isCurrentlyOpen && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium">Currently Closed</span>
            </div>
          )}

          {/* Promoted Badge */}
          {vendor.isVerified && (
            <Badge
              variant="info"
              size="sm"
              className="absolute top-2 left-2"
            >
              Promoted
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Logo */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border">
              <Image
                src={vendor.logo || '/placeholder-store.jpg'}
                alt={vendor.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {vendor.name}
                </h3>
                {vendor.isVerified && (
                  <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-500 line-clamp-1">
                {vendor.description || vendorTypeLabels[vendor.type]}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-sm flex-shrink-0">
              <Star className="h-3 w-3 fill-current" />
              <span className="font-medium">{vendor.rating}</span>
            </div>
          </div>

          {/* Info Row */}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{vendor.avgDeliveryTime} min</span>
            </div>
            {distance && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{formatDistance(distance)}</span>
              </div>
            )}
            {vendor.minimumOrder && vendor.minimumOrder > 0 && (
              <span className="text-gray-400">
                Min. ₹{vendor.minimumOrder}
              </span>
            )}
          </div>

          {/* Offers */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
              50% OFF up to ₹100
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

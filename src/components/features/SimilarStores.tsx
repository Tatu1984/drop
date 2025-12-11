'use client';

import { Store, Clock, Star, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Vendor } from '@/types';

interface SimilarStoresProps {
  currentVendor: Vendor;
  vendors: Vendor[];
  reason?: 'busy' | 'closed' | 'similar';
}

export default function SimilarStores({ currentVendor, vendors, reason = 'similar' }: SimilarStoresProps) {
  // Filter similar vendors (same type, different id)
  const similarVendors = vendors
    .filter(v => v.id !== currentVendor.id && v.type === currentVendor.type && v.isActive)
    .slice(0, 3);

  if (similarVendors.length === 0) return null;

  const getMessage = () => {
    switch (reason) {
      case 'busy':
        return {
          title: 'This store is currently busy',
          subtitle: 'Try these similar alternatives for faster delivery',
          icon: <Clock className="h-5 w-5 text-amber-500" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
        };
      case 'closed':
        return {
          title: 'This store is currently closed',
          subtitle: 'Check out these similar stores that are open',
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      default:
        return {
          title: 'You might also like',
          subtitle: 'Similar stores in your area',
          icon: <Store className="h-5 w-5 text-purple-500" />,
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
        };
    }
  };

  const message = getMessage();

  return (
    <div className={`${message.bgColor} rounded-xl p-4 border ${message.borderColor}`}>
      <div className="flex items-start gap-3 mb-4">
        {message.icon}
        <div>
          <h3 className="font-semibold text-gray-900">{message.title}</h3>
          <p className="text-sm text-gray-600">{message.subtitle}</p>
        </div>
      </div>

      <div className="space-y-3">
        {similarVendors.map((vendor) => (
          <Link
            key={vendor.id}
            href={`/store/${vendor.id}`}
            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            {/* Store Logo */}
            <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
              <img
                src={vendor.logo || '/placeholder-store.jpg'}
                alt={vendor.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Store Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{vendor.name}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span>{vendor.rating.toFixed(1)}</span>
                </div>
                <span>•</span>
                <span>{vendor.avgDeliveryTime}</span>
              </div>
              {vendor.description && (
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {vendor.description}
                </p>
              )}
            </div>

            {/* Arrow */}
            <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

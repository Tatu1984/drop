'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Share2,
  Heart,
  Search,
  BadgeCheck,
} from 'lucide-react';
import Link from 'next/link';
import {
  allVendors,
  foodProducts,
  groceryProducts,
  wineProducts,
} from '@/data/mockData';
import ProductCard from '@/components/cards/ProductCard';
import Tabs from '@/components/ui/Tabs';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { isOpen } from '@/lib/utils';

export default function StorePage() {
  const params = useParams();
  const storeId = params.id as string;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const vendor = allVendors.find((v) => v.id === storeId);

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Store not found</p>
      </div>
    );
  }

  // Get products based on vendor type
  let products = foodProducts.filter((p) => p.vendorId === storeId);
  if (vendor.type === 'GROCERY') {
    products = groceryProducts.filter((p) => p.vendorId === storeId);
  } else if (vendor.type === 'WINE_SHOP') {
    products = wineProducts.filter((p) => p.vendorId === storeId);
  }

  // If no products for this specific vendor, show sample products
  if (products.length === 0) {
    if (vendor.type === 'RESTAURANT') {
      products = foodProducts.slice(0, 6);
    } else if (vendor.type === 'GROCERY') {
      products = groceryProducts;
    } else if (vendor.type === 'WINE_SHOP') {
      products = wineProducts;
    }
  }

  // Filter products
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isCurrentlyOpen = isOpen(vendor.openingTime, vendor.closingTime);

  // Get unique categories
  const categories = [
    { id: 'all', label: 'All' },
    ...Array.from(new Set(products.map((p) => p.categoryId)))
      .filter(Boolean)
      .map((id) => ({ id: id!, label: id!.replace('-', ' ') })),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-48">
        <Image
          src={vendor.coverImage || vendor.logo || '/placeholder-store.jpg'}
          alt={vendor.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Top Actions */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Link
            href="/"
            className="p-2 bg-white rounded-full shadow-lg"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Link>
          <div className="flex gap-2">
            <button className="p-2 bg-white rounded-full shadow-lg">
              <Heart className="h-5 w-5 text-gray-700" />
            </button>
            <button className="p-2 bg-white rounded-full shadow-lg">
              <Share2 className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Store Logo */}
        <div className="absolute -bottom-8 left-4">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden border-4 border-white shadow-lg">
            <Image
              src={vendor.logo || '/placeholder-store.jpg'}
              alt={vendor.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Store Info */}
      <div className="bg-white pt-12 pb-4 px-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{vendor.name}</h1>
              {vendor.isVerified && (
                <BadgeCheck className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{vendor.description}</p>
          </div>
          <Badge
            variant={isCurrentlyOpen ? 'success' : 'error'}
          >
            {isCurrentlyOpen ? 'Open' : 'Closed'}
          </Badge>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded">
              <Star className="h-3 w-3 fill-current" />
              <span className="font-medium">{vendor.rating}</span>
            </div>
            <span className="text-gray-500">({vendor.totalRatings}+ ratings)</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{vendor.avgDeliveryTime} min</span>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 mt-3 text-sm text-gray-500">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{vendor.address}</span>
        </div>

        {/* Offers */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          <div className="flex-shrink-0 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm">
            50% off up to ₹100
          </div>
          <div className="flex-shrink-0 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
            Free delivery above ₹199
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white px-4 py-3 border-t">
        <Input
          placeholder={`Search in ${vendor.name}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-5 w-5" />}
        />
      </div>

      {/* Categories */}
      {categories.length > 1 && (
        <div className="bg-white px-4 py-3 border-t overflow-x-auto">
          <Tabs
            tabs={categories}
            defaultTab={activeCategory}
            onChange={setActiveCategory}
            variant="pills"
          />
        </div>
      )}

      {/* Products */}
      <div className="p-4">
        {filteredProducts.length > 0 ? (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="horizontal"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found</p>
          </div>
        )}
      </div>
    </div>
  );
}

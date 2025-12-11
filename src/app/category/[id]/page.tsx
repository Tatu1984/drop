'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import {
  restaurants,
  groceryStores,
  wineShops,
  mainCategories,
} from '@/data/mockData';
import VendorCard from '@/components/cards/VendorCard';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import BottomSheet from '@/components/ui/BottomSheet';
import type { Vendor } from '@/types';

const categoryVendorMap: Record<string, Vendor[]> = {
  food: restaurants,
  grocery: groceryStores,
  wine: wineShops,
  pharmacy: [],
  meat: [],
  milk: [],
  pet: [],
  flowers: [],
  genie: [],
};

const sortOptions = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'rating', label: 'Rating' },
  { id: 'deliveryTime', label: 'Delivery Time' },
  { id: 'distance', label: 'Distance' },
];

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    isVeg: false,
    rating4Plus: false,
    freeDelivery: false,
  });

  const category = mainCategories.find((c) => c.id === categoryId);
  const vendors = categoryVendorMap[categoryId] || [];

  // Apply filters
  let filteredVendors = [...vendors];
  if (filters.rating4Plus) {
    filteredVendors = filteredVendors.filter((v) => v.rating >= 4);
  }
  if (filters.freeDelivery) {
    filteredVendors = filteredVendors.filter((v) => v.minimumOrder <= 199);
  }

  // Apply sorting
  if (sortBy === 'rating') {
    filteredVendors.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'deliveryTime') {
    filteredVendors.sort((a, b) => a.avgDeliveryTime - b.avgDeliveryTime);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b sticky top-0 z-20">
        <h1 className="text-xl font-bold text-gray-900 mb-4">
          {category?.icon} {category?.name || 'Category'}
        </h1>

        {/* Sort Tabs */}
        <Tabs
          tabs={sortOptions}
          defaultTab={sortBy}
          onChange={(id) => setSortBy(id)}
          variant="pills"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white px-4 py-3 border-b flex gap-2 overflow-x-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>

        <Button
          variant={filters.isVeg ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilters({ ...filters, isVeg: !filters.isVeg })}
        >
          Pure Veg
        </Button>

        <Button
          variant={filters.rating4Plus ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilters({ ...filters, rating4Plus: !filters.rating4Plus })}
        >
          Rating 4.0+
        </Button>

        <Button
          variant={filters.freeDelivery ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilters({ ...filters, freeDelivery: !filters.freeDelivery })}
        >
          Free Delivery
        </Button>
      </div>

      {/* Results */}
      <div className="p-4 space-y-3">
        {filteredVendors.length > 0 ? (
          filteredVendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No stores found in this category</p>
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      <BottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filters"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <span className="font-medium">Pure Veg</span>
            <button
              onClick={() => setFilters({ ...filters, isVeg: !filters.isVeg })}
              className={`w-12 h-6 rounded-full transition-colors ${
                filters.isVeg ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  filters.isVeg ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <span className="font-medium">Rating 4.0+</span>
            <button
              onClick={() => setFilters({ ...filters, rating4Plus: !filters.rating4Plus })}
              className={`w-12 h-6 rounded-full transition-colors ${
                filters.rating4Plus ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  filters.rating4Plus ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <span className="font-medium">Free Delivery</span>
            <button
              onClick={() => setFilters({ ...filters, freeDelivery: !filters.freeDelivery })}
              className={`w-12 h-6 rounded-full transition-colors ${
                filters.freeDelivery ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  filters.freeDelivery ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setFilters({ isVeg: false, rating4Plus: false, freeDelivery: false });
              }}
            >
              Clear All
            </Button>
            <Button fullWidth onClick={() => setShowFilters(false)}>
              Apply
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

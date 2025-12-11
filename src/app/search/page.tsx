'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Mic,
  SlidersHorizontal,
} from 'lucide-react';
import { useSearchStore } from '@/store/useStore';
import { allProducts, allVendors } from '@/data/mockData';
import ProductCard from '@/components/cards/ProductCard';
import VendorCard from '@/components/cards/VendorCard';
import Input from '@/components/ui/Input';
import Tabs from '@/components/ui/Tabs';

const trendingSearches = [
  'Biryani',
  'Pizza',
  'Burger',
  'Coffee',
  'Milk',
  'Wine',
  'Bread',
  'Eggs',
];

export default function SearchPage() {
  const router = useRouter();
  const {
    query,
    setQuery,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  } = useSearchStore();

  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState<{
    products: typeof allProducts;
    vendors: typeof allVendors;
  }>({ products: [], vendors: [] });

  // Search effect
  useEffect(() => {
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      const matchedProducts = allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.description?.toLowerCase().includes(lowerQuery)
      );
      const matchedVendors = allVendors.filter(
        (v) =>
          v.name.toLowerCase().includes(lowerQuery) ||
          v.description?.toLowerCase().includes(lowerQuery)
      );
      setResults({ products: matchedProducts, vendors: matchedVendors });
    } else {
      setResults({ products: [], vendors: [] });
    }
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
    }
  };

  const hasResults = results.products.length > 0 || results.vendors.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white px-4 py-4 border-b sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search for food, grocery, wine..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leftIcon={<Search className="h-5 w-5" />}
              rightIcon={
                query ? (
                  <button onClick={() => setQuery('')}>
                    <X className="h-5 w-5" />
                  </button>
                ) : (
                  <button className="text-orange-500">
                    <Mic className="h-5 w-5" />
                  </button>
                )
              }
              autoFocus
            />
          </div>
          <button
            onClick={() => router.back()}
            className="text-orange-500 font-medium"
          >
            Cancel
          </button>
        </div>

        {/* Tabs */}
        {hasResults && (
          <div className="mt-4">
            <Tabs
              tabs={[
                { id: 'all', label: 'All' },
                { id: 'food', label: 'Food' },
                { id: 'stores', label: 'Stores' },
                { id: 'grocery', label: 'Grocery' },
              ]}
              defaultTab={activeTab}
              onChange={setActiveTab}
              variant="pills"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {!query ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Recent Searches</h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-sm text-orange-500"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm"
                    >
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold text-gray-900">Trending Now</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleSearch(search)}
                    className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-medium hover:bg-orange-100 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : !hasResults ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 text-sm">
              Try searching for something else
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stores */}
            {(activeTab === 'all' || activeTab === 'stores') &&
              results.vendors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Stores</h3>
                  <div className="space-y-3">
                    {results.vendors.map((vendor) => (
                      <VendorCard
                        key={vendor.id}
                        vendor={vendor}
                        variant="horizontal"
                      />
                    ))}
                  </div>
                </div>
              )}

            {/* Products */}
            {(activeTab === 'all' || activeTab === 'food' || activeTab === 'grocery') &&
              results.products.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {results.products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        variant="compact"
                      />
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

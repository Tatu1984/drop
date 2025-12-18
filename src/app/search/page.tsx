'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Mic,
  MicOff,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react';
import { useSearchStore } from '@/store/useStore';
import ProductCard from '@/components/cards/ProductCard';
import VendorCard from '@/components/cards/VendorCard';
import Input from '@/components/ui/Input';
import Tabs from '@/components/ui/Tabs';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description?: string;
  images: string[];
  price: number;
  discountPrice?: number;
  rating: number;
  isVeg: boolean;
  vendor?: { id: string; name: string };
}

interface Vendor {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  type: string;
  rating: number;
  avgDeliveryTime: number;
}

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
    products: Product[];
    vendors: Vendor[];
  }>({ products: [], vendors: [] });
  const [isListening, setIsListening] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Voice search handler
  const handleVoiceSearch = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice search not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast('Listening...', { icon: '🎤' });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      addRecentSearch(transcript);
      toast.success(`Searching for "${transcript}"`);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied');
      } else {
        toast.error('Voice search failed. Try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [setQuery, addRecentSearch]);

  // Search effect with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setResults({ products: [], vendors: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const [productsRes, vendorsRes] = await Promise.all([
          fetch(`/api/products?search=${encodeURIComponent(query)}&limit=20`),
          fetch(`/api/vendors?search=${encodeURIComponent(query)}&limit=10`),
        ]);

        const productsData = productsRes.ok ? await productsRes.json() : { data: { data: [] } };
        const vendorsData = vendorsRes.ok ? await vendorsRes.json() : { data: { data: [] } };

        setResults({
          products: productsData.data?.data || [],
          vendors: vendorsData.data?.data || [],
        });
      } catch (error) {
        console.error('Search error:', error);
        setResults({ products: [], vendors: [] });
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
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
                  <button
                    onClick={handleVoiceSearch}
                    className={`${isListening ? 'text-red-500 animate-pulse' : 'text-orange-500'}`}
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
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
        ) : isSearching ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-500">Searching...</p>
          </div>
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

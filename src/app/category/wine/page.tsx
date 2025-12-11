'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Wine, AlertTriangle, ShieldCheck, Calendar, Upload, Camera, X, CheckCircle, SlidersHorizontal, ChevronDown, Star } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import ProductCard from '@/components/cards/ProductCard';
import { useAuthStore } from '@/store/useStore';
import toast from 'react-hot-toast';

// Extended wine products with filter attributes
const wineProducts = [
  { id: 'w1', name: 'Sula Rasa Shiraz', vendorId: 'liquor1', categoryId: 'wine', price: 1299, discountPrice: 1099, description: 'Bold Indian red wine with notes of blackberry and spice', images: ['/products/wine1.jpg'], rating: 4.5, totalRatings: 128, isVeg: true, isVegan: false, inStock: true, allergens: [], pairings: ['Red Meat', 'Cheese'], abvPercent: 13.5, tasteProfile: 'Bold', countryOfOrigin: 'India', year: 2021, grapeType: 'Shiraz', wineType: 'Red' },
  { id: 'w2', name: 'Jacob\'s Creek Chardonnay', vendorId: 'liquor1', categoryId: 'wine', price: 1599, description: 'Crisp Australian white wine with citrus notes', images: ['/products/wine2.jpg'], rating: 4.3, totalRatings: 89, isVeg: true, isVegan: false, inStock: true, allergens: [], pairings: ['Seafood', 'Poultry'], abvPercent: 12.5, tasteProfile: 'Crisp', countryOfOrigin: 'Australia', year: 2022, grapeType: 'Chardonnay', wineType: 'White' },
  { id: 'w3', name: 'Grover Zampa Reserve', vendorId: 'liquor1', categoryId: 'wine', price: 2499, discountPrice: 2199, description: 'Premium reserve wine with oak aging', images: ['/products/wine3.jpg'], rating: 4.7, totalRatings: 156, isVeg: true, isVegan: false, inStock: true, allergens: [], pairings: ['Lamb', 'Game'], abvPercent: 14.0, tasteProfile: 'Full-bodied', countryOfOrigin: 'India', year: 2019, grapeType: 'Cabernet Sauvignon', wineType: 'Red' },
  { id: 'w4', name: 'Big Banyan Merlot', vendorId: 'liquor1', categoryId: 'wine', price: 899, description: 'Smooth red wine perfect for everyday', images: ['/products/wine4.jpg'], rating: 4.2, totalRatings: 67, isVeg: true, isVegan: false, inStock: true, allergens: [], pairings: ['Pasta', 'Pizza'], abvPercent: 12.0, tasteProfile: 'Smooth', countryOfOrigin: 'India', year: 2022, grapeType: 'Merlot', wineType: 'Red' },
  { id: 'w5', name: 'Moet & Chandon Imperial', vendorId: 'liquor1', categoryId: 'wine', price: 4999, description: 'Premium French champagne', images: ['/products/wine5.jpg'], rating: 4.9, totalRatings: 234, isVeg: true, isVegan: false, inStock: true, allergens: [], pairings: ['Celebrations', 'Oysters'], abvPercent: 12.0, tasteProfile: 'Bubbly', countryOfOrigin: 'France', year: 2020, grapeType: 'Pinot Noir', wineType: 'Sparkling' },
  { id: 'w6', name: 'Yellow Tail Moscato', vendorId: 'liquor1', categoryId: 'wine', price: 1199, description: 'Sweet and fruity white wine', images: ['/products/wine6.jpg'], rating: 4.1, totalRatings: 145, isVeg: true, isVegan: false, inStock: true, allergens: [], pairings: ['Desserts', 'Fruits'], abvPercent: 7.5, tasteProfile: 'Sweet', countryOfOrigin: 'Australia', year: 2023, grapeType: 'Moscato', wineType: 'White' },
  { id: 'w7', name: 'Fratelli Sangiovese Rosé', vendorId: 'liquor1', categoryId: 'wine', price: 1399, description: 'Light and refreshing rosé wine', images: ['/products/wine7.jpg'], rating: 4.4, totalRatings: 98, isVeg: true, isVegan: false, inStock: true, allergens: [], pairings: ['Salads', 'Light Fare'], abvPercent: 11.5, tasteProfile: 'Light', countryOfOrigin: 'India', year: 2022, grapeType: 'Sangiovese', wineType: 'Rosé' },
];

const beerProducts = [
  { id: 'b1', name: 'Kingfisher Ultra', vendorId: 'liquor1', categoryId: 'beer', price: 149, description: 'Premium lager beer', images: ['/products/beer1.jpg'], rating: 4.1, totalRatings: 234, isVeg: true, isVegan: false, inStock: true, allergens: ['Gluten'], pairings: ['Snacks', 'Indian Food'], abvPercent: 5.0, beerType: 'Lager', countryOfOrigin: 'India' },
  { id: 'b2', name: 'Budweiser', vendorId: 'liquor1', categoryId: 'beer', price: 179, description: 'American lager', images: ['/products/beer2.jpg'], rating: 4.0, totalRatings: 189, isVeg: true, isVegan: false, inStock: true, allergens: ['Gluten'], pairings: ['Burgers', 'Wings'], abvPercent: 5.0, beerType: 'Lager', countryOfOrigin: 'USA' },
  { id: 'b3', name: 'Heineken', vendorId: 'liquor1', categoryId: 'beer', price: 199, description: 'Dutch premium lager', images: ['/products/beer3.jpg'], rating: 4.3, totalRatings: 167, isVeg: true, isVegan: false, inStock: true, allergens: ['Gluten'], pairings: ['Fries', 'Seafood'], abvPercent: 5.0, beerType: 'Lager', countryOfOrigin: 'Netherlands' },
  { id: 'b4', name: 'Corona Extra', vendorId: 'liquor1', categoryId: 'beer', price: 219, description: 'Mexican pale lager', images: ['/products/beer4.jpg'], rating: 4.2, totalRatings: 312, isVeg: true, isVegan: false, inStock: true, allergens: ['Gluten'], pairings: ['Mexican Food', 'Beach Vibes'], abvPercent: 4.5, beerType: 'Pale Lager', countryOfOrigin: 'Mexico' },
  { id: 'b5', name: 'Hoegaarden', vendorId: 'liquor1', categoryId: 'beer', price: 249, description: 'Belgian wheat beer', images: ['/products/beer5.jpg'], rating: 4.4, totalRatings: 178, isVeg: true, isVegan: false, inStock: true, allergens: ['Gluten', 'Wheat'], pairings: ['Salads', 'Light Dishes'], abvPercent: 4.9, beerType: 'Wheat Beer', countryOfOrigin: 'Belgium' },
  { id: 'b6', name: 'Bira 91 White', vendorId: 'liquor1', categoryId: 'beer', price: 169, description: 'Indian craft wheat beer', images: ['/products/beer6.jpg'], rating: 4.3, totalRatings: 456, isVeg: true, isVegan: false, inStock: true, allergens: ['Gluten', 'Wheat'], pairings: ['Pizza', 'Asian Food'], abvPercent: 4.7, beerType: 'Wheat Beer', countryOfOrigin: 'India' },
];

const spiritsProducts = [
  { id: 's1', name: 'Old Monk Rum', vendorId: 'liquor1', categoryId: 'spirits', price: 499, description: 'Classic Indian rum', images: ['/products/rum1.jpg'], rating: 4.6, totalRatings: 423, isVeg: true, isVegan: false, inStock: true, allergens: [], pairings: ['Cola', 'Cocktails'], abvPercent: 42.8, spiritType: 'Rum', countryOfOrigin: 'India' },
  { id: 's2', name: 'Johnnie Walker Red', vendorId: 'liquor1', categoryId: 'spirits', price: 1799, description: 'Blended Scotch whisky', images: ['/products/whisky1.jpg'], rating: 4.4, totalRatings: 267, isVeg: true, isVegan: false, inStock: true, allergens: [], pairings: ['Neat', 'On the Rocks'], abvPercent: 40.0, spiritType: 'Whisky', countryOfOrigin: 'Scotland' },
  { id: 's3', name: 'Absolut Vodka', vendorId: 'liquor1', categoryId: 'spirits', price: 1599, description: 'Swedish premium vodka', images: ['/products/vodka1.jpg'], rating: 4.5, totalRatings: 345, isVeg: true, isVegan: false, inStock: true, allergens: [], pairings: ['Martini', 'Mixed Drinks'], abvPercent: 40.0, spiritType: 'Vodka', countryOfOrigin: 'Sweden' },
  { id: 's4', name: 'Bombay Sapphire Gin', vendorId: 'liquor1', categoryId: 'spirits', price: 2199, description: 'Premium London dry gin', images: ['/products/gin1.jpg'], rating: 4.6, totalRatings: 189, isVeg: true, isVegan: false, inStock: true, allergens: [], pairings: ['Gin & Tonic', 'Cocktails'], abvPercent: 40.0, spiritType: 'Gin', countryOfOrigin: 'UK' },
  { id: 's5', name: 'Jose Cuervo Gold', vendorId: 'liquor1', categoryId: 'spirits', price: 1899, description: 'Mexican gold tequila', images: ['/products/tequila1.jpg'], rating: 4.3, totalRatings: 234, isVeg: true, isVegan: false, inStock: true, allergens: [], pairings: ['Margarita', 'Shots'], abvPercent: 40.0, spiritType: 'Tequila', countryOfOrigin: 'Mexico' },
];

// Filter options
const wineFilters = {
  wineTypes: ['Red', 'White', 'Rosé', 'Sparkling'],
  tasteProfiles: ['Bold', 'Crisp', 'Full-bodied', 'Smooth', 'Sweet', 'Light', 'Bubbly'],
  countries: ['India', 'France', 'Australia', 'Italy', 'USA', 'Spain'],
  grapeTypes: ['Shiraz', 'Chardonnay', 'Cabernet Sauvignon', 'Merlot', 'Pinot Noir', 'Moscato', 'Sangiovese'],
  years: [2023, 2022, 2021, 2020, 2019],
  abvRanges: [{ label: 'Light (<10%)', min: 0, max: 10 }, { label: 'Medium (10-13%)', min: 10, max: 13 }, { label: 'Full (13%+)', min: 13, max: 100 }],
};

const beerFilters = {
  beerTypes: ['Lager', 'Wheat Beer', 'Pale Lager', 'IPA', 'Stout'],
  countries: ['India', 'USA', 'Netherlands', 'Mexico', 'Belgium', 'Germany'],
  abvRanges: [{ label: 'Light (<5%)', min: 0, max: 5 }, { label: 'Regular (5-7%)', min: 5, max: 7 }, { label: 'Strong (7%+)', min: 7, max: 100 }],
};

const spiritFilters = {
  spiritTypes: ['Whisky', 'Vodka', 'Rum', 'Gin', 'Tequila', 'Brandy'],
  countries: ['India', 'Scotland', 'USA', 'Sweden', 'UK', 'Mexico'],
  abvRanges: [{ label: 'Standard (35-40%)', min: 35, max: 40 }, { label: 'Strong (40%+)', min: 40, max: 100 }],
};

interface FilterState {
  wineType: string[];
  tasteProfile: string[];
  country: string[];
  grapeType: string[];
  year: number[];
  abvRange: { min: number; max: number } | null;
  beerType: string[];
  spiritType: string[];
  priceRange: { min: number; max: number } | null;
  sortBy: 'rating' | 'price_low' | 'price_high' | 'popularity';
}

const initialFilters: FilterState = {
  wineType: [],
  tasteProfile: [],
  country: [],
  grapeType: [],
  year: [],
  abvRange: null,
  beerType: [],
  spiritType: [],
  priceRange: null,
  sortBy: 'popularity',
};

export default function WineCategoryPage() {
  const { user, setUser } = useAuthStore();
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'wine' | 'beer' | 'spirits'>('wine');
  const [searchQuery, setSearchQuery] = useState('');
  const [kycStep, setKycStep] = useState(1);
  const [dob, setDob] = useState('');
  const [idType, setIdType] = useState<'aadhaar' | 'pan' | 'license'>('aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  useEffect(() => {
    // Check if user is age verified
    if (user?.isAgeVerified) {
      setIsVerified(true);
    } else {
      setShowAgeVerification(true);
    }
  }, [user]);

  const handleAgeCheck = (isOver21: boolean) => {
    if (isOver21) {
      setShowAgeVerification(false);
      if (!user?.isKycVerified) {
        setShowKYCModal(true);
      } else {
        setIsVerified(true);
      }
    } else {
      toast.error('You must be 21+ to access this section');
    }
  };

  const handleKYCSubmit = async () => {
    if (!dob || !idNumber) {
      toast.error('Please fill all required fields');
      return;
    }

    // Calculate age
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 21) {
      toast.error('You must be 21 years or older to purchase alcohol');
      return;
    }

    setIsProcessing(true);
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update user
    if (user) {
      setUser({ ...user, isAgeVerified: true, isKycVerified: true });
    }

    setIsProcessing(false);
    setShowKYCModal(false);
    setIsVerified(true);
    toast.success('Age verification successful!');
  };

  const activeFilterCount = [
    ...filters.wineType, ...filters.tasteProfile, ...filters.country,
    ...filters.grapeType, ...filters.year.map(String), ...filters.beerType, ...filters.spiritType,
    filters.abvRange ? 'abv' : '', filters.priceRange ? 'price' : ''
  ].filter(Boolean).length;

  const toggleFilter = (key: keyof FilterState, value: string | number) => {
    setFilters(prev => {
      const current = prev[key] as (string | number)[];
      if (Array.isArray(current)) {
        return {
          ...prev,
          [key]: current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value]
        };
      }
      return prev;
    });
  };

  const products = selectedTab === 'wine' ? wineProducts : selectedTab === 'beer' ? beerProducts : spiritsProducts;

  // Apply filters
  let filteredProducts = products.filter(p => {
    // Search filter
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Wine-specific filters
    if (selectedTab === 'wine') {
      const wine = p as typeof wineProducts[0];
      if (filters.wineType.length && !filters.wineType.includes(wine.wineType)) return false;
      if (filters.tasteProfile.length && !filters.tasteProfile.includes(wine.tasteProfile)) return false;
      if (filters.grapeType.length && !filters.grapeType.includes(wine.grapeType)) return false;
      if (filters.year.length && !filters.year.includes(wine.year)) return false;
    }

    // Beer-specific filters
    if (selectedTab === 'beer') {
      const beer = p as typeof beerProducts[0];
      if (filters.beerType.length && !filters.beerType.includes(beer.beerType)) return false;
    }

    // Spirits-specific filters
    if (selectedTab === 'spirits') {
      const spirit = p as typeof spiritsProducts[0];
      if (filters.spiritType.length && !filters.spiritType.includes(spirit.spiritType)) return false;
    }

    // Common filters
    if (filters.country.length) {
      const product = p as { countryOfOrigin?: string };
      if (product.countryOfOrigin && !filters.country.includes(product.countryOfOrigin)) return false;
    }

    if (filters.abvRange) {
      const product = p as { abvPercent?: number };
      if (product.abvPercent && (product.abvPercent < filters.abvRange.min || product.abvPercent > filters.abvRange.max)) {
        return false;
      }
    }

    if (filters.priceRange) {
      if (p.price < filters.priceRange.min || p.price > filters.priceRange.max) return false;
    }

    return true;
  });

  // Apply sorting
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'popularity':
      default:
        return b.totalRatings - a.totalRatings;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-800 to-purple-900 text-white px-4 py-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Wine className="h-6 w-6" />
              Wine & Spirits
            </h1>
            <p className="text-purple-200 text-sm">Premium drinks delivered to your door</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search wines, beers, spirits..."
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Age Verification Warning */}
      {!isVerified && !showAgeVerification && !showKYCModal && (
        <Card className="mx-4 mt-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800">Age Verification Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You need to complete age verification to browse and purchase alcohol products.
              </p>
              <Button size="sm" className="mt-3" onClick={() => setShowKYCModal(true)}>
                Verify Now
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isVerified && (
        <>
          {/* Verified Badge */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 text-green-600">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-medium">Age Verified</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-4 flex gap-2 mb-4">
            {(['wine', 'beer', 'spirits'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setSelectedTab(tab);
                  setFilters(initialFilters); // Reset filters when switching tabs
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                  selectedTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 border'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filter & Sort Bar */}
          <div className="px-4 flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))}
                className="appearance-none bg-white border rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="popularity">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="px-4 mb-4 flex flex-wrap gap-2">
              {filters.wineType.map(t => (
                <span key={t} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                  {t}
                  <button onClick={() => toggleFilter('wineType', t)}><X className="h-3 w-3" /></button>
                </span>
              ))}
              {filters.tasteProfile.map(t => (
                <span key={t} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                  {t}
                  <button onClick={() => toggleFilter('tasteProfile', t)}><X className="h-3 w-3" /></button>
                </span>
              ))}
              {filters.country.map(c => (
                <span key={c} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                  {c}
                  <button onClick={() => toggleFilter('country', c)}><X className="h-3 w-3" /></button>
                </span>
              ))}
              {filters.grapeType.map(g => (
                <span key={g} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                  {g}
                  <button onClick={() => toggleFilter('grapeType', g)}><X className="h-3 w-3" /></button>
                </span>
              ))}
              {filters.beerType.map(b => (
                <span key={b} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                  {b}
                  <button onClick={() => toggleFilter('beerType', b)}><X className="h-3 w-3" /></button>
                </span>
              ))}
              {filters.spiritType.map(s => (
                <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                  {s}
                  <button onClick={() => toggleFilter('spiritType', s)}><X className="h-3 w-3" /></button>
                </span>
              ))}
              <button
                onClick={() => setFilters(initialFilters)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="px-4 mb-3">
            <p className="text-sm text-gray-500">{filteredProducts.length} products found</p>
          </div>

          {/* Products Grid */}
          <div className="px-4 grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} variant="compact" />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Wine className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No products found</p>
            </div>
          )}

          {/* Delivery Info */}
          <Card className="mx-4 mt-6 bg-purple-50 border-purple-200">
            <h3 className="font-medium text-purple-800 mb-2">Delivery Guidelines</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Delivery available between 10 AM - 10 PM only</li>
              <li>• Valid ID required at delivery</li>
              <li>• Cannot be delivered to dry areas</li>
              <li>• Max 2 bottles per category per order</li>
            </ul>
          </Card>
        </>
      )}

      {/* Age Verification Modal */}
      <Modal
        isOpen={showAgeVerification}
        onClose={() => {}}
        title=""
        size="md"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Age Verification Required</h2>
          <p className="text-gray-600 mb-6">
            You must be 21 years or older to access the wine and spirits section.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            By clicking &quot;I am 21+&quot;, you confirm that you are of legal drinking age.
          </p>
          <div className="flex gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" fullWidth>
                Go Back
              </Button>
            </Link>
            <Button fullWidth onClick={() => handleAgeCheck(true)}>
              I am 21+
            </Button>
          </div>
        </div>
      </Modal>

      {/* KYC Verification Modal */}
      <Modal
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        title="Age Verification (KYC)"
        size="lg"
      >
        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  kycStep >= step
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {kycStep > step ? <CheckCircle className="h-5 w-5" /> : step}
              </div>
            ))}
          </div>

          {kycStep === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Enter Your Date of Birth</h3>
                <p className="text-sm text-gray-500">We need to verify you are 21+</p>
              </div>
              <Input
                type="date"
                label="Date of Birth"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
              <Button fullWidth onClick={() => {
                if (!dob) {
                  toast.error('Please enter your date of birth');
                  return;
                }
                setKycStep(2);
              }}>
                Continue
              </Button>
            </div>
          )}

          {kycStep === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <ShieldCheck className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Select ID Type</h3>
                <p className="text-sm text-gray-500">Choose a government issued ID</p>
              </div>
              <div className="space-y-2">
                {[
                  { id: 'aadhaar', label: 'Aadhaar Card', desc: '12-digit Aadhaar number' },
                  { id: 'pan', label: 'PAN Card', desc: '10-character PAN number' },
                  { id: 'license', label: 'Driving License', desc: 'Valid driving license' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setIdType(option.id as any)}
                    className={`w-full p-4 rounded-lg border text-left transition-colors ${
                      idType === option.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-gray-500">{option.desc}</p>
                  </button>
                ))}
              </div>
              <Input
                label={`Enter ${idType === 'aadhaar' ? 'Aadhaar' : idType === 'pan' ? 'PAN' : 'License'} Number`}
                placeholder={idType === 'aadhaar' ? 'XXXX XXXX XXXX' : idType === 'pan' ? 'ABCDE1234F' : 'DL-XXXXXXXXXX'}
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setKycStep(1)}>Back</Button>
                <Button fullWidth onClick={() => setKycStep(3)}>Continue</Button>
              </div>
            </div>
          )}

          {kycStep === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <Camera className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Upload ID Document</h3>
                <p className="text-sm text-gray-500">Take a photo or upload your ID</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-colors">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-sm">Front Side</span>
                </button>
                <button className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-colors">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-sm">Back Side</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Your documents are encrypted and stored securely. We use them only for age verification.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setKycStep(2)}>Back</Button>
                <Button fullWidth onClick={handleKYCSubmit} loading={isProcessing}>
                  Verify & Continue
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter Products"
        size="lg"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Wine Filters */}
          {selectedTab === 'wine' && (
            <>
              {/* Wine Type */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Wine Type</h4>
                <div className="flex flex-wrap gap-2">
                  {wineFilters.wineTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => toggleFilter('wineType', type)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.wineType.includes(type)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Taste Profile */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Taste Profile</h4>
                <div className="flex flex-wrap gap-2">
                  {wineFilters.tasteProfiles.map(taste => (
                    <button
                      key={taste}
                      onClick={() => toggleFilter('tasteProfile', taste)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.tasteProfile.includes(taste)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {taste}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grape Type */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Grape Variety</h4>
                <div className="flex flex-wrap gap-2">
                  {wineFilters.grapeTypes.map(grape => (
                    <button
                      key={grape}
                      onClick={() => toggleFilter('grapeType', grape)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.grapeType.includes(grape)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {grape}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Vintage Year</h4>
                <div className="flex flex-wrap gap-2">
                  {wineFilters.years.map(year => (
                    <button
                      key={year}
                      onClick={() => toggleFilter('year', year)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.year.includes(year)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Country of Origin</h4>
                <div className="flex flex-wrap gap-2">
                  {wineFilters.countries.map(country => (
                    <button
                      key={country}
                      onClick={() => toggleFilter('country', country)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.country.includes(country)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              </div>

              {/* ABV Range */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Alcohol Content (ABV %)</h4>
                <div className="flex flex-wrap gap-2">
                  {wineFilters.abvRanges.map(range => (
                    <button
                      key={range.label}
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        abvRange: prev.abvRange?.min === range.min ? null : range
                      }))}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.abvRange?.min === range.min
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Beer Filters */}
          {selectedTab === 'beer' && (
            <>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Beer Type</h4>
                <div className="flex flex-wrap gap-2">
                  {beerFilters.beerTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => toggleFilter('beerType', type)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.beerType.includes(type)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Country of Origin</h4>
                <div className="flex flex-wrap gap-2">
                  {beerFilters.countries.map(country => (
                    <button
                      key={country}
                      onClick={() => toggleFilter('country', country)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.country.includes(country)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Alcohol Content (ABV %)</h4>
                <div className="flex flex-wrap gap-2">
                  {beerFilters.abvRanges.map(range => (
                    <button
                      key={range.label}
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        abvRange: prev.abvRange?.min === range.min ? null : range
                      }))}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.abvRange?.min === range.min
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Spirits Filters */}
          {selectedTab === 'spirits' && (
            <>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Spirit Type</h4>
                <div className="flex flex-wrap gap-2">
                  {spiritFilters.spiritTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => toggleFilter('spiritType', type)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.spiritType.includes(type)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Country of Origin</h4>
                <div className="flex flex-wrap gap-2">
                  {spiritFilters.countries.map(country => (
                    <button
                      key={country}
                      onClick={() => toggleFilter('country', country)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.country.includes(country)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Alcohol Content (ABV %)</h4>
                <div className="flex flex-wrap gap-2">
                  {spiritFilters.abvRanges.map(range => (
                    <button
                      key={range.label}
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        abvRange: prev.abvRange?.min === range.min ? null : range
                      }))}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.abvRange?.min === range.min
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Price Range - Common for all */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Under ₹500', min: 0, max: 500 },
                { label: '₹500 - ₹1000', min: 500, max: 1000 },
                { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
                { label: 'Above ₹2000', min: 2000, max: 100000 },
              ].map(range => (
                <button
                  key={range.label}
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    priceRange: prev.priceRange?.min === range.min ? null : range
                  }))}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.priceRange?.min === range.min
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setFilters(initialFilters)}
              fullWidth
            >
              Clear All
            </Button>
            <Button
              onClick={() => setShowFilterModal(false)}
              fullWidth
            >
              Apply Filters ({filteredProducts.length})
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

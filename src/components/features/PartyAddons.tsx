'use client';

import { useState } from 'react';
import { PartyPopper, Check, Plus, Minus, Utensils, Package } from 'lucide-react';
import { useCartStore } from '@/store/useStore';
import { Product } from '@/types';
import toast from 'react-hot-toast';

interface PartyAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: 'cutlery' | 'packaging' | 'extras';
}

const partyAddons: PartyAddon[] = [
  // Cutlery
  { id: 'cutlery-basic', name: 'Basic Cutlery Set', description: 'Spoons, forks, knives (10 each)', price: 49, icon: '🍴', category: 'cutlery' },
  { id: 'cutlery-premium', name: 'Premium Cutlery Set', description: 'Wooden cutlery, eco-friendly (10 each)', price: 99, icon: '🥢', category: 'cutlery' },
  { id: 'plates-paper', name: 'Paper Plates', description: 'Pack of 20 paper plates', price: 79, icon: '🍽️', category: 'cutlery' },
  { id: 'plates-premium', name: 'Premium Plates', description: 'Sturdy laminated plates (12 pack)', price: 129, icon: '🍽️', category: 'cutlery' },
  { id: 'cups-paper', name: 'Paper Cups', description: 'Pack of 20 paper cups', price: 59, icon: '🥤', category: 'cutlery' },
  { id: 'napkins', name: 'Paper Napkins', description: 'Pack of 50 napkins', price: 39, icon: '🧻', category: 'cutlery' },

  // Packaging
  { id: 'foil-wrap', name: 'Foil Wraps', description: 'Keep food warm (10 pack)', price: 69, icon: '📦', category: 'packaging' },
  { id: 'food-containers', name: 'Food Containers', description: 'Reusable containers (5 pack)', price: 149, icon: '🥡', category: 'packaging' },
  { id: 'ice-packs', name: 'Ice Packs', description: 'Keep beverages cold', price: 89, icon: '🧊', category: 'packaging' },

  // Extras
  { id: 'candles', name: 'Birthday Candles', description: 'Pack of 24 + 1 large candle', price: 49, icon: '🕯️', category: 'extras' },
  { id: 'balloons', name: 'Party Balloons', description: 'Assorted colors (20 pack)', price: 99, icon: '🎈', category: 'extras' },
  { id: 'tablecloth', name: 'Disposable Tablecloth', description: 'Plastic tablecloth (6ft)', price: 79, icon: '🎊', category: 'extras' },
  { id: 'party-hats', name: 'Party Hats', description: 'Colorful party hats (10 pack)', price: 69, icon: '🎉', category: 'extras' },
  { id: 'streamer', name: 'Party Streamers', description: 'Decorative streamers (3 rolls)', price: 59, icon: '🎀', category: 'extras' },
];

interface SelectedAddon {
  addon: PartyAddon;
  quantity: number;
}

export default function PartyAddons() {
  const { addItem } = useCartStore();
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'cutlery' | 'packaging' | 'extras'>('all');

  const filteredAddons = activeCategory === 'all'
    ? partyAddons
    : partyAddons.filter(a => a.category === activeCategory);

  const getAddonQuantity = (id: string) => {
    const found = selectedAddons.find(s => s.addon.id === id);
    return found?.quantity || 0;
  };

  const updateQuantity = (addon: PartyAddon, delta: number) => {
    setSelectedAddons(prev => {
      const existing = prev.find(s => s.addon.id === addon.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return prev.filter(s => s.addon.id !== addon.id);
        }
        return prev.map(s =>
          s.addon.id === addon.id ? { ...s, quantity: newQty } : s
        );
      }
      if (delta > 0) {
        return [...prev, { addon, quantity: 1 }];
      }
      return prev;
    });
  };

  const totalPrice = selectedAddons.reduce(
    (sum, s) => sum + s.addon.price * s.quantity,
    0
  );

  const addAllToCart = () => {
    selectedAddons.forEach(({ addon, quantity }) => {
      const product: Product = {
        id: `addon-${addon.id}`,
        vendorId: 'party-addons',
        name: addon.name,
        description: addon.description,
        images: ['/addons/party.jpg'],
        price: addon.price,
        inStock: true,
        isVeg: true,
        isVegan: true,
        allergens: [],
        pairings: [],
        rating: 5,
        totalRatings: 0,
      };
      addItem(product, quantity);
    });
    toast.success(`Added ${selectedAddons.length} party items to cart`);
    setSelectedAddons([]);
  };

  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <PartyPopper className="h-5 w-5 text-pink-500" />
        <h3 className="font-semibold text-gray-900">Party Essentials</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Add cutlery, plates, and party supplies to make your celebration complete!
      </p>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {(['all', 'cutlery', 'packaging', 'extras'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-pink-500 text-white'
                : 'bg-white text-gray-600 border'
            }`}
          >
            {cat === 'all' ? 'All Items' : cat}
          </button>
        ))}
      </div>

      {/* Addons Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {filteredAddons.map((addon) => {
          const quantity = getAddonQuantity(addon.id);
          return (
            <div
              key={addon.id}
              className={`p-3 rounded-lg border-2 transition-colors ${
                quantity > 0
                  ? 'bg-pink-50 border-pink-400'
                  : 'bg-white border-transparent hover:border-pink-200'
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-2xl">{addon.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{addon.name}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{addon.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-pink-600">₹{addon.price}</span>
                {quantity > 0 ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(addon, -1)}
                      className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(addon, 1)}
                      className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => updateQuantity(addon, 1)}
                    className="px-3 py-1 bg-pink-500 text-white text-xs rounded-full font-medium"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add to Cart Section */}
      {selectedAddons.length > 0 && (
        <div className="pt-4 border-t border-pink-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">
              {selectedAddons.reduce((sum, s) => sum + s.quantity, 0)} item(s)
            </span>
            <span className="font-semibold text-pink-600">₹{totalPrice}</span>
          </div>
          <button
            onClick={addAllToCart}
            className="w-full py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
          >
            <Package className="h-4 w-4" />
            Add Party Supplies to Cart
          </button>
        </div>
      )}
    </div>
  );
}

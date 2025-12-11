'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Clock,
  ShoppingBag,
  Bell,
  ChevronRight,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import { useCartStore, useOrderStore, useAuthStore } from '@/store/useStore';
import { Product } from '@/types';
import toast from 'react-hot-toast';

interface AIRecommendationsProps {
  products: Product[];
  variant?: 'full' | 'compact' | 'banner';
}

// Mock data for demonstration - in real app, this would come from AI/ML backend
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { greeting: 'Good Morning', meal: 'breakfast', icon: '🌅' };
  if (hour < 17) return { greeting: 'Good Afternoon', meal: 'lunch', icon: '☀️' };
  if (hour < 21) return { greeting: 'Good Evening', meal: 'dinner', icon: '🌆' };
  return { greeting: 'Late Night', meal: 'snack', icon: '🌙' };
};

const getPredictiveReminders = () => [
  { id: 'r1', item: 'Milk', daysLeft: 2, icon: '🥛', urgency: 'high' },
  { id: 'r2', item: 'Eggs', daysLeft: 4, icon: '🥚', urgency: 'medium' },
  { id: 'r3', item: 'Bread', daysLeft: 1, icon: '🍞', urgency: 'high' },
  { id: 'r4', item: 'Butter', daysLeft: 5, icon: '🧈', urgency: 'low' },
];

export default function AIRecommendations({ products, variant = 'full' }: AIRecommendationsProps) {
  const { addItem } = useCartStore();
  const { orders } = useOrderStore();
  const { user } = useAuthStore();
  const [showReminders, setShowReminders] = useState(true);
  const [dismissedReminders, setDismissedReminders] = useState<string[]>([]);

  const timeContext = getTimeBasedGreeting();
  const reminders = getPredictiveReminders().filter(r => !dismissedReminders.includes(r.id));

  // Simulate reorder suggestions based on past orders
  const reorderSuggestions = products.slice(0, 3).map((p, i) => ({
    ...p,
    lastOrdered: `${7 + i * 3} days ago`,
    frequency: i === 0 ? 'Weekly' : i === 1 ? 'Bi-weekly' : 'Monthly',
  }));

  // Time-based recommendations
  const timeBasedProducts = products
    .filter(p => p.categoryId?.toLowerCase().includes(timeContext.meal) || true)
    .slice(0, 4);

  const handleQuickAdd = (product: Product) => {
    addItem(product, 1);
    toast.success(`Added ${product.name} to cart`);
  };

  const dismissReminder = (id: string) => {
    setDismissedReminders(prev => [...prev, id]);
  };

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{timeContext.greeting}! {timeContext.icon}</p>
            <p className="text-sm text-purple-100">
              Based on your preferences, here are some {timeContext.meal} suggestions
            </p>
          </div>
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="space-y-4">
        {/* Quick Reorder */}
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900">Quick Reorder</h3>
            </div>
            <button className="text-sm text-orange-500 font-medium">View All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {reorderSuggestions.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-32 bg-gray-50 rounded-lg p-2"
              >
                <div className="w-full aspect-square rounded-lg bg-gray-200 mb-2 overflow-hidden">
                  <img
                    src={product.images[0] || '/placeholder-food.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs font-medium truncate">{product.name}</p>
                <p className="text-xs text-gray-500">{product.lastOrdered}</p>
                <button
                  onClick={() => handleQuickAdd(product)}
                  className="mt-2 w-full py-1.5 bg-orange-500 text-white text-xs rounded-lg font-medium"
                >
                  Add ₹{product.discountPrice || product.price}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Predictive Reminders */}
      {reminders.length > 0 && showReminders && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-gray-900">Running Low On</h3>
            </div>
            <button
              onClick={() => setShowReminders(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Based on your purchase history, you might need to restock:
          </p>
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  reminder.urgency === 'high'
                    ? 'bg-red-50 border border-red-200'
                    : reminder.urgency === 'medium'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-green-50 border border-green-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{reminder.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{reminder.item}</p>
                    <p className={`text-xs ${
                      reminder.urgency === 'high' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {reminder.urgency === 'high' && <AlertCircle className="h-3 w-3 inline mr-1" />}
                      Estimated {reminder.daysLeft} days left
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dismissReminder(reminder.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button className="px-3 py-1.5 bg-orange-500 text-white text-xs rounded-lg font-medium flex items-center gap-1">
                    <Plus className="h-3 w-3" />
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time-Based Suggestions */}
      <div className="bg-white rounded-xl p-4 border">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold text-gray-900">
            {timeContext.icon} Perfect for {timeContext.meal}
          </h3>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Personalized picks based on time of day and your preferences
        </p>
        <div className="grid grid-cols-2 gap-3">
          {timeBasedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-gray-50 rounded-lg p-3 flex gap-3"
            >
              <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                <img
                  src={product.images[0] || '/placeholder-food.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-sm text-orange-600 font-semibold">
                  ₹{product.discountPrice || product.price}
                </p>
                <button
                  onClick={() => handleQuickAdd(product)}
                  className="mt-1 px-2 py-1 bg-orange-500 text-white text-xs rounded font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reorder Suggestions */}
      <div className="bg-white rounded-xl p-4 border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-gray-900">Order Again</h3>
          </div>
          <span className="text-xs text-gray-500">Based on your history</span>
        </div>
        <div className="space-y-3">
          {reorderSuggestions.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-14 h-14 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                <img
                  src={product.images[0] || '/placeholder-food.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{product.lastOrdered}</span>
                  <span>•</span>
                  <span className="text-green-600">{product.frequency}</span>
                </div>
              </div>
              <button
                onClick={() => handleQuickAdd(product)}
                className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg font-medium"
              >
                ₹{product.discountPrice || product.price}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ChevronDown,
  GripVertical,
  Tag,
  Clock,
  Flame,
  Leaf,
  AlertTriangle,
} from 'lucide-react';
import VendorLayout from '@/components/layout/VendorLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  isVeg: boolean;
  isSpicy: boolean;
  isBestseller: boolean;
  prepTime: number;
}

interface Category {
  id: string;
  name: string;
  itemCount: number;
}

const mockCategories: Category[] = [
  { id: '1', name: 'Starters', itemCount: 12 },
  { id: '2', name: 'Main Course', itemCount: 18 },
  { id: '3', name: 'Breads', itemCount: 8 },
  { id: '4', name: 'Rice & Biryani', itemCount: 6 },
  { id: '5', name: 'Beverages', itemCount: 10 },
  { id: '6', name: 'Desserts', itemCount: 5 },
];

const mockItems: MenuItem[] = [
  { id: '1', name: 'Paneer Tikka', description: 'Marinated cottage cheese grilled in tandoor', price: 320, category: 'Starters', isAvailable: true, isVeg: true, isSpicy: false, isBestseller: true, prepTime: 15 },
  { id: '2', name: 'Chicken Tikka', description: 'Tender chicken pieces marinated and grilled', price: 380, category: 'Starters', isAvailable: true, isVeg: false, isSpicy: true, isBestseller: true, prepTime: 18 },
  { id: '3', name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken', price: 420, category: 'Main Course', isAvailable: true, isVeg: false, isSpicy: false, isBestseller: true, prepTime: 20 },
  { id: '4', name: 'Dal Makhani', description: 'Slow-cooked black lentils in creamy gravy', price: 280, category: 'Main Course', isAvailable: true, isVeg: true, isSpicy: false, isBestseller: false, prepTime: 15 },
  { id: '5', name: 'Garlic Naan', description: 'Soft bread topped with garlic and butter', price: 60, category: 'Breads', isAvailable: true, isVeg: true, isSpicy: false, isBestseller: false, prepTime: 8 },
  { id: '6', name: 'Chicken Biryani', description: 'Aromatic rice dish with spiced chicken', price: 450, category: 'Rice & Biryani', isAvailable: false, isVeg: false, isSpicy: true, isBestseller: true, prepTime: 25 },
  { id: '7', name: 'Gulab Jamun', description: 'Deep fried milk dumplings in sugar syrup', price: 120, category: 'Desserts', isAvailable: true, isVeg: true, isSpicy: false, isBestseller: false, prepTime: 5 },
];

export default function VendorMenuPage() {
  const [items, setItems] = useState<MenuItem[]>(mockItems);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredItems = items.filter(item => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAvailability = (itemId: string) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
    ));
  };

  const totalItems = items.length;
  const availableItems = items.filter(i => i.isAvailable).length;

  return (
    <VendorLayout title="Menu Management">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-gray-500">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Available</p>
            <p className="text-2xl font-bold text-green-600">{availableItems}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Unavailable</p>
            <p className="text-2xl font-bold text-red-600">{totalItems - availableItems}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-2xl font-bold text-gray-900">{mockCategories.length}</p>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Categories Sidebar */}
          <div className="w-full lg:w-64">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Categories</h3>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    !selectedCategory ? 'bg-green-100 text-green-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  All Items ({totalItems})
                </button>
                {mockCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                      selectedCategory === category.name ? 'bg-green-100 text-green-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-xs text-gray-500">{category.itemCount}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Items Grid */}
          <div className="flex-1">
            <Card padding="none">
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 hover:bg-gray-50 ${!item.isAvailable ? 'bg-red-50' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Drag Handle */}
                      <div className="pt-2 cursor-move text-gray-400">
                        <GripVertical className="h-5 w-5" />
                      </div>

                      {/* Image Placeholder */}
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                item.isVeg ? 'border-green-600' : 'border-red-600'
                              }`}>
                                <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                              </span>
                              <h3 className="font-medium text-gray-900">{item.name}</h3>
                              {item.isBestseller && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                                  Bestseller
                                </span>
                              )}
                              {item.isSpicy && <Flame className="h-4 w-4 text-red-500" />}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.prepTime} min
                              </span>
                              <span className="text-gray-400">{item.category}</span>
                            </div>
                          </div>
                          <p className="text-lg font-bold text-gray-900">₹{item.price}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAvailability(item.id)}
                          className={`p-2 rounded-lg ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                          title={item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                        >
                          {item.isAvailable ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-100 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>No menu items found</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Menu Item</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows={2}
                  placeholder="Enter description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    {mockCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="15"
                  />
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-green-500" />
                    <span className="text-sm">Veg</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-green-500" />
                    <span className="text-sm">Spicy</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => setShowAddModal(false)} className="flex-1">
                Add Item
              </Button>
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  );
}

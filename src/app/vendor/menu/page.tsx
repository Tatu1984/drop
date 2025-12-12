'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  GripVertical,
  Clock,
  Flame,
  Loader2,
} from 'lucide-react';
import VendorLayout from '@/components/layout/VendorLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  images: string[];
  isAvailable: boolean;
  isVeg: boolean;
  prepTime?: number;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  itemCount: number;
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Starters', itemCount: 0 },
  { id: '2', name: 'Main Course', itemCount: 0 },
  { id: '3', name: 'Breads', itemCount: 0 },
  { id: '4', name: 'Rice & Biryani', itemCount: 0 },
  { id: '5', name: 'Beverages', itemCount: 0 },
  { id: '6', name: 'Desserts', itemCount: 0 },
];

export default function VendorMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: 'Starters',
    isVeg: true,
    isSpicy: false,
    prepTime: '15',
  });

  const fetchMenuItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/vendor/menu?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.data?.items || data.data || []);

        // Update category counts
        const counts: Record<string, number> = {};
        (data.data?.items || data.data || []).forEach((item: MenuItem) => {
          counts[item.category] = (counts[item.category] || 0) + 1;
        });
        setCategories(prev => prev.map(cat => ({
          ...cat,
          itemCount: counts[cat.name] || 0,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const filteredItems = items.filter(item => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAvailability = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    try {
      const response = await fetch('/api/vendor/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: itemId,
          isAvailable: !item.isAvailable,
        }),
      });

      if (response.ok) {
        setItems(items.map(i =>
          i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i
        ));
        toast.success(`Item ${!item.isAvailable ? 'available' : 'unavailable'}`);
      } else {
        toast.error('Failed to update availability');
      }
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const handleSaveItem = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...(editingItem ? { id: editingItem.id } : {}),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        category: formData.category,
        isVeg: formData.isVeg,
        prepTime: parseInt(formData.prepTime) || 15,
        tags: formData.isSpicy ? ['spicy'] : [],
      };

      const response = await fetch('/api/vendor/menu', {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingItem ? 'Item updated!' : 'Item added!');
        setShowAddModal(false);
        setEditingItem(null);
        resetForm();
        fetchMenuItems();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save item');
      }
    } catch (error) {
      toast.error('Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/vendor/menu?id=${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setItems(items.filter(i => i.id !== itemId));
        toast.success('Item deleted');
      } else {
        toast.error('Failed to delete item');
      }
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discountPrice: '',
      category: 'Starters',
      isVeg: true,
      isSpicy: false,
      prepTime: '15',
    });
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      discountPrice: item.discountPrice?.toString() || '',
      category: item.category,
      isVeg: item.isVeg,
      isSpicy: item.tags?.includes('spicy') || false,
      prepTime: item.prepTime?.toString() || '15',
    });
    setShowAddModal(true);
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
            <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
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
                {categories.map((category) => (
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
                  <Button onClick={() => { resetForm(); setEditingItem(null); setShowAddModal(true); }} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 hover:bg-gray-50 ${!item.isAvailable ? 'bg-red-50' : ''}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="pt-2 cursor-move text-gray-400">
                            <GripVertical className="h-5 w-5" />
                          </div>

                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.images?.[0] ? (
                              <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            )}
                          </div>

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
                                  {item.tags?.includes('spicy') && <Flame className="h-4 w-4 text-red-500" />}
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {item.prepTime || 15} min
                                  </span>
                                  <span className="text-gray-400">{item.category}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">₹{item.price}</p>
                                {item.discountPrice && (
                                  <p className="text-sm text-green-600">₹{item.discountPrice}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleAvailability(item.id)}
                              className={`p-2 rounded-lg ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                              title={item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                            >
                              {item.isAvailable ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                            >
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
                      <Button onClick={() => setShowAddModal(true)} className="mt-4">
                        Add Your First Item
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows={2}
                  placeholder="Enter description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                  <input
                    type="number"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="15"
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                    className="rounded text-green-500"
                  />
                  <span className="text-sm">Vegetarian</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSpicy}
                    onChange={(e) => setFormData({ ...formData, isSpicy: e.target.checked })}
                    className="rounded text-green-500"
                  />
                  <span className="text-sm">Spicy</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveItem} className="flex-1" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingItem ? (
                  'Update Item'
                ) : (
                  'Add Item'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  );
}

'use client';

import { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Flame,
  Leaf,
  AlertTriangle,
  Tag,
  MoreVertical,
  Settings,
  Layers,
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  image?: string;
  isAvailable: boolean;
  isVeg: boolean;
  isSpicy: boolean;
  isPopular: boolean;
  prepTime: number;
  allergens: string[];
  modifierGroups: string[];
  variants?: { name: string; price: number }[];
}

interface MenuCategory {
  id: string;
  name: string;
  itemCount: number;
  isExpanded: boolean;
  subCategories?: { id: string; name: string; itemCount: number }[];
}

interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  modifiers: { id: string; name: string; price: number }[];
}

const mockCategories: MenuCategory[] = [
  { id: '1', name: 'Starters', itemCount: 12, isExpanded: true, subCategories: [
    { id: '1a', name: 'Veg Starters', itemCount: 6 },
    { id: '1b', name: 'Non-Veg Starters', itemCount: 6 },
  ]},
  { id: '2', name: 'Main Course', itemCount: 18, isExpanded: false, subCategories: [
    { id: '2a', name: 'Veg Curries', itemCount: 8 },
    { id: '2b', name: 'Non-Veg Curries', itemCount: 6 },
    { id: '2c', name: 'Biryanis', itemCount: 4 },
  ]},
  { id: '3', name: 'Breads', itemCount: 8, isExpanded: false },
  { id: '4', name: 'Beverages', itemCount: 10, isExpanded: false },
  { id: '5', name: 'Desserts', itemCount: 6, isExpanded: false },
];

const mockItems: MenuItem[] = [
  {
    id: '1',
    name: 'Paneer Tikka',
    description: 'Marinated cottage cheese cubes grilled to perfection in tandoor',
    price: 320,
    category: 'Starters',
    subCategory: 'Veg Starters',
    isAvailable: true,
    isVeg: true,
    isSpicy: false,
    isPopular: true,
    prepTime: 15,
    allergens: ['Dairy'],
    modifierGroups: ['Spice Level', 'Add-ons'],
    variants: [
      { name: 'Half', price: 180 },
      { name: 'Full', price: 320 },
    ],
  },
  {
    id: '2',
    name: 'Chicken Tikka',
    description: 'Succulent chicken pieces marinated in yogurt and spices, grilled in tandoor',
    price: 380,
    category: 'Starters',
    subCategory: 'Non-Veg Starters',
    isAvailable: true,
    isVeg: false,
    isSpicy: true,
    isPopular: true,
    prepTime: 18,
    allergens: ['Dairy'],
    modifierGroups: ['Spice Level'],
  },
  {
    id: '3',
    name: 'Veg Spring Rolls',
    description: 'Crispy rolls stuffed with mixed vegetables',
    price: 220,
    category: 'Starters',
    subCategory: 'Veg Starters',
    isAvailable: false,
    isVeg: true,
    isSpicy: false,
    isPopular: false,
    prepTime: 12,
    allergens: ['Gluten'],
    modifierGroups: [],
  },
  {
    id: '4',
    name: 'Butter Chicken',
    description: 'Tender chicken in rich tomato and butter gravy',
    price: 420,
    category: 'Main Course',
    subCategory: 'Non-Veg Curries',
    isAvailable: true,
    isVeg: false,
    isSpicy: false,
    isPopular: true,
    prepTime: 20,
    allergens: ['Dairy', 'Nuts'],
    modifierGroups: ['Spice Level', 'Portion Size'],
  },
  {
    id: '5',
    name: 'Dal Makhani',
    description: 'Creamy black lentils slow-cooked overnight',
    price: 280,
    category: 'Main Course',
    subCategory: 'Veg Curries',
    isAvailable: true,
    isVeg: true,
    isSpicy: false,
    isPopular: true,
    prepTime: 15,
    allergens: ['Dairy'],
    modifierGroups: ['Portion Size'],
  },
];

const mockModifierGroups: ModifierGroup[] = [
  {
    id: '1',
    name: 'Spice Level',
    required: true,
    minSelect: 1,
    maxSelect: 1,
    modifiers: [
      { id: '1a', name: 'Mild', price: 0 },
      { id: '1b', name: 'Medium', price: 0 },
      { id: '1c', name: 'Spicy', price: 0 },
      { id: '1d', name: 'Extra Spicy', price: 20 },
    ],
  },
  {
    id: '2',
    name: 'Add-ons',
    required: false,
    minSelect: 0,
    maxSelect: 3,
    modifiers: [
      { id: '2a', name: 'Extra Cheese', price: 50 },
      { id: '2b', name: 'Extra Gravy', price: 30 },
      { id: '2c', name: 'Raita', price: 40 },
    ],
  },
  {
    id: '3',
    name: 'Portion Size',
    required: true,
    minSelect: 1,
    maxSelect: 1,
    modifiers: [
      { id: '3a', name: 'Half', price: -80 },
      { id: '3b', name: 'Full', price: 0 },
    ],
  },
];

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState<'items' | 'categories' | 'modifiers' | 'recipes'>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState(mockCategories);
  const [showItemModal, setShowItemModal] = useState(false);
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory || item.subCategory === selectedCategory;
    const matchesAvailable = filterAvailable === null || item.isAvailable === filterAvailable;
    return matchesSearch && matchesCategory && matchesAvailable;
  });

  const toggleCategory = (categoryId: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat
    ));
  };

  const totalItems = mockCategories.reduce((sum, cat) => sum + cat.itemCount, 0);
  const availableItems = mockItems.filter(i => i.isAvailable).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600">Manage menu items, categories, and modifiers</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Menu Settings
          </Button>
          <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Items</p>
          <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Available</p>
          <p className="text-2xl font-bold text-green-600">{availableItems}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Unavailable</p>
          <p className="text-2xl font-bold text-red-600">{mockItems.filter(i => !i.isAvailable).length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Categories</p>
          <p className="text-2xl font-bold text-gray-900">{mockCategories.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'items', label: 'Menu Items', icon: UtensilsCrossed },
              { id: 'categories', label: 'Categories', icon: Layers },
              { id: 'modifiers', label: 'Modifiers', icon: Tag },
              { id: 'recipes', label: 'Recipes', icon: Flame },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Menu Items Tab */}
        {activeTab === 'items' && (
          <div className="flex">
            {/* Categories Sidebar */}
            <div className="w-64 border-r border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    !selectedCategory ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  All Items ({totalItems})
                </button>
                {categories.map((category) => (
                  <div key={category.id}>
                    <button
                      onClick={() => {
                        setSelectedCategory(category.name);
                        if (category.subCategories) toggleCategory(category.id);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                        selectedCategory === category.name ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {category.subCategories && (
                          category.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                        )}
                        {category.name}
                      </span>
                      <span className="text-xs text-gray-500">{category.itemCount}</span>
                    </button>
                    {category.isExpanded && category.subCategories && (
                      <div className="ml-6 space-y-1 mt-1">
                        {category.subCategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedCategory(sub.name)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${
                              selectedCategory === sub.name ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            <span className="flex items-center justify-between">
                              {sub.name}
                              <span className="text-xs text-gray-500">{sub.itemCount}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Items Grid */}
            <div className="flex-1 p-4">
              {/* Search and Filters */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <select
                  value={filterAvailable === null ? 'all' : filterAvailable.toString()}
                  onChange={(e) => setFilterAvailable(e.target.value === 'all' ? null : e.target.value === 'true')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-gray-50 rounded-xl p-4 border ${item.isAvailable ? 'border-gray-200' : 'border-red-200 bg-red-50'}`}
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
                              {item.isPopular && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                                  Popular
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
                              {item.allergens.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  {item.allergens.join(', ')}
                                </span>
                              )}
                              {item.modifierGroups.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Tag className="h-3 w-3" />
                                  {item.modifierGroups.length} modifiers
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">₹{item.price}</p>
                            {item.variants && (
                              <p className="text-xs text-gray-500">{item.variants.length} variants</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          className={`p-2 rounded-lg ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                          title={item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                        >
                          {item.isAvailable ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-200 text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-200 text-gray-600">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-100 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Menu Categories</h3>
              <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </div>
            <div className="space-y-2">
              {mockCategories.map((category, idx) => (
                <div key={category.id} className="bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                      <div>
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <p className="text-sm text-gray-500">{category.itemCount} items</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <button className="p-2 hover:bg-gray-200 rounded">
                        <MoreVertical className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  {category.subCategories && (
                    <div className="border-t border-gray-200 px-4 py-2 bg-white">
                      <p className="text-xs text-gray-500 mb-2">Sub-categories:</p>
                      <div className="flex flex-wrap gap-2">
                        {category.subCategories.map((sub) => (
                          <span
                            key={sub.id}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {sub.name} ({sub.itemCount})
                          </span>
                        ))}
                        <button className="px-3 py-1 border border-dashed border-gray-300 text-gray-500 rounded-full text-sm hover:bg-gray-50">
                          + Add Sub-category
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modifiers Tab */}
        {activeTab === 'modifiers' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Modifier Groups</h3>
              <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4" />
                Add Modifier Group
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockModifierGroups.map((group) => (
                <div key={group.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{group.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {group.required && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Required</span>
                        )}
                        <span className="text-xs text-gray-500">
                          Select {group.minSelect}-{group.maxSelect}
                        </span>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Edit className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {group.modifiers.map((mod) => (
                      <div key={mod.id} className="flex items-center justify-between py-1 px-2 bg-white rounded">
                        <span className="text-sm text-gray-700">{mod.name}</span>
                        <span className={`text-sm font-medium ${mod.price > 0 ? 'text-green-600' : mod.price < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                          {mod.price > 0 ? `+₹${mod.price}` : mod.price < 0 ? `-₹${Math.abs(mod.price)}` : 'Free'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-900">Recipe Management</h3>
                <p className="text-sm text-gray-500">Link menu items to inventory for automatic stock deduction</p>
              </div>
              <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4" />
                Add Recipe
              </Button>
            </div>
            <div className="space-y-3">
              {mockItems.slice(0, 3).map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">Recipe cost: ₹85 | Margin: 73%</p>
                    </div>
                    <Button variant="outline" size="sm">Edit Recipe</Button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Paneer 200g', 'Yogurt 50ml', 'Ginger-Garlic 10g', 'Spice Mix 5g'].map((ing, idx) => (
                      <div key={idx} className="px-3 py-2 bg-white rounded border border-gray-200 text-sm">
                        {ing}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

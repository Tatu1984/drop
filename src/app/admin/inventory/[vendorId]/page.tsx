'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Search, Plus, Edit2, Trash2, RefreshCw, Package, DollarSign,
  AlertTriangle, CheckCircle, XCircle, ArrowLeft, Image as ImageIcon,
  Tag, BarChart3, Filter, MoreVertical, Eye, TrendingUp, Boxes
} from 'lucide-react';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  discountPrice: number | null;
  inStock: boolean;
  stockQuantity: number | null;
  category: { id: string; name: string } | null;
  isVeg: boolean;
  isVegan: boolean;
  brand: string | null;
  packSize: string | null;
  rating: number;
  totalRatings: number;
  orderCount: number;
  reviewCount: number;
  abvPercent: number | null;
  countryOfOrigin: string | null;
  year: number | null;
  grapeType: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  name: string;
  type: string;
}

interface InventoryStats {
  total: number;
  inStock: number;
  outOfStock: number;
  lowStock: number;
  avgPrice: number;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  stockQuantity: string;
  categoryId: string;
  isVeg: boolean;
  isVegan: boolean;
  brand: string;
  packSize: string;
  inStock: boolean;
  // Wine specific
  abvPercent: string;
  countryOfOrigin: string;
  year: string;
  grapeType: string;
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  discountPrice: '',
  stockQuantity: '',
  categoryId: '',
  isVeg: true,
  isVegan: false,
  brand: '',
  packSize: '',
  inStock: true,
  abvPercent: '',
  countryOfOrigin: '',
  year: '',
  grapeType: '',
};

export default function InventoryPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      const params = new URLSearchParams({
        vendorId,
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder,
      });
      if (search) params.set('search', search);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (stockFilter !== 'all') params.set('stockStatus', stockFilter);

      const res = await fetch(`/api/admin/inventory?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setProducts(result.data.products || []);
        setCategories(result.data.categories || []);
        setVendor(result.data.vendor || null);
        setStats(result.data.stats || null);
        setTotalPages(result.data.pagination?.totalPages || 1);
      } else {
        toast.error(result.error || 'Failed to load inventory');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [vendorId, currentPage, search, categoryFilter, stockFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, stockFilter]);

  const handleToggleStock = async (product: Product) => {
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          action: 'toggle_stock',
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        fetchInventory();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error('Failed to update stock');
    }
  };

  const handleSubmitProduct = async (isEdit: boolean) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const payload = {
        vendorId,
        productId: isEdit ? selectedProduct?.id : undefined,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : null,
        categoryId: formData.categoryId || null,
        isVeg: formData.isVeg,
        isVegan: formData.isVegan,
        brand: formData.brand || null,
        packSize: formData.packSize || null,
        inStock: formData.inStock,
        abvPercent: formData.abvPercent ? parseFloat(formData.abvPercent) : null,
        countryOfOrigin: formData.countryOfOrigin || null,
        year: formData.year ? parseInt(formData.year) : null,
        grapeType: formData.grapeType || null,
      };

      const res = await fetch('/api/admin/inventory', {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        setShowAddModal(false);
        setShowEditModal(false);
        setFormData(initialFormData);
        setSelectedProduct(null);
        fetchInventory();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error('Failed to save product');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/admin/inventory?productId=${selectedProduct.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        setShowDeleteModal(false);
        setSelectedProduct(null);
        fetchInventory();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error('Failed to delete product');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      discountPrice: product.discountPrice?.toString() || '',
      stockQuantity: product.stockQuantity?.toString() || '',
      categoryId: product.category?.id || '',
      isVeg: product.isVeg,
      isVegan: product.isVegan,
      brand: product.brand || '',
      packSize: product.packSize || '',
      inStock: product.inStock,
      abvPercent: product.abvPercent?.toString() || '',
      countryOfOrigin: product.countryOfOrigin || '',
      year: product.year?.toString() || '',
      grapeType: product.grapeType || '',
    });
    setShowEditModal(true);
  };

  const isWineVendor = vendor?.type === 'WINE_SHOP';

  return (
    <AdminLayout title={vendor ? `${vendor.name} - Inventory` : 'Inventory'}>
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{vendor?.name || 'Loading...'}</h2>
            <p className="text-sm text-gray-500">
              {vendor?.type?.replace('_', ' ')} - Manage products and inventory
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchInventory} loading={loading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => { setFormData(initialFormData); setShowAddModal(true); }}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
              <p className="text-xs text-gray-500">Total Products</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats?.inStock || 0}</p>
              <p className="text-xs text-gray-500">In Stock</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats?.outOfStock || 0}</p>
              <p className="text-xs text-gray-500">Out of Stock</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats?.lowStock || 0}</p>
              <p className="text-xs text-gray-500">Low Stock</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats?.avgPrice || 0)}</p>
              <p className="text-xs text-gray-500">Avg Price</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-5 w-5 text-gray-400" />}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="low_stock">Low Stock (&le;10)</option>
          </select>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              setSortBy(by);
              setSortOrder(order);
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="price-asc">Price Low-High</option>
            <option value="price-desc">Price High-Low</option>
            <option value="stockQuantity-asc">Stock Low-High</option>
            <option value="stockQuantity-desc">Stock High-Low</option>
          </select>
        </div>
      </Card>

      {/* Products Table */}
      {loading && products.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : products.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Boxes className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No products found</p>
            <Button onClick={() => { setFormData(initialFormData); setShowAddModal(true); }}>
              <Plus className="h-4 w-4" />
              Add Your First Product
            </Button>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600">Product</th>
                  <th className="text-left p-4 font-medium text-gray-600">Category</th>
                  <th className="text-left p-4 font-medium text-gray-600">Price</th>
                  <th className="text-left p-4 font-medium text-gray-600">Stock</th>
                  <th className="text-left p-4 font-medium text-gray-600">Orders</th>
                  <th className="text-left p-4 font-medium text-gray-600">Rating</th>
                  <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {product.isVeg && <Badge variant="success" className="text-xs">Veg</Badge>}
                            {product.isVegan && <Badge variant="info" className="text-xs">Vegan</Badge>}
                            {product.brand && <span>{product.brand}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">
                        {product.category?.name || '-'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{formatCurrency(product.price)}</p>
                        {product.discountPrice && (
                          <p className="text-sm text-green-600">
                            Sale: {formatCurrency(product.discountPrice)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            !product.inStock ? 'error' :
                            (product.stockQuantity && product.stockQuantity <= 10) ? 'warning' :
                            'success'
                          }
                        >
                          {!product.inStock ? 'Out' :
                           product.stockQuantity !== null ? product.stockQuantity : 'In Stock'}
                        </Badge>
                        <button
                          onClick={() => handleToggleStock(product)}
                          className={`text-xs underline ${product.inStock ? 'text-red-600' : 'text-green-600'}`}
                        >
                          {product.inStock ? 'Mark Out' : 'Mark In'}
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">{product.orderCount}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{product.rating?.toFixed(1) || '-'}</span>
                        <span className="text-xs text-gray-400">({product.totalRatings})</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowDetailsModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(product)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setFormData(initialFormData);
          setSelectedProduct(null);
        }}
        title={showEditModal ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sale Price
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <Input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <Input
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Brand name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pack Size
              </label>
              <Input
                value={formData.packSize}
                onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                placeholder="e.g., 500g, 1L"
              />
            </div>

            <div className="col-span-2 flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <span className="text-sm">In Stock</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVeg}
                  onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                  className="w-4 h-4 text-green-500 rounded"
                />
                <span className="text-sm">Vegetarian</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVegan}
                  onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                  className="w-4 h-4 text-green-500 rounded"
                />
                <span className="text-sm">Vegan</span>
              </label>
            </div>

            {/* Wine-specific fields */}
            {isWineVendor && (
              <>
                <div className="col-span-2 border-t pt-4 mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-3">Wine Details</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ABV %
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.abvPercent}
                    onChange={(e) => setFormData({ ...formData, abvPercent: e.target.value })}
                    placeholder="e.g., 13.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country of Origin
                  </label>
                  <Input
                    value={formData.countryOfOrigin}
                    onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                    placeholder="e.g., France"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vintage Year
                  </label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="e.g., 2019"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grape Type
                  </label>
                  <Input
                    value={formData.grapeType}
                    onChange={(e) => setFormData({ ...formData, grapeType: e.target.value })}
                    placeholder="e.g., Cabernet Sauvignon"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setFormData(initialFormData);
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={() => handleSubmitProduct(showEditModal)}
              loading={actionLoading}
              disabled={!formData.name || !formData.price}
            >
              {showEditModal ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Product Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedProduct(null);
        }}
        title="Product Details"
        size="lg"
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {selectedProduct.images?.[0] ? (
                  <Image
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{selectedProduct.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{selectedProduct.description || 'No description'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={selectedProduct.inStock ? 'success' : 'error'}>
                    {selectedProduct.inStock ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                  {selectedProduct.isVeg && <Badge variant="success">Veg</Badge>}
                  {selectedProduct.isVegan && <Badge variant="info">Vegan</Badge>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{formatCurrency(selectedProduct.price)}</p>
                <p className="text-xs text-gray-500">Price</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{selectedProduct.stockQuantity ?? '-'}</p>
                <p className="text-xs text-gray-500">Stock</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{selectedProduct.orderCount}</p>
                <p className="text-xs text-gray-500">Orders</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{selectedProduct.rating?.toFixed(1) || '-'}</p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Category</span>
                <span>{selectedProduct.category?.name || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Brand</span>
                <span>{selectedProduct.brand || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Pack Size</span>
                <span>{selectedProduct.packSize || '-'}</span>
              </div>
              {selectedProduct.discountPrice && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Sale Price</span>
                  <span className="text-green-600">{formatCurrency(selectedProduct.discountPrice)}</span>
                </div>
              )}
              {selectedProduct.abvPercent && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">ABV</span>
                  <span>{selectedProduct.abvPercent}%</span>
                </div>
              )}
              {selectedProduct.countryOfOrigin && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Origin</span>
                  <span>{selectedProduct.countryOfOrigin}</span>
                </div>
              )}
              {selectedProduct.year && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Vintage</span>
                  <span>{selectedProduct.year}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Created</span>
                <span>{new Date(selectedProduct.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Last Updated</span>
                <span>{new Date(selectedProduct.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              <Button fullWidth onClick={() => {
                setShowDetailsModal(false);
                openEditModal(selectedProduct);
              }}>
                <Edit2 className="h-4 w-4" />
                Edit Product
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        title="Delete Product"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-red-800">
                Are you sure you want to delete <strong>{selectedProduct.name}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={handleDeleteProduct}
                loading={actionLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete Product
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

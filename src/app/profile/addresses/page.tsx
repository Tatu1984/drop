'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, MapPin, Home, Briefcase, Heart, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  label: string;
  address: string;
  landmark?: string;
  isDefault: boolean;
}

const initialAddresses: Address[] = [
  {
    id: '1',
    type: 'home',
    label: 'Home',
    address: '123 MG Road, Indiranagar, Bangalore 560038',
    landmark: 'Near Metro Station',
    isDefault: true,
  },
  {
    id: '2',
    type: 'work',
    label: 'Office',
    address: '456 Koramangala 4th Block, Bangalore 560034',
    landmark: 'Sony World Junction',
    isDefault: false,
  },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    label: '',
    address: '',
    landmark: '',
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="h-5 w-5" />;
      case 'work':
        return <Briefcase className="h-5 w-5" />;
      default:
        return <Heart className="h-5 w-5" />;
    }
  };

  const handleSave = () => {
    if (!formData.address) {
      toast.error('Please enter an address');
      return;
    }

    if (editingAddress) {
      setAddresses(addresses.map(addr =>
        addr.id === editingAddress.id
          ? { ...addr, ...formData }
          : addr
      ));
      toast.success('Address updated');
    } else {
      const newAddress: Address = {
        id: Date.now().toString(),
        ...formData,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, newAddress]);
      toast.success('Address added');
    }

    setShowAddModal(false);
    setEditingAddress(null);
    setFormData({ type: 'home', label: '', address: '', landmark: '' });
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
    toast.success('Address deleted');
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
    toast.success('Default address updated');
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      label: address.label,
      address: address.address,
      landmark: address.landmark || '',
    });
    setShowAddModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 border-b sticky top-0 z-10">
        <Link href="/profile">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold flex-1">Saved Addresses</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-orange-500 font-medium"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Addresses List */}
      <div className="p-4 space-y-3">
        {addresses.map((address) => (
          <Card key={address.id} padding="none">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                  {getIcon(address.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{address.label}</h3>
                    {address.isDefault && (
                      <Badge variant="success" size="sm">Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{address.address}</p>
                  {address.landmark && (
                    <p className="text-xs text-gray-400 mt-1">
                      Landmark: {address.landmark}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(address)}
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(address.id)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                {!address.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                    className="ml-auto"
                  >
                    Set as Default
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {addresses.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No saved addresses</p>
            <Button className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4" />
              Add Address
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingAddress(null);
          setFormData({ type: 'home', label: '', address: '', landmark: '' });
        }}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <div className="space-y-4">
          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Type
            </label>
            <div className="flex gap-2">
              {(['home', 'work', 'other'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, type, label: type === 'other' ? '' : type.charAt(0).toUpperCase() + type.slice(1) })}
                  className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                    formData.type === type
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  {getIcon(type)}
                  <span className="capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Label"
            placeholder="e.g., Home, Office, Mom's place"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          />

          <Input
            label="Full Address"
            placeholder="Enter complete address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <Input
            label="Landmark (Optional)"
            placeholder="e.g., Near metro station"
            value={formData.landmark}
            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
          />

          <Button fullWidth onClick={handleSave}>
            {editingAddress ? 'Update Address' : 'Save Address'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

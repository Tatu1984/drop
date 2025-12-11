'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Package,
  MapPin,
  Plus,
  Minus,
  Clock,
  Truck,
  FileText,
  Gift,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

const MapComponent = dynamic(() => import('@/components/map/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-48 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <span className="text-gray-500">Loading map...</span>
    </div>
  ),
});

const serviceTypes = [
  {
    id: 'pickup-drop',
    name: 'Pickup & Drop',
    description: 'Send packages, documents',
    icon: Package,
    basePrice: 49,
  },
  {
    id: 'multi-stop',
    name: 'Multi-Stop',
    description: 'Multiple pickup/drop locations',
    icon: MapPin,
    basePrice: 79,
  },
  {
    id: 'return',
    name: 'Return Delivery',
    description: 'Drop, wait & return',
    icon: Truck,
    basePrice: 99,
  },
  {
    id: 'bulk',
    name: 'Bulk Delivery',
    description: 'For business deliveries',
    icon: FileText,
    basePrice: 199,
  },
];

const prohibitedItems = [
  'Illegal substances',
  'Weapons & explosives',
  'Hazardous materials',
  'Cash & valuable jewelry',
  'Perishable items (without proper packaging)',
  'Live animals',
];

interface Stop {
  id: string;
  type: 'pickup' | 'drop';
  address: string;
  contactName: string;
  contactPhone: string;
  instructions: string;
}

export default function GeniePage() {
  const [selectedService, setSelectedService] = useState(serviceTypes[0]);
  const [stops, setStops] = useState<Stop[]>([
    { id: '1', type: 'pickup', address: '', contactName: '', contactPhone: '', instructions: '' },
    { id: '2', type: 'drop', address: '', contactName: '', contactPhone: '', instructions: '' },
  ]);
  const [packageDetails, setPackageDetails] = useState({
    weight: 'light',
    description: '',
  });
  const [showProhibitedModal, setShowProhibitedModal] = useState(false);

  const estimatedPrice = selectedService.basePrice + (stops.length - 2) * 20;
  const estimatedTime = '30-45 min';

  const addStop = () => {
    if (stops.length >= 5) {
      toast.error('Maximum 5 stops allowed');
      return;
    }
    setStops([
      ...stops,
      {
        id: Date.now().toString(),
        type: 'drop',
        address: '',
        contactName: '',
        contactPhone: '',
        instructions: '',
      },
    ]);
  };

  const removeStop = (id: string) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((s) => s.id !== id));
  };

  const updateStop = (id: string, field: keyof Stop, value: string) => {
    setStops(stops.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleBookGenie = () => {
    const hasEmptyAddresses = stops.some((s) => !s.address.trim());
    if (hasEmptyAddresses) {
      toast.error('Please fill all pickup/drop addresses');
      return;
    }
    toast.success('Genie booked! Finding a delivery partner...');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white/80 mb-4">
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-7 w-7" />
          Genie Service
        </h1>
        <p className="text-white/80 mt-2">
          Send anything across the city
        </p>
      </div>

      {/* Service Types */}
      <div className="px-4 -mt-4 relative z-10">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Select Service</h3>
          <div className="grid grid-cols-2 gap-2">
            {serviceTypes.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`p-3 rounded-lg text-left transition-all ${
                  selectedService.id === service.id
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <service.icon
                  className={`h-6 w-6 mb-2 ${
                    selectedService.id === service.id
                      ? 'text-blue-500'
                      : 'text-gray-400'
                  }`}
                />
                <p className="font-medium text-sm text-gray-900">{service.name}</p>
                <p className="text-xs text-gray-500">{service.description}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Map Preview */}
      <div className="px-4 mt-4">
        <Card padding="none" className="overflow-hidden">
          <MapComponent
            center={[12.9716, 77.5946]}
            zoom={12}
            height="180px"
          />
        </Card>
      </div>

      {/* Stops */}
      <div className="px-4 mt-4">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Pickup & Drop Details</h3>
          <div className="space-y-4">
            {stops.map((stop, index) => (
              <div key={stop.id} className="relative">
                {/* Vertical Line */}
                {index < stops.length - 1 && (
                  <div className="absolute left-3 top-10 w-0.5 h-full bg-gray-200 -z-10" />
                )}

                <div className="flex gap-3">
                  {/* Icon */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      stop.type === 'pickup'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    } text-white text-xs font-bold`}
                  >
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={stop.type === 'pickup' ? 'success' : 'info'} size="sm">
                        {stop.type === 'pickup' ? 'Pickup' : 'Drop'}
                      </Badge>
                      {stops.length > 2 && (
                        <button
                          onClick={() => removeStop(stop.id)}
                          className="text-red-500 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <Input
                      placeholder="Enter full address"
                      value={stop.address}
                      onChange={(e) => updateStop(stop.id, 'address', e.target.value)}
                      leftIcon={<MapPin className="h-4 w-4" />}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Contact name"
                        value={stop.contactName}
                        onChange={(e) => updateStop(stop.id, 'contactName', e.target.value)}
                      />
                      <Input
                        placeholder="Phone"
                        type="tel"
                        value={stop.contactPhone}
                        onChange={(e) => updateStop(stop.id, 'contactPhone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedService.id === 'multi-stop' && stops.length < 5 && (
            <Button
              variant="outline"
              fullWidth
              className="mt-4"
              onClick={addStop}
            >
              <Plus className="h-4 w-4" />
              Add Stop
            </Button>
          )}
        </Card>
      </div>

      {/* Package Details */}
      <div className="px-4 mt-4">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Package Details</h3>

          <p className="text-sm text-gray-600 mb-2">Package Weight</p>
          <div className="flex gap-2 mb-4">
            {['light', 'medium', 'heavy'].map((weight) => (
              <button
                key={weight}
                onClick={() => setPackageDetails({ ...packageDetails, weight })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  packageDetails.weight === weight
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {weight === 'light' && '< 5 kg'}
                {weight === 'medium' && '5-15 kg'}
                {weight === 'heavy' && '> 15 kg'}
              </button>
            ))}
          </div>

          <Input
            label="Package Description"
            placeholder="e.g., Documents, Electronics, Gifts"
            value={packageDetails.description}
            onChange={(e) =>
              setPackageDetails({ ...packageDetails, description: e.target.value })
            }
          />
        </Card>
      </div>

      {/* Prohibited Items Warning */}
      <div className="px-4 mt-4">
        <button
          onClick={() => setShowProhibitedModal(true)}
          className="w-full"
        >
          <Card className="bg-yellow-50 border border-yellow-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1 text-left">
                <p className="font-medium text-yellow-800">Prohibited Items</p>
                <p className="text-sm text-yellow-600">Tap to view items we cannot deliver</p>
              </div>
              <ChevronRight className="h-5 w-5 text-yellow-600" />
            </div>
          </Card>
        </button>
      </div>

      {/* Price & Book */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500">Estimated Price</p>
            <p className="text-2xl font-bold text-gray-900">₹{estimatedPrice}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{estimatedTime}</span>
            </div>
          </div>
        </div>
        <Button fullWidth onClick={handleBookGenie}>
          Book Genie
        </Button>
      </div>

      {/* Prohibited Items Modal */}
      <Modal
        isOpen={showProhibitedModal}
        onClose={() => setShowProhibitedModal(false)}
        title="Prohibited Items"
      >
        <div className="space-y-3">
          {prohibitedItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3 py-2 border-b last:border-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-gray-700">{item}</span>
            </div>
          ))}
        </div>
        <Button fullWidth className="mt-4" onClick={() => setShowProhibitedModal(false)}>
          I Understand
        </Button>
      </Modal>
    </div>
  );
}

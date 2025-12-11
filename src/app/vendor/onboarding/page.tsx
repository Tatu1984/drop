'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Upload, Camera, Store, FileText, MapPin, Clock, CheckCircle, User, Building2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, title: 'Business Info', icon: Building2 },
  { id: 2, title: 'Owner Details', icon: User },
  { id: 3, title: 'Documents', icon: FileText },
  { id: 4, title: 'Store Setup', icon: Store },
  { id: 5, title: 'Review', icon: CheckCircle },
];

const businessTypes = [
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'grocery', label: 'Grocery Store', icon: '🛒' },
  { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
  { id: 'bakery', label: 'Bakery & Cafe', icon: '🥐' },
  { id: 'meat', label: 'Meat & Fish', icon: '🥩' },
  { id: 'liquor', label: 'Wine & Spirits', icon: '🍷' },
];

const cuisineTypes = [
  'North Indian', 'South Indian', 'Chinese', 'Italian', 'Mexican',
  'Continental', 'Fast Food', 'Street Food', 'Desserts', 'Healthy', 'Biryani'
];

export default function VendorOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Business Info
    businessName: '',
    businessType: '',
    cuisines: [] as string[],
    description: '',

    // Owner Details
    ownerName: '',
    phone: '',
    email: '',
    alternatePhone: '',

    // Documents
    gstin: '',
    fssaiLicense: '',
    panNumber: '',
    bankAccount: '',
    ifscCode: '',

    // Store Setup
    address: '',
    city: '',
    pincode: '',
    landmark: '',
    openTime: '09:00',
    closeTime: '22:00',
    avgPrepTime: '30',
    minOrderValue: '100',
    deliveryRadius: '5',
  });

  const updateForm = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCuisine = (cuisine: string) => {
    const cuisines = formData.cuisines.includes(cuisine)
      ? formData.cuisines.filter(c => c !== cuisine)
      : [...formData.cuisines, cuisine];
    updateForm('cuisines', cuisines);
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Application submitted! We\'ll review and contact you within 24-48 hours.');
    router.push('/vendor/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/vendor/login">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Partner Registration</h1>
            <p className="text-sm text-gray-500">Join Drop as a vendor partner</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center min-w-fit">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      currentStep >= step.id
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${currentStep >= step.id ? 'text-green-600' : 'text-gray-400'}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 lg:w-20 h-1 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto p-4 pb-24">
        {/* Step 1: Business Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold mb-4">Business Information</h2>
              <div className="space-y-4">
                <Input
                  label="Business Name"
                  placeholder="e.g., Spice Garden Restaurant"
                  value={formData.businessName}
                  onChange={(e) => updateForm('businessName', e.target.value)}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {businessTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => updateForm('businessType', type.id)}
                        className={`p-4 rounded-lg border text-center transition-colors ${
                          formData.businessType === type.id
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl mb-1 block">{type.icon}</span>
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {(formData.businessType === 'restaurant' || formData.businessType === 'bakery') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cuisines (Select all that apply)</label>
                    <div className="flex flex-wrap gap-2">
                      {cuisineTypes.map((cuisine) => (
                        <button
                          key={cuisine}
                          onClick={() => toggleCuisine(cuisine)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            formData.cuisines.includes(cuisine)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {cuisine}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
                  <textarea
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Tell customers about your business..."
                    value={formData.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold mb-4">Store Photos</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors">
                  <Camera className="h-8 w-8 mb-2" />
                  <span className="text-sm">Store Front</span>
                </button>
                <button className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-sm">Menu</span>
                </button>
                <button className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-sm">Kitchen</span>
                </button>
                <button className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-sm">Interior</span>
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Owner Details */}
        {currentStep === 2 && (
          <Card>
            <h2 className="text-lg font-semibold mb-4">Owner / Contact Details</h2>
            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.ownerName}
                onChange={(e) => updateForm('ownerName', e.target.value)}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="Primary contact number"
                  value={formData.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                />
                <Input
                  label="Alternate Phone"
                  type="tel"
                  placeholder="Secondary contact (optional)"
                  value={formData.alternatePhone}
                  onChange={(e) => updateForm('alternatePhone', e.target.value)}
                />
              </div>
              <Input
                label="Email Address"
                type="email"
                placeholder="business@example.com"
                value={formData.email}
                onChange={(e) => updateForm('email', e.target.value)}
              />

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> We&apos;ll send important updates, order notifications, and settlement reports to this email and phone number.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Documents */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold mb-4">Business Documents</h2>
              <div className="space-y-4">
                <Input
                  label="GSTIN (Optional)"
                  placeholder="22AAAAA0000A1Z5"
                  value={formData.gstin}
                  onChange={(e) => updateForm('gstin', e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST Certificate</label>
                  <button className="w-full p-6 border-2 border-dashed rounded-lg flex flex-col items-center gap-2 text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors">
                    <Upload className="h-6 w-6" />
                    <span>Upload GST Certificate</span>
                  </button>
                </div>
                <Input
                  label="FSSAI License Number"
                  placeholder="Enter 14-digit FSSAI number"
                  value={formData.fssaiLicense}
                  onChange={(e) => updateForm('fssaiLicense', e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">FSSAI License</label>
                  <button className="w-full p-6 border-2 border-dashed rounded-lg flex flex-col items-center gap-2 text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors">
                    <Upload className="h-6 w-6" />
                    <span>Upload FSSAI License</span>
                  </button>
                </div>
                <Input
                  label="PAN Number"
                  placeholder="ABCDE1234F"
                  value={formData.panNumber}
                  onChange={(e) => updateForm('panNumber', e.target.value.toUpperCase())}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card</label>
                  <button className="w-full p-6 border-2 border-dashed rounded-lg flex flex-col items-center gap-2 text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors">
                    <Upload className="h-6 w-6" />
                    <span>Upload PAN Card</span>
                  </button>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold mb-4">Bank Details</h2>
              <p className="text-sm text-gray-500 mb-4">For receiving payments from orders</p>
              <div className="space-y-4">
                <Input
                  label="Bank Account Number"
                  placeholder="Enter account number"
                  value={formData.bankAccount}
                  onChange={(e) => updateForm('bankAccount', e.target.value)}
                />
                <Input
                  label="IFSC Code"
                  placeholder="e.g., SBIN0001234"
                  value={formData.ifscCode}
                  onChange={(e) => updateForm('ifscCode', e.target.value.toUpperCase())}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cancelled Cheque / Passbook</label>
                  <button className="w-full p-6 border-2 border-dashed rounded-lg flex flex-col items-center gap-2 text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors">
                    <Upload className="h-6 w-6" />
                    <span>Upload Document</span>
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 4: Store Setup */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold mb-4">Store Location</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pick Location on Map</label>
                  <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="h-10 w-10 mx-auto mb-2" />
                      <p>Click to select location</p>
                    </div>
                  </div>
                </div>
                <Input
                  label="Full Address"
                  placeholder="Shop number, building, street"
                  value={formData.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => updateForm('city', e.target.value)}
                  />
                  <Input
                    label="Pincode"
                    placeholder="560001"
                    value={formData.pincode}
                    onChange={(e) => updateForm('pincode', e.target.value)}
                  />
                </div>
                <Input
                  label="Landmark"
                  placeholder="Near any famous place"
                  value={formData.landmark}
                  onChange={(e) => updateForm('landmark', e.target.value)}
                />
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold mb-4">Operating Hours & Settings</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time</label>
                    <input
                      type="time"
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.openTime}
                      onChange={(e) => updateForm('openTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Closing Time</label>
                    <input
                      type="time"
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.closeTime}
                      onChange={(e) => updateForm('closeTime', e.target.value)}
                    />
                  </div>
                </div>
                <Input
                  label="Average Preparation Time (minutes)"
                  type="number"
                  placeholder="30"
                  value={formData.avgPrepTime}
                  onChange={(e) => updateForm('avgPrepTime', e.target.value)}
                />
                <Input
                  label="Minimum Order Value (₹)"
                  type="number"
                  placeholder="100"
                  value={formData.minOrderValue}
                  onChange={(e) => updateForm('minOrderValue', e.target.value)}
                />
                <Input
                  label="Delivery Radius (km)"
                  type="number"
                  placeholder="5"
                  value={formData.deliveryRadius}
                  onChange={(e) => updateForm('deliveryRadius', e.target.value)}
                />
              </div>
            </Card>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold mb-4">Review Your Application</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Business Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Business Name</span>
                      <span className="font-medium">{formData.businessName || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Business Type</span>
                      <span className="font-medium capitalize">{formData.businessType || '-'}</span>
                    </div>
                    {formData.cuisines.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cuisines</span>
                        <span className="font-medium">{formData.cuisines.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Contact Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Owner Name</span>
                      <span className="font-medium">{formData.ownerName || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-medium">{formData.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium">{formData.email || '-'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Store Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Address</span>
                      <span className="font-medium text-right">{formData.address}, {formData.city} - {formData.pincode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Operating Hours</span>
                      <span className="font-medium">{formData.openTime} - {formData.closeTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Prep Time</span>
                      <span className="font-medium">{formData.avgPrepTime} mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Min Order</span>
                      <span className="font-medium">₹{formData.minOrderValue}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-800">Ready to Submit</h3>
                  <p className="text-sm text-green-700 mt-1">
                    By submitting, you agree to our Partner Terms of Service and Commission Structure.
                    Our team will verify your documents and contact you within 24-48 hours.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <Button fullWidth onClick={handleNext} loading={loading}>
            {currentStep === 5 ? 'Submit Application' : 'Continue'}
            {currentStep < 5 && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

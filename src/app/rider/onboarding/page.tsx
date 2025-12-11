'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Upload, Camera, FileText, Car, User, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Documents', icon: FileText },
  { id: 3, title: 'Vehicle', icon: Car },
  { id: 4, title: 'Verification', icon: CheckCircle },
];

export default function RiderOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    aadhaar: '',
    pan: '',
    drivingLicense: '',
    vehicleType: 'BIKE',
    vehicleNumber: '',
    vehicleModel: '',
  });
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Application submitted! We\'ll review and get back to you.');
    router.push('/rider');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 border-b sticky top-0 z-10">
        <Link href="/rider">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold">Become a Drop Rider</h1>
      </div>

      {/* Progress */}
      <div className="bg-white px-4 py-4 border-b">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <step.icon className="h-4 w-4" />
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-1 mx-1 ${
                    currentStep > step.id ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-sm font-medium text-gray-600">
          Step {currentStep}: {steps[currentStep - 1].title}
        </p>
      </div>

      <div className="p-4">
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <Card>
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                leftIcon={<span className="text-gray-500">+91</span>}
              />
              <Input
                label="Email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </Card>
        )}

        {/* Step 2: Documents */}
        {currentStep === 2 && (
          <Card>
            <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
            <div className="space-y-4">
              <Input
                label="Aadhaar Number"
                placeholder="Enter 12-digit Aadhaar"
                value={formData.aadhaar}
                onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhaar Card (Front & Back)
                </label>
                <button className="w-full p-8 border-2 border-dashed rounded-lg flex flex-col items-center gap-2 text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors">
                  <Upload className="h-8 w-8" />
                  <span>Upload Aadhaar</span>
                </button>
              </div>
              <Input
                label="PAN Number"
                placeholder="Enter PAN number"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Card
                </label>
                <button className="w-full p-8 border-2 border-dashed rounded-lg flex flex-col items-center gap-2 text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors">
                  <Upload className="h-8 w-8" />
                  <span>Upload PAN</span>
                </button>
              </div>
              <Input
                label="Driving License Number"
                placeholder="Enter license number"
                value={formData.drivingLicense}
                onChange={(e) => setFormData({ ...formData, drivingLicense: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driving License
                </label>
                <button className="w-full p-8 border-2 border-dashed rounded-lg flex flex-col items-center gap-2 text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors">
                  <Upload className="h-8 w-8" />
                  <span>Upload License</span>
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Vehicle */}
        {currentStep === 3 && (
          <Card>
            <h2 className="text-lg font-semibold mb-4">Vehicle Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['BIKE', 'SCOOTER', 'BICYCLE'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFormData({ ...formData, vehicleType: type })}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        formData.vehicleType === type
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-200'
                      }`}
                    >
                      <Car className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm">{type}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Input
                label="Vehicle Number"
                placeholder="e.g., KA 01 AB 1234"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
              />
              <Input
                label="Vehicle Model"
                placeholder="e.g., Honda Activa 6G"
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Photo
                </label>
                <button className="w-full p-8 border-2 border-dashed rounded-lg flex flex-col items-center gap-2 text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors">
                  <Camera className="h-8 w-8" />
                  <span>Take Photo</span>
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Certificate (RC)
                </label>
                <button className="w-full p-8 border-2 border-dashed rounded-lg flex flex-col items-center gap-2 text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors">
                  <Upload className="h-8 w-8" />
                  <span>Upload RC</span>
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 4: Verification */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <Card>
              <h2 className="text-lg font-semibold mb-4">Profile Photo</h2>
              <div className="flex flex-col items-center">
                <button className="w-32 h-32 rounded-full border-2 border-dashed flex flex-col items-center justify-center text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors">
                  <Camera className="h-8 w-8 mb-2" />
                  <span className="text-sm">Take Selfie</span>
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Please take a clear photo of your face
                </p>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold mb-4">Review & Submit</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium">{formData.name || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium">{formData.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Vehicle</span>
                  <span className="font-medium">{formData.vehicleType} - {formData.vehicleNumber || 'Not provided'}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                By submitting, you agree to our Terms of Service and Partner Agreement.
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <Button
          fullWidth
          onClick={handleNext}
          loading={loading}
        >
          {currentStep === 4 ? 'Submit Application' : 'Continue'}
          {currentStep < 4 && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Camera, CheckCircle, AlertTriangle, Shield, User, X, Scan } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface RiderAgeVerificationProps {
  orderId: string;
  customerName: string;
  onVerified: () => void;
  onFailed: () => void;
}

export default function RiderAgeVerification({
  orderId,
  customerName,
  onVerified,
  onFailed,
}: RiderAgeVerificationProps) {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'intro' | 'scan' | 'manual' | 'result'>('intro');
  const [isScanning, setIsScanning] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'success' | 'failed' | null>(null);
  const [manualDob, setManualDob] = useState('');

  const startScan = () => {
    setStep('scan');
    setIsScanning(true);
    // Simulate ID scanning
    setTimeout(() => {
      setIsScanning(false);
      // Randomly succeed or fail for demo
      const success = Math.random() > 0.2;
      setVerificationResult(success ? 'success' : 'failed');
      setStep('result');
    }, 3000);
  };

  const handleManualVerification = () => {
    if (!manualDob) {
      toast.error('Please enter date of birth');
      return;
    }

    const birthDate = new Date(manualDob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    setVerificationResult(age >= 21 ? 'success' : 'failed');
    setStep('result');
  };

  const handleComplete = () => {
    if (verificationResult === 'success') {
      onVerified();
      toast.success('Age verified! Proceeding with delivery.');
    } else {
      onFailed();
      toast.error('Age verification failed. Cannot deliver alcohol to this customer.');
    }
    setShowModal(false);
    setStep('intro');
    setVerificationResult(null);
    setManualDob('');
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
      >
        <Shield className="h-5 w-5" />
        Verify Customer Age (21+)
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Age Verification Required"
        size="md"
      >
        <div className="space-y-4">
          {step === 'intro' && (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Alcohol Delivery</p>
                    <p className="text-sm text-amber-700">
                      This order contains alcohol products. You must verify that the customer
                      is 21 years or older before handing over the delivery.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center py-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-8 w-8 text-purple-600" />
                </div>
                <p className="font-medium text-gray-900">{customerName}</p>
                <p className="text-sm text-gray-500">Order #{orderId}</p>
              </div>

              <div className="space-y-3">
                <Button fullWidth onClick={startScan} className="flex items-center justify-center gap-2">
                  <Scan className="h-5 w-5" />
                  Scan ID Card
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setStep('manual')}
                  className="flex items-center justify-center gap-2"
                >
                  <Camera className="h-5 w-5" />
                  Manual Verification
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Ask the customer to show a valid government-issued photo ID
              </p>
            </>
          )}

          {step === 'scan' && (
            <div className="text-center py-8">
              <div className="relative w-48 h-32 mx-auto mb-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                {isScanning ? (
                  <div className="space-y-2">
                    <div className="animate-pulse">
                      <Scan className="h-12 w-12 text-purple-500 mx-auto" />
                    </div>
                    <p className="text-sm text-gray-500">Scanning ID...</p>
                    <div className="h-1 w-32 bg-gray-200 rounded-full overflow-hidden mx-auto">
                      <div className="h-full bg-purple-500 animate-[scan_2s_ease-in-out_infinite]" />
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <Camera className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Position ID card here</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Hold the customer&apos;s ID card steady in front of the camera
              </p>
              <Button
                variant="outline"
                onClick={() => setStep('intro')}
                className="mt-4"
              >
                Cancel
              </Button>
            </div>
          )}

          {step === 'manual' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter the customer&apos;s date of birth from their ID card:
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={manualDob}
                  onChange={(e) => setManualDob(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('intro')}>
                  Back
                </Button>
                <Button fullWidth onClick={handleManualVerification}>
                  Verify Age
                </Button>
              </div>
            </div>
          )}

          {step === 'result' && (
            <div className="text-center py-4">
              {verificationResult === 'success' ? (
                <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-600 mb-2">Age Verified!</h3>
                  <p className="text-gray-600 mb-6">
                    Customer is 21+ years old. You can proceed with the delivery.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="h-10 w-10 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-red-600 mb-2">Verification Failed</h3>
                  <p className="text-gray-600 mb-6">
                    Customer is under 21 or verification could not be completed.
                    Do NOT hand over the alcohol products.
                  </p>
                </>
              )}
              <Button fullWidth onClick={handleComplete}>
                {verificationResult === 'success' ? 'Proceed with Delivery' : 'Report & Return Order'}
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

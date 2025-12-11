import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 border-b sticky top-0 z-10">
        <Link href="/profile">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold">Terms of Service</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using the Drop application, you accept and agree to be bound by the terms
              and provision of this agreement. If you do not agree to abide by these terms, please do not
              use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Use of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              Drop provides a platform for ordering food, groceries, and other products from local vendors.
              You agree to use the service only for lawful purposes and in accordance with these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. User Accounts</h2>
            <p className="text-gray-600 leading-relaxed">
              To use certain features of the Service, you must register for an account. You agree to
              provide accurate, current, and complete information during registration and to update such
              information to keep it accurate, current, and complete.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Orders and Payment</h2>
            <p className="text-gray-600 leading-relaxed">
              When you place an order, you agree to pay all charges associated with your order, including
              product prices, delivery fees, taxes, and any applicable tips. Prices are subject to change
              without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Delivery</h2>
            <p className="text-gray-600 leading-relaxed">
              Drop partners with delivery personnel to fulfill orders. Estimated delivery times are
              approximate and may vary based on factors including weather, traffic, and vendor preparation
              time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cancellation and Refunds</h2>
            <p className="text-gray-600 leading-relaxed">
              Orders may be cancelled within a limited time after placement. Refund policies vary by vendor
              and order status. Please contact customer support for assistance with cancellations and
              refunds.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              Drop shall not be liable for any indirect, incidental, special, consequential, or punitive
              damages resulting from your use or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of significant
              changes through the app or via email.
            </p>
          </section>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500">
              Last updated: December 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

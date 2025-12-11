import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 border-b sticky top-0 z-10">
        <Link href="/profile">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold">Privacy Policy</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We collect information you provide directly, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Name and contact information (phone number, email)</li>
              <li>Delivery addresses</li>
              <li>Payment information</li>
              <li>Order history and preferences</li>
              <li>Location data when using the app</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We use the collected information to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Process and deliver your orders</li>
              <li>Communicate with you about orders and promotions</li>
              <li>Improve our services and user experience</li>
              <li>Ensure security and prevent fraud</li>
              <li>Personalize recommendations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Information Sharing</h2>
            <p className="text-gray-600 leading-relaxed">
              We share your information with vendors to fulfill orders and with delivery partners to
              complete deliveries. We do not sell your personal information to third parties. We may
              share anonymized data for analytics purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement industry-standard security measures to protect your data. This includes
              encryption, secure servers, and regular security audits. However, no method of
              transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Location Data</h2>
            <p className="text-gray-600 leading-relaxed">
              We collect location data to provide accurate delivery services and show nearby vendors.
              You can control location permissions through your device settings. Note that some
              features may not work without location access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cookies and Tracking</h2>
            <p className="text-gray-600 leading-relaxed">
              We use cookies and similar technologies to remember your preferences, understand app
              usage, and improve our services. You can manage cookie preferences in your browser
              settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing communications</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at
              privacy@dropapp.com or through the Help section in the app.
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

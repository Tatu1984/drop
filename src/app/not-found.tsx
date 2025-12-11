import { Search, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button>
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

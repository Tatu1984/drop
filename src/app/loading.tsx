import Skeleton from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white px-4 py-4 border-b">
        <div className="flex items-center gap-3">
          <Skeleton width={40} height={40} variant="circular" />
          <div className="flex-1">
            <Skeleton width={150} height={16} className="mb-2" />
            <Skeleton width={100} height={12} />
          </div>
        </div>
      </div>

      {/* Banner Skeleton */}
      <div className="p-4">
        <Skeleton height={150} className="rounded-xl" />
      </div>

      {/* Categories Skeleton */}
      <div className="px-4 mb-4">
        <Skeleton width={120} height={20} className="mb-3" />
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton width={56} height={56} variant="circular" />
              <Skeleton width={50} height={12} />
            </div>
          ))}
        </div>
      </div>

      {/* Vendor Cards Skeleton */}
      <div className="px-4">
        <Skeleton width={150} height={20} className="mb-3" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <Skeleton height={150} />
              <div className="p-4">
                <Skeleton width="60%" height={18} className="mb-2" />
                <Skeleton width="80%" height={14} className="mb-3" />
                <div className="flex gap-4">
                  <Skeleton width={60} height={14} />
                  <Skeleton width={60} height={14} />
                  <Skeleton width={60} height={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

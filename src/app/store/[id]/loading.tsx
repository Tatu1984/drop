import Skeleton from '@/components/ui/Skeleton';

export default function StoreLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image Skeleton */}
      <Skeleton height={200} />

      {/* Store Info Skeleton */}
      <div className="bg-white px-4 py-4 border-b">
        <div className="flex items-start gap-4">
          <Skeleton width={80} height={80} className="rounded-xl" />
          <div className="flex-1">
            <Skeleton width="70%" height={24} className="mb-2" />
            <Skeleton width="50%" height={16} className="mb-2" />
            <div className="flex gap-3 mt-2">
              <Skeleton width={60} height={20} />
              <Skeleton width={60} height={20} />
              <Skeleton width={60} height={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Skeleton */}
      <div className="bg-white px-4 py-3 border-b flex gap-3 overflow-x-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} width={80} height={32} className="rounded-full flex-shrink-0" />
        ))}
      </div>

      {/* Products Skeleton */}
      <div className="p-4">
        <Skeleton width={120} height={20} className="mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 flex gap-4">
              <div className="flex-1">
                <Skeleton width="80%" height={18} className="mb-2" />
                <Skeleton width="100%" height={14} className="mb-2" />
                <Skeleton width={60} height={16} />
              </div>
              <Skeleton width={100} height={100} className="rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import Skeleton from '@/components/ui/Skeleton';

export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b">
        <Skeleton width={120} height={24} />
      </div>

      {/* Tabs */}
      <div className="bg-white px-4 py-2 border-b flex gap-4">
        <Skeleton width={80} height={32} />
        <Skeleton width={80} height={32} />
      </div>

      {/* Orders */}
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <Skeleton width={120} height={18} className="mb-2" />
                <Skeleton width={100} height={14} />
              </div>
              <Skeleton width={80} height={24} className="rounded-full" />
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center gap-3">
                <Skeleton width={60} height={60} className="rounded-lg" />
                <div className="flex-1">
                  <Skeleton width="60%" height={16} className="mb-2" />
                  <Skeleton width="40%" height={14} />
                </div>
                <Skeleton width={80} height={32} className="rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

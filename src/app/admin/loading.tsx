import Skeleton from '@/components/ui/Skeleton';

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r p-4 hidden lg:block">
        <Skeleton width={120} height={32} className="mb-6" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} height={40} className="rounded-lg" />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton width={200} height={32} />
          <div className="flex gap-3">
            <Skeleton width={150} height={40} className="rounded-lg" />
            <Skeleton width={100} height={40} className="rounded-lg" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4">
              <Skeleton width="60%" height={16} className="mb-2" />
              <Skeleton width="40%" height={28} />
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl">
          <div className="p-4 border-b">
            <Skeleton width={150} height={24} />
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton width={40} height={40} variant="circular" />
                  <div className="flex-1">
                    <Skeleton width="30%" height={16} className="mb-2" />
                    <Skeleton width="50%" height={14} />
                  </div>
                  <Skeleton width={80} height={24} className="rounded-full" />
                  <Skeleton width={60} height={32} className="rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

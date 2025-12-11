'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export default function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
    none: '',
  };

  return (
    <div
      className={cn(
        'bg-gray-200',
        variants[variant],
        animations[animation],
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm">
      <Skeleton className="w-full h-32 mb-3" />
      <Skeleton className="w-3/4 h-4 mb-2" />
      <Skeleton className="w-1/2 h-3 mb-2" />
      <div className="flex justify-between items-center">
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-8 h-8" variant="circular" />
      </div>
    </div>
  );
}

export function VendorCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      <Skeleton className="w-full h-40" />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-12 h-12" variant="circular" />
          <div className="flex-1">
            <Skeleton className="w-3/4 h-5 mb-2" />
            <Skeleton className="w-1/2 h-3" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-16 h-6" />
          <Skeleton className="w-20 h-6" />
          <Skeleton className="w-16 h-6" />
        </div>
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between mb-3">
        <Skeleton className="w-24 h-5" />
        <Skeleton className="w-16 h-5" />
      </div>
      <div className="flex gap-3 mb-3">
        <Skeleton className="w-16 h-16" />
        <div className="flex-1">
          <Skeleton className="w-3/4 h-4 mb-2" />
          <Skeleton className="w-1/2 h-3" />
        </div>
      </div>
      <div className="flex justify-between">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-24 h-8" />
      </div>
    </div>
  );
}

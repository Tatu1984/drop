'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Category } from '@/types';
import Card from '@/components/ui/Card';

interface CategoryCardProps {
  category: Category;
  variant?: 'default' | 'compact' | 'icon';
  href?: string;
}

export default function CategoryCard({
  category,
  variant = 'default',
  href,
}: CategoryCardProps) {
  const content = (
    <>
      {variant === 'icon' && (
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-2xl">
            {category.icon}
          </div>
          <span className="text-xs text-gray-700 text-center line-clamp-1">
            {category.name}
          </span>
        </div>
      )}

      {variant === 'compact' && (
        <Card hoverable padding="sm" className="text-center">
          {category.image ? (
            <div className="relative w-12 h-12 mx-auto mb-2 rounded-lg overflow-hidden">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 mx-auto mb-2 bg-orange-50 rounded-lg flex items-center justify-center text-xl">
              {category.icon}
            </div>
          )}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
            {category.name}
          </h3>
        </Card>
      )}

      {variant === 'default' && (
        <Card hoverable padding="none" className="overflow-hidden">
          <div className="relative aspect-[4/3]">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-4xl">
                {category.icon}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="font-semibold text-white text-lg">
                {category.name}
              </h3>
            </div>
          </div>
        </Card>
      )}
    </>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <div>{content}</div>;
}

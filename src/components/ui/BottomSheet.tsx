'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useEffect, useCallback, useRef } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: 'auto' | 'half' | 'full';
  showHandle?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  height = 'auto',
  showHandle = true,
  showCloseButton = true,
  className,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const heights = {
    auto: 'max-h-[90vh]',
    half: 'h-[50vh]',
    full: 'h-[90vh]',
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl animate-slide-up',
          heights[height],
          className
        )}
      >
        {/* Handle */}
        {showHandle && (
          <div className="flex justify-center py-3">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 pb-3 border-b">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

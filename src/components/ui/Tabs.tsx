'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
  className?: string;
}

export default function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  variant = 'default',
  fullWidth = false,
  className,
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id);

  // Support both controlled and uncontrolled modes
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabClick = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onChange?.(tabId);
  };

  const baseStyles = 'relative flex items-center justify-center gap-2 font-medium transition-all duration-200';

  const variants = {
    default: {
      container: 'bg-gray-100 p-1 rounded-lg',
      tab: 'px-4 py-2 rounded-md',
      active: 'bg-white shadow-sm text-gray-900',
      inactive: 'text-gray-600 hover:text-gray-900',
    },
    pills: {
      container: 'gap-2',
      tab: 'px-4 py-2 rounded-full',
      active: 'bg-orange-500 text-white',
      inactive: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    },
    underline: {
      container: 'border-b',
      tab: 'px-4 py-3 border-b-2 -mb-px',
      active: 'border-orange-500 text-orange-500',
      inactive: 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300',
    },
  };

  const style = variants[variant];

  return (
    <div
      className={cn(
        'flex',
        style.container,
        fullWidth && 'w-full',
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={cn(
            baseStyles,
            style.tab,
            fullWidth && 'flex-1',
            activeTab === tab.id ? style.active : style.inactive
          )}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { PORTAL_THEMES, PortalType } from '@/lib/design-system';

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface PortalTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  portalType: PortalType;
}

export const PortalTabs: React.FC<PortalTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  portalType,
}) => {
  const theme = PORTAL_THEMES[portalType];

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all font-medium ${
            activeTab === tab.id ? theme.tabActive : theme.tabInactive
          }`}
        >
          <tab.icon className="w-4 h-4" />
          <span>{tab.label}</span>
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className="bg-white/30 text-white text-xs px-2 py-0.5 rounded-full">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

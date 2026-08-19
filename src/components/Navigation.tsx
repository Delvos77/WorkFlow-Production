import React from 'react';
import { Briefcase, FileText, Settings, Shield, Eye } from 'lucide-react';
import { ActiveTab, UserRole } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  badgeCount?: number;
  userRole?: UserRole;
  onOpenRoleSwitch?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  badgeCount = 0,
  userRole = 'moderator',
  onOpenRoleSwitch,
}) => {
  const isSpectator = userRole === 'spectator';

  // For Spectator: only show monitoring tabs (Status SPK & Laporan). Hide Pengaturan completely!
  const allTabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number; moderatorOnly?: boolean }[] = [
    {
      id: 'jobs',
      label: isSpectator ? 'Status & Rute' : 'Jobs & Rute',
      icon: <Briefcase className="w-5 h-5" />,
      badge: badgeCount,
    },
    {
      id: 'laporan',
      label: 'Laporan Status',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan',
      icon: <Settings className="w-5 h-5" />,
      moderatorOnly: true,
    },
  ];

  const visibleTabs = allTabs.filter((tab) => !tab.moderatorOnly || !isSpectator);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 sm:px-6 py-2 flex justify-around items-center z-40 max-w-7xl mx-auto rounded-t-2xl shadow-2xl safe-area-pb">
      {visibleTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-4 sm:px-6 rounded-2xl transition font-semibold text-xs min-w-[80px] min-h-[48px] cursor-pointer relative touch-manipulation active:scale-95 ${
              isActive
                ? 'text-[#2CA58D] font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-[#2CA58D] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-2xs">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] sm:text-xs leading-none">{tab.label}</span>
            {isActive && (
              <span className="w-7 h-1 bg-[#2CA58D] rounded-full mt-0.5 animate-fadeIn"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

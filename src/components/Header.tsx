import React from 'react';
import {
  Layers,
  Printer,
  Plus,
  Shield,
  Eye,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { UserRole, SyncDetails } from '../types';
import { SyncStatusBadge } from './SyncStatusBadge';

interface HeaderProps {
  activeCount: number;
  totalCount: number;
  isOnline: boolean;
  syncDetails: SyncDetails;
  userRole: UserRole;
  onOpenAddSpk: () => void;
  onOpenRoleSwitch: () => void;
  onOpenSyncDetails: () => void;
  onPrintSpk?: () => void;
  onLockApp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCount,
  totalCount,
  isOnline,
  syncDetails,
  userRole,
  onOpenAddSpk,
  onOpenRoleSwitch,
  onOpenSyncDetails,
  onPrintSpk,
  onLockApp,
}) => {
  const isModerator = userRole === 'moderator';

  return (
    <header className="p-2.5 sm:p-4 pb-1 sm:pb-2">
      <div className="bg-gradient-to-r from-[#207a68] via-[#2CA58D] to-[#34b69d] text-white py-3 px-3.5 sm:px-5 md:px-6 rounded-2xl sm:rounded-3xl shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center justify-between md:justify-start gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20 shrink-0 shadow-xs">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight flex items-center gap-1.5 leading-tight">
                <span>Workflow Produksi</span>
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/30 hidden sm:inline-block">
                  Firebase Sync
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-white/85 font-normal line-clamp-1">
                Sistem Alur Rute, Multi-Batch &amp; Laporan Produksi
              </p>
            </div>
          </div>

          {/* Mobile Right Badges */}
          <div className="flex items-center gap-1.5 md:hidden">
            {/* Quick Sync status pill on Mobile */}
            <SyncStatusBadge
              syncDetails={syncDetails}
              onOpenDetails={onOpenSyncDetails}
              compact
            />

            {/* Quick Role Pill on Mobile */}
            <button
              onClick={onOpenRoleSwitch}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border backdrop-blur-sm transition cursor-pointer shadow-xs ${
                isModerator
                  ? 'bg-emerald-950/40 text-emerald-100 border-emerald-300/40 hover:bg-emerald-950/60'
                  : 'bg-amber-950/40 text-amber-100 border-amber-300/40 hover:bg-amber-950/60'
              }`}
            >
              {isModerator ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="hidden xs:inline">Moderator</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden xs:inline">Spectator</span>
                </>
              )}
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-between md:justify-end pt-1 md:pt-0 border-t md:border-t-0 border-white/15">
          {/* Desktop Realtime Firebase Sync Badge */}
          <div className="hidden md:block">
            <SyncStatusBadge
              syncDetails={syncDetails}
              onOpenDetails={onOpenSyncDetails}
            />
          </div>

          {/* Desktop Role Switcher Button */}
          <button
            onClick={onOpenRoleSwitch}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shadow-xs ${
              isModerator
                ? 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                : 'bg-amber-400 text-slate-900 border-amber-500 hover:bg-amber-300'
            }`}
            title="Klik untuk ubah mode akses (Moderator vs Spectator)"
          >
            {isModerator ? (
              <>
                <Shield className="w-3.5 h-3.5 text-emerald-200" />
                <span>Mode: Moderator</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-900" />
                <span>Mode: Spectator (Read-Only)</span>
              </>
            )}
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {/* Print SPK button */}
          {onPrintSpk && (
            <button
              onClick={onPrintSpk}
              title="Cetak Lembar SPK"
              className="px-2.5 sm:px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl transition border border-white/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          )}

          {/* Lock App / Log Out button */}
          {onLockApp && (
            <button
              onClick={onLockApp}
              title="Kunci Akses Aplikasi"
              className="px-2.5 sm:px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl transition border border-white/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">Kunci</span>
            </button>
          )}

          {/* Add SPK button (Visible ONLY for Moderator) */}
          {isModerator ? (
            <button
              onClick={onOpenAddSpk}
              className="px-3 py-1.5 bg-white text-[#207a68] hover:bg-slate-100 text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer active:scale-95 ml-auto md:ml-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ SPK Baru</span>
            </button>
          ) : (
            <div className="bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/20 text-[11px] font-semibold text-white/90 flex items-center gap-1">
              <Eye className="w-3 h-3 text-amber-200" />
              <span>Hanya Lihat</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

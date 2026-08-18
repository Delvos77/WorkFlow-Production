import React, { useState } from 'react';
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  Database,
  WifiOff,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { SyncDetails } from '../types';

interface SyncStatusBadgeProps {
  syncDetails: SyncDetails;
  onOpenDetails: () => void;
  compact?: boolean;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  syncDetails,
  onOpenDetails,
  compact = false,
}) => {
  const { state, isOnline, hasPendingWrites, lastSyncedAt } = syncDetails;

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Baru saja';
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 10) return 'Baru saja';
    if (diffSec < 60) return `${diffSec} dtk lalu`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Determine active visual state
  if (state === 'syncing') {
    return (
      <button
        id="sync-status-badge-syncing"
        onClick={onOpenDetails}
        className="group relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-500/25 border border-blue-300/40 text-white hover:bg-blue-500/35 transition cursor-pointer backdrop-blur-sm shadow-xs text-xs font-semibold"
        title="Sedang menyinkronkan data dengan Firebase Firestore"
      >
        <RefreshCw className="w-3.5 h-3.5 text-blue-200 animate-spin" />
        <span className="text-[11px] sm:text-xs text-blue-100 font-bold">
          {compact ? 'Sinkron...' : 'Menyinkronkan...'}
        </span>
        <ChevronDown className="w-3 h-3 text-blue-200/70 group-hover:translate-y-0.5 transition-transform" />
      </button>
    );
  }

  if (!isOnline || state === 'offline_saved' || hasPendingWrites) {
    return (
      <button
        id="sync-status-badge-offline"
        onClick={onOpenDetails}
        className="group relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/25 border border-amber-300/50 text-white hover:bg-amber-500/35 transition cursor-pointer backdrop-blur-sm shadow-xs text-xs font-semibold"
        title="Mode Offline: Data tersimpan aman di penyimpanan lokal perangkat dan akan otomatis disinkronkan saat terhubung kembali"
      >
        <Database className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span className="text-[11px] sm:text-xs text-amber-100 font-bold">
            {compact ? 'Offline (Aman)' : 'Tersimpan Offline (Lokal)'}
          </span>
        </span>
        <ChevronDown className="w-3 h-3 text-amber-200/70 group-hover:translate-y-0.5 transition-transform" />
      </button>
    );
  }

  // Synced online state
  return (
    <button
      id="sync-status-badge-synced"
      onClick={onOpenDetails}
      className="group relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-950/30 border border-emerald-300/40 text-white hover:bg-emerald-950/45 transition cursor-pointer backdrop-blur-sm shadow-xs text-xs font-semibold"
      title={`Semua data tersinkronisasi di Firebase Cloud Firestore (${formatLastSync(lastSyncedAt)}). Klik untuk melihat detail keamanan.`}
    >
      <div className="relative flex items-center justify-center">
        <Cloud className="w-3.5 h-3.5 text-emerald-300" />
        <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
      </div>
      <span className="text-[11px] sm:text-xs text-emerald-100 font-bold flex items-center gap-1">
        <span>{compact ? 'Tersinkron' : 'Tersinkron ke Cloud'}</span>
        <span className="text-[10px] text-emerald-200/80 font-normal hidden lg:inline">
          • {formatLastSync(lastSyncedAt)}
        </span>
      </span>
      <ChevronDown className="w-3 h-3 text-emerald-200/70 group-hover:translate-y-0.5 transition-transform" />
    </button>
  );
};

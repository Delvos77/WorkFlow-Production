import React from 'react';
import { Database, WifiOff, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SyncDetails } from '../types';

interface OfflineAlertBannerProps {
  syncDetails: SyncDetails;
  onOpenSyncDetails: () => void;
}

export const OfflineAlertBanner: React.FC<OfflineAlertBannerProps> = ({
  syncDetails,
  onOpenSyncDetails,
}) => {
  if (syncDetails.isOnline && !syncDetails.hasPendingWrites) {
    return null;
  }

  return (
    <div className="px-2.5 sm:px-4 pb-2">
      <div className="p-3 sm:p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-orange-500/10 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-amber-950">
                Mode Offline Aktif — Perlindungan Data Lokal Bekerja
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900 border border-amber-300">
                Otomatis Tersimpan
              </span>
            </div>
            <p className="text-[11px] text-amber-800/90 leading-tight">
              Anda tetap dapat memperbarui alur rute, kuantitas, atau batch. Data tersimpan aman di perangkat dan akan disinkronkan ke Firebase begitu internet kembali.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSyncDetails}
          className="self-end sm:self-center px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Lihat Status Keamanan</span>
        </button>
      </div>
    </div>
  );
};

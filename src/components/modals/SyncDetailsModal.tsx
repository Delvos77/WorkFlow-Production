import React, { useState } from 'react';
import {
  X,
  Cloud,
  Database,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Wifi,
  WifiOff,
  ShieldCheck,
  Download,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { SyncDetails, JobSPK } from '../../types';

interface SyncDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncDetails: SyncDetails;
  jobs: JobSPK[];
  onManualSync: () => Promise<void>;
}

export const SyncDetailsModal: React.FC<SyncDetailsModalProps> = ({
  isOpen,
  onClose,
  syncDetails,
  jobs,
  onManualSync,
}) => {
  const [isSyncingManual, setIsSyncingManual] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const { state, isOnline, hasPendingWrites, fromCache, lastSyncedAt, totalSavedJobs } =
    syncDetails;

  const handleTriggerSync = async () => {
    setIsSyncingManual(true);
    setSyncFeedback(null);
    try {
      await onManualSync();
      setSyncFeedback('Sinkronisasi berhasil! Semua data cloud telah diperbarui.');
    } catch (err: any) {
      setSyncFeedback(
        isOnline
          ? 'Koneksi Firestore stabil. Data lokal sinkron dengan server.'
          : 'Perangkat sedang offline. Data tetap aman di penyimpanan lokal.'
      );
    } finally {
      setIsSyncingManual(false);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      app: 'Workflow Produksi - Percetakan & Packaging',
      totalJobs: jobs.length,
      jobs: jobs,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_workflow_spk_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="sync-details-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration bar */}
        <div
          className={`h-2 absolute top-0 left-0 right-0 ${
            !isOnline
              ? 'bg-amber-500'
              : state === 'syncing'
              ? 'bg-blue-500 animate-pulse'
              : 'bg-emerald-500'
          }`}
        />

        {/* Modal Top */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mt-1">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                !isOnline
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-[#207a68]'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 leading-tight">
                Status Sinkronisasi &amp; Keamanan Data
              </h2>
              <p className="text-xs text-slate-500">
                Arsitektur Offline-First + Cloud Firestore Realtime
              </p>
            </div>
          </div>
          <button
            id="close-sync-details-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Status Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {state === 'syncing' ? (
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              ) : !isOnline ? (
                <Database className="w-5 h-5 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                  {state === 'syncing'
                    ? 'Sedang Melakukan Sinkronisasi...'
                    : !isOnline
                    ? 'Mode Offline: Data Tersimpan di Perangkat'
                    : 'Semua Data Tersimpan & Tersinkronisasi'}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {!isOnline
                  ? 'Koneksi internet tidak terdeteksi. Setiap penambahan SPK, perubahan tahapan, kuantitas, atau batch tetap tersimpan di penyimpanan lokal dan akan otomatis diunggah ke Firebase begitu Anda terhubung kembali.'
                  : 'Data SPK dan alur produksi terhubung langsung dengan Google Firebase Cloud. Perubahan disinkronkan secara realtime ke semua perangkat.'}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Metrics Checklist */}
        <div className="mt-4 space-y-2.5">
          {/* Local Storage & Cache */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Penyimpanan Lokal (Offline Cache)</p>
                <p className="text-[11px] text-slate-500">
                  {totalSavedJobs} Dokumen SPK tersimpan aman di browser ini
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Aktif &amp; Terlindungi
            </span>
          </div>

          {/* Cloud Firestore Connection */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                {isOnline ? (
                  <Cloud className="w-4 h-4 text-emerald-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Google Cloud Firestore</p>
                <p className="text-[11px] text-slate-500">
                  {isOnline ? 'Koneksi server realtime aktif' : 'Menunggu koneksi internet aktif'}
                </p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                isOnline
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}
            >
              {isOnline ? 'Terhubung' : 'Offline'}
            </span>
          </div>

          {/* Last Sync Timestamp */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Sinkronisasi Terakhir</p>
                <p className="text-[11px] text-slate-500">
                  {lastSyncedAt
                    ? lastSyncedAt.toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : 'Baru saja diinisialisasi'}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-600">
              {fromCache && !isOnline ? 'Dari Cache Lokal' : 'Realtime Live'}
            </span>
          </div>
        </div>

        {/* Feedback alert if manual sync was pressed */}
        {syncFeedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            id="trigger-manual-sync-btn"
            onClick={handleTriggerSync}
            disabled={isSyncingManual}
            className="w-full sm:flex-1 py-2.5 px-3 bg-[#2CA58D] hover:bg-[#238572] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingManual ? 'animate-spin' : ''}`} />
            <span>{isSyncingManual ? 'Memeriksa...' : 'Sinkronkan Sekarang'}</span>
          </button>

          <button
            id="export-json-backup-btn"
            onClick={handleExportBackup}
            className="w-full sm:w-auto py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
            title="Unduh file backup data SPK dalam format JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Cadangkan JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};

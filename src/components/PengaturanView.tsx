import React, { useRef, useState } from 'react';
import {
  Settings,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Database,
  CheckCircle,
  Printer,
  Cloud,
  Shield,
  Eye,
  ChevronRight,
  UserCheck,
  KeyRound,
  Lock,
  Save,
  Check,
} from 'lucide-react';
import { JobSPK, RoutePresetsMap, UserRole, DeviceSession, SecurityConfig } from '../types';
import { DeviceSessionsManager } from './DeviceSessionsManager';

interface PengaturanViewProps {
  jobs: JobSPK[];
  presets: RoutePresetsMap;
  isOnline: boolean;
  userRole?: UserRole;
  sessions?: DeviceSession[];
  currentDeviceId?: string;
  securityConfig?: SecurityConfig;
  onRefreshSessions?: () => void;
  onOpenRoleSwitch?: () => void;
  onToggleDeviceRole?: (deviceId: string, newRole: UserRole) => Promise<void>;
  onDeleteSession?: (deviceId: string) => Promise<void>;
  onSaveSecurityConfig?: (config: SecurityConfig) => Promise<void>;
  onLockApp?: () => void;
  onResetAllData: () => void;
  onRestoreSampleData: () => void;
  onImportData: (importedJobs: JobSPK[], importedPresets?: RoutePresetsMap) => void;
  onPrintAllSpk: () => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  jobs,
  presets,
  isOnline,
  userRole = 'moderator',
  sessions = [],
  currentDeviceId = '',
  securityConfig,
  onRefreshSessions,
  onOpenRoleSwitch,
  onToggleDeviceRole,
  onDeleteSession,
  onSaveSecurityConfig,
  onLockApp,
  onResetAllData,
  onRestoreSampleData,
  onImportData,
  onPrintAllSpk,
}) => {
  const isModerator = userRole === 'moderator';
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Security PIN states
  const [internalPin, setInternalPin] = useState(securityConfig?.internalPin || '1234');
  const [moderatorPin, setModeratorPin] = useState(securityConfig?.moderatorPin || '8899');
  const [isSavingPin, setIsSavingPin] = useState(false);
  const [pinSaveSuccess, setPinSaveSuccess] = useState(false);

  const handleSavePins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveSecurityConfig) return;
    if (internalPin.length < 4 || moderatorPin.length < 4) {
      alert('PIN minimal terdiri dari 4 digit angka.');
      return;
    }
    setIsSavingPin(true);
    try {
      await onSaveSecurityConfig({
        internalPin: internalPin.trim(),
        moderatorPin: moderatorPin.trim(),
        isLockEnabled: true,
        companyName: securityConfig?.companyName || 'Percetakan & Packaging Internal',
      });
      setPinSaveSuccess(true);
      setTimeout(() => setPinSaveSuccess(false), 3000);
    } finally {
      setIsSavingPin(false);
    }
  };

  const handleExportJSON = () => {
    const exportPayload = {
      version: '1.3.0',
      exportedAt: new Date().toISOString(),
      provider: 'Firebase Firestore + Multi-Device Session RBAC',
      jobs,
      presets,
      sessions,
    };

    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `workflow_produksi_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (Array.isArray(parsed)) {
          onImportData(parsed);
        } else if (parsed && Array.isArray(parsed.jobs)) {
          onImportData(parsed.jobs, parsed.presets);
        }
      } catch (err) {
        console.error('Gagal membaca file JSON:', err);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section className="space-y-4 md:space-y-5">
      {/* 1. DEVICE SESSIONS & REALTIME ACCESS CONTROL (Top priority user feature) */}
      <DeviceSessionsManager
        sessions={sessions}
        currentDeviceId={currentDeviceId}
        currentUserRole={userRole}
        onRefreshSessions={onRefreshSessions}
        onToggleDeviceRole={onToggleDeviceRole}
        onDeleteSession={onDeleteSession}
      />

      {/* 2. GENERAL SETTINGS CONTAINER */}
      <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 flex flex-col space-y-4 md:space-y-5 shadow-xs">
        {/* Header */}
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-lg md:text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#2CA58D]" />
            <span>Pengaturan Sistem &amp; Backup Data</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadangkan data produksi ke file JSON, muat ulang template contoh, dan sinkronisasi Firebase.
          </p>
        </div>

        {/* Role Switch Banner */}
        <div
          className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isModerator
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-amber-50/80 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isModerator
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-amber-500 text-white shadow-xs'
              }`}
            >
              {isModerator ? <Shield className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold flex items-center gap-2">
                <span>Mode Saat Ini: {isModerator ? 'Moderator (Akses Penuh)' : 'Spectator (Hanya Pantau)'}</span>
              </h4>
              <p className="text-[11px] opacity-80 mt-0.5">
                {isModerator
                  ? 'Perangkat ini memiliki izin untuk menambah, mengedit, memajukan alur rute, dan menghapus SPK.'
                  : 'Perangkat ini berada dalam mode Read-Only. Data hanya bisa dipantau tanpa izin mengubah.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onLockApp && (
              <button
                type="button"
                onClick={onLockApp}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center gap-1.5 cursor-pointer touch-manipulation active:scale-95"
                title="Kunci aplikasi di perangkat ini sekarang"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Kunci Perangkat</span>
              </button>
            )}

            {onOpenRoleSwitch && (
              <button
                onClick={onOpenRoleSwitch}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-300 transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer touch-manipulation active:scale-95 shrink-0"
              >
                <span>Ubah Peran Manual</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* 🔒 PIN GERBANG INTERNAL & KEAMANAN SISTEM */}
        {isModerator && (
          <div className="p-4 bg-slate-50/90 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <KeyRound className="w-4 h-4 text-[#2CA58D]" />
                <span>PIN Gerbang Akses Masuk Internal (Layar Kunci)</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Aktif &amp; Terenkripsi</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Setiap perangkat baru yang pertama kali membuka tautan aplikasi akan terkunci otomatis dan wajib memasukkan PIN ini.
            </p>

            <form onSubmit={handleSavePins} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  1. PIN Staff / Spectator (Hanya Pantau):
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  value={internalPin}
                  onChange={(e) => setInternalPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Contoh: 1234"
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Dibagikan ke staf operator / divisi lantai kerja.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  2. PIN Master Moderator (Akses Penuh):
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  value={moderatorPin}
                  onChange={(e) => setModeratorPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Contoh: 8899"
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Khusus Kepala Produksi / Admin Utama.
                </span>
              </div>

              <div className="sm:col-span-2 flex items-center justify-between pt-1">
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  {pinSaveSuccess && (
                    <>
                      <Check className="w-4 h-4" />
                      <span>PIN berhasil diperbarui dan tersinkron ke Firebase!</span>
                    </>
                  )}
                </span>

                <button
                  type="submit"
                  disabled={isSavingPin}
                  className="px-4 py-2 bg-[#2CA58D] hover:bg-[#238572] text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs touch-manipulation"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingPin ? 'Menyimpan...' : 'Simpan Perubahan PIN'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Backup & Restore Panel */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Database className="w-4 h-4 text-[#2CA58D]" />
              <span>Cadangkan &amp; Pulihkan (Backup / Restore)</span>
            </div>
            <p className="text-xs text-slate-500">
              Ekspor seluruh SPK, alur tahapan, riwayat sesi, dan preset template ke file JSON untuk dipindahkan atau disimpan sebagai arsip offline.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={handleExportJSON}
                className="flex-1 py-2.5 px-3 bg-[#2CA58D] hover:bg-[#238572] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer touch-manipulation active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Ekspor Backup (JSON)</span>
              </button>

              {isModerator ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-95"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Impor Data (JSON)</span>
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 py-2.5 px-3 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 cursor-not-allowed opacity-60"
                  title="Beralih ke mode Moderator untuk mengimpor data"
                >
                  <Upload className="w-4 h-4" />
                  <span>Impor (Moderator)</span>
                </button>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Action / Reset Panel */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Pemulihan Data Firestore</span>
            </div>
            <p className="text-xs text-slate-500">
              Muat ulang data simulasi produksi percetakan ke Firebase atau kosongkan database.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              {isModerator ? (
                <>
                  <button
                    onClick={onRestoreSampleData}
                    className="flex-1 py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-amber-300 touch-manipulation active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Muat Ulang Contoh</span>
                  </button>

                  <button
                    onClick={onResetAllData}
                    className="flex-1 py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-red-200 touch-manipulation active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Kosongkan Semua Data</span>
                  </button>
                </>
              ) : (
                <div className="w-full p-2.5 bg-slate-100 rounded-xl text-center text-xs text-slate-500 font-medium">
                  Tindakan reset &amp; pemulihan dinonaktifkan dalam Mode Spectator.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Print Action Banner */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-white rounded-xl">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950">
                Cetak / Ekspor Lembar Kerja SPK Cetak
              </h4>
              <p className="text-[11px] text-emerald-800">
                Cetak lembar SPK aktif dalam format rapi untuk ditempel di papan lantai produksi dan paraf operator.
              </p>
            </div>
          </div>
          <button
            onClick={onPrintAllSpk}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer touch-manipulation active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Lembar SPK</span>
          </button>
        </div>

        {/* Firebase Status & System Info */}
        <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sky-900 font-bold text-xs">
              <Cloud className="w-4 h-4 text-[#2CA58D]" />
              <span>Integrasi Firebase Firestore Cloud &amp; Offline Persistence</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isOnline
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {isOnline ? '● Online (Cloud Synced)' : '○ Offline (Local Cache)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-sky-950">
            <div className="bg-white/90 p-2.5 rounded-xl border border-sky-100">
              <span className="text-[10px] text-sky-600 block">Database Provider</span>
              <span className="font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Google Cloud Firestore
              </span>
            </div>
            <div className="bg-white/90 p-2.5 rounded-xl border border-sky-100">
              <span className="text-[10px] text-sky-600 block">Offline Multi-Tab Cache</span>
              <span className="font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Aktif (IndexedDB)
              </span>
            </div>
            <div className="bg-white/90 p-2.5 rounded-xl border border-sky-100">
              <span className="text-[10px] text-sky-600 block">Total SPK Terkoneksi</span>
              <span className="font-bold">{jobs.length} Dokumen SPK</span>
            </div>
          </div>

          <p className="text-[11px] text-sky-800 leading-relaxed pt-1">
            ✓ <strong>Keunggulan Offline:</strong> Saat koneksi internet terputus di pabrik atau gudang, Anda tetap dapat memantau status atau (sebagai Moderator) memajukan alur rute dan tracking bahan. Seluruh perubahan akan otomatis disinkronkan ke Firebase begitu koneksi kembali tersedia.
          </p>
        </div>
      </div>
    </section>
  );
};

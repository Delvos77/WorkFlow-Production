import React from 'react';
import {
  FileText,
  Calendar,
  Layers,
  Palette,
  Maximize2,
  Tag,
  User,
  Plus,
  ArrowLeft,
  Eye,
  Shield,
  Cloud,
  Database,
  RefreshCw,
} from 'lucide-react';
import { JobSPK, RoutePresetsMap, RouteStep, ProductionBatch, UserRole, SyncDetails } from '../types';
import { RouteStepper } from './RouteStepper';
import { PackingSection } from './PackingSection';
import { OrderQtyWidget } from './OrderQtyWidget';

interface JobDetailProps {
  job: JobSPK | null;
  presets: RoutePresetsMap;
  userRole?: UserRole;
  syncDetails?: SyncDetails;
  onBackToList?: () => void;
  onUpdateSteps: (newSteps: RouteStep[], batchId?: string) => void;
  onApplyPreset: (presetKey: string) => void;
  onSelectPacking: (option: string) => void;
  onDeletePacking: (option: string, e: React.MouseEvent) => void;
  onUpdateQty: (targetQty: number, completedQty: number) => void;
  onOpenSavePreset: () => void;
  onOpenAddStep: () => void;
  onOpenAddBatch: () => void;
  onOpenEditBatch: (batch: ProductionBatch) => void;
  onOpenDeleteBatch: (batch: ProductionBatch) => void;
  onSelectBatch: (batchId: string) => void;
  onOpenAddPacking: () => void;
  onOpenMaterialModal: () => void;
  onOpenShipmentModal: () => void;
  onOpenAddSpk: () => void;
}

export const JobDetail: React.FC<JobDetailProps> = ({
  job,
  presets,
  userRole = 'moderator',
  syncDetails,
  onBackToList,
  onUpdateSteps,
  onApplyPreset,
  onSelectPacking,
  onDeletePacking,
  onUpdateQty,
  onOpenSavePreset,
  onOpenAddStep,
  onOpenAddBatch,
  onOpenEditBatch,
  onOpenDeleteBatch,
  onSelectBatch,
  onOpenAddPacking,
  onOpenMaterialModal,
  onOpenShipmentModal,
  onOpenAddSpk,
}) => {
  const isModerator = userRole === 'moderator';

  if (!job) {
    return (
      <section className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-base font-extrabold text-slate-700 mb-1">
          Tidak ada SPK yang dipilih
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mb-4">
          Pilih salah satu SPK dari daftar atau buat SPK baru untuk melihat detail alur kerja dan rute produksi.
        </p>
        {isModerator && (
          <button
            onClick={onOpenAddSpk}
            className="px-4 py-2 bg-[#2CA58D] hover:bg-[#238572] text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer touch-manipulation active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah SPK Baru</span>
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 flex flex-col space-y-3 sm:space-y-4 shadow-xs">
      {/* Mobile Back Button */}
      {onBackToList && (
        <div className="md:hidden flex items-center justify-between pb-2 border-b border-slate-100">
          <button
            onClick={onBackToList}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer touch-manipulation active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Daftar SPK</span>
          </button>

          {!isModerator && (
            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Eye className="w-3 h-3 text-amber-600" />
              <span>Spectator Mode</span>
            </span>
          )}
        </div>
      )}

      {/* Job Header Metadata Summary */}
      <div className="border-b border-slate-100 pb-3 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 bg-[#2CA58D] text-white text-xs font-black rounded-lg shadow-2xs">
              {job.id}
            </span>
            <h2 className="text-base md:text-lg font-extrabold text-slate-800 leading-snug">
              {job.title.includes(': ') ? job.title.split(': ')[1] : job.title}
            </h2>

            {/* In-job Sync Confirmation Badge */}
            {syncDetails && (
              <span
                className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  syncDetails.state === 'syncing'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                    : !syncDetails.isOnline || syncDetails.hasPendingWrites
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
                title={
                  syncDetails.state === 'syncing'
                    ? 'Menyinkronkan perubahan ke Firebase Cloud'
                    : !syncDetails.isOnline
                    ? 'Perubahan tersimpan aman di cache offline perangkat'
                    : 'Data SPK tersinkronisasi di Firebase Cloud'
                }
              >
                {syncDetails.state === 'syncing' ? (
                  <>
                    <RefreshCw className="w-2.5 h-2.5 text-blue-600 animate-spin" />
                    <span>Menyinkronkan...</span>
                  </>
                ) : !syncDetails.isOnline || syncDetails.hasPendingWrites ? (
                  <>
                    <Database className="w-2.5 h-2.5 text-amber-600" />
                    <span>Tersimpan Offline</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Cloud Synced</span>
                  </>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            {job.customer && (
              <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg font-bold border border-slate-200">
                <User className="w-3 h-3 text-slate-400" />
                <span>{job.customer}</span>
              </span>
            )}
            {job.dueDate && (
              <span className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg font-extrabold border border-amber-200">
                <Calendar className="w-3 h-3 text-amber-600" />
                <span>Deadline: {job.dueDate}</span>
              </span>
            )}
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-slate-50 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 text-xs text-slate-700">
          <div className="flex items-start gap-2">
            <Layers className="w-4 h-4 text-[#2CA58D] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">
                Bahan Material
              </span>
              <span className="font-bold text-slate-800 truncate block">{job.material || '-'}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Palette className="w-4 h-4 text-[#2CA58D] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">
                Warna Cetak
              </span>
              <span className="font-bold text-slate-800 truncate block">{job.print || '-'}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Tag className="w-4 h-4 text-[#2CA58D] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">
                Laminasi
              </span>
              <span className="font-bold text-slate-800 truncate block">{job.lamination || 'Tanpa Laminasi'}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Maximize2 className="w-4 h-4 text-[#2CA58D] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">
                Ukuran Jadi
              </span>
              <span className="font-bold text-slate-800 truncate block">{job.size || '-'}</span>
            </div>
          </div>
        </div>

        {job.notes && (
          <p className="text-[11px] text-slate-600 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80 flex items-start sm:items-center gap-1.5">
            <span className="font-bold text-amber-900 shrink-0">Catatan SPK:</span>
            <span>{job.notes}</span>
          </p>
        )}
      </div>

      {/* Rute Alur Produksi & Multi-Batch Parsial */}
      <RouteStepper
        job={job}
        presets={presets}
        userRole={userRole}
        onUpdateSteps={onUpdateSteps}
        onApplyPreset={onApplyPreset}
        onOpenSavePreset={onOpenSavePreset}
        onOpenAddStep={onOpenAddStep}
        onOpenAddBatch={onOpenAddBatch}
        onOpenEditBatch={onOpenEditBatch}
        onOpenDeleteBatch={onOpenDeleteBatch}
        onSelectBatch={onSelectBatch}
      />

      {/* Detail Packing */}
      <PackingSection
        packingOptions={job.packingOptions}
        activePacking={job.activePacking}
        userRole={userRole}
        onSelectPacking={onSelectPacking}
        onOpenAddPacking={onOpenAddPacking}
        onDeletePacking={onDeletePacking}
      />

      {/* Pencatatan & Status Order Finishing */}
      <OrderQtyWidget
        job={job}
        userRole={userRole}
        onUpdateQty={onUpdateQty}
        onOpenMaterialModal={onOpenMaterialModal}
        onOpenShipmentModal={onOpenShipmentModal}
      />
    </section>
  );
};

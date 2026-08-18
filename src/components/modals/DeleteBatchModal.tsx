import React from 'react';
import { Trash2, X, AlertTriangle, Layers } from 'lucide-react';
import { ProductionBatch } from '../../types';

interface DeleteBatchModalProps {
  isOpen: boolean;
  batch: ProductionBatch | null;
  spkId: string;
  onClose: () => void;
  onConfirmDelete: (batchId: string) => void;
}

export const DeleteBatchModal: React.FC<DeleteBatchModalProps> = ({
  isOpen,
  batch,
  spkId,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !batch) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 md:p-6 border border-slate-100 space-y-4">
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 border border-red-200">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                Hapus Alur Batch Produksi
              </h3>
              <p className="text-xs text-slate-500">
                SPK: <strong className="text-slate-700">{spkId}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Body */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 space-y-2 text-red-950">
            <div className="flex items-center gap-2 font-bold text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Konfirmasi Penghapusan Batch</span>
            </div>
            <p className="leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong>&quot;{batch.batchName}&quot;</strong>?
            </p>
            <div className="bg-white/80 p-2.5 rounded-xl border border-red-100 space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span>Kuantitas Batch:</span>
                <strong className="text-red-700">{batch.targetQty.toLocaleString()} pcs</strong>
              </div>
              <div className="flex justify-between">
                <span>Jumlah Tahapan Rute:</span>
                <strong>{batch.steps?.length || 0} Tahap</strong>
              </div>
              <div className="flex justify-between">
                <span>Status Batch:</span>
                <strong className="capitalize">{batch.status}</strong>
              </div>
            </div>
            <p className="text-[11px] text-red-700">
              * Kuantitas {batch.targetQty.toLocaleString()} pcs akan otomatis kembali menjadi sisa kuantitas yang belum terjadwal di SPK ini.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(batch.id);
              onClose();
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>Ya, Hapus Batch Ini</span>
          </button>
        </div>
      </div>
    </div>
  );
};

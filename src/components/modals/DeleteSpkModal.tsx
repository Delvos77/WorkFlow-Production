import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { JobSPK } from '../../types';

interface DeleteSpkModalProps {
  isOpen: boolean;
  job: JobSPK | null;
  onClose: () => void;
  onConfirmDelete: (jobId: string) => void;
}

export const DeleteSpkModal: React.FC<DeleteSpkModalProps> = ({
  isOpen,
  job,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 md:p-6 border border-slate-100 space-y-4">
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="font-extrabold text-slate-800 text-base">
            Hapus Surat Perintah Kerja (SPK)?
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Apakah Anda yakin ingin menghapus data pekerjaan ini dari sistem dan database?
          </p>
        </div>

        <div className="p-3 bg-red-50/70 border border-red-200 rounded-2xl text-xs space-y-1">
          <p className="font-bold text-red-900">
            Kode: <span className="font-black">{job.id}</span>
          </p>
          <p className="font-semibold text-red-800">
            Nama: {job.title.includes(': ') ? job.title.split(': ')[1] : job.title}
          </p>
          {job.customer && (
            <p className="text-red-700 text-[11px]">Customer: {job.customer}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(job.id);
              onClose();
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Ya, Hapus SPK</span>
          </button>
        </div>
      </div>
    </div>
  );
};

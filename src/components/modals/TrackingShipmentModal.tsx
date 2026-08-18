import React, { useState, useEffect } from 'react';
import { X, Truck, AlertTriangle, CheckCircle2, PackageCheck, Layers } from 'lucide-react';
import { JobSPK } from '../../types';

interface TrackingShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobSPK | null;
  onSave: (completedQty: number, packedQty: number, shippedQty: number) => void;
}

export const TrackingShipmentModal: React.FC<TrackingShipmentModalProps> = ({
  isOpen,
  onClose,
  job,
  onSave,
}) => {
  if (!isOpen || !job) return null;

  const [completed, setCompleted] = useState(job.completedQty || 0);
  const [packed, setPacked] = useState(job.packedQty || 0);
  const [shipped, setShipped] = useState(job.shippedQty || 0);

  useEffect(() => {
    if (job) {
      setCompleted(job.completedQty || 0);
      setPacked(job.packedQty || 0);
      setShipped(job.shippedQty || 0);
    }
  }, [job]);

  const target = job.targetQty || 0;

  // Validation
  const warnings: string[] = [];
  if (shipped > packed) warnings.push('Qty sudah dikirim tidak boleh melebihi qty yang sudah di-packing.');
  if (packed > completed) warnings.push('Qty sudah di-packing tidak boleh melebihi qty yang sudah selesai finishing.');
  if (completed > target) warnings.push('Catatan: Kuantitas selesai melebihi target order.');

  const notYetFinished = Math.max(0, target - completed);
  const finishedButNotPacked = Math.max(0, completed - packed);
  const packedButNotShipped = Math.max(0, packed - shipped);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shipped > packed || packed > completed) {
      if (!confirm('Terdapat peringatan logika kuantitas. Apakah Anda tetap ingin menyimpan?')) {
        return;
      }
    }

    onSave(completed, packed, shipped);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-5 md:p-6 border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                Track Pengiriman & Ekspedisi Parsial
              </h3>
              <p className="text-[11px] text-slate-400">
                Pantau progres tahapan fisik barang hingga sampai ke customer
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

        {/* Job Overview */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
          <p>
            <span className="font-bold text-slate-500">SPK:</span>{' '}
            <span className="font-extrabold text-slate-800">{job.id} - {job.title}</span>
          </p>
          <p>
            <span className="font-bold text-slate-500">Target Pesanan:</span>{' '}
            <span className="font-bold text-slate-800">{target.toLocaleString()} pcs</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1. Kuantitas Selesai Finishing (Pcs)
              </label>
              <input
                type="number"
                min="0"
                value={completed}
                onChange={(e) => setCompleted(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] font-bold text-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Barang yang sudah tuntas proses lem/lipat/finishing mesin & manual.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Kuantitas Sudah Di-Packing (Pcs)
              </label>
              <input
                type="number"
                min="0"
                value={packed}
                onChange={(e) => setPacked(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] font-bold text-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Barang yang sudah dibungkus rapi (siap masuk truk atau gudang pengiriman).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                3. Kuantitas Sudah Dikirim ke Customer (Pcs)
              </label>
              <input
                type="number"
                min="0"
                value={shipped}
                onChange={(e) => setShipped(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] font-bold text-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Barang yang sudah keluar surat jalan dan delivered ke lokasi customer.
              </p>
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Peringatan Logika Angka:</span>
              </div>
              {warnings.map((w, i) => (
                <p key={i} className="text-amber-700 text-[11px]">
                  • {w}
                </p>
              ))}
            </div>
          )}

          {/* Breakdown Preview */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
            <p className="font-bold text-slate-700">Ringkasan Status Saat Ini:</p>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center bg-emerald-100/60 p-2 rounded-xl text-emerald-900 font-semibold text-xs">
                <span>✓ Sudah Dikirim:</span>
                <span className="font-black">
                  {shipped.toLocaleString()} pcs ({target > 0 ? Math.round((shipped / target) * 100) : 0}%)
                </span>
              </div>

              <div className="flex justify-between items-center bg-blue-100/60 p-2 rounded-xl text-blue-900 font-semibold text-xs">
                <span>📦 Packed Siap Kirim (Di Gudang):</span>
                <span className="font-black">
                  {packedButNotShipped.toLocaleString()} pcs ({target > 0 ? Math.round((packedButNotShipped / target) * 100) : 0}%)
                </span>
              </div>

              <div className="flex justify-between items-center bg-amber-100/60 p-2 rounded-xl text-amber-900 font-semibold text-xs">
                <span>⏳ Selesai (Belum Di-Packing):</span>
                <span className="font-black">
                  {finishedButNotPacked.toLocaleString()} pcs ({target > 0 ? Math.round((finishedButNotPacked / target) * 100) : 0}%)
                </span>
              </div>

              <div className="flex justify-between items-center bg-slate-200/70 p-2 rounded-xl text-slate-800 font-semibold text-xs">
                <span>🔄 Belum Selesai Finishing:</span>
                <span className="font-black">
                  {notYetFinished.toLocaleString()} pcs ({target > 0 ? Math.round((notYetFinished / target) * 100) : 0}%)
                </span>
              </div>
            </div>
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
              type="submit"
              className="px-5 py-2 bg-[#2CA58D] hover:bg-[#238572] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer active:scale-95"
            >
              Simpan Tracking Pengiriman
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

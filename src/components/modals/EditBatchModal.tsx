import React, { useState, useEffect } from 'react';
import { X, Check, Edit3, Layers, AlertCircle, Sparkles } from 'lucide-react';
import { JobSPK, ProductionBatch } from '../../types';

interface EditBatchModalProps {
  isOpen: boolean;
  job: JobSPK | null;
  batch: ProductionBatch | null;
  onClose: () => void;
  onSaveBatch: (updatedBatch: ProductionBatch) => void;
}

export const EditBatchModal: React.FC<EditBatchModalProps> = ({
  isOpen,
  job,
  batch,
  onClose,
  onSaveBatch,
}) => {
  if (!isOpen || !job || !batch) return null;

  const [batchName, setBatchName] = useState(batch.batchName);
  const [targetQty, setTargetQty] = useState<number>(batch.targetQty);
  const [completedQty, setCompletedQty] = useState<number>(batch.completedQty || 0);
  const [status, setStatus] = useState<'completed' | 'in-progress' | 'pending'>(batch.status);
  const [notes, setNotes] = useState(batch.notes || '');

  // Reset form when active batch changes
  useEffect(() => {
    if (batch) {
      setBatchName(batch.batchName);
      setTargetQty(batch.targetQty);
      setCompletedQty(batch.completedQty || 0);
      setStatus(batch.status);
      setNotes(batch.notes || '');
    }
  }, [batch]);

  // Math calculations
  const allBatches = job.batches || [];
  const otherBatchesQty = allBatches
    .filter((b) => b.id !== batch.id)
    .reduce((acc, b) => acc + (b.targetQty || 0), 0);

  const idealRemainingForThisBatch = Math.max(0, job.targetQty - otherBatchesQty);
  const totalWithNewQty = otherBatchesQty + (targetQty || 0);
  const diffFromSpkTarget = totalWithNewQty - job.targetQty;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim()) {
      alert('Nama batch tidak boleh kosong.');
      return;
    }
    if (targetQty <= 0) {
      alert('Kuantitas batch harus lebih dari 0.');
      return;
    }

    const updated: ProductionBatch = {
      ...batch,
      batchName: batchName.trim(),
      targetQty: Number(targetQty),
      completedQty: Number(completedQty),
      status: status,
      notes: notes.trim() || undefined,
    };

    onSaveBatch(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 md:p-6 border border-slate-100 space-y-4">
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                Edit Kuantitas &amp; Rincian Batch
              </h3>
              <p className="text-xs text-slate-500">
                SPK: <strong className="text-slate-700">{job.id}</strong> (Target: {job.targetQty.toLocaleString()} pcs)
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

        {/* Live Math Allocation Info Box */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-white rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Total SPK</span>
              <span className="font-black text-slate-800 text-xs">{job.targetQty.toLocaleString()} pcs</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Batch Lain</span>
              <span className="font-black text-slate-700 text-xs">{otherBatchesQty.toLocaleString()} pcs</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-100">
              <span className="text-[10px] text-[#2CA58D] font-bold uppercase block">Batch Ini</span>
              <span className="font-black text-[#207a68] text-xs">{(targetQty || 0).toLocaleString()} pcs</span>
            </div>
          </div>

          {/* Diff indicator */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
            <span className="text-slate-600">Total Akumulasi Semua Batch:</span>
            <span
              className={`font-black ${
                diffFromSpkTarget === 0
                  ? 'text-emerald-700'
                  : diffFromSpkTarget < 0
                  ? 'text-amber-700'
                  : 'text-purple-700'
              }`}
            >
              {totalWithNewQty.toLocaleString()} pcs{' '}
              {diffFromSpkTarget === 0
                ? '(✓ Pas 100%)'
                : diffFromSpkTarget < 0
                ? `(Kurang ${Math.abs(diffFromSpkTarget).toLocaleString()} pcs)`
                : `(+${diffFromSpkTarget.toLocaleString()} pcs)`}
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Nama Batch Produksi
            </label>
            <input
              type="text"
              required
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="Contoh: Batch 1 (Tahap 1), Batch 2 (Sisa)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800 font-bold"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700">
                Kuantitas Target Batch (Pcs)
              </label>
              {idealRemainingForThisBatch > 0 && idealRemainingForThisBatch !== targetQty && (
                <button
                  type="button"
                  onClick={() => setTargetQty(idealRemainingForThisBatch)}
                  className="text-[10px] text-[#2CA58D] font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Pas-kan ke Sisa Target ({idealRemainingForThisBatch.toLocaleString()} pcs)</span>
                </button>
              )}
            </div>
            <input
              type="number"
              required
              min={1}
              value={targetQty || ''}
              onChange={(e) => setTargetQty(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800 font-extrabold text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Kuantitas Selesai (Pcs)
              </label>
              <input
                type="number"
                min={0}
                max={targetQty}
                value={completedQty || ''}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCompletedQty(val);
                  if (val >= targetQty && targetQty > 0) {
                    setStatus('completed');
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Status Batch
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'completed' | 'in-progress' | 'pending')
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800 font-semibold"
              >
                <option value="in-progress">● Sedang Berjalan</option>
                <option value="completed">✓ Selesai 100%</option>
                <option value="pending">⏳ Pending (Antrean)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Catatan Khusus Batch (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Mesin cetak 1, pengerjaan shift pagi"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2CA58D] hover:bg-[#238572] text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Simpan Perubahan Batch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

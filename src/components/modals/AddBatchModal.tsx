import React, { useState, useEffect } from 'react';
import { X, Plus, Layers, Sparkles, Check, AlertCircle } from 'lucide-react';
import { JobSPK, ProductionBatch, RoutePresetsMap, RouteStep } from '../../types';

interface AddBatchModalProps {
  isOpen: boolean;
  job: JobSPK | null;
  presets: RoutePresetsMap;
  onClose: () => void;
  onAddBatch: (newBatch: ProductionBatch) => void;
}

export const AddBatchModal: React.FC<AddBatchModalProps> = ({
  isOpen,
  job,
  presets,
  onClose,
  onAddBatch,
}) => {
  if (!isOpen || !job) return null;

  // Normalized existing batches
  const existingBatches: ProductionBatch[] =
    job.batches && job.batches.length > 0
      ? job.batches
      : [
          {
            id: `batch-${job.id}-1`,
            batchName: 'Batch 1 (Awal)',
            targetQty: job.completedQty > 0 ? job.completedQty : job.targetQty,
            completedQty: job.completedQty,
            status:
              job.completedQty >= job.targetQty ? 'completed' : 'in-progress',
            steps: job.steps,
            createdAt: job.createdAt,
          },
        ];

  const totalAllocatedSoFar = existingBatches.reduce(
    (acc, b) => acc + (b.targetQty || 0),
    0
  );
  const remainingQty = Math.max(0, job.targetQty - totalAllocatedSoFar);
  const nextBatchNumber = existingBatches.length + 1;

  // Default suggested quantity: if there is positive remaining, use it; otherwise suggest 1,000 or half
  const defaultSuggestedQty =
    remainingQty > 0
      ? remainingQty
      : Math.max(500, Math.round(job.targetQty / 2));

  const [batchName, setBatchName] = useState(`Batch ${nextBatchNumber}`);
  const [targetQty, setTargetQty] = useState<number>(defaultSuggestedQty);
  const [routeSource, setRouteSource] = useState<'current' | 'preset'>('current');
  const [selectedPreset, setSelectedPreset] = useState(Object.keys(presets)[0] || '');
  const [notes, setNotes] = useState('');

  // Re-sync defaults when modal opens or job changes
  useEffect(() => {
    if (isOpen) {
      setBatchName(`Batch ${nextBatchNumber}`);
      setTargetQty(defaultSuggestedQty);
      setNotes('');
    }
  }, [isOpen, nextBatchNumber, defaultSuggestedQty]);

  // Projected new allocation
  const projectedTotal = totalAllocatedSoFar + (targetQty || 0);
  const projectedDiff = projectedTotal - job.targetQty;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim()) {
      alert('Nama batch harus diisi.');
      return;
    }
    if (targetQty <= 0) {
      alert('Kuantitas batch harus lebih dari 0.');
      return;
    }

    let initialSteps: RouteStep[] = [];

    if (routeSource === 'current' && job.steps.length > 0) {
      // Copy steps from current SPK/batch template with first step in-progress, rest pending
      initialSteps = job.steps.map((s, idx) => ({
        id: `batch-${Date.now()}-step-${idx}`,
        name: s.name,
        icon: s.icon,
        status: idx === 0 ? ('in-progress' as const) : ('pending' as const),
      }));
    } else if (routeSource === 'preset' && presets[selectedPreset]) {
      initialSteps = presets[selectedPreset].map((s, idx) => ({
        id: `batch-${Date.now()}-step-${idx}`,
        name: s.name,
        icon: s.icon,
        status: idx === 0 ? ('in-progress' as const) : ('pending' as const),
      }));
    } else {
      initialSteps = [
        {
          id: `batch-${Date.now()}-step-0`,
          name: 'Potong Bahan',
          icon: 'Scissors',
          status: 'in-progress',
        },
      ];
    }

    const newBatch: ProductionBatch = {
      id: `batch-${Date.now()}`,
      batchName: batchName.trim(),
      targetQty: Number(targetQty),
      completedQty: 0,
      status: 'in-progress',
      steps: initialSteps,
      createdAt: new Date().toISOString().slice(0, 10),
      notes: notes.trim() || undefined,
    };

    onAddBatch(newBatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-5 md:p-6 border border-slate-100 space-y-4">
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#2CA58D]/10 flex items-center justify-center text-[#2CA58D]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                Tambah Alur Rute Batch Parsial Baru
              </h3>
              <p className="text-xs text-slate-500">
                SPK: <strong className="text-slate-700">{job.id}</strong> (Target Total: {job.targetQty.toLocaleString()} pcs)
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

        {/* SPK Target vs Allocated Summary */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-white rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Total SPK</span>
              <span className="font-black text-slate-800 text-xs">{job.targetQty.toLocaleString()} pcs</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-100">
              <span className="text-[10px] text-emerald-600 font-bold uppercase block">Sudah Terjadwal</span>
              <span className="font-black text-emerald-700 text-xs">{totalAllocatedSoFar.toLocaleString()} pcs</span>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-[10px] text-amber-700 font-bold uppercase block">Sisa Belum Rute</span>
              <span className="font-black text-amber-900 text-xs">{remainingQty.toLocaleString()} pcs</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
            <span className="text-slate-600">Proyeksi Total Setelah Batch Ini:</span>
            <span
              className={`font-black ${
                projectedDiff === 0
                  ? 'text-emerald-700'
                  : projectedDiff < 0
                  ? 'text-amber-700'
                  : 'text-purple-700'
              }`}
            >
              {projectedTotal.toLocaleString()} pcs{' '}
              {projectedDiff === 0
                ? '(✓ Pas 100%)'
                : projectedDiff < 0
                ? `(Kurang ${Math.abs(projectedDiff).toLocaleString()} pcs)`
                : `(+${projectedDiff.toLocaleString()} pcs)`}
            </span>
          </div>
        </div>

        {/* Form */}
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
              placeholder="Contoh: Batch 2 (Produksi Sisa 2.500 pcs)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800 font-bold"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700">
                Kuantitas Batch Baru Ini (Pcs)
              </label>
              {remainingQty > 0 && (
                <button
                  type="button"
                  onClick={() => setTargetQty(remainingQty)}
                  className="text-[10px] text-[#2CA58D] font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Isi Sisa ({remainingQty.toLocaleString()} pcs)</span>
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

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Pilihan Alur Rute Tahapan Untuk Batch Ini
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
                <input
                  type="radio"
                  name="routeSource"
                  checked={routeSource === 'current'}
                  onChange={() => setRouteSource('current')}
                  className="text-[#2CA58D] focus:ring-[#2CA58D]"
                />
                <span className="font-semibold text-slate-700">
                  Salin Rute SPK ({job.steps.length} Tahap)
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
                <input
                  type="radio"
                  name="routeSource"
                  checked={routeSource === 'preset'}
                  onChange={() => setRouteSource('preset')}
                  className="text-[#2CA58D] focus:ring-[#2CA58D]"
                />
                <span className="font-semibold text-slate-700">
                  Gunakan Preset Template
                </span>
              </label>
            </div>

            {routeSource === 'preset' && (
              <select
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value)}
                className="mt-2 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800 font-semibold"
              >
                {Object.keys(presets).map((pKey) => (
                  <option key={pKey} value={pKey}>
                    {pKey} ({presets[pKey].length} Tahap)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Catatan Khusus Batch (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pengerjaan batch parsial susulan"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800"
            />
          </div>

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
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Buat Rute Batch Baru</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

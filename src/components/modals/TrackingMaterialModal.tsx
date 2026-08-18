import React, { useState, useEffect } from 'react';
import { X, Boxes, Plus, Trash2, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { JobSPK, MaterialItem } from '../../types';
import { MATERIAL_PRESETS } from '../../data/initialData';

interface TrackingMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobSPK | null;
  onSave: (materials: MaterialItem[]) => void;
}

export const TrackingMaterialModal: React.FC<TrackingMaterialModalProps> = ({
  isOpen,
  onClose,
  job,
  onSave,
}) => {
  if (!isOpen || !job) return null;

  const [materials, setMaterials] = useState<MaterialItem[]>([]);

  useEffect(() => {
    if (job) {
      if (job.materials && job.materials.length > 0) {
        setMaterials(JSON.parse(JSON.stringify(job.materials)));
      } else {
        // Init with main job material
        const splitted = (job.material || 'Bahan Utama')
          .split('+')
          .map((m) => m.trim())
          .filter(Boolean);
        setMaterials(
          splitted.map((m, idx) => ({
            id: `mat-${Date.now()}-${idx}`,
            name: m,
            orderedQty: job.targetQty || 0,
            usedQty: 0,
            unit: 'lembar',
          }))
        );
      }
    }
  }, [job]);

  const handleAddRow = () => {
    setMaterials([
      ...materials,
      {
        id: `mat-${Date.now()}-${materials.length}`,
        name: '',
        orderedQty: job.targetQty || 0,
        usedQty: 0,
        unit: 'lembar',
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleUpdate = (
    index: number,
    field: keyof MaterialItem,
    value: string | number
  ) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: value };
    setMaterials(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (const mat of materials) {
      if (!mat.name.trim()) {
        alert('Nama bahan tidak boleh kosong.');
        return;
      }
    }
    onSave(materials);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-5 md:p-6 border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                Track Penggunaan Bahan Baku
              </h3>
              <p className="text-[11px] text-slate-400">
                Kelola stok kertas, karton, foil, dan lem yang dialokasikan ke SPK
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

        {/* Job Info */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
          <p>
            <span className="font-bold text-slate-500">SPK Terpilih:</span>{' '}
            <span className="font-extrabold text-slate-800">{job.id} - {job.title}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <datalist id="materialPresetsList">
            {MATERIAL_PRESETS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>

          {/* Materials List */}
          <div className="space-y-3">
            {materials.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center text-xs text-slate-500">
                <p>Belum ada bahan baku. Klik tombol di bawah untuk menambah bahan.</p>
              </div>
            ) : (
              materials.map((mat, idx) => {
                const diff = mat.orderedQty - mat.usedQty;
                const percentUsed =
                  mat.orderedQty > 0
                    ? Math.round((mat.usedQty / mat.orderedQty) * 100)
                    : 0;

                let cardBg = 'bg-blue-50/60 border-blue-200 text-blue-900';
                let statusBadge = (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Sisa {diff.toLocaleString()} {mat.unit || 'unit'}
                  </span>
                );

                if (diff === 0 && mat.orderedQty > 0) {
                  cardBg = 'bg-emerald-50/60 border-emerald-200 text-emerald-900';
                  statusBadge = (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Pas Sesuai Pesanan
                    </span>
                  );
                } else if (diff < 0) {
                  cardBg = 'bg-red-50/60 border-red-200 text-red-900';
                  statusBadge = (
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Kurang / Boros {Math.abs(diff).toLocaleString()} {mat.unit || 'unit'}
                    </span>
                  );
                }

                return (
                  <div
                    key={mat.id || idx}
                    className={`p-3.5 rounded-2xl border space-y-2.5 transition ${cardBg}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Nama Material Bahan #{idx + 1}
                        </label>
                        <input
                          type="text"
                          list="materialPresetsList"
                          value={mat.name}
                          onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                          placeholder="Nama bahan..."
                          required
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold bg-white text-slate-800"
                        />
                      </div>

                      <div className="w-24 space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Satuan
                        </label>
                        <input
                          type="text"
                          value={mat.unit || 'lembar'}
                          onChange={(e) => handleUpdate(idx, 'unit', e.target.value)}
                          placeholder="lembar/roll"
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold bg-white text-slate-800"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        title="Hapus bahan ini"
                        className="p-2 hover:bg-red-100 text-red-600 rounded-xl transition cursor-pointer mt-5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="font-bold text-slate-600 block text-[11px]">
                          Qty Dipesan / Alokasi
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={mat.orderedQty}
                          onChange={(e) =>
                            handleUpdate(idx, 'orderedQty', parseInt(e.target.value) || 0)
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold mt-0.5 bg-white text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block text-[11px]">
                          Qty Aktual Terpakai
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={mat.usedQty}
                          onChange={(e) =>
                            handleUpdate(idx, 'usedQty', parseInt(e.target.value) || 0)
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold mt-0.5 bg-white text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {statusBadge}
                      <span className="text-[10px] font-bold text-slate-500">
                        {percentUsed}% terpakai
                      </span>
                    </div>

                    <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Material Row Button */}
          <button
            type="button"
            onClick={handleAddRow}
            className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 border border-amber-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Material Bahan Baru</span>
          </button>

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
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer active:scale-95"
            >
              Simpan Penggunaan Bahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

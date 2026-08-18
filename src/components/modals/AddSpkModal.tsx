import React, { useState } from 'react';
import { X, Plus, Trash2, Layers, Tag, Palette } from 'lucide-react';
import { RoutePresetsMap, JobSPK } from '../../types';
import { MATERIAL_PRESETS } from '../../data/initialData';

interface AddSpkModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: RoutePresetsMap;
  existingJobs: JobSPK[];
  onSubmit: (newJob: JobSPK) => void;
}

export const AddSpkModal: React.FC<AddSpkModalProps> = ({
  isOpen,
  onClose,
  presets,
  existingJobs,
  onSubmit,
}) => {
  if (!isOpen) return null;

  // Auto generate next code
  const getNextCode = () => {
    let max = 100;
    existingJobs.forEach((j) => {
      const match = j.id.match(/^SPK-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > max) max = num;
      }
    });
    return `SPK-${max + 1}`;
  };

  const [code, setCode] = useState(getNextCode());
  const [title, setTitle] = useState('');
  const [customer, setCustomer] = useState('');
  const [materials, setMaterials] = useState<string[]>(['Ivory 300g']);
  const [print, setPrint] = useState('4 Warna (CMYK)');
  const [lamination, setLamination] = useState('Tanpa Laminasi');
  const [size, setSize] = useState('');
  const [targetQty, setTargetQty] = useState<number | ''>(5000);
  const [selectedPreset, setSelectedPreset] = useState<string>(
    Object.keys(presets)[0] || 'Default Duplex'
  );
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddMaterialRow = () => {
    setMaterials([...materials, '']);
  };

  const handleUpdateMaterial = (index: number, val: string) => {
    const updated = [...materials];
    updated[index] = val;
    setMaterials(updated);
  };

  const handleRemoveMaterial = (index: number) => {
    if (materials.length <= 1) return;
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Harap isi nama pekerjaan SPK.');
      return;
    }

    const finalMaterials = materials.map((m) => m.trim()).filter(Boolean).join(' + ');
    const presetTemplate = presets[selectedPreset] || Object.values(presets)[0] || [];

    const newJobSteps = presetTemplate.map((step, idx) => ({
      id: `step-${Date.now()}-${idx}`,
      name: step.name,
      icon: step.icon,
      status: idx === 0 ? ('completed' as const) : idx === 1 ? ('in-progress' as const) : ('pending' as const),
    }));

    // Seed default materials array for tracking
    const trackedMaterials = materials
      .map((m) => m.trim())
      .filter(Boolean)
      .map((m, idx) => ({
        id: `mat-${Date.now()}-${idx}`,
        name: m,
        orderedQty: Number(targetQty) || 0,
        usedQty: 0,
        unit: 'lembar',
      }));

    const newJob: JobSPK = {
      id: code.trim() || getNextCode(),
      title: title.trim(),
      customer: customer.trim() || undefined,
      material: finalMaterials || 'Standar',
      print,
      lamination,
      size: size.trim() || '-',
      status: 'Active Jobs',
      activePacking: 'Dus Saja',
      targetQty: Number(targetQty) || 0,
      completedQty: 0,
      packedQty: 0,
      shippedQty: 0,
      materials: trackedMaterials,
      steps: newJobSteps,
      packingOptions: ['Dus Saja', 'Ikat -> Plastik -> Karung', 'Plastik -> Dus -> Karung'],
      createdAt: new Date().toISOString().slice(0, 10),
      dueDate: dueDate || undefined,
      notes: notes.trim() || undefined,
    };

    onSubmit(newJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-5 md:p-6 border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-[#2CA58D]">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">Tambah SPK / Job Baru</h3>
              <p className="text-[11px] text-slate-400">Buat alur perintah kerja percetakan baru</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <datalist id="materialPresets">
            {MATERIAL_PRESETS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>

          {/* Code & Customer Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor / Kode SPK <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Contoh: SPK-103"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] font-bold text-slate-800 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Pemesan / Customer
              </label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Contoh: PT Boga Selera"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800"
              />
            </div>
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama / Deskripsi Pekerjaan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Kotak Martabak Spesial 25x20x6 cm"
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800 font-semibold"
            />
          </div>

          {/* Material Rows */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Material Bahan Baku <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddMaterialRow}
                className="text-[11px] font-bold text-[#2CA58D] hover:text-[#238572] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Bahan Lain</span>
              </button>
            </div>

            <div className="space-y-2">
              {materials.map((mat, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    list="materialPresets"
                    value={mat}
                    onChange={(e) => handleUpdateMaterial(idx, e.target.value)}
                    placeholder="Pilih dari daftar atau ketik nama bahan..."
                    required
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] bg-white text-slate-800"
                  />
                  {materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(idx)}
                      title="Hapus baris bahan"
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Print & Lamination Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Warna Cetak
              </label>
              <select
                value={print}
                onChange={(e) => setPrint(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] bg-white text-slate-800"
              >
                <option value="1 Warna">1 Warna</option>
                <option value="2 Warna">2 Warna</option>
                <option value="3 Warna">3 Warna</option>
                <option value="4 Warna (CMYK)">4 Warna (CMYK)</option>
                <option value="5 Warna (CMYK + Special)">5 Warna (CMYK + Special)</option>
                <option value="6 Warna">6 Warna</option>
                <option value="Tanpa Cetak (Polos)">Tanpa Cetak (Polos)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Laminasi
              </label>
              <select
                value={lamination}
                onChange={(e) => setLamination(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] bg-white text-slate-800"
              >
                <option value="Tanpa Laminasi">-- Tanpa Laminasi --</option>
                <option value="Doff">Doff (Matte)</option>
                <option value="Glossy">Glossy (Kilap)</option>
                <option value="Soft Touch">Soft Touch Velvet</option>
                <option value="Waterbased Varnish">Waterbased Varnish</option>
              </select>
            </div>
          </div>

          {/* Size & Target Qty Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ukuran Jadi
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="Contoh: 25x20x10 cm"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Kuantitas (Pcs) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={targetQty}
                onChange={(e) =>
                  setTargetQty(e.target.value === '' ? '' : parseInt(e.target.value) || 0)
                }
                placeholder="0"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800 font-bold"
              />
            </div>
          </div>

          {/* Route Preset Selector & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Template Alur Rute Awal
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] bg-white text-slate-800 font-semibold"
              >
                {Object.keys(presets).map((key) => (
                  <option key={key} value={key}>
                    {key} ({presets[key].length} Tahap)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Selesai (Deadline)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Produksi Khusus (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Perhatikan register warna foil emas, jangan sampai meleset."
              rows={2}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
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
              Simpan SPK Baru
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

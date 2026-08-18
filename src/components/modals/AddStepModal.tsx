import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { MASTER_STEP_OPTIONS } from '../../data/initialData';
import { renderStepIcon } from '../../utils/iconMap';
import { RouteStep } from '../../types';

interface AddStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStep: (step: RouteStep) => void;
}

export const AddStepModal: React.FC<AddStepModalProps> = ({
  isOpen,
  onClose,
  onAddStep,
}) => {
  if (!isOpen) return null;

  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);
  const [customName, setCustomName] = useState('');
  const [customIcon, setCustomIcon] = useState('Sparkles');

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    setCustomName(MASTER_STEP_OPTIONS[idx].name);
    setCustomIcon(MASTER_STEP_OPTIONS[idx].icon);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      alert('Harap masukkan nama tahapan produksi.');
      return;
    }

    const newStep: RouteStep = {
      id: `step-${Date.now()}`,
      name: customName.trim(),
      icon: customIcon,
      status: 'pending',
    };

    onAddStep(newStep);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 border border-slate-100 space-y-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-[#2CA58D]">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">
              Tambah Tahapan Rute Produksi
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Pilih dari Master Tahapan Percetakan:
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {MASTER_STEP_OPTIONS.map((opt, idx) => {
                const isSelected = selectedPresetIndex === idx;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => handleSelectPreset(idx)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-[#2CA58D] text-[#2CA58D] font-bold ring-2 ring-[#2CA58D]/30'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="shrink-0">
                      {renderStepIcon(opt.icon, {
                        className: `w-3.5 h-3.5 ${
                          isSelected ? 'text-[#2CA58D]' : 'text-slate-500'
                        }`,
                      })}
                    </div>
                    <span className="truncate">{opt.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-2 text-[10px] text-slate-400 font-bold uppercase">
              atau Buat Nama Kustom
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Tahapan
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Contoh: Spot UV, Sablon Manual, Pasang Handle"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Ikon Simbol
              </label>
              <select
                value={customIcon}
                onChange={(e) => setCustomIcon(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] bg-white text-slate-800"
              >
                <option value="Scissors">✂️ Scissors (Potong Bahan)</option>
                <option value="Printer">🖨️ Printer (Cetak Offset / Digital)</option>
                <option value="Layers">📄 Layers (Laminasi)</option>
                <option value="Waves">🌊 Waves (Gelombang / Corrugated)</option>
                <option value="BoxSelect">📦 Box Select (Pond / Die Cut)</option>
                <option value="Cog">⚙️ Cog (Finishing)</option>
                <option value="Sparkles">✨ Sparkles (Spot UV / Vernis Khusus)</option>
                <option value="Flame">🔥 Flame (Foil Hotprint)</option>
                <option value="Stamp">🔖 Stamp (Emboss / Deboss)</option>
                <option value="Hand">✋ Hand (Lem / Rakit Manual)</option>
                <option value="CheckSquare">✅ CheckSquare (Quality Control)</option>
                <option value="Package">📦 Package (Packing & Kemas)</option>
                <option value="Truck">🚚 Truck (Pengiriman)</option>
              </select>
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
              className="px-4 py-2 bg-[#2CA58D] hover:bg-[#238572] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer active:scale-95"
            >
              Tambahkan ke Rute
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

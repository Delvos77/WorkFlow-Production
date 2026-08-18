import React, { useState } from 'react';
import { X, Package, Plus } from 'lucide-react';

interface AddPackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOption: (optionName: string) => void;
}

export const AddPackingModal: React.FC<AddPackingModalProps> = ({
  isOpen,
  onClose,
  onAddOption,
}) => {
  if (!isOpen) return null;

  const [packingName, setPackingName] = useState('');

  const suggestions = [
    'Bubble Wrap -> Dus Master',
    'Ikat 100pcs -> Karung Plastik',
    'Plastik Shrink -> Dus -> Palet Kayu',
    'Dus Saja',
    'Plastik Vakum -> Karton Tebal',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packingName.trim()) {
      alert('Harap isi nama skema packing.');
      return;
    }
    onAddOption(packingName.trim());
    setPackingName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 border border-slate-100 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-[#2CA58D]">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">
              Tambah Opsi Packing Baru
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama / Skema Pengemasan
            </label>
            <input
              type="text"
              value={packingName}
              onChange={(e) => setPackingName(e.target.value)}
              placeholder="Contoh: Bubble Wrap -> Dus -> Palet Kayu"
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Atau pilih template cepat:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPackingName(s)}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 hover:text-[#2CA58D] hover:border-emerald-200 border border-slate-200 rounded-lg text-slate-600 text-[11px] font-medium transition cursor-pointer text-left"
                >
                  {s}
                </button>
              ))}
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
              Simpan Opsi Packing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

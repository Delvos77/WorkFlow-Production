import React, { useState } from 'react';
import { X, Bookmark, ArrowRight } from 'lucide-react';
import { RouteStep } from '../../types';

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSteps: RouteStep[];
  onSavePreset: (presetName: string) => void;
}

export const SavePresetModal: React.FC<SavePresetModalProps> = ({
  isOpen,
  onClose,
  currentSteps,
  onSavePreset,
}) => {
  if (!isOpen) return null;

  const [presetName, setPresetName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) {
      alert('Harap isi nama preset baru.');
      return;
    }
    onSavePreset(presetName.trim());
    setPresetName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 border border-slate-100 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Bookmark className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">
              Simpan Sebagai Preset Rute Baru
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
              Nama Template Preset
            </label>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Contoh: Hardbox E-Commerce, Kantong Kraft"
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800 font-semibold"
            />
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
            <p className="font-bold text-slate-700">
              Alur tahapan yang akan disimpan ({currentSteps.length} tahap):
            </p>
            <div className="flex flex-wrap items-center gap-1.5 max-h-32 overflow-y-auto custom-scrollbar">
              {currentSteps.map((step, idx) => (
                <div key={`preset-step-${idx}`} className="flex items-center gap-1.5">
                  <span className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-700 font-medium text-[11px]">
                    {step.name}
                  </span>
                  {idx < currentSteps.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                  )}
                </div>
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
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer active:scale-95"
            >
              Simpan Preset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

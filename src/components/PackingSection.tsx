import React from 'react';
import { Package, Plus, X, Check, Eye } from 'lucide-react';
import { UserRole } from '../types';

interface PackingSectionProps {
  packingOptions: string[];
  activePacking: string;
  userRole?: UserRole;
  onSelectPacking: (option: string) => void;
  onOpenAddPacking: () => void;
  onDeletePacking: (option: string, e: React.MouseEvent) => void;
}

export const PackingSection: React.FC<PackingSectionProps> = ({
  packingOptions,
  activePacking,
  userRole = 'moderator',
  onSelectPacking,
  onOpenAddPacking,
  onDeletePacking,
}) => {
  const isModerator = userRole === 'moderator';

  return (
    <div className="space-y-2 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-[#2CA58D]" />
          <span>Detail Opsi Packing</span>
        </h3>
        {isModerator ? (
          <button
            onClick={onOpenAddPacking}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#2CA58D] font-bold rounded-xl text-xs flex items-center gap-1 transition cursor-pointer border border-emerald-200 touch-manipulation active:scale-95"
          >
            <Plus className="w-3 h-3" />
            <span>Tambah Opsi</span>
          </button>
        ) : (
          <span className="text-[10px] text-slate-400 font-medium">Opsi Kemasan</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {packingOptions.map((option) => {
          const isActive = option === activePacking;
          return (
            <div
              key={option}
              onClick={() => isModerator && onSelectPacking(option)}
              className={`group relative p-3 rounded-2xl text-xs font-bold border transition text-center flex flex-col justify-center items-center select-none touch-manipulation ${
                isModerator ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'
              } ${
                isActive
                  ? 'bg-emerald-50/80 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {/* Delete Button (Moderator Only) */}
              {isModerator && packingOptions.length > 1 && (
                <button
                  onClick={(e) => onDeletePacking(option, e)}
                  title="Hapus opsi packing ini"
                  className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition shadow z-10 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              <div className="flex items-center gap-1.5 mb-0.5">
                {isActive && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
                <span className="leading-snug">{option}</span>
              </div>

              <span
                className={`text-[9px] font-medium ${
                  isActive ? 'text-emerald-700 font-bold' : 'text-slate-400'
                }`}
              >
                {isActive ? '(Aktif Digunakan)' : '(Tersedia)'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

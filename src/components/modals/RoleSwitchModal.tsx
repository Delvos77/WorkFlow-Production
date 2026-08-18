import React, { useState } from 'react';
import { Shield, Eye, Lock, Check, X, Smartphone, Monitor } from 'lucide-react';
import { UserRole } from '../../types';

interface RoleSwitchModalProps {
  isOpen: boolean;
  currentRole: UserRole;
  onClose: () => void;
  onSelectRole: (role: UserRole) => void;
}

export const RoleSwitchModal: React.FC<RoleSwitchModalProps> = ({
  isOpen,
  currentRole,
  onClose,
  onSelectRole,
}) => {
  if (!isOpen) return null;

  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    // If switching from spectator to moderator, we can optionally require a simple PIN (e.g. 1234) or allow direct switch
    if (selectedRole === 'moderator' && currentRole === 'spectator' && pinInput.trim() !== '') {
      if (pinInput.trim() !== '1234' && pinInput.trim() !== 'admin') {
        setErrorMsg('PIN Moderator salah (Gunakan PIN default: 1234)');
        return;
      }
    }

    onSelectRole(selectedRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 md:p-6 border border-slate-100 space-y-4">
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#2CA58D]/10 flex items-center justify-center text-[#2CA58D]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                Pilih Mode Hak Akses &amp; Tampilan
              </h3>
              <p className="text-xs text-slate-500">
                Atur izin akses untuk perangkat handphone / monitor
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

        {/* Role Options */}
        <form onSubmit={handleApply} className="space-y-3.5 text-xs">
          <div className="space-y-2.5">
            {/* 1. Moderator Role Option */}
            <div
              onClick={() => {
                setSelectedRole('moderator');
                setErrorMsg('');
              }}
              className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 select-none ${
                selectedRole === 'moderator'
                  ? 'border-[#2CA58D] bg-emerald-50/40 shadow-xs ring-2 ring-[#2CA58D]/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedRole === 'moderator'
                    ? 'bg-[#2CA58D] text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 text-xs md:text-sm flex items-center gap-1.5">
                    <span>Moderator / Operator</span>
                    <span className="text-[10px] px-2 py-0.2 bg-[#2CA58D] text-white rounded-full font-bold">
                      Akses Penuh
                    </span>
                  </h4>
                  {selectedRole === 'moderator' && (
                    <Check className="w-4 h-4 text-[#2CA58D] stroke-[3]" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Bisa mengedit SPK, memajukan status alur rute produksi, menambah/edit/hapus batch, input data packing, dan konfigurasi.
                </p>
              </div>
            </div>

            {/* 2. Spectator Role Option */}
            <div
              onClick={() => {
                setSelectedRole('spectator');
                setErrorMsg('');
              }}
              className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 select-none ${
                selectedRole === 'spectator'
                  ? 'border-[#2CA58D] bg-emerald-50/40 shadow-xs ring-2 ring-[#2CA58D]/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedRole === 'spectator'
                    ? 'bg-[#2CA58D] text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Eye className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 text-xs md:text-sm flex items-center gap-1.5">
                    <span>Spectator / Pengawas / Klien</span>
                    <span className="text-[10px] px-2 py-0.2 bg-slate-200 text-slate-700 rounded-full font-bold">
                      Read-Only (Hanya Lihat)
                    </span>
                  </h4>
                  {selectedRole === 'spectator' && (
                    <Check className="w-4 h-4 text-[#2CA58D] stroke-[3]" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Hanya bisa melihat laporan produksi, dashboard status, alur tahapan rute, dan tracking. Tidak bisa mengubah atau menghapus data.
                </p>
              </div>
            </div>
          </div>

          {/* Optional PIN Prompt if switching from Spectator to Moderator */}
          {selectedRole === 'moderator' && currentRole === 'spectator' && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 animate-fadeIn">
              <label className="font-bold text-slate-700 block flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>PIN Moderator (Opsional - Default: 1234)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Tekan lanjut jika tanpa PIN</span>
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Masukkan PIN 1234 atau kosongkan..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800 font-mono tracking-widest text-center font-bold text-sm"
              />
              {errorMsg && (
                <p className="text-[11px] text-red-600 font-bold text-center">
                  {errorMsg}
                </p>
              )}
            </div>
          )}

          {/* Device notice */}
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Mode ini tersimpan di browser perangkat ini secara otomatis.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
              <span>Terapkan Mode Akses</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

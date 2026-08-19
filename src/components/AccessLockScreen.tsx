import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  KeyRound,
  Delete,
  CheckCircle2,
} from 'lucide-react';
import { SecurityConfig, UserRole } from '../types';

interface AccessLockScreenProps {
  securityConfig: SecurityConfig;
  onUnlockSuccess: (role: UserRole) => void;
  onShowNotification?: (type: 'synced' | 'error', title: string, desc: string) => void;
}

export const AccessLockScreen: React.FC<AccessLockScreenProps> = ({
  securityConfig,
  onUnlockSuccess,
  onShowNotification,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input automatically
    inputRef.current?.focus();
  }, []);

  const handleKeyPress = (digit: string) => {
    if (pin.length < 8) {
      setErrorMsg('');
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setErrorMsg('');
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setErrorMsg('');
    setPin('');
    inputRef.current?.focus();
  };

  const handleVerify = (inputPin: string = pin) => {
    const trimmed = inputPin.trim();
    if (!trimmed) {
      setErrorMsg('Silakan masukkan PIN akses.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    // Verification check
    const internalPin = securityConfig.internalPin || '1234';
    const moderatorPin = securityConfig.moderatorPin || '8899';

    setTimeout(() => {
      if (trimmed === moderatorPin) {
        // Unlocks directly as Moderator
        setIsSuccess(true);
        if (onShowNotification) {
          onShowNotification(
            'synced',
            'Akses Terbuka: Moderator',
            'Selamat datang! Anda masuk dengan Hak Akses Moderator (Penuh).'
          );
        }
        setTimeout(() => {
          onUnlockSuccess('moderator');
        }, 500);
      } else if (trimmed === internalPin) {
        // Unlocks as Spectator
        setIsSuccess(true);
        if (onShowNotification) {
          onShowNotification(
            'synced',
            'Akses Terbuka: Internal',
            'Aplikasi terbuka dalam Mode Spectator (Hanya Pantau).'
          );
        }
        setTimeout(() => {
          onUnlockSuccess('spectator');
        }, 500);
      } else {
        setIsSubmitting(false);
        setErrorMsg('PIN yang Anda masukkan salah. Hubungi admin internal jika lupa.');
      }
    }, 250);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Subtle Background Glow Elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#2CA58D]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Lock Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 z-10 flex flex-col items-center">
        {/* Animated Icon */}
        <div className="relative mb-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${
              isSuccess
                ? 'bg-emerald-500 text-white scale-110'
                : 'bg-linear-to-br from-[#2CA58D] to-teal-700 text-white'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            ) : (
              <Lock className="w-8 h-8" />
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
          </span>
        </div>

        {/* Title and Badge */}
        <h1 className="text-xl sm:text-2xl font-black text-white text-center tracking-tight mb-1">
          Workflow Produksi & Packing
        </h1>
        <p className="text-xs text-slate-400 text-center mb-3">
          Sistem Manajemen Alur Rute & Pemantauan SPK
        </p>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Akses Terkunci • Khusus Pihak Internal</span>
        </div>

        {/* Subtitle instructions */}
        <p className="text-xs text-slate-300 text-center mb-5 leading-relaxed">
          Silakan masukkan <span className="font-bold text-white">PIN Akses Internal</span> untuk membuka aplikasi di perangkat ini.
        </p>

        {/* PIN Form */}
        <form onSubmit={handleFormSubmit} className="w-full">
          {/* PIN Input with Eye Toggle */}
          <div className="relative mb-3">
            <input
              ref={inputRef}
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setPin(val);
                setErrorMsg('');
              }}
              placeholder="Masukkan PIN Akses..."
              className="w-full bg-slate-800/90 border border-slate-700 focus:border-[#2CA58D] focus:ring-2 focus:ring-[#2CA58D]/40 text-center text-xl tracking-widest font-mono text-white rounded-2xl py-3 px-12 transition outline-hidden placeholder:text-slate-500 placeholder:text-xs placeholder:tracking-normal placeholder:font-sans"
            />
            <div className="absolute left-4 top-3.5 text-slate-500">
              <KeyRound className="w-5 h-5" />
            </div>
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              title={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-950/40 border border-rose-800/60 p-2.5 rounded-xl mb-3 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Keypad for Touch / Mobile Screens */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num.toString())}
                className="py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-mono text-lg font-bold rounded-xl border border-slate-700/80 transition cursor-pointer touch-manipulation shadow-xs active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-3 bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-bold text-xs rounded-xl border border-slate-800 transition cursor-pointer active:scale-95"
            >
              HAPUS
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-mono text-lg font-bold rounded-xl border border-slate-700/80 transition cursor-pointer touch-manipulation shadow-xs active:scale-95"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-3 bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center rounded-xl border border-slate-800 transition cursor-pointer active:scale-95"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Submit Unlock Button */}
          <button
            type="submit"
            disabled={isSubmitting || !pin}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition shadow-lg cursor-pointer active:scale-98 ${
              pin
                ? 'bg-linear-to-r from-[#2CA58D] to-teal-600 hover:from-teal-600 hover:to-[#2CA58D] shadow-teal-900/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Memverifikasi...</span>
              </div>
            ) : isSuccess ? (
              <div className="flex items-center gap-2 text-white">
                <Unlock className="w-4 h-4" />
                <span>Berhasil Membuka!</span>
              </div>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>Buka Akses Aplikasi</span>
              </>
            )}
          </button>
        </form>

        {/* Security Help / Default Hint for Operator */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 w-full text-center">
          <p className="text-[11px] text-slate-500">
            💡 <span className="font-semibold text-slate-400">PIN Standar Internal:</span> <code className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">1234</code> (Staff) • <code className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">8899</code> (Moderator)
          </p>
          <p className="text-[10px] text-slate-600 mt-1">
            PIN dapat diubah kapan saja oleh Moderator di menu Pengaturan.
          </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Workflow Produksi & Packaging • Akses Aman Terenkripsi
      </div>
    </div>
  );
};

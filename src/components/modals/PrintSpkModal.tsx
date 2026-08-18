import React from 'react';
import { X, Printer, CheckSquare, Layers, Box, Check } from 'lucide-react';
import { JobSPK } from '../../types';

interface PrintSpkModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobSPK | null;
}

export const PrintSpkModal: React.FC<PrintSpkModalProps> = ({
  isOpen,
  onClose,
  job,
}) => {
  if (!isOpen || !job) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 max-h-[95vh] overflow-y-auto custom-scrollbar">
        {/* Header Controls (Hidden on paper print) */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#2CA58D]" />
            <h3 className="font-extrabold text-slate-800 text-base">
              Pratinjau Lembar Kerja SPK Cetak
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#2CA58D] hover:bg-[#238572] text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable SPK Sheet Container */}
        <div className="p-6 border-2 border-slate-800 rounded-2xl text-slate-900 bg-white space-y-5 print:border-none print:p-0">
          {/* SPK Title Header */}
          <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase">
                SURAT PERINTAH KERJA (SPK)
              </h1>
              <p className="text-xs text-slate-600">
                Divisi Produksi Percetakan, Packaging & Finishing
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-slate-900 border-2 border-slate-800 px-3 py-1 rounded-lg inline-block">
                {job.id}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Tanggal: {job.createdAt}</p>
            </div>
          </div>

          {/* Job Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-300 pb-3">
            <div>
              <span className="font-bold text-slate-500 block">Nama Pekerjaan / SPK:</span>
              <span className="text-sm font-black text-slate-900">{job.title}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Customer / Pemesan:</span>
              <span className="text-sm font-black text-slate-900">{job.customer || '-'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Material Bahan Baku:</span>
              <span className="font-bold text-slate-900">{job.material}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Warna Cetak:</span>
              <span className="font-bold text-slate-900">{job.print}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Laminasi:</span>
              <span className="font-bold text-slate-900">{job.lamination || 'Tanpa'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Ukuran Jadi:</span>
              <span className="font-bold text-slate-900">{job.size}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Target Kuantitas:</span>
              <span className="text-sm font-black text-slate-900">
                {job.targetQty.toLocaleString()} pcs
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Skema Packing:</span>
              <span className="font-bold text-slate-900">{job.activePacking}</span>
            </div>
          </div>

          {/* Production Route Checklist */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
              JALUR TAHAPAN PRODUKSI:
            </h4>
            <div className="space-y-1.5">
              {job.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border border-slate-300 px-3 py-2 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md border border-slate-400 flex items-center justify-center font-bold text-[10px]">
                      {step.status === 'completed' ? '✓' : idx + 1}
                    </span>
                    <span className="font-bold">{step.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="text-slate-500">
                      Status: <strong className="uppercase">{step.status}</strong>
                    </span>
                    <span className="inline-block w-24 border-b border-dashed border-slate-400 text-center text-[10px] text-slate-400">
                      Paraf Operator
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {job.notes && (
            <div className="border border-slate-300 p-2.5 rounded-xl text-xs">
              <span className="font-black text-slate-700 block">Instruksi Khusus:</span>
              <p className="text-slate-800">{job.notes}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-6 text-center text-xs">
            <div>
              <p className="font-bold text-slate-600 mb-10">Dibuat Oleh (Admin)</p>
              <div className="border-t border-slate-400 mx-4 pt-1 font-bold">( .................... )</div>
            </div>
            <div>
              <p className="font-bold text-slate-600 mb-10">Kepala Produksi</p>
              <div className="border-t border-slate-400 mx-4 pt-1 font-bold">( .................... )</div>
            </div>
            <div>
              <p className="font-bold text-slate-600 mb-10">QC / Packing</p>
              <div className="border-t border-slate-400 mx-4 pt-1 font-bold">( .................... )</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

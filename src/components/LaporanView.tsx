import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  Boxes,
  Truck,
  Layers,
  Search,
  Check,
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  User,
  Calendar,
} from 'lucide-react';
import { JobSPK, ProductionBatch } from '../types';
import { renderStepIcon } from '../utils/iconMap';

interface LaporanViewProps {
  jobs: JobSPK[];
  onSelectJob: (id: string) => void;
}

export const LaporanView: React.FC<LaporanViewProps> = ({ jobs, onSelectJob }) => {
  const [selectedSpkId, setSelectedSpkId] = useState<string>(
    jobs.length > 0 ? jobs[0].id : ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');

  // Filter jobs based on search term
  const filteredJobs = jobs.filter((job) => {
    return (
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.customer && job.customer.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Current active job for single SPK report view
  const activeJob =
    filteredJobs.find((j) => j.id === selectedSpkId) ||
    filteredJobs[0] ||
    jobs[0] ||
    null;

  if (jobs.length === 0) {
    return (
      <section className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <FileText className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-700">Belum ada data SPK</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Buat SPK baru di tab &quot;Jobs &amp; Rute&quot; untuk melihat laporan status produksi, material, dan pengiriman per SPK.
        </p>
      </section>
    );
  }

  // Helper variables for active job
  const activeTarget = activeJob ? activeJob.targetQty || 0 : 0;
  const activeCompleted = activeJob ? activeJob.completedQty || 0 : 0;
  const activePacked = activeJob ? activeJob.packedQty || 0 : 0;
  const activeShipped = activeJob ? activeJob.shippedQty || 0 : 0;
  const activeRemaining = Math.max(0, activeTarget - activeCompleted);
  const activeCompletedSteps = activeJob
    ? activeJob.steps.filter((s) => s.status === 'completed').length
    : 0;
  const activeTotalSteps = activeJob ? activeJob.steps.length : 0;

  const activeBatches: ProductionBatch[] =
    activeJob && activeJob.batches && activeJob.batches.length > 0
      ? activeJob.batches
      : activeJob
      ? [
          {
            id: `batch-${activeJob.id}-default`,
            batchName: 'Batch 1 (Utama)',
            targetQty: activeJob.targetQty,
            completedQty: activeJob.completedQty,
            status:
              activeJob.completedQty >= activeJob.targetQty
                ? 'completed'
                : 'in-progress',
            steps: activeJob.steps,
            createdAt: activeJob.createdAt,
          },
        ]
      : [];

  const totalAllocated = activeBatches.reduce((acc, b) => acc + (b.targetQty || 0), 0);
  const remainingToSchedule = activeJob
    ? Math.max(0, activeJob.targetQty - totalAllocated)
    : 0;

  return (
    <section className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 flex flex-col space-y-5 shadow-xs">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#2CA58D]" />
            <span>Laporan Status &amp; Alur Parsial Per SPK</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan individual per surat perintah kerja, alur batch parsial, material, dan pengiriman.
          </p>
        </div>

        {/* View Controls & Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari SPK..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-700 w-36 sm:w-48"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                viewMode === 'single'
                  ? 'bg-white text-slate-800 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Fokus 1 SPK
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-white text-slate-800 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Semua SPK
            </button>
          </div>
        </div>
      </div>

      {/* SPK Selector Carousel / Tab Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <SlidersHorizontal className="w-3 h-3" />
          <span>Pilih SPK:</span>
        </span>
        {filteredJobs.map((job) => {
          const isSelected = activeJob?.id === job.id;
          const completedSteps = job.steps.filter((s) => s.status === 'completed').length;
          const isDone =
            job.steps.length > 0 &&
            completedSteps === job.steps.length &&
            job.completedQty >= job.targetQty;

          return (
            <button
              key={job.id}
              onClick={() => {
                setSelectedSpkId(job.id);
                if (viewMode === 'all') setViewMode('single');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-2 border cursor-pointer ${
                isSelected
                  ? 'bg-[#2CA58D] text-white border-[#207a68] shadow-xs scale-105'
                  : isDone
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{job.id}</span>
              <span className="text-[10px] opacity-85 truncate max-w-[110px]">
                {job.title.includes(': ') ? job.title.split(': ')[1] : job.title}
              </span>
              {isDone ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* SINGLE SPK REPORT VIEW */}
      {viewMode === 'single' && activeJob && (
        <div className="space-y-4">
          {/* Individual SPK Header Card */}
          <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-[#2CA58D] text-white text-xs font-black rounded-md">
                  {activeJob.id}
                </span>
                <h3 className="text-base font-extrabold text-slate-800">
                  {activeJob.title.includes(': ') ? activeJob.title.split(': ')[1] : activeJob.title}
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5">
                {activeJob.customer && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <strong>Customer:</strong> {activeJob.customer}
                  </span>
                )}
                <span>
                  <strong>Bahan:</strong> {activeJob.material}
                </span>
                <span>
                  <strong>Cetak:</strong> {activeJob.print}
                </span>
                <span>
                  <strong>Ukuran:</strong> {activeJob.size}
                </span>
                {activeJob.dueDate && (
                  <span className="flex items-center gap-1 text-amber-700 font-semibold">
                    <Calendar className="w-3 h-3 text-amber-600" />
                    Deadline: {activeJob.dueDate}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => onSelectJob(activeJob.id)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer"
            >
              <span>Buka di Tab Jobs &amp; Rute</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* 6 INDIVIDUAL METRIC TILES FOR THIS SPK */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Target Order */}
            <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 text-center">
              <p className="text-[11px] text-blue-700 font-semibold">Target Order</p>
              <p className="text-lg md:text-xl font-black text-blue-900 mt-0.5">
                {activeTarget.toLocaleString()}
              </p>
              <span className="text-[9px] text-blue-600">Total Kuantitas Pcs</span>
            </div>

            {/* 2. Selesai Finishing */}
            <div className="p-3.5 bg-teal-50/80 rounded-2xl border border-teal-200 text-center">
              <p className="text-[11px] text-teal-700 font-semibold">Selesai Finishing</p>
              <p className="text-lg md:text-xl font-black text-teal-900 mt-0.5">
                {activeCompleted.toLocaleString()}
              </p>
              <span className="text-[9px] text-teal-600 font-bold">
                {activeTarget > 0 ? Math.round((activeCompleted / activeTarget) * 100) : 0}% Target
              </span>
            </div>

            {/* 3. Sudah Di-Packing */}
            <div className="p-3.5 bg-indigo-50/80 rounded-2xl border border-indigo-200 text-center">
              <p className="text-[11px] text-indigo-700 font-semibold">Sudah Di-Packing</p>
              <p className="text-lg md:text-xl font-black text-indigo-900 mt-0.5">
                {activePacked.toLocaleString()}
              </p>
              <span className="text-[9px] text-indigo-600">Siap Masuk Truk</span>
            </div>

            {/* 4. Sudah Dikirim */}
            <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-center">
              <p className="text-[11px] text-emerald-700 font-semibold">Sudah Dikirim</p>
              <p className="text-lg md:text-xl font-black text-emerald-900 mt-0.5">
                {activeShipped.toLocaleString()}
              </p>
              <span className="text-[9px] text-emerald-600 font-bold">
                {activeTarget > 0 ? Math.round((activeShipped / activeTarget) * 100) : 0}% Terkirim
              </span>
            </div>

            {/* 5. Sisa Belum Selesai */}
            <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-center">
              <p className="text-[11px] text-amber-700 font-semibold">Sisa Finishing</p>
              <p className="text-lg md:text-xl font-black text-amber-900 mt-0.5">
                {activeRemaining.toLocaleString()}
              </p>
              <span className="text-[9px] text-amber-600">
                {activeRemaining === 0 ? '✓ Selesai Penuh' : 'Dalam Antrean'}
              </span>
            </div>

            {/* 6. Progress Rute Tahapan */}
            <div className="p-3.5 bg-purple-50/80 rounded-2xl border border-purple-200 text-center">
              <p className="text-[11px] text-purple-700 font-semibold">Alur Tahapan</p>
              <p className="text-lg md:text-xl font-black text-purple-900 mt-0.5">
                {activeCompletedSteps} / {activeTotalSteps}
              </p>
              <span className="text-[9px] text-purple-600 font-bold">
                {activeTotalSteps > 0
                  ? Math.round((activeCompletedSteps / activeTotalSteps) * 100)
                  : 0}
                % Rute
              </span>
            </div>
          </div>

          {/* LAPORAN KHUSUS: BREAKDOWN BATCH & RUTE PRODUKSI PARSIAL */}
          <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2CA58D]" />
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Laporan Alur Rute &amp; Batch Produksi Parsial ({activeBatches.length} Batch)
                </h4>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">
                  Total Terjadwal: <strong>{totalAllocated.toLocaleString()}</strong> /{' '}
                  <strong>{activeTarget.toLocaleString()} pcs</strong>
                </span>
                {remainingToSchedule > 0 ? (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-lg font-bold">
                    Kurang {remainingToSchedule.toLocaleString()} pcs untuk dibuat rute baru
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg font-bold">
                    ✓ 100% Terjadwal
                  </span>
                )}
              </div>
            </div>

            {/* Cards for each batch */}
            <div className="space-y-3">
              {activeBatches.map((batch, bIdx) => {
                const doneCount = batch.steps.filter((s) => s.status === 'completed').length;
                const totalCount = batch.steps.length;
                const isBatchCompleted = totalCount > 0 && doneCount === totalCount;

                return (
                  <div
                    key={batch.id || `batch-${bIdx}`}
                    className={`p-3.5 rounded-2xl border transition ${
                      isBatchCompleted
                        ? 'bg-white border-emerald-300 shadow-2xs'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Batch Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isBatchCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {bIdx + 1}
                        </span>
                        <span className="font-extrabold text-slate-800 text-xs md:text-sm">
                          {batch.batchName}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-black rounded-lg border border-slate-200">
                          {batch.targetQty.toLocaleString()} pcs
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                            isBatchCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}
                        >
                          {isBatchCompleted ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Selesai Penuh (100%)</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Sedang Berjalan ({doneCount}/{totalCount} Tahap)</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Batch Step Timeline */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 custom-scrollbar">
                      {batch.steps.map((step, sIdx) => {
                        const isStepDone = step.status === 'completed';
                        const isStepRunning = step.status === 'in-progress';

                        return (
                          <div
                            key={step.id || `step-${sIdx}`}
                            className={`p-2 rounded-xl border text-[11px] min-w-[110px] text-center space-y-0.5 shrink-0 ${
                              isStepDone
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium'
                                : isStepRunning
                                ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-300/40 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-center mb-1">
                              {renderStepIcon(step.icon, {
                                className: `w-3.5 h-3.5 ${
                                  isStepDone
                                    ? 'text-emerald-600'
                                    : isStepRunning
                                    ? 'text-amber-600'
                                    : 'text-slate-400'
                                }`,
                              })}
                            </div>
                            <p className="truncate font-semibold">{step.name}</p>
                            <span
                              className={`text-[9px] font-bold block ${
                                isStepDone
                                  ? 'text-emerald-700'
                                  : isStepRunning
                                  ? 'text-amber-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {isStepDone ? '✓ Selesai' : isStepRunning ? '● Proses' : 'Pending'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Bar Ganda Untuk SPK Ini */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            {/* Kuantitas Finishing Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Progres Fisik Selesai Finishing</span>
                </span>
                <span className="font-extrabold text-emerald-800">
                  {activeJob.completedQty.toLocaleString()} / {activeJob.targetQty.toLocaleString()} pcs (
                  {activeJob.targetQty > 0
                    ? Math.round((activeJob.completedQty / activeJob.targetQty) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#2CA58D] to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      activeJob.targetQty > 0
                        ? (activeJob.completedQty / activeJob.targetQty) * 100
                        : 0,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Rute Stepper Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>Progres Alur Rute Produksi Utama</span>
                </span>
                <span className="font-extrabold text-amber-800">
                  {activeJob.steps.filter((s) => s.status === 'completed').length} dari{' '}
                  {activeJob.steps.length} Tahap (
                  {activeJob.steps.length > 0
                    ? Math.round(
                        (activeJob.steps.filter((s) => s.status === 'completed').length /
                          activeJob.steps.length) *
                          100
                      )
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      activeJob.steps.length > 0
                        ? (activeJob.steps.filter((s) => s.status === 'completed').length /
                            activeJob.steps.length) *
                            100
                        : 0,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Material & Shipment Grid Per SPK */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pengiriman Parsial SPK Ini */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-sky-600" />
                <span>Distribusi & Pengiriman Parsial SPK {activeJob.id}:</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-emerald-100/70 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 block">✓ Sudah Dikirim</span>
                  <p className="text-sm font-black text-emerald-950 mt-0.5">
                    {activeJob.shippedQty.toLocaleString()} pcs
                  </p>
                  <span className="text-[9px] text-emerald-700">
                    {activeJob.targetQty > 0
                      ? Math.round((activeJob.shippedQty / activeJob.targetQty) * 100)
                      : 0}
                    % target
                  </span>
                </div>

                <div className="p-2 bg-blue-100/70 rounded-xl border border-blue-200">
                  <span className="text-[10px] font-bold text-blue-800 block">📦 Packed (Siap Kirim)</span>
                  <p className="text-sm font-black text-blue-950 mt-0.5">
                    {Math.max(0, activeJob.packedQty - activeJob.shippedQty).toLocaleString()} pcs
                  </p>
                  <span className="text-[9px] text-blue-700">Di gudang packing</span>
                </div>

                <div className="p-2 bg-amber-100/70 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-800 block">⏳ Selesai (Belum Pack)</span>
                  <p className="text-sm font-black text-amber-950 mt-0.5">
                    {Math.max(0, activeJob.completedQty - activeJob.packedQty).toLocaleString()} pcs
                  </p>
                  <span className="text-[9px] text-amber-700">Menunggu dikemas</span>
                </div>

                <div className="p-2 bg-slate-200/80 rounded-xl border border-slate-300">
                  <span className="text-[10px] font-bold text-slate-700 block">🔄 Belum Selesai</span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">
                    {Math.max(0, activeJob.targetQty - activeJob.completedQty).toLocaleString()} pcs
                  </p>
                  <span className="text-[9px] text-slate-600">Sisa antrean mesin</span>
                </div>
              </div>
            </div>

            {/* Penggunaan Bahan Baku SPK Ini */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-amber-600" />
                <span>Bahan Baku SPK {activeJob.id} ({activeJob.materials?.length || 0} Item):</span>
              </h4>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {activeJob.materials && activeJob.materials.length > 0 ? (
                  activeJob.materials.map((mat, i) => {
                    const diff = mat.orderedQty - mat.usedQty;
                    const percentUsed =
                      mat.orderedQty > 0 ? Math.round((mat.usedQty / mat.orderedQty) * 100) : 0;

                    let statusClass = 'bg-blue-50 border-blue-200 text-blue-900';
                    let statusLabel = `Sisa ${diff.toLocaleString()}`;

                    if (diff === 0 && mat.orderedQty > 0) {
                      statusClass = 'bg-emerald-50 border-emerald-200 text-emerald-900';
                      statusLabel = 'Pas';
                    } else if (diff < 0) {
                      statusClass = 'bg-red-50 border-red-200 text-red-900';
                      statusLabel = `Kurang ${Math.abs(diff).toLocaleString()}`;
                    }

                    return (
                      <div
                        key={mat.id || `mat-${i}`}
                        className={`p-2 rounded-xl border text-xs space-y-1 ${statusClass}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold">{mat.name}</span>
                          <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-white border border-current/20">
                            {statusLabel} {mat.unit || 'unit'}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] opacity-80">
                          <span>Dipesan: {mat.orderedQty.toLocaleString()}</span>
                          <span>Terpakai: {mat.usedQty.toLocaleString()}</span>
                          <span>{percentUsed}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(percentUsed, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    Belum ada data bahan baku tercatat.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALL SPK CARDS (EACH WITH ITS OWN INDIVIDUAL METRICS) */}
      {viewMode === 'all' && (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const target = job.targetQty || 0;
            const completed = job.completedQty || 0;
            const packed = job.packedQty || 0;
            const shipped = job.shippedQty || 0;
            const remaining = Math.max(0, target - completed);
            const completedSteps = job.steps.filter((s) => s.status === 'completed').length;
            const totalSteps = job.steps.length;

            return (
              <div
                key={job.id}
                className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-[#2CA58D] text-white text-xs font-black rounded-lg">
                      {job.id}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-800">
                      {job.title.includes(': ') ? job.title.split(': ')[1] : job.title}
                    </h3>
                    {job.customer && (
                      <span className="text-xs text-slate-500 font-medium">
                        ({job.customer})
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSpkId(job.id);
                      setViewMode('single');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center gap-1 cursor-pointer self-start sm:self-center"
                  >
                    <span>Fokus Laporan</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>

                {/* 6 Individual Metric Tiles for this SPK */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-center">
                    <span className="text-[10px] text-blue-700 font-semibold block">Target</span>
                    <p className="text-base font-black text-blue-900">{target.toLocaleString()}</p>
                    <span className="text-[9px] text-blue-600">pcs</span>
                  </div>

                  <div className="p-2.5 bg-teal-50 rounded-xl border border-teal-200 text-center">
                    <span className="text-[10px] text-teal-700 font-semibold block">Finishing</span>
                    <p className="text-base font-black text-teal-900">{completed.toLocaleString()}</p>
                    <span className="text-[9px] text-teal-600 font-bold">
                      {target > 0 ? Math.round((completed / target) * 100) : 0}%
                    </span>
                  </div>

                  <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-200 text-center">
                    <span className="text-[10px] text-indigo-700 font-semibold block">Packed</span>
                    <p className="text-base font-black text-indigo-900">{packed.toLocaleString()}</p>
                    <span className="text-[9px] text-indigo-600">siap kirim</span>
                  </div>

                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                    <span className="text-[10px] text-emerald-700 font-semibold block">Dikirim</span>
                    <p className="text-base font-black text-emerald-900">{shipped.toLocaleString()}</p>
                    <span className="text-[9px] text-emerald-600 font-bold">
                      {target > 0 ? Math.round((shipped / target) * 100) : 0}%
                    </span>
                  </div>

                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-center">
                    <span className="text-[10px] text-amber-700 font-semibold block">Sisa</span>
                    <p className="text-base font-black text-amber-900">{remaining.toLocaleString()}</p>
                    <span className="text-[9px] text-amber-600">pcs</span>
                  </div>

                  <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-center">
                    <span className="text-[10px] text-purple-700 font-semibold block">Rute</span>
                    <p className="text-base font-black text-purple-900">
                      {completedSteps}/{totalSteps}
                    </p>
                    <span className="text-[9px] text-purple-600 font-bold">
                      {totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#2CA58D] to-emerald-500 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(target > 0 ? (completed / target) * 100 : 0, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

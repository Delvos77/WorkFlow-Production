import React, { useState } from 'react';
import {
  Bookmark,
  Plus,
  ArrowRight,
  Check,
  RotateCcw,
  GripVertical,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit3,
  Eye,
} from 'lucide-react';
import { JobSPK, RouteStep, RoutePresetsMap, ProductionBatch, UserRole } from '../types';
import { renderStepIcon } from '../utils/iconMap';
import confetti from 'canvas-confetti';

interface RouteStepperProps {
  job: JobSPK;
  presets: RoutePresetsMap;
  userRole?: UserRole;
  onUpdateSteps: (newSteps: RouteStep[], batchId?: string) => void;
  onApplyPreset: (presetKey: string) => void;
  onOpenSavePreset: () => void;
  onOpenAddStep: () => void;
  onOpenAddBatch: () => void;
  onOpenEditBatch: (batch: ProductionBatch) => void;
  onOpenDeleteBatch: (batch: ProductionBatch) => void;
  onSelectBatch: (batchId: string) => void;
}

export const RouteStepper: React.FC<RouteStepperProps> = ({
  job,
  presets,
  userRole = 'moderator',
  onUpdateSteps,
  onApplyPreset,
  onOpenSavePreset,
  onOpenAddStep,
  onOpenAddBatch,
  onOpenEditBatch,
  onOpenDeleteBatch,
  onSelectBatch,
}) => {
  const isModerator = userRole === 'moderator';
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Normalize batches: if job has batches, use them; otherwise create standard virtual single batch
  const batches: ProductionBatch[] =
    job.batches && job.batches.length > 0
      ? job.batches
      : [
          {
            id: `batch-${job.id}-1`,
            batchName: 'Batch 1 (Utama)',
            targetQty: job.targetQty,
            completedQty: job.completedQty || 0,
            status:
              job.steps.every((s) => s.status === 'completed') &&
              job.completedQty >= job.targetQty
                ? 'completed'
                : 'in-progress',
            steps: job.steps,
            createdAt: job.createdAt,
          },
        ];

  // Active batch
  const activeBatchId = job.activeBatchId || batches[0].id;
  const activeBatch = batches.find((b) => b.id === activeBatchId) || batches[0];
  const activeSteps = activeBatch.steps || job.steps;

  // Batch allocations calculations
  const totalAllocatedQty = batches.reduce((acc, b) => acc + (b.targetQty || 0), 0);
  const remainingUnallocatedQty = Math.max(0, job.targetQty - totalAllocatedQty);
  const excessQty = totalAllocatedQty > job.targetQty ? totalAllocatedQty - job.targetQty : 0;

  // Complete step at index and progress to next in active batch (Moderator only)
  const handleCompleteStep = (index: number) => {
    if (!isModerator) return;
    const updatedSteps = activeSteps.map((step, idx) => {
      if (idx === index) {
        return { ...step, status: 'completed' as const, completedAt: new Date().toISOString() };
      }
      if (idx === index + 1 && step.status === 'pending') {
        return { ...step, status: 'in-progress' as const };
      }
      return step;
    });

    onUpdateSteps(updatedSteps, activeBatch.id);

    // If this was the last step in this batch
    if (index === activeSteps.length - 1) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  };

  // Toggle step status directly (Moderator only)
  const handleToggleStepStatus = (index: number) => {
    if (!isModerator) return;
    const current = activeSteps[index].status;
    let nextStatus: 'pending' | 'in-progress' | 'completed' = 'pending';
    if (current === 'pending') nextStatus = 'in-progress';
    else if (current === 'in-progress') nextStatus = 'completed';
    else if (current === 'completed') nextStatus = 'pending';

    const updated = [...activeSteps];
    updated[index] = { ...updated[index], status: nextStatus };
    onUpdateSteps(updated, activeBatch.id);
  };

  // Reset entire route for active batch
  const handleResetRoute = () => {
    if (!isModerator) return;
    if (
      confirm(
        `Kembalikan semua tahapan ${activeBatch.batchName} ke awal (tahap pertama in-progress)?`
      )
    ) {
      const reset = activeSteps.map((step, idx) => ({
        ...step,
        status: idx === 0 ? ('in-progress' as const) : ('pending' as const),
      }));
      onUpdateSteps(reset, activeBatch.id);
    }
  };

  // Delete single step in active batch
  const handleDeleteStep = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isModerator) return;
    if (activeSteps.length <= 1) {
      alert('Rute minimal harus memiliki 1 tahapan produksi.');
      return;
    }
    const filtered = activeSteps.filter((_, idx) => idx !== index);
    onUpdateSteps(filtered, activeBatch.id);
  };

  // Move step left / right for tactile mobile controls
  const handleMoveStep = (fromIndex: number, direction: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isModerator) return;
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= activeSteps.length) return;

    const reordered = [...activeSteps];
    const item = reordered.splice(fromIndex, 1)[0];
    reordered.splice(toIndex, 0, item);
    onUpdateSteps(reordered, activeBatch.id);
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isModerator) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isModerator) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    if (!isModerator) return;
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const reordered = [...activeSteps];
    const movedItem = reordered.splice(draggedIndex, 1)[0];
    reordered.splice(targetIndex, 0, movedItem);
    setDraggedIndex(null);
    onUpdateSteps(reordered, activeBatch.id);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
      {/* 1. BATCH PRODUKSI PARSIAL SELECTOR & MANAGEMENT BAR */}
      <div className="space-y-2.5 pb-2.5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2CA58D]" />
            <h4 className="text-xs font-black text-slate-800 tracking-wide uppercase">
              Alur Rute &amp; Batch Produksi
            </h4>
            <span className="text-[10px] font-bold bg-[#2CA58D]/10 text-[#207a68] px-2 py-0.5 rounded-full">
              {batches.length} Batch
            </span>
          </div>

          {/* Batch Actions for Moderator or Read-Only Notice for Spectator */}
          {isModerator ? (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={onOpenAddBatch}
                className="px-3 py-1.5 bg-[#2CA58D] hover:bg-[#238572] text-white font-bold text-xs rounded-xl transition shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 touch-manipulation"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Batch Rute</span>
              </button>
            </div>
          ) : (
            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-lg font-medium flex items-center gap-1">
              <Eye className="w-3 h-3 text-slate-400" />
              <span>Mode Spectator (Read-Only)</span>
            </span>
          )}
        </div>

        {/* Batch Pills List with Inline Edit & Delete Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 custom-scrollbar">
          {batches.map((b) => {
            const isCurrentBatch = b.id === activeBatch.id;
            const completedCount = b.steps.filter((s) => s.status === 'completed').length;
            const isBatchDone =
              b.steps.length > 0 && completedCount === b.steps.length;

            return (
              <div
                key={b.id}
                onClick={() => onSelectBatch(b.id)}
                className={`group px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer select-none touch-manipulation active:scale-[0.98] ${
                  isCurrentBatch
                    ? 'bg-[#2CA58D] text-white border-[#207a68] shadow-xs'
                    : isBatchDone
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{b.batchName}</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                    isCurrentBatch
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {b.targetQty.toLocaleString()} pcs
                </span>

                {isBatchDone ? (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      isCurrentBatch ? 'text-emerald-200' : 'text-emerald-600'
                    }`}
                  />
                ) : (
                  <span
                    className={`text-[10px] opacity-85 ${
                      isCurrentBatch ? 'text-amber-200' : 'text-amber-600'
                    }`}
                  >
                    ({completedCount}/{b.steps.length})
                  </span>
                )}

                {/* Edit Batch button (Moderator Only) */}
                {isModerator && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEditBatch(b);
                    }}
                    title="Edit kuantitas atau nama batch ini"
                    className={`p-1 rounded-md transition cursor-pointer touch-manipulation ${
                      isCurrentBatch
                        ? 'hover:bg-white/20 text-white'
                        : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}

                {/* Delete batch button (Moderator Only & if > 1 batch) */}
                {isModerator && batches.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDeleteBatch(b);
                    }}
                    title="Hapus batch ini"
                    className={`p-1 rounded-md transition cursor-pointer touch-manipulation ${
                      isCurrentBatch
                        ? 'hover:bg-red-500/80 text-white'
                        : 'hover:bg-red-100 text-slate-400 hover:text-red-600'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Quick Add Button if there is remaining unallocated qty (Moderator Only) */}
          {isModerator && remainingUnallocatedQty > 0 && (
            <button
              onClick={onOpenAddBatch}
              className="px-3 py-1.5 rounded-xl border border-dashed border-amber-400 bg-amber-50/80 text-amber-900 text-xs font-bold hover:bg-amber-100 transition flex items-center gap-1.5 shrink-0 cursor-pointer animate-pulse touch-manipulation"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>
                + Buat Alur Sisa ({remainingUnallocatedQty.toLocaleString()} pcs)
              </span>
            </button>
          )}
        </div>

        {/* Informational Sub-Bar for Active Batch */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-600">
              Sedang Memantau:{' '}
              <strong className="text-[#207a68] font-black">{activeBatch.batchName}</strong>
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-700">
              Target Batch: <strong className="font-black">{activeBatch.targetQty.toLocaleString()} pcs</strong>
            </span>
            {isModerator && (
              <button
                onClick={() => onOpenEditBatch(activeBatch)}
                className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-md text-[10px] flex items-center gap-1 transition cursor-pointer touch-manipulation"
              >
                <Edit3 className="w-2.5 h-2.5 text-slate-500" />
                <span>Edit Kuantitas</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] flex-wrap">
            <span className="text-slate-500">
              Total SPK: <strong>{job.targetQty.toLocaleString()} pcs</strong>
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">
              Terjadwal: <strong>{totalAllocatedQty.toLocaleString()} pcs</strong>
            </span>
            <span className="text-slate-400">•</span>
            {excessQty > 0 ? (
              <span className="text-purple-700 font-black">
                ⚠️ +{excessQty.toLocaleString()} pcs
              </span>
            ) : remainingUnallocatedQty === 0 ? (
              <span className="text-emerald-700 font-black">
                ✓ 100% Terjadwal
              </span>
            ) : (
              <span className="text-amber-700 font-black">
                Kurang {remainingUnallocatedQty.toLocaleString()} pcs
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. STEPPER HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span>Tahapan Rute ({activeSteps.length} Tahap)</span>
          </h3>
          {isModerator ? (
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-200 hidden md:inline-flex">
              <GripVertical className="w-3 h-3 text-slate-400" />
              Geser kartu untuk ubah urutan
            </span>
          ) : (
            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
              Pantau Alur
            </span>
          )}
        </div>

        {isModerator && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleResetRoute}
              title="Reset status tahapan batch ini ke awal"
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition cursor-pointer touch-manipulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenSavePreset}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95 touch-manipulation"
              title="Simpan urutan tahapan saat ini menjadi template preset baru"
            >
              <Bookmark className="w-3 h-3" />
              <span>Simpan Preset</span>
            </button>
            <button
              onClick={onOpenAddStep}
              className="px-2.5 py-1 bg-[#2CA58D] hover:bg-[#238572] text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95 touch-manipulation"
            >
              <Plus className="w-3 h-3" />
              <span>Tambah Tahap</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. STEPPER HORIZONTAL SCROLL LIST */}
      <div className="flex items-center overflow-x-auto py-2.5 px-1.5 custom-scrollbar gap-2 min-h-[155px] bg-slate-50/60 rounded-2xl border border-slate-100">
        {activeSteps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isInProgress = step.status === 'in-progress';

          let statusBadgeClass = 'bg-slate-200 text-slate-600 border-slate-300';
          let cardBorderClass = 'border-slate-200 bg-white text-slate-700';

          if (isCompleted) {
            statusBadgeClass = 'bg-emerald-500 text-white border-emerald-500';
            cardBorderClass = 'border-emerald-300 bg-emerald-50/40 text-emerald-950 shadow-xs';
          } else if (isInProgress) {
            statusBadgeClass = 'bg-amber-500 text-white border-amber-500';
            cardBorderClass =
              'border-amber-400 bg-amber-50/60 ring-2 ring-amber-400/40 shadow-sm';
          }

          const isDragged = draggedIndex === idx;
          const isDragOver = dragOverIndex === idx;

          return (
            <div
              key={step.id || `step-item-${idx}`}
              className="flex items-center gap-2 shrink-0"
            >
              <div
                draggable={isModerator}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                onClick={() => handleToggleStepStatus(idx)}
                title={
                  isModerator
                    ? 'Klik untuk ubah status tahapan'
                    : `Status tahapan: ${step.status}`
                }
                className={`step-card group relative flex items-center min-w-[135px] max-w-[145px] flex-col text-center p-2.5 rounded-2xl border transition-all select-none touch-manipulation ${
                  isModerator ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
                } ${cardBorderClass} ${isDragged ? 'opacity-40 scale-95' : ''} ${
                  isDragOver ? 'border-2 border-dashed border-[#2CA58D] bg-emerald-50' : ''
                }`}
              >
                {/* Delete Step Button (Moderator Only) */}
                {isModerator && (
                  <button
                    onClick={(e) => handleDeleteStep(idx, e)}
                    title="Hapus tahapan ini"
                    className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition shadow z-10 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}

                {/* Move Arrows on Hover (Moderator Only) */}
                {isModerator && (
                  <div className="absolute top-1 left-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                    {idx > 0 && (
                      <button
                        onClick={(e) => handleMoveStep(idx, 'left', e)}
                        title="Geser ke kiri"
                        className="w-4 h-4 bg-slate-200 hover:bg-slate-300 rounded text-[9px] flex items-center justify-center text-slate-700 cursor-pointer"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    )}
                    {idx < activeSteps.length - 1 && (
                      <button
                        onClick={(e) => handleMoveStep(idx, 'right', e)}
                        title="Geser ke kanan"
                        className="w-4 h-4 bg-slate-200 hover:bg-slate-300 rounded text-[9px] flex items-center justify-center text-slate-700 cursor-pointer"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* Step Number or Status Badge */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border mb-1.5 ${statusBadgeClass}`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : isInProgress ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                  ) : (
                    idx + 1
                  )}
                </div>

                {/* Step Icon */}
                <div className="p-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs mb-1">
                  {renderStepIcon(step.icon, {
                    className: `w-4 h-4 ${
                      isCompleted
                        ? 'text-emerald-600'
                        : isInProgress
                        ? 'text-amber-600'
                        : 'text-slate-600'
                    }`,
                  })}
                </div>

                {/* Step Name */}
                <span className="text-[11px] font-bold leading-tight line-clamp-2 px-1">
                  {step.name}
                </span>

                {/* Status Subtitle */}
                <span
                  className={`text-[9px] font-semibold capitalize mt-0.5 ${
                    isCompleted
                      ? 'text-emerald-600'
                      : isInProgress
                      ? 'text-amber-600 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {isInProgress ? '● Sedang Proses' : isCompleted ? '✓ Selesai' : 'Pending'}
                </span>

                {/* Quick Advance Button when In-Progress (Moderator Only) */}
                {isModerator && isInProgress && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCompleteStep(idx);
                    }}
                    className="mt-2 w-full py-1 px-2 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg shadow-xs transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 touch-manipulation"
                  >
                    <Check className="w-3 h-3" />
                    <span>Lanjut</span>
                  </button>
                )}
              </div>

              {idx < activeSteps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* 4. PRESET ROUTE TEMPLATES (Moderator Only) */}
      {isModerator && (
        <div className="flex flex-wrap gap-2 pt-1 text-xs items-center">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Preset Template:</span>
          </span>
          <div className="flex flex-wrap gap-1.5 items-center">
            {Object.keys(presets).map((presetKey) => (
              <button
                key={presetKey}
                onClick={() => onApplyPreset(presetKey)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 transition text-[11px] font-semibold flex items-center gap-1 cursor-pointer touch-manipulation"
              >
                <span>[{presetKey}]</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

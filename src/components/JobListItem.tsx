import React, { useState, useRef, useEffect } from 'react';
import {
  Trash2,
  Edit3,
  Layers,
  ChevronRight,
  CheckCircle2,
  Clock,
  Plus,
  ArrowLeft,
  X,
  Smartphone,
  Eye,
  Shield,
  Sparkles,
} from 'lucide-react';
import { JobSPK, ProductionBatch, UserRole } from '../types';

interface JobListItemProps {
  job: JobSPK;
  isSelected: boolean;
  userRole?: UserRole;
  isSwipedOpen: boolean;
  onSwipeChange: (isOpen: boolean) => void;
  onSelectJob: (id: string) => void;
  onDeleteJob: (id: string, e: React.MouseEvent) => void;
  onQuickEditBatch?: (job: JobSPK, batch: ProductionBatch) => void;
  onQuickDeleteBatch?: (job: JobSPK, batch: ProductionBatch) => void;
  onQuickAddBatch?: (job: JobSPK) => void;
}

export const JobListItem: React.FC<JobListItemProps> = ({
  job,
  isSelected,
  userRole = 'moderator',
  isSwipedOpen,
  onSwipeChange,
  onSelectJob,
  onDeleteJob,
  onQuickEditBatch,
  onQuickDeleteBatch,
  onQuickAddBatch,
}) => {
  const isModerator = userRole === 'moderator';

  // Normalize batches: if job has batches, use them; otherwise fallback to virtual primary batch
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

  const primaryBatch = batches[0];
  const activeBatch = batches.find((b) => b.id === job.activeBatchId) || primaryBatch;

  // Touch & Swipe state
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const isHorizontalDrag = useRef<boolean | null>(null);
  const hasMovedSignificant = useRef<boolean>(false);

  const MAX_SWIPE_OFFSET = isModerator ? 170 : 85;

  // Sync open state with drag offset
  useEffect(() => {
    if (isSwipedOpen) {
      setDragOffset(-MAX_SWIPE_OFFSET);
    } else {
      setDragOffset(0);
    }
  }, [isSwipedOpen, MAX_SWIPE_OFFSET]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
    isHorizontalDrag.current = null;
    hasMovedSignificant.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartX.current === null || dragStartY.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - dragStartX.current;
    const deltaY = currentY - dragStartY.current;

    if (isHorizontalDrag.current === null) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        isHorizontalDrag.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontalDrag.current) {
      if (Math.abs(deltaX) > 10) {
        hasMovedSignificant.current = true;
      }
      const baseOffset = isSwipedOpen ? -MAX_SWIPE_OFFSET : 0;
      let newOffset = baseOffset + deltaX;

      if (newOffset > 10) newOffset = 10;
      if (newOffset < -(MAX_SWIPE_OFFSET + 25)) {
        newOffset = -(MAX_SWIPE_OFFSET + 25);
      }

      setDragOffset(newOffset);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    dragStartX.current = null;
    dragStartY.current = null;

    if (isHorizontalDrag.current) {
      const threshold = isSwipedOpen ? -MAX_SWIPE_OFFSET + 30 : -40;
      if (dragOffset < threshold) {
        setDragOffset(-MAX_SWIPE_OFFSET);
        onSwipeChange(true);
      } else {
        setDragOffset(0);
        onSwipeChange(false);
      }
    }
    isHorizontalDrag.current = null;
  };

  // Mouse handlers for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only handle left click
    if (e.button !== 0) return;
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    isHorizontalDrag.current = true;
    hasMovedSignificant.current = false;
    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (dragStartX.current === null) return;
      const deltaX = moveEvent.clientX - dragStartX.current;
      if (Math.abs(deltaX) > 6) {
        hasMovedSignificant.current = true;
      }
      const baseOffset = isSwipedOpen ? -MAX_SWIPE_OFFSET : 0;
      let newOffset = baseOffset + deltaX;

      if (newOffset > 10) newOffset = 10;
      if (newOffset < -(MAX_SWIPE_OFFSET + 25)) {
        newOffset = -(MAX_SWIPE_OFFSET + 25);
      }
      setDragOffset(newOffset);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartX.current = null;
      dragStartY.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      setDragOffset((curr) => {
        const threshold = isSwipedOpen ? -MAX_SWIPE_OFFSET + 30 : -40;
        if (curr < threshold) {
          onSwipeChange(true);
          return -MAX_SWIPE_OFFSET;
        } else {
          onSwipeChange(false);
          return 0;
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Quick Close
  const handleCloseSwipe = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDragOffset(0);
    onSwipeChange(false);
  };

  // Step calculations
  const completedStepsCount = job.steps.filter((s) => s.status === 'completed').length;
  const totalStepsCount = job.steps.length;
  const isAllCompleted =
    totalStepsCount > 0 &&
    completedStepsCount === totalStepsCount &&
    job.completedQty >= job.targetQty;

  const progressPercentage =
    job.targetQty > 0
      ? Math.min(100, Math.round((job.completedQty / job.targetQty) * 100))
      : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-800 shadow-2xs group">
      {/* 1. BACKGROUND SWIPE ACTIONS TRAY */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end px-2 gap-1.5 bg-slate-900 text-white rounded-r-2xl z-0"
        style={{ width: `${MAX_SWIPE_OFFSET + 20}px` }}
      >
        {isModerator ? (
          <>
            {/* Quick Edit Batch Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSwipeChange(false);
                if (onQuickEditBatch) {
                  onQuickEditBatch(job, activeBatch);
                }
              }}
              title="Edit & Kelola Batch SPK"
              className="flex flex-col items-center justify-center w-12 h-11 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl transition shadow-xs cursor-pointer touch-manipulation"
            >
              <Edit3 className="w-4 h-4 mb-0.5" />
              <span className="text-[9px] font-bold tracking-tight">Batch</span>
            </button>

            {/* Quick Delete SPK Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSwipeChange(false);
                onDeleteJob(job.id, e);
              }}
              title="Hapus SPK ini"
              className="flex flex-col items-center justify-center w-12 h-11 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl transition shadow-xs cursor-pointer touch-manipulation"
            >
              <Trash2 className="w-4 h-4 mb-0.5" />
              <span className="text-[9px] font-bold tracking-tight">Hapus</span>
            </button>

            {/* Close Swipe Button */}
            <button
              onClick={handleCloseSwipe}
              title="Tutup Aksi"
              className="flex flex-col items-center justify-center w-7 h-11 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-400 rounded-xl transition cursor-pointer touch-manipulation"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            {/* Spectator Detail Quick Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSwipeChange(false);
                onSelectJob(job.id);
              }}
              className="flex flex-col items-center justify-center w-14 h-11 bg-[#2CA58D] text-white rounded-xl font-bold text-[10px] active:scale-95 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 mb-0.5" />
              <span>Detail</span>
            </button>
            <button
              onClick={handleCloseSwipe}
              className="flex items-center justify-center w-7 h-11 bg-slate-800 text-slate-400 rounded-xl cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* 2. FOREGROUND CARD (TRANSLATABLE VIA SWIPE GESTURE) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onClick={() => {
          if (hasMovedSignificant.current) {
            hasMovedSignificant.current = false;
            return;
          }
          if (isSwipedOpen) {
            setDragOffset(0);
            onSwipeChange(false);
          } else {
            onSelectJob(job.id);
          }
        }}
        style={{
          transform: `translateX(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`relative z-10 cursor-pointer p-2.5 sm:p-3 transition-colors flex flex-col justify-between select-none touch-manipulation ${
          isSelected
            ? 'bg-[#2CA58D] text-white shadow-md'
            : isAllCompleted
            ? 'bg-emerald-50/90 text-slate-700 hover:bg-emerald-100/90'
            : 'bg-white text-slate-700 hover:bg-slate-50'
        }`}
      >
        {/* Top Header Line: SPK ID, Customer & Batch Indicator */}
        <div className="flex items-center justify-between gap-1.5 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {/* SPK ID Badge */}
            <span
              className={`text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-lg shrink-0 ${
                isSelected
                  ? 'bg-white/20 text-white'
                  : isAllCompleted
                  ? 'bg-emerald-200/80 text-emerald-900'
                  : 'bg-slate-100 text-slate-800 border border-slate-200'
              }`}
            >
              {job.id}
            </span>

            {/* Customer Name */}
            {job.customer && (
              <span
                className={`text-[10px] font-bold truncate max-w-[120px] sm:max-w-[150px] ${
                  isSelected ? 'text-white/85' : 'text-slate-500'
                }`}
              >
                {job.customer}
              </span>
            )}
          </div>

          {/* Right Status / Multi-Batch Indicator */}
          <div className="flex items-center gap-1 shrink-0">
            {batches.length > 1 && (
              <span
                className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                  isSelected
                    ? 'bg-white/25 text-white'
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}
              >
                {batches.length} Batch
              </span>
            )}

            {isAllCompleted ? (
              <span
                className={`text-[9px] font-black px-1.5 py-0.2 rounded-md flex items-center gap-0.5 ${
                  isSelected ? 'bg-white/20 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>Selesai</span>
              </span>
            ) : (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Clock className="w-2.5 h-2.5 text-amber-500" />
                <span>Rute {completedStepsCount}/{totalStepsCount}</span>
              </span>
            )}
          </div>
        </div>

        {/* Job Title & Material summary */}
        <div className="mb-1.5">
          <h3
            className={`font-extrabold text-xs sm:text-sm leading-snug line-clamp-1 ${
              isSelected ? 'text-white' : 'text-slate-800'
            }`}
          >
            {job.title.includes(': ') ? job.title.split(': ')[1] : job.title}
          </h3>
          <p
            className={`text-[10px] line-clamp-1 mt-0.5 ${
              isSelected ? 'text-white/75' : 'text-slate-500'
            }`}
          >
            {job.material} {job.size ? `• ${job.size}` : ''}
          </p>
        </div>

        {/* Batch & Qty Micro-Row */}
        <div className="flex items-center justify-between gap-2 text-[10px] pt-0.5 border-t border-slate-100/30">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="font-extrabold">
              {job.completedQty.toLocaleString()} / {job.targetQty.toLocaleString()} pcs
            </span>
            <span className={`text-[9px] font-bold ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
              ({progressPercentage}%)
            </span>
          </div>

          {/* Quick-Swipe Button / Action Trigger for Mobile */}
          <div className="flex items-center gap-1">
            {isModerator && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSwipedOpen) {
                    setDragOffset(0);
                    onSwipeChange(false);
                  } else {
                    setDragOffset(-MAX_SWIPE_OFFSET);
                    onSwipeChange(true);
                  }
                }}
                title="Geser atau klik untuk aksi cepat batch & SPK"
                className={`p-1 rounded-lg text-[9px] font-bold transition cursor-pointer touch-manipulation flex items-center gap-0.5 ${
                  isSelected
                    ? 'bg-white/20 hover:bg-white/30 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Edit3 className="w-2.5 h-2.5" />
                <span className="hidden xs:inline">Aksi</span>
              </button>
            )}

            <ChevronRight
              className={`w-3.5 h-3.5 transition ${
                isSelected ? 'text-white' : 'text-slate-300 group-hover:text-slate-500'
              }`}
            />
          </div>
        </div>

        {/* Micro Progress Bar on Card Base */}
        <div className="w-full bg-black/10 rounded-full h-1 mt-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isSelected
                ? 'bg-white'
                : isAllCompleted
                ? 'bg-emerald-500'
                : 'bg-[#2CA58D]'
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

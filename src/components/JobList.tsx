import React, { useState } from 'react';
import { Plus, Search, Eye, Sparkles, SlidersHorizontal, Layers, ChevronRight } from 'lucide-react';
import { JobSPK, ProductionBatch, UserRole } from '../types';
import { JobListItem } from './JobListItem';

interface JobListProps {
  jobs: JobSPK[];
  selectedJobId: string | null;
  userRole?: UserRole;
  onSelectJob: (id: string) => void;
  onOpenAddSpk: () => void;
  onDeleteJob: (id: string, e: React.MouseEvent) => void;
  onQuickEditBatch?: (job: JobSPK, batch: ProductionBatch) => void;
  onQuickDeleteBatch?: (job: JobSPK, batch: ProductionBatch) => void;
  onQuickAddBatch?: (job: JobSPK) => void;
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  selectedJobId,
  userRole = 'moderator',
  onSelectJob,
  onOpenAddSpk,
  onDeleteJob,
  onQuickEditBatch,
  onQuickDeleteBatch,
  onQuickAddBatch,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [swipedJobId, setSwipedJobId] = useState<string | null>(null);

  const isModerator = userRole === 'moderator';

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.customer && job.customer.toLowerCase().includes(searchTerm.toLowerCase()));

    const isFinished =
      job.status === 'Selesai' ||
      (job.steps.length > 0 &&
        job.steps.every((s) => s.status === 'completed') &&
        job.completedQty >= job.targetQty);

    if (filterStatus === 'active') return matchesSearch && !isFinished;
    if (filterStatus === 'completed') return matchesSearch && isFinished;
    return matchesSearch;
  });

  return (
    <section className="bg-slate-50/90 p-2.5 sm:p-3.5 rounded-2xl border border-slate-200/90 flex flex-col h-full">
      {/* Header with Add Button and Role Badge */}
      <div className="flex justify-between items-center mb-2 px-0.5">
        <div className="flex items-center gap-1.5">
          <h2 className="font-black text-slate-800 text-sm md:text-base">
            Daftar SPK ({filteredJobs.length})
          </h2>
          {!isModerator && (
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Eye className="w-2.5 h-2.5" />
              <span>Lihat</span>
            </span>
          )}
        </div>

        {isModerator && (
          <button
            onClick={onOpenAddSpk}
            className="px-3 py-1.5 bg-[#2CA58D] hover:bg-[#238572] text-white text-xs font-bold rounded-xl transition shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95 touch-manipulation"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ SPK</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative mb-2">
        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari nomor SPK, judul, atau pelanggan..."
          className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-700 placeholder:text-slate-400 shadow-2xs"
        />
      </div>

      {/* Quick Filter Pills */}
      <div className="flex items-center gap-1 mb-2 text-[11px] bg-slate-200/60 p-1 rounded-xl">
        <button
          onClick={() => setFilterStatus('all')}
          className={`flex-1 py-1 rounded-lg font-bold transition cursor-pointer text-center touch-manipulation ${
            filterStatus === 'all'
              ? 'bg-white text-slate-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Semua ({jobs.length})
        </button>
        <button
          onClick={() => setFilterStatus('active')}
          className={`flex-1 py-1 rounded-lg font-bold transition cursor-pointer text-center touch-manipulation ${
            filterStatus === 'active'
              ? 'bg-white text-amber-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Aktif
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`flex-1 py-1 rounded-lg font-bold transition cursor-pointer text-center touch-manipulation ${
            filterStatus === 'completed'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Selesai
        </button>
      </div>

      {/* Mobile Swipe Gesture Visual Cue */}
      <div className="flex items-center justify-between px-1 py-1 mb-1.5 text-[10px] text-slate-500 bg-emerald-50/60 border border-emerald-100/80 rounded-xl">
        <span className="font-semibold text-emerald-950 flex items-center gap-1 truncate">
          <Sparkles className="w-3 h-3 text-[#2CA58D] shrink-0" />
          <span>Geser kartu ke kiri (Swipe 👈) untuk aksi cepat batch</span>
        </span>
      </div>

      {/* Job Cards List */}
      <div className="space-y-2 overflow-y-auto max-h-[500px] md:max-h-[640px] flex-1 pr-1 custom-scrollbar">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-10 px-3 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs space-y-1">
            <p className="font-bold text-slate-600">Tidak ada SPK ditemukan</p>
            <p className="text-[11px] text-slate-400">
              {searchTerm
                ? 'Coba ubah kata kunci pencarian.'
                : 'Belum ada data SPK yang tersimpan.'}
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <JobListItem
              key={job.id}
              job={job}
              isSelected={job.id === selectedJobId}
              userRole={userRole}
              isSwipedOpen={swipedJobId === job.id}
              onSwipeChange={(isOpen) => setSwipedJobId(isOpen ? job.id : null)}
              onSelectJob={(id) => {
                setSwipedJobId(null);
                onSelectJob(id);
              }}
              onDeleteJob={onDeleteJob}
              onQuickEditBatch={onQuickEditBatch}
              onQuickDeleteBatch={onQuickDeleteBatch}
              onQuickAddBatch={onQuickAddBatch}
            />
          ))
        )}
      </div>
    </section>
  );
};

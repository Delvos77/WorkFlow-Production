import React from 'react';
import {
  Boxes,
  Truck,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { JobSPK, UserRole } from '../types';

interface OrderQtyWidgetProps {
  job: JobSPK;
  userRole?: UserRole;
  onUpdateQty: (targetQty: number, completedQty: number) => void;
  onOpenMaterialModal: () => void;
  onOpenShipmentModal: () => void;
}

export const OrderQtyWidget: React.FC<OrderQtyWidgetProps> = ({
  job,
  userRole = 'moderator',
  onUpdateQty,
  onOpenMaterialModal,
  onOpenShipmentModal,
}) => {
  const isModerator = userRole === 'moderator';
  const target = job.targetQty || 0;
  const completed = job.completedQty || 0;
  const packed = job.packedQty || 0;
  const shipped = job.shippedQty || 0;
  const diff = completed - target;

  let statusCardStyle = 'border-slate-200 bg-white';
  let statusBadgeContent = <span className="text-slate-400">0 pcs</span>;

  if (diff === 0 && target > 0) {
    statusCardStyle = 'border-emerald-300 bg-emerald-50 text-emerald-800';
    statusBadgeContent = (
      <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Pas ({completed.toLocaleString()} pcs)
      </span>
    );
  } else if (diff < 0) {
    statusCardStyle = 'border-amber-300 bg-amber-50 text-amber-800';
    statusBadgeContent = (
      <span className="text-xs font-extrabold text-amber-700 flex items-center gap-1">
        <AlertTriangle className="w-3.5 h-3.5" />
        Kurang {Math.abs(diff).toLocaleString()} pcs
      </span>
    );
  } else if (diff > 0) {
    statusCardStyle = 'border-blue-300 bg-blue-50 text-blue-800';
    statusBadgeContent = (
      <span className="text-xs font-extrabold text-blue-700 flex items-center gap-1">
        <PlusCircle className="w-3.5 h-3.5" />
        Kelebihan {diff.toLocaleString()} pcs
      </span>
    );
  }

  return (
    <div className="space-y-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-[#2CA58D]" />
          <span>Status &amp; Rekap Finishing</span>
        </h3>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={onOpenMaterialModal}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-amber-200 cursor-pointer touch-manipulation active:scale-95"
            title="Kelola penggunaan bahan baku SPK"
          >
            <Boxes className="w-3.5 h-3.5 text-amber-600" />
            <span>Track Bahan ({job.materials?.length || 0})</span>
          </button>
          <button
            onClick={onOpenShipmentModal}
            className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-sky-200 cursor-pointer touch-manipulation active:scale-95"
            title="Pantau pengiriman parsial ke customer"
          >
            <Truck className="w-3.5 h-3.5 text-sky-600" />
            <span>Track Pengiriman</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
        {/* Target Order Input / Display */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-600">
            Target Order (Pcs)
          </label>
          {isModerator ? (
            <div className="relative">
              <input
                type="number"
                value={target || ''}
                onChange={(e) => onUpdateQty(parseInt(e.target.value) || 0, completed)}
                className="w-full px-3 py-2 pr-10 text-xs font-black border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] bg-white text-slate-800 shadow-2xs"
                placeholder="0"
              />
              <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-bold">
                pcs
              </span>
            </div>
          ) : (
            <div className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800">
              {target.toLocaleString()} pcs
            </div>
          )}
        </div>

        {/* Selesai / Finishing Input / Display */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-600">
            Selesai / Finishing (Pcs)
          </label>
          {isModerator ? (
            <div className="relative">
              <input
                type="number"
                value={completed || ''}
                onChange={(e) => onUpdateQty(target, parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 pr-10 text-xs font-black border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] bg-white text-slate-800 shadow-2xs"
                placeholder="0"
              />
              <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-bold">
                pcs
              </span>
            </div>
          ) : (
            <div className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800">
              {completed.toLocaleString()} pcs
            </div>
          )}
        </div>

        {/* Status Selisih Card */}
        <div
          className={`p-2.5 rounded-xl border flex flex-col justify-center items-center text-center ${statusCardStyle}`}
        >
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
            Status Selisih
          </span>
          <div className="mt-0.5">{statusBadgeContent}</div>
        </div>
      </div>

      {/* Mini summary badges for Packed & Shipped */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
        <div className="p-2.5 bg-slate-100 rounded-xl text-center border border-slate-200">
          <span className="text-[10px] text-slate-500 font-semibold block">Target Total</span>
          <span className="text-xs font-black text-slate-800">{target.toLocaleString()} pcs</span>
        </div>
        <div className="p-2.5 bg-amber-50 rounded-xl text-center border border-amber-200">
          <span className="text-[10px] text-amber-700 font-semibold block">Finishing Selesai</span>
          <span className="text-xs font-black text-amber-900">{completed.toLocaleString()} pcs</span>
        </div>
        <div className="p-2.5 bg-blue-50 rounded-xl text-center border border-blue-200">
          <span className="text-[10px] text-blue-700 font-semibold block">Di-Packing</span>
          <span className="text-xs font-black text-blue-900">{packed.toLocaleString()} pcs</span>
        </div>
        <div className="p-2.5 bg-emerald-50 rounded-xl text-center border border-emerald-200">
          <span className="text-[10px] text-emerald-700 font-semibold block">Sudah Dikirim</span>
          <span className="text-xs font-black text-emerald-900">{shipped.toLocaleString()} pcs</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Shield,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  RefreshCw,
  UserCheck,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { DeviceSession, UserRole } from '../types';
import {
  updateDeviceRoleInFirestore,
  updateDeviceLabelInFirestore,
  deleteDeviceSessionFromFirestore,
} from '../lib/firebase';
import { saveStoredUserLabel } from '../utils/deviceSession';

interface DeviceSessionsManagerProps {
  sessions: DeviceSession[];
  currentDeviceId: string;
  currentUserRole: UserRole;
  onRefreshSessions?: () => void;
}

export const DeviceSessionsManager: React.FC<DeviceSessionsManagerProps> = ({
  sessions,
  currentDeviceId,
  currentUserRole,
  onRefreshSessions,
}) => {
  const isModerator = currentUserRole === 'moderator';
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'moderator' | 'spectator' | 'online'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabelInput, setEditLabelInput] = useState('');

  // Format relative timestamp
  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Tidak diketahui';
    try {
      const date = new Date(isoString);
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);

      if (diffSec < 60) return 'Baru saja';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mnt lalu`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;

      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Check if active recently (within last 15 minutes)
  const isRecentlyActive = (isoString?: string) => {
    if (!isoString) return false;
    try {
      const diffSec = (Date.now() - new Date(isoString).getTime()) / 1000;
      return diffSec < 900; // 15 mins
    } catch {
      return false;
    }
  };

  // Helper icon for device
  const getDeviceIcon = (name: string, platform?: string) => {
    const text = `${name} ${platform || ''}`.toLowerCase();
    if (text.includes('iphone') || text.includes('android') || text.includes('smartphone')) {
      return <Smartphone className="w-4 h-4 text-sky-600" />;
    }
    if (text.includes('ipad') || text.includes('tablet')) {
      return <Tablet className="w-4 h-4 text-purple-600" />;
    }
    if (text.includes('mac') || text.includes('laptop')) {
      return <Laptop className="w-4 h-4 text-emerald-600" />;
    }
    return <Monitor className="w-4 h-4 text-slate-600" />;
  };

  // Filtered list
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.userLabel && s.userLabel.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.platform && s.platform.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (roleFilter === 'moderator') return s.assignedRole === 'moderator';
    if (roleFilter === 'spectator') return s.assignedRole === 'spectator';
    if (roleFilter === 'online') return isRecentlyActive(s.lastActive);
    return true;
  });

  // Action handlers
  const handleToggleRole = async (session: DeviceSession) => {
    if (!isModerator) return;
    const newRole: UserRole = session.assignedRole === 'moderator' ? 'spectator' : 'moderator';
    const confirmMsg =
      newRole === 'moderator'
        ? `Ubah hak akses perangkat "${session.userLabel || session.deviceName}" menjadi MODERATOR (Akses Penuh)?`
        : `Ubah hak akses perangkat "${session.userLabel || session.deviceName}" menjadi SPECTATOR (Hanya Pantau / Read-Only)?`;

    if (confirm(confirmMsg)) {
      await updateDeviceRoleInFirestore(session.id, newRole);
    }
  };

  const handleStartEdit = (session: DeviceSession) => {
    setEditingId(session.id);
    setEditLabelInput(session.userLabel || '');
  };

  const handleSaveEdit = async (deviceId: string) => {
    const trimmed = editLabelInput.trim() || 'Operator';
    await updateDeviceLabelInFirestore(deviceId, trimmed);
    if (deviceId === currentDeviceId) {
      saveStoredUserLabel(trimmed);
    }
    setEditingId(null);
  };

  const handleDeleteSession = async (session: DeviceSession) => {
    if (!isModerator) return;
    if (
      confirm(
        `Hapus riwayat sesi perangkat "${session.userLabel || session.deviceName}" dari daftar?`
      )
    ) {
      await deleteDeviceSessionFromFirestore(session.id);
    }
  };

  // Metrics
  const totalCount = sessions.length;
  const onlineCount = sessions.filter((s) => isRecentlyActive(s.lastActive)).length;
  const moderatorCount = sessions.filter((s) => s.assignedRole === 'moderator').length;
  const spectatorCount = sessions.filter((s) => s.assignedRole === 'spectator').length;

  return (
    <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#2CA58D]" />
            <span>Riwayat Login &amp; Manajemen Hak Akses Perangkat</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau perangkat yang masuk ke sistem dan kelola peran (Moderator vs Spectator) secara realtime.
          </p>
        </div>

        {onRefreshSessions && (
          <button
            onClick={onRefreshSessions}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 self-start sm:self-center cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Sesi</span>
          </button>
        )}
      </div>

      {/* 4 Overview Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span className="text-[11px] text-slate-500 font-semibold block">Total Perangkat</span>
          <span className="text-base font-extrabold text-slate-800">{totalCount}</span>
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
          <span className="text-[11px] text-emerald-700 font-semibold block">Aktif / Online</span>
          <span className="text-base font-extrabold text-emerald-900 flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {onlineCount}
          </span>
        </div>

        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-center">
          <span className="text-[11px] text-teal-700 font-semibold block">Moderator (Full)</span>
          <span className="text-base font-extrabold text-teal-900">{moderatorCount}</span>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <span className="text-[11px] text-amber-700 font-semibold block">Spectator (Read)</span>
          <span className="text-base font-extrabold text-amber-900">{spectatorCount}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama perangkat / operator..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1 rounded-xl transition cursor-pointer shrink-0 ${
              roleFilter === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({totalCount})
          </button>
          <button
            onClick={() => setRoleFilter('online')}
            className={`px-3 py-1 rounded-xl transition cursor-pointer shrink-0 ${
              roleFilter === 'online'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Online ({onlineCount})
          </button>
          <button
            onClick={() => setRoleFilter('moderator')}
            className={`px-3 py-1 rounded-xl transition cursor-pointer shrink-0 ${
              roleFilter === 'moderator'
                ? 'bg-[#2CA58D] text-white font-bold'
                : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
            }`}
          >
            Moderator ({moderatorCount})
          </button>
          <button
            onClick={() => setRoleFilter('spectator')}
            className={`px-3 py-1 rounded-xl transition cursor-pointer shrink-0 ${
              roleFilter === 'spectator'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Spectator ({spectatorCount})
          </button>
        </div>
      </div>

      {/* Device Sessions List / Table */}
      <div className="space-y-2.5">
        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada perangkat yang sesuai dengan filter pencarian.
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isCurrent = session.id === currentDeviceId;
            const isSessionOnline = isRecentlyActive(session.lastActive);
            const isEditingThis = editingId === session.id;

            return (
              <div
                key={session.id}
                className={`p-3.5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-emerald-50/40 border-emerald-300 ring-2 ring-emerald-400/20'
                    : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200'
                }`}
              >
                {/* Left: Device & Operator Details */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs mt-0.5 shrink-0">
                    {getDeviceIcon(session.deviceName, session.platform)}
                  </div>

                  <div className="space-y-1 min-w-0">
                    {/* Operator Label & Inline Edit */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {isEditingThis ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editLabelInput}
                            onChange={(e) => setEditLabelInput(e.target.value)}
                            className="px-2 py-0.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2CA58D] text-slate-800 font-bold"
                            placeholder="Label operator / lokasi"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(session.id)}
                            className="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg cursor-pointer"
                            title="Simpan"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer"
                            title="Batal"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm truncate">
                            {session.userLabel || session.deviceName}
                          </h4>
                          <button
                            onClick={() => handleStartEdit(session)}
                            title="Ubah nama operator / label perangkat"
                            className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </>
                      )}

                      {/* Current Device Badge */}
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-md shadow-2xs">
                          Perangkat Ini
                        </span>
                      )}

                      {/* Online/Offline Status Indicator */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isSessionOnline
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSessionOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        ></span>
                        {isSessionOnline ? 'Aktif' : 'Offline'}
                      </span>
                    </div>

                    {/* Metadata Subtitle */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                      <span className="font-medium">{session.deviceName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Terakhir aktif: <strong>{formatTime(session.lastActive)}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Role Badge & Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                  {/* Current Role Badge */}
                  <span
                    className={`px-2.5 py-1 text-xs font-black rounded-xl border flex items-center gap-1.5 ${
                      session.assignedRole === 'moderator'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : 'bg-amber-50 text-amber-900 border-amber-300'
                    }`}
                  >
                    {session.assignedRole === 'moderator' ? (
                      <>
                        <Shield className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Moderator</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-amber-600" />
                        <span>Spectator (Read-Only)</span>
                      </>
                    )}
                  </span>

                  {/* Toggle Role Button (Moderator Only) */}
                  {isModerator && (
                    <button
                      onClick={() => handleToggleRole(session)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-xl border transition shadow-2xs cursor-pointer active:scale-95 touch-manipulation flex items-center gap-1 ${
                        session.assignedRole === 'moderator'
                          ? 'bg-white hover:bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                      title="Klik untuk mengubah peran akses perangkat ini"
                    >
                      {session.assignedRole === 'moderator' ? (
                        <>
                          <Eye className="w-3 h-3 text-amber-600" />
                          <span>Ubah ke Spectator</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-3 h-3 text-emerald-600" />
                          <span>Jadikan Moderator</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Delete / Revoke Session (Moderator Only & not current device) */}
                  {isModerator && !isCurrent && (
                    <button
                      onClick={() => handleDeleteSession(session)}
                      title="Hapus sesi perangkat ini"
                      className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl border border-slate-200 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Informational Help Note */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2 text-xs text-slate-600">
        <Info className="w-4 h-4 text-[#2CA58D] shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong>Sinkronisasi Hak Akses Realtime:</strong> Ketika Anda mengubah peran suatu perangkat (misal: dari <em>Moderator</em> menjadi <em>Spectator</em>), perangkat target akan langsung disinkronkan secara otomatis tanpa perlu me-refresh halaman.
        </p>
      </div>
    </div>
  );
};

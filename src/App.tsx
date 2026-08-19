import React, { useState, useEffect, useRef } from 'react';
import {
  ActiveTab,
  JobSPK,
  RoutePresetsMap,
  RouteStep,
  MaterialItem,
  ProductionBatch,
  UserRole,
  DeviceSession,
  SyncDetails,
  SyncToast,
  SyncState,
  SecurityConfig,
} from './types';
import {
  subscribeToJobs,
  subscribeToPresets,
  subscribeToSessions,
  subscribeToDeviceRole,
  subscribeToSecurityConfig,
  saveSecurityConfigToFirestore,
  registerOrUpdateDeviceSession,
  updateDeviceRoleInFirestore,
  deleteDeviceSessionFromFirestore,
  saveJobToFirestore,
  deleteJobFromFirestore,
  savePresetToFirestore,
  seedInitialJobs,
  seedInitialPresets,
  clearAllFirestoreData,
} from './lib/firebase';
import {
  loadStoredJobs,
  saveStoredJobs,
  loadStoredPresets,
  saveStoredPresets,
  loadStoredRole,
  saveStoredRole,
  loadStoredSecurityConfig,
  saveStoredSecurityConfig,
  isAppUnlocked,
  setAppUnlocked,
} from './utils/storage';
import {
  getOrCreateDeviceId,
  createInitialDeviceSession,
} from './utils/deviceSession';
import { INITIAL_JOBS, DEFAULT_ROUTE_PRESETS } from './data/initialData';

import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { JobList } from './components/JobList';
import { JobDetail } from './components/JobDetail';
import { LaporanView } from './components/LaporanView';
import { PengaturanView } from './components/PengaturanView';
import { OfflineAlertBanner } from './components/OfflineAlertBanner';
import { SyncToastContainer } from './components/SyncToastContainer';
import { AccessLockScreen } from './components/AccessLockScreen';

import { AddSpkModal } from './components/modals/AddSpkModal';
import { AddStepModal } from './components/modals/AddStepModal';
import { AddBatchModal } from './components/modals/AddBatchModal';
import { EditBatchModal } from './components/modals/EditBatchModal';
import { DeleteBatchModal } from './components/modals/DeleteBatchModal';
import { SavePresetModal } from './components/modals/SavePresetModal';
import { AddPackingModal } from './components/modals/AddPackingModal';
import { TrackingShipmentModal } from './components/modals/TrackingShipmentModal';
import { TrackingMaterialModal } from './components/modals/TrackingMaterialModal';
import { PrintSpkModal } from './components/modals/PrintSpkModal';
import { DeleteSpkModal } from './components/modals/DeleteSpkModal';
import { RoleSwitchModal } from './components/modals/RoleSwitchModal';
import { SyncDetailsModal } from './components/modals/SyncDetailsModal';
import { FileText, Layers } from 'lucide-react';

export default function App() {
  // Device & RBAC initialization
  const [currentDeviceId] = useState<string>(() => getOrCreateDeviceId());
  const [userRole, setUserRole] = useState<UserRole>(() => loadStoredRole());
  const [sessions, setSessions] = useState<DeviceSession[]>([]);

  // Security & Lock screen state (Locked for first-time access on new devices)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => isAppUnlocked());
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(() =>
    loadStoredSecurityConfig()
  );

  // State initialization
  const [jobs, setJobs] = useState<JobSPK[]>(() => loadStoredJobs());
  const [presets, setPresets] = useState<RoutePresetsMap>(() => loadStoredPresets());
  const [selectedJobId, setSelectedJobId] = useState<string | null>(() => {
    const stored = loadStoredJobs();
    return stored.length > 0 ? stored[0].id : null;
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('jobs');
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Sync state tracking
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(() => new Date());
  const [fromCache, setFromCache] = useState<boolean>(false);
  const [hasPendingWrites, setHasPendingWrites] = useState<boolean>(false);
  const [lastActionText, setLastActionText] = useState<string>('Sistem siap');
  const [toasts, setToasts] = useState<SyncToast[]>([]);
  const [isSyncDetailsOpen, setIsSyncDetailsOpen] = useState<boolean>(false);

  // Mobile View Toggle: 'list' vs 'detail' (only affects screens < md)
  const [mobileJobView, setMobileJobView] = useState<'list' | 'detail'>('list');

  // Modals state
  const [isRoleSwitchOpen, setIsRoleSwitchOpen] = useState(false);
  const [isAddSpkOpen, setIsAddSpkOpen] = useState(false);
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [batchToEdit, setBatchToEdit] = useState<ProductionBatch | null>(null);
  const [batchToDelete, setBatchToDelete] = useState<ProductionBatch | null>(null);
  const [isSavePresetOpen, setIsSavePresetOpen] = useState(false);
  const [isAddPackingOpen, setIsAddPackingOpen] = useState(false);
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobSPK | null>(null);

  const userRoleRef = useRef(userRole);
  userRoleRef.current = userRole;

  // Helper for displaying auto-dismissing Sync Toast
  const showSyncToast = (
    type: 'synced' | 'syncing' | 'offline_saved' | 'error',
    title: string,
    description: string
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: SyncToast = { id, type, title, description, timestamp: Date.now() };
    setToasts((prev) => [...prev.slice(-3), newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncState('syncing');
      showSyncToast(
        'syncing',
        'Koneksi Internet Kembali',
        'Menyinkronkan semua antrean data ke Firebase Cloud...'
      );
      setTimeout(() => {
        setSyncState('synced');
        setLastSyncedAt(new Date());
      }, 1200);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncState('offline_saved');
      showSyncToast(
        'offline_saved',
        'Mode Offline Aktif',
        'Data Anda otomatis tersimpan di penyimpanan offline perangkat.'
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register device session & Heartbeat
  useEffect(() => {
    const initialSession = createInitialDeviceSession(userRoleRef.current);
    registerOrUpdateDeviceSession(initialSession).catch((err) =>
      console.warn('Initial session registration offline:', err)
    );

    // Heartbeat every 2 minutes or on focus
    const interval = setInterval(() => {
      const activeSession = createInitialDeviceSession(userRoleRef.current);
      registerOrUpdateDeviceSession(activeSession).catch(() => {});
    }, 120000);

    const handleFocus = () => {
      const activeSession = createInitialDeviceSession(userRoleRef.current);
      registerOrUpdateDeviceSession(activeSession).catch(() => {});
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Firebase Realtime Subscriptions (Jobs, Presets, Sessions & Remote Role Sync)
  useEffect(() => {
    // 1. Subscribe to Jobs
    const unsubscribeJobs = subscribeToJobs(
      (firestoreJobs, meta) => {
        if (firestoreJobs && firestoreJobs.length > 0) {
          setJobs(firestoreJobs);
          saveStoredJobs(firestoreJobs);
          setFromCache(meta?.fromCache ?? false);
          setHasPendingWrites(meta?.hasPendingWrites ?? false);
          setLastSyncedAt(new Date());
          setSyncState(
            !navigator.onLine || meta?.hasPendingWrites ? 'offline_saved' : 'synced'
          );
          setSelectedJobId((currentId) => {
            if (!currentId || !firestoreJobs.some((j) => j.id === currentId)) {
              return firestoreJobs[0].id;
            }
            return currentId;
          });
        }
      },
      (err) => {
        console.warn('Using local cached jobs:', err);
        setSyncState('offline_saved');
      }
    );

    // 2. Subscribe to Presets
    const unsubscribePresets = subscribeToPresets(
      (firestorePresets) => {
        if (firestorePresets && Object.keys(firestorePresets).length > 0) {
          setPresets(firestorePresets);
          saveStoredPresets(firestorePresets);
        }
      },
      (err) => {
        console.warn('Using local cached presets:', err);
      }
    );

    // 3. Subscribe to Device Sessions (Login History)
    const unsubscribeSessions = subscribeToSessions(
      (firestoreSessions) => {
        setSessions(firestoreSessions);
      },
      (err) => {
        console.warn('Using cached sessions:', err);
      }
    );

    // 4. Realtime Remote Role Sync for This Device
    const unsubscribeRole = subscribeToDeviceRole(currentDeviceId, (remoteRole) => {
      if (remoteRole && remoteRole !== userRoleRef.current) {
        setUserRole(remoteRole);
        saveStoredRole(remoteRole);
        if (remoteRole === 'spectator') {
          setActiveTab('laporan');
        }
      }
    });

    // 5. Realtime Security Config & PINs Sync
    const unsubscribeSecurity = subscribeToSecurityConfig((config) => {
      setSecurityConfig(config);
      saveStoredSecurityConfig(config);
    });

    return () => {
      unsubscribeJobs();
      unsubscribePresets();
      unsubscribeSessions();
      unsubscribeRole();
      unsubscribeSecurity();
    };
  }, [currentDeviceId]);

  // Guard: if device is spectator, it cannot be on pengaturan tab
  useEffect(() => {
    if (userRole === 'spectator' && activeTab === 'pengaturan') {
      setActiveTab('laporan');
    }
  }, [userRole, activeTab]);

  // Sync Details Object for Badges & Modals
  const syncDetails: SyncDetails = {
    state: syncState,
    isOnline,
    fromCache,
    hasPendingWrites,
    lastSyncedAt,
    lastActionText,
    totalSavedJobs: jobs.length,
  };

  // Centralized Job Persist with visual feedback
  const persistJobWithFeedback = async (
    updatedJob: JobSPK,
    actionTitle: string,
    successMsg?: string
  ) => {
    // 1. Instantly update local state & localStorage
    const newJobs = jobs.map((j) => (j.id === updatedJob.id ? updatedJob : j));
    setJobs(newJobs);
    saveStoredJobs(newJobs);
    setLastActionText(actionTitle);

    // 2. Indicate syncing
    setSyncState('syncing');

    try {
      await saveJobToFirestore(updatedJob);
      setSyncState('synced');
      setLastSyncedAt(new Date());
      showSyncToast(
        isOnline ? 'synced' : 'offline_saved',
        isOnline ? '✓ Tersimpan di Cloud' : '⚡ Tersimpan Offline',
        successMsg ||
          (isOnline
            ? `${actionTitle} berhasil disinkronkan ke Firebase.`
            : `${actionTitle} tersimpan aman di perangkat lokal.`)
      );
    } catch (err) {
      console.warn('Job saved in offline cache:', err);
      setSyncState('offline_saved');
      showSyncToast(
        'offline_saved',
        '⚡ Tersimpan Offline',
        `${actionTitle} tersimpan aman di cache offline perangkat.`
      );
    }
  };

  // Manual Trigger Sync Check
  const handleManualSync = async () => {
    setSyncState('syncing');
    try {
      for (const j of jobs) {
        await saveJobToFirestore(j);
      }
      setSyncState('synced');
      setLastSyncedAt(new Date());
      showSyncToast(
        'synced',
        '✓ Sinkronisasi Lengkap',
        'Semua data SPK berhasil diverifikasi dan disinkronkan ke Firebase.'
      );
    } catch (err) {
      setSyncState(isOnline ? 'error' : 'offline_saved');
      throw err;
    }
  };

  // Handle switching role locally
  const handleSelectRole = async (newRole: UserRole) => {
    setUserRole(newRole);
    saveStoredRole(newRole);

    // Also update this device's session in Firestore
    const updated = createInitialDeviceSession(newRole);
    await registerOrUpdateDeviceSession(updated).catch(() => {});

    // If spectator, automatically switch to laporan tab
    if (newRole === 'spectator' && activeTab === 'pengaturan') {
      setActiveTab('laporan');
    }

    showSyncToast(
      'synced',
      'Mode Akses Diperbarui',
      `Perangkat ini sekarang menggunakan mode ${
        newRole === 'moderator' ? 'Moderator (Akses Penuh)' : 'Spectator (Hanya Pantau)'
      }.`
    );
  };

  const handleUnlockSuccess = (role: UserRole) => {
    setAppUnlocked(true);
    setIsUnlocked(true);
    handleSelectRole(role);
  };

  const handleLockApp = () => {
    setAppUnlocked(false);
    setIsUnlocked(false);
    showSyncToast(
      'offline_saved',
      'Aplikasi Terkunci',
      'Sesi ditutup dan gerbang akses terkunci kembali.'
    );
  };

  const handleSaveSecurityConfig = async (newConfig: SecurityConfig) => {
    setSecurityConfig(newConfig);
    saveStoredSecurityConfig(newConfig);
    try {
      await saveSecurityConfigToFirestore(newConfig);
      showSyncToast(
        'synced',
        'PIN Akses Diperbarui',
        'PIN gerbang masuk baru berhasil disimpan dan disinkronkan ke Cloud.'
      );
    } catch (err) {
      console.warn('Gagal menyimpan PIN ke Firestore:', err);
      showSyncToast(
        'offline_saved',
        'Disimpan Offline',
        'Perubahan PIN disimpan lokal di peramban ini.'
      );
    }
  };

  // Admin toggles any device session role (local + remote Firestore)
  const handleToggleDeviceRole = async (deviceId: string, newRole: UserRole) => {
    // 1. Optimistic update
    setSessions((prev) =>
      prev.map((s) => (s.id === deviceId ? { ...s, assignedRole: newRole } : s))
    );

    // 2. If it's this current device, apply locally immediately
    if (deviceId === currentDeviceId) {
      setUserRole(newRole);
      saveStoredRole(newRole);
      if (newRole === 'spectator') {
        setActiveTab('laporan');
      }
    }

    // 3. Persist to Firestore
    try {
      await updateDeviceRoleInFirestore(deviceId, newRole);
      showSyncToast(
        'synced',
        'Hak Akses Diperbarui',
        `Perangkat berhasil diatur sebagai ${
          newRole === 'moderator' ? 'Moderator (Akses Penuh)' : 'Spectator (Hanya Pantau)'
        }.`
      );
    } catch (err) {
      console.warn('Device role update saved offline:', err);
      showSyncToast(
        'offline_saved',
        'Tersimpan Offline',
        'Perubahan hak akses perangkat tersimpan lokal.'
      );
    }
  };

  // Admin deletes a device session
  const handleDeleteDeviceSession = async (deviceId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== deviceId));
    try {
      await deleteDeviceSessionFromFirestore(deviceId);
      showSyncToast('synced', 'Sesi Dihapus', 'Riwayat sesi perangkat berhasil dihapus.');
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  // Selected Job reference
  const currentJob = jobs.find((j) => j.id === selectedJobId) || null;

  // Active Job Count (not fully completed)
  const activeCount = jobs.filter((j) => {
    const completedSteps = j.steps.filter((s) => s.status === 'completed').length;
    return !(completedSteps === j.steps.length && j.completedQty >= j.targetQty);
  }).length;

  // --- Handlers with Firebase Sync ---
  const handleSelectJob = (id: string) => {
    setSelectedJobId(id);
    setMobileJobView('detail'); // On mobile, automatically show the detail view
    if (activeTab !== 'jobs') {
      setActiveTab('jobs');
    }
  };

  const handleAddJob = async (newJob: JobSPK) => {
    if (userRole === 'spectator') return;
    setJobs((prev) => [newJob, ...prev]);
    setSelectedJobId(newJob.id);
    setMobileJobView('detail');
    saveStoredJobs([newJob, ...jobs]);
    setSyncState('syncing');

    try {
      await saveJobToFirestore(newJob);
      setSyncState('synced');
      setLastSyncedAt(new Date());
      showSyncToast(
        isOnline ? 'synced' : 'offline_saved',
        isOnline ? '✓ SPK Ditambahkan ke Cloud' : '⚡ SPK Tersimpan Offline',
        `SPK ${newJob.id} berhasil disimpan ${isOnline ? 'ke Firebase' : 'di perangkat lokal'}.`
      );
    } catch (err) {
      console.warn('Saved in offline cache:', err);
      setSyncState('offline_saved');
      showSyncToast(
        'offline_saved',
        '⚡ SPK Tersimpan Offline',
        `SPK ${newJob.id} tersimpan di penyimpanan lokal.`
      );
    }
  };

  const handleOpenDeleteDialog = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (userRole === 'spectator') return;
    const target = jobs.find((j) => j.id === id);
    if (target) {
      setJobToDelete(target);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    if (userRole === 'spectator') return;
    const updated = jobs.filter((j) => j.id !== id);
    setJobs(updated);
    saveStoredJobs(updated);

    if (selectedJobId === id) {
      setSelectedJobId(updated.length > 0 ? updated[0].id : null);
      setMobileJobView('list');
    }

    setSyncState('syncing');
    try {
      await deleteJobFromFirestore(id);
      setSyncState('synced');
      setLastSyncedAt(new Date());
      showSyncToast('synced', 'SPK Dihapus', `SPK ${id} berhasil dihapus.`);
    } catch (err) {
      console.warn('Deleted from offline cache:', err);
      setSyncState('offline_saved');
      showSyncToast(
        'offline_saved',
        'SPK Dihapus Lokal',
        `Penghapusan SPK ${id} tersimpan di cache offline.`
      );
    }
  };

  // Update Route Steps (Supports Multi-Batch and Single Route)
  const handleUpdateSteps = async (newSteps: RouteStep[], batchId?: string) => {
    if (userRole === 'spectator') return;
    if (!selectedJobId || !currentJob) return;

    let updatedBatches = currentJob.batches;
    const targetBatchId = batchId || currentJob.activeBatchId;

    if (updatedBatches && updatedBatches.length > 0 && targetBatchId) {
      updatedBatches = updatedBatches.map((b) => {
        if (b.id === targetBatchId) {
          const isDone = newSteps.every((s) => s.status === 'completed');
          return {
            ...b,
            steps: newSteps,
            status: isDone ? ('completed' as const) : ('in-progress' as const),
            completedQty: isDone ? b.targetQty : b.completedQty,
          };
        }
        return b;
      });
    }

    const updatedJob: JobSPK = {
      ...currentJob,
      steps: newSteps,
      batches: updatedBatches,
    };

    await persistJobWithFeedback(
      updatedJob,
      'Progres Tahapan Diperbarui',
      'Perubahan alur rute berhasil disimpan.'
    );
  };

  // Select Active Batch in Stepper
  const handleSelectBatch = async (batchId: string) => {
    if (!selectedJobId || !currentJob) return;
    const targetBatch = currentJob.batches?.find((b) => b.id === batchId);
    const updatedJob: JobSPK = {
      ...currentJob,
      activeBatchId: batchId,
      steps: targetBatch ? targetBatch.steps : currentJob.steps,
    };

    await persistJobWithFeedback(updatedJob, 'Batch Aktif Dipilih');
  };

  // Add a new partial production batch with exact math balance
  const handleAddBatch = async (newBatch: ProductionBatch) => {
    if (userRole === 'spectator') return;
    if (!selectedJobId || !currentJob) return;

    let existingBatches: ProductionBatch[] = [];

    if (currentJob.batches && currentJob.batches.length > 0) {
      existingBatches = [...currentJob.batches];
    } else {
      const batch1Target = Math.max(1, currentJob.targetQty - newBatch.targetQty);
      const isBatch1Done = currentJob.completedQty >= batch1Target;

      existingBatches = [
        {
          id: `batch-${currentJob.id}-1`,
          batchName: 'Batch 1 (Awal)',
          targetQty: batch1Target,
          completedQty: Math.min(currentJob.completedQty, batch1Target),
          status: isBatch1Done ? 'completed' : 'in-progress',
          steps: currentJob.steps,
          createdAt: currentJob.createdAt,
        },
      ];
    }

    const updatedBatches = [...existingBatches, newBatch];
    const updatedJob: JobSPK = {
      ...currentJob,
      batches: updatedBatches,
      activeBatchId: newBatch.id,
      steps: newBatch.steps,
    };

    await persistJobWithFeedback(
      updatedJob,
      'Batch Baru Ditambahkan',
      `${newBatch.batchName} (${newBatch.targetQty.toLocaleString('id-ID')} pcs) tersimpan.`
    );
  };

  // Save edited batch
  const handleSaveEditedBatch = async (updatedBatch: ProductionBatch) => {
    if (userRole === 'spectator') return;
    if (!selectedJobId || !currentJob) return;

    const currentBatches: ProductionBatch[] =
      currentJob.batches && currentJob.batches.length > 0
        ? currentJob.batches
        : [
            {
              id: `batch-${currentJob.id}-1`,
              batchName: 'Batch 1 (Utama)',
              targetQty: currentJob.targetQty,
              completedQty: currentJob.completedQty,
              status:
                currentJob.completedQty >= currentJob.targetQty
                  ? 'completed'
                  : 'in-progress',
              steps: currentJob.steps,
              createdAt: currentJob.createdAt,
            },
          ];

    const updatedBatches = currentBatches.map((b) =>
      b.id === updatedBatch.id ? updatedBatch : b
    );

    const isActive = currentJob.activeBatchId === updatedBatch.id;

    const updatedJob: JobSPK = {
      ...currentJob,
      batches: updatedBatches,
      steps: isActive && updatedBatch.steps ? updatedBatch.steps : currentJob.steps,
    };

    await persistJobWithFeedback(
      updatedJob,
      'Batch Diperbarui',
      `Data ${updatedBatch.batchName} berhasil disimpan.`
    );
  };

  // Confirm delete batch
  const handleConfirmDeleteBatch = async (batchId: string) => {
    if (userRole === 'spectator') return;
    if (!selectedJobId || !currentJob || !currentJob.batches) return;
    const filtered = currentJob.batches.filter((b) => b.id !== batchId);
    if (filtered.length === 0) {
      alert('Minimal harus ada 1 alur batch.');
      return;
    }

    const newActive =
      currentJob.activeBatchId === batchId ? filtered[0].id : currentJob.activeBatchId;
    const newActiveBatch = filtered.find((b) => b.id === newActive) || filtered[0];

    const updatedJob: JobSPK = {
      ...currentJob,
      batches: filtered,
      activeBatchId: newActive,
      steps: newActiveBatch.steps,
    };

    await persistJobWithFeedback(
      updatedJob,
      'Batch Dihapus',
      'Alur batch berhasil dihapus dan diperbarui.'
    );
  };

  const handleApplyPreset = async (presetKey: string) => {
    if (userRole === 'spectator') return;
    if (!selectedJobId || !presets[presetKey] || !currentJob) return;
    const template = presets[presetKey];
    const stepsWithId: RouteStep[] = template.map((s, idx) => ({
      id: `step-${Date.now()}-${idx}`,
      name: s.name,
      icon: s.icon,
      status:
        idx === 0
          ? ('completed' as const)
          : idx === 1
          ? ('in-progress' as const)
          : ('pending' as const),
    }));

    handleUpdateSteps(stepsWithId);
  };

  const handleSavePreset = async (presetName: string) => {
    if (userRole === 'spectator') return;
    if (!currentJob) return;
    const templateSteps = currentJob.steps.map((s, idx) => ({
      name: s.name,
      icon: s.icon,
      status: idx === 0 ? ('completed' as const) : ('pending' as const),
    }));

    const updatedPresets = {
      ...presets,
      [presetName]: templateSteps,
    };
    setPresets(updatedPresets);
    saveStoredPresets(updatedPresets);

    setSyncState('syncing');
    try {
      await savePresetToFirestore(presetName, templateSteps);
      setSyncState('synced');
      setLastSyncedAt(new Date());
      showSyncToast(
        isOnline ? 'synced' : 'offline_saved',
        isOnline ? '✓ Preset Tersimpan ke Cloud' : '⚡ Preset Tersimpan Offline',
        `Preset Rute "${presetName}" berhasil disimpan.`
      );
    } catch (err) {
      setSyncState('offline_saved');
      showSyncToast(
        'offline_saved',
        '⚡ Preset Tersimpan Offline',
        `Preset "${presetName}" tersimpan di cache lokal.`
      );
    }
  };

  const handleAddStepToJob = async (newStep: RouteStep) => {
    if (userRole === 'spectator') return;
    if (!selectedJobId || !currentJob) return;
    const updatedSteps = [...currentJob.steps, newStep];
    handleUpdateSteps(updatedSteps);
  };

  const handleSelectPacking = async (option: string) => {
    if (userRole === 'spectator') return;
    if (!selectedJobId || !currentJob) return;
    const updatedJob: JobSPK = { ...currentJob, activePacking: option };
    await persistJobWithFeedback(updatedJob, `Packing Dipilih: ${option}`);
  };

  const handleAddPackingOption = async (optionName: string) => {
    if (userRole === 'spectator') return;
    if (!selectedJobId || !currentJob) return;
    if (currentJob.packingOptions.includes(optionName)) {
      handleSelectPacking(optionName);
      return;
    }
    const updatedJob: JobSPK = {
      ...currentJob,
      packingOptions: [...currentJob.packingOptions, optionName],
      activePacking: optionName,
    };
    await persistJobWithFeedback(
      updatedJob,
      `Opsi Packing Ditambahkan: ${optionName}`
    );
  };

  const handleDeletePackingOption = async (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (userRole === 'spectator') return;
    if (!selectedJobId || !currentJob) return;
    if (currentJob.packingOptions.length <= 1) {
      alert('Minimal harus ada 1 opsi packing.');
      return;
    }

    const filtered = currentJob.packingOptions.filter((o) => o !== option);
    const newActive =
      currentJob.activePacking === option ? filtered[0] : currentJob.activePacking;

    const updatedJob: JobSPK = {
      ...currentJob,
      packingOptions: filtered,
      activePacking: newActive,
    };
    await persistJobWithFeedback(updatedJob, `Opsi Packing Dihapus: ${option}`);
  };

  const handleUpdateQty = async (targetQty: number, completedQty: number) => {
    if (userRole === 'spectator') return;
    if (!selectedJobId || !currentJob) return;
    const updatedJob: JobSPK = { ...currentJob, targetQty, completedQty };
    await persistJobWithFeedback(
      updatedJob,
      'Kuantitas SPK Diperbarui',
      `Target: ${targetQty.toLocaleString('id-ID')} | Selesai: ${completedQty.toLocaleString('id-ID')}`
    );
  };

  const handleSaveShipment = async (
    completedQty: number,
    packedQty: number,
    shippedQty: number
  ) => {
    if (userRole === 'spectator') return;
    if (!selectedJobId || !currentJob) return;
    const updatedJob: JobSPK = {
      ...currentJob,
      completedQty,
      packedQty,
      shippedQty,
    };
    await persistJobWithFeedback(
      updatedJob,
      'Data Pengiriman & Ekspedisi Disimpan'
    );
  };

  const handleSaveMaterials = async (newMaterials: MaterialItem[]) => {
    if (userRole === 'spectator') return;
    if (!selectedJobId || !currentJob) return;
    const updatedJob: JobSPK = {
      ...currentJob,
      materials: newMaterials,
    };
    await persistJobWithFeedback(
      updatedJob,
      'Kebutuhan Material Disimpan'
    );
  };

  // Reset & Restore (Moderator only)
  const handleResetAllData = async () => {
    if (userRole === 'spectator') return;
    if (
      confirm(
        'Apakah Anda yakin ingin menghapus SEMUA data SPK? Tindakan ini akan mengosongkan database!'
      )
    ) {
      const ids = jobs.map((j) => j.id);
      setJobs([]);
      setSelectedJobId(null);
      saveStoredJobs([]);
      await clearAllFirestoreData(ids);
      showSyncToast('synced', 'Database Dikosongkan', 'Semua SPK telah dihapus.');
    }
  };

  const handleRestoreSampleData = async () => {
    if (userRole === 'spectator') return;
    setJobs(INITIAL_JOBS);
    setPresets(DEFAULT_ROUTE_PRESETS);
    setSelectedJobId(INITIAL_JOBS[0].id);
    saveStoredJobs(INITIAL_JOBS);
    saveStoredPresets(DEFAULT_ROUTE_PRESETS);
    setSyncState('syncing');
    await seedInitialJobs();
    await seedInitialPresets();
    setSyncState('synced');
    setLastSyncedAt(new Date());
    showSyncToast(
      'synced',
      '✓ Contoh Data Dimuat',
      'Data alur cetak dan SPK contoh berhasil dimuat ke Firebase!'
    );
  };

  const handleImportData = async (
    importedJobs: JobSPK[],
    importedPresets?: RoutePresetsMap
  ) => {
    if (userRole === 'spectator') return;
    setJobs(importedJobs);
    saveStoredJobs(importedJobs);
    if (importedJobs.length > 0) {
      setSelectedJobId(importedJobs[0].id);
    }
    if (importedPresets) {
      setPresets(importedPresets);
      saveStoredPresets(importedPresets);
    }

    setSyncState('syncing');
    for (const j of importedJobs) {
      await saveJobToFirestore(j);
    }
    setSyncState('synced');
    setLastSyncedAt(new Date());
    showSyncToast(
      'synced',
      '✓ Data Berhasil Diimpor',
      `${importedJobs.length} SPK berhasil diunggah ke Firebase.`
    );
  };

  return (
    <>
      {!isUnlocked ? (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
          <AccessLockScreen
            securityConfig={securityConfig}
            onUnlockSuccess={handleUnlockSuccess}
            onShowNotification={showSyncToast}
          />
          {/* Realtime Toast Feedback */}
          <SyncToastContainer toasts={toasts} onDismiss={handleDismissToast} />
        </div>
      ) : (
        <div className="min-h-screen bg-[#E2E8F0] p-1.5 sm:p-3 md:p-4 text-slate-800 flex flex-col justify-between max-w-7xl mx-auto font-sans antialiased">
          {/* App Container Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-slate-200 flex flex-col flex-1 pb-20 md:pb-20">
            {/* Top Header */}
            <Header
              activeCount={activeCount}
              totalCount={jobs.length}
              isOnline={isOnline}
              syncDetails={syncDetails}
              userRole={userRole}
              onOpenAddSpk={() => setIsAddSpkOpen(true)}
              onOpenRoleSwitch={() => setIsRoleSwitchOpen(true)}
              onOpenSyncDetails={() => setIsSyncDetailsOpen(true)}
              onPrintSpk={currentJob ? () => setIsPrintModalOpen(true) : undefined}
              onLockApp={handleLockApp}
            />

        {/* Offline & Cloud Sync Status Notification Banner */}
        <OfflineAlertBanner
          syncDetails={syncDetails}
          onOpenSyncDetails={() => setIsSyncDetailsOpen(true)}
        />

        {/* Tab Panels */}
        <main className="p-2 sm:p-3 md:p-4 flex-1">
          {activeTab === 'jobs' && (
            <div className="flex flex-col space-y-3">
              {/* Mobile View Toggle Switch (Visible ONLY on mobile screens < md) */}
              <div className="md:hidden flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold shadow-2xs">
                <button
                  onClick={() => setMobileJobView('list')}
                  className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-95 ${
                    mobileJobView === 'list'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Daftar SPK ({jobs.length})</span>
                </button>
                <button
                  onClick={() => setMobileJobView('detail')}
                  className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-95 ${
                    mobileJobView === 'detail'
                      ? 'bg-white text-[#2CA58D] shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Detail &amp; Rute {currentJob ? `(${currentJob.id})` : ''}</span>
                </button>
              </div>

              {/* Desktop 2-Column Grid & Mobile Responsive Views */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
                {/* Left Column: Job List (Hidden on mobile if in 'detail' view) */}
                <div
                  className={`md:col-span-4 flex flex-col ${
                    mobileJobView === 'detail' ? 'hidden md:flex' : 'flex'
                  }`}
                >
                  <JobList
                    jobs={jobs}
                    selectedJobId={selectedJobId}
                    userRole={userRole}
                    onSelectJob={handleSelectJob}
                    onOpenAddSpk={() => setIsAddSpkOpen(true)}
                    onDeleteJob={handleOpenDeleteDialog}
                    onQuickEditBatch={(job, batch) => {
                      setSelectedJobId(job.id);
                      setBatchToEdit(batch);
                    }}
                    onQuickDeleteBatch={(job, batch) => {
                      setSelectedJobId(job.id);
                      setBatchToDelete(batch);
                    }}
                    onQuickAddBatch={(job) => {
                      setSelectedJobId(job.id);
                      setIsAddBatchOpen(true);
                    }}
                  />
                </div>

                {/* Right Column: Job Detail (Hidden on mobile if in 'list' view) */}
                <div
                  className={`md:col-span-8 flex flex-col ${
                    mobileJobView === 'list' ? 'hidden md:flex' : 'flex'
                  }`}
                >
                  <JobDetail
                    job={currentJob}
                    presets={presets}
                    userRole={userRole}
                    syncDetails={syncDetails}
                    onBackToList={() => setMobileJobView('list')}
                    onUpdateSteps={handleUpdateSteps}
                    onApplyPreset={handleApplyPreset}
                    onSelectPacking={handleSelectPacking}
                    onDeletePacking={handleDeletePackingOption}
                    onUpdateQty={handleUpdateQty}
                    onOpenSavePreset={() => setIsSavePresetOpen(true)}
                    onOpenAddStep={() => setIsAddStepOpen(true)}
                    onOpenAddBatch={() => setIsAddBatchOpen(true)}
                    onOpenEditBatch={(batch) => setBatchToEdit(batch)}
                    onOpenDeleteBatch={(batch) => setBatchToDelete(batch)}
                    onSelectBatch={handleSelectBatch}
                    onOpenAddPacking={() => setIsAddPackingOpen(true)}
                    onOpenMaterialModal={() => setIsMaterialModalOpen(true)}
                    onOpenShipmentModal={() => setIsShipmentModalOpen(true)}
                    onOpenAddSpk={() => setIsAddSpkOpen(true)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'laporan' && (
            <LaporanView jobs={jobs} onSelectJob={handleSelectJob} />
          )}

          {activeTab === 'pengaturan' && userRole === 'moderator' && (
            <PengaturanView
              jobs={jobs}
              presets={presets}
              isOnline={isOnline}
              userRole={userRole}
              sessions={sessions}
              currentDeviceId={currentDeviceId}
              securityConfig={securityConfig}
              onSaveSecurityConfig={handleSaveSecurityConfig}
              onLockApp={handleLockApp}
              onRefreshSessions={() => {
                const refreshed = createInitialDeviceSession(userRole);
                registerOrUpdateDeviceSession(refreshed);
              }}
              onToggleDeviceRole={handleToggleDeviceRole}
              onDeleteSession={handleDeleteDeviceSession}
              onOpenRoleSwitch={() => setIsRoleSwitchOpen(true)}
              onResetAllData={handleResetAllData}
              onRestoreSampleData={handleRestoreSampleData}
              onImportData={handleImportData}
              onPrintAllSpk={() => {
                if (currentJob) {
                  setIsPrintModalOpen(true);
                } else {
                  showSyncToast('offline_saved', 'Info Cetak', 'Pilih SPK terlebih dahulu untuk mencetak.');
                }
              }}
            />
          )}
        </main>
      </div>

      {/* Bottom Sticky Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        badgeCount={activeCount}
        userRole={userRole}
        onOpenRoleSwitch={() => setIsRoleSwitchOpen(true)}
      />

      {/* Realtime Toast Feedback for Firebase & Offline Cache */}
      <SyncToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* ROLE SWITCH MODAL */}
      <RoleSwitchModal
        isOpen={isRoleSwitchOpen}
        currentRole={userRole}
        onClose={() => setIsRoleSwitchOpen(false)}
        onSelectRole={handleSelectRole}
      />

      {/* SYNC DETAILS & SECURITY MODAL */}
      <SyncDetailsModal
        isOpen={isSyncDetailsOpen}
        onClose={() => setIsSyncDetailsOpen(false)}
        syncDetails={syncDetails}
        onManualSync={handleManualSync}
      />

      {/* MODALS */}
      <AddSpkModal
        isOpen={isAddSpkOpen}
        onClose={() => setIsAddSpkOpen(false)}
        presets={presets}
        existingJobs={jobs}
        onSubmit={handleAddJob}
      />

      <AddStepModal
        isOpen={isAddStepOpen}
        onClose={() => setIsAddStepOpen(false)}
        onAddStep={handleAddStepToJob}
      />

      <AddBatchModal
        isOpen={isAddBatchOpen}
        job={currentJob}
        presets={presets}
        onClose={() => setIsAddBatchOpen(false)}
        onAddBatch={handleAddBatch}
      />

      <EditBatchModal
        isOpen={batchToEdit !== null}
        job={currentJob}
        batch={batchToEdit}
        onClose={() => setBatchToEdit(null)}
        onSaveBatch={handleSaveEditedBatch}
      />

      <DeleteBatchModal
        isOpen={batchToDelete !== null}
        batch={batchToDelete}
        spkId={currentJob?.id || ''}
        onClose={() => setBatchToDelete(null)}
        onConfirmDelete={handleConfirmDeleteBatch}
      />

      <SavePresetModal
        isOpen={isSavePresetOpen}
        onClose={() => setIsSavePresetOpen(false)}
        currentSteps={currentJob?.steps || []}
        onSavePreset={handleSavePreset}
      />

      <AddPackingModal
        isOpen={isAddPackingOpen}
        onClose={() => setIsAddPackingOpen(false)}
        onAddOption={handleAddPackingOption}
      />

      <TrackingShipmentModal
        isOpen={isShipmentModalOpen}
        onClose={() => setIsShipmentModalOpen(false)}
        job={currentJob}
        onSave={handleSaveShipment}
      />

      <TrackingMaterialModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        job={currentJob}
        onSave={handleSaveMaterials}
      />

      <PrintSpkModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        job={currentJob}
      />

      <DeleteSpkModal
        isOpen={jobToDelete !== null}
        job={jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
      />
        </div>
      )}
    </>
  );
}

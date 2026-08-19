import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { JobSPK, RoutePresetsMap, DeviceSession, UserRole, SecurityConfig } from '../types';
import { INITIAL_JOBS, DEFAULT_ROUTE_PRESETS } from '../data/initialData';
import { DEFAULT_SECURITY_CONFIG } from '../utils/storage';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with Multi-Tab Persistent Offline Cache
let db: Firestore;
try {
  db = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    },
    firebaseConfig.firestoreDatabaseId || undefined
  );
} catch (e) {
  // Fallback if already initialized
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
}

export { app, db };

// Collections
export const JOBS_COLLECTION = 'jobs';
export const PRESETS_COLLECTION = 'presets';
export const SESSIONS_COLLECTION = 'sessions';
export const SETTINGS_COLLECTION = 'settings';
export const SECURITY_DOC_ID = 'security_pins';

/**
 * Utility to strip undefined properties before sending to Firestore
 * Firestore rejects objects containing `undefined` values
 */
function cleanForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Normalize step names to migrate legacy "Finishing (Lem Mesin)" to "Finishing"
 */
function normalizeJob(job: JobSPK): JobSPK {
  const clean = { ...job };
  if (Array.isArray(clean.steps)) {
    clean.steps = clean.steps.map((s) =>
      s.name && s.name.includes('Lem Mesin') ? { ...s, name: 'Finishing' } : s
    );
  }
  if (Array.isArray(clean.batches)) {
    clean.batches = clean.batches.map((b) => ({
      ...b,
      steps: Array.isArray(b.steps)
        ? b.steps.map((s) =>
            s.name && s.name.includes('Lem Mesin') ? { ...s, name: 'Finishing' } : s
          )
        : b.steps,
    }));
  }
  return clean;
}

/**
 * Subscribe to realtime SPK jobs updates with offline-first support
 */
export function subscribeToJobs(
  onUpdate: (
    jobs: JobSPK[],
    meta?: { fromCache: boolean; hasPendingWrites: boolean }
  ) => void,
  onError?: (err: Error) => void
) {
  const q = collection(db, JOBS_COLLECTION);
  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    async (snapshot) => {
      const meta = {
        fromCache: snapshot.metadata.fromCache,
        hasPendingWrites: snapshot.metadata.hasPendingWrites,
      };

      // If Firestore is completely empty on remote, seed initial data to keep persistence
      if (snapshot.empty && !snapshot.metadata.fromCache) {
        console.info('Firestore is empty. Seeding initial SPK data to ensure persistence...');
        for (const initialJob of INITIAL_JOBS) {
          try {
            await saveJobToFirestore(normalizeJob(initialJob));
          } catch (e) {
            console.warn('Auto-seed job error:', e);
          }
        }
        onUpdate(INITIAL_JOBS.map(normalizeJob), meta);
        return;
      }

      const jobs: JobSPK[] = [];
      snapshot.forEach((docSnap) => {
        const raw = docSnap.data() as JobSPK;
        if (raw && raw.id) {
          jobs.push(normalizeJob(raw));
        }
      });

      if (jobs.length > 0) {
        // Sort by createdAt / ID desc
        jobs.sort((a, b) => b.id.localeCompare(a.id));
        onUpdate(jobs, meta);
      }
    },
    (err) => {
      console.warn('Firestore jobs subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribe to Route Presets
 */
export function subscribeToPresets(
  onUpdate: (presets: RoutePresetsMap) => void,
  onError?: (err: Error) => void
) {
  const q = collection(db, PRESETS_COLLECTION);
  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    async (snapshot) => {
      if (snapshot.empty && !snapshot.metadata.fromCache) {
        console.info('Firestore presets empty. Seeding default route presets...');
        for (const [name, steps] of Object.entries(DEFAULT_ROUTE_PRESETS)) {
          try {
            await savePresetToFirestore(name, steps);
          } catch (e) {
            console.warn('Auto-seed preset error:', e);
          }
        }
        onUpdate(DEFAULT_ROUTE_PRESETS);
        return;
      }

      const presets: RoutePresetsMap = { ...DEFAULT_ROUTE_PRESETS };
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.name && data.steps) {
          presets[data.name] = data.steps.map((s: any) =>
            s.name && s.name.includes('Lem Mesin') ? { ...s, name: 'Finishing' } : s
          );
        }
      });
      onUpdate(presets);
    },
    (err) => {
      console.warn('Firestore presets subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribe to all Active Device Sessions / Login History
 */
export function subscribeToSessions(
  onUpdate: (sessions: DeviceSession[]) => void,
  onError?: (err: Error) => void
) {
  const q = collection(db, SESSIONS_COLLECTION);
  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snapshot) => {
      const sessions: DeviceSession[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DeviceSession;
        if (data && data.id) {
          sessions.push(data);
        }
      });

      // Sort by lastActive desc (most recent first)
      sessions.sort((a, b) => (b.lastActive || '').localeCompare(a.lastActive || ''));
      onUpdate(sessions);
    },
    (err) => {
      console.warn('Firestore sessions subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Realtime listener for this specific device's assigned role
 * Allows another admin to change this device's role in real-time
 */
export function subscribeToDeviceRole(
  deviceId: string,
  onRoleChange: (role: UserRole) => void
) {
  if (!deviceId) return () => {};
  const docRef = doc(db, SESSIONS_COLLECTION, deviceId);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as DeviceSession;
        if (data && (data.assignedRole === 'moderator' || data.assignedRole === 'spectator')) {
          onRoleChange(data.assignedRole);
        }
      }
    },
    (err) => {
      console.warn('Device role listener error:', err);
    }
  );
}

/**
 * Register or update current device session in Firestore
 */
export async function registerOrUpdateDeviceSession(session: DeviceSession): Promise<void> {
  if (!session.id) return;
  const docRef = doc(db, SESSIONS_COLLECTION, session.id);

  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const existing = snap.data() as DeviceSession;
      // Do not overwrite existing assignedRole assigned by admin/moderator
      const payload = cleanForFirestore({
        deviceName: session.deviceName,
        platform: session.platform,
        userLabel: session.userLabel || existing.userLabel || 'Operator',
        assignedRole: existing.assignedRole || session.assignedRole || 'spectator',
        lastActive: new Date().toISOString(),
        status: 'online',
      });
      await setDoc(docRef, payload, { merge: true });
    } else {
      // First login for new device -> default to spectator
      const payload = cleanForFirestore({
        ...session,
        assignedRole: session.assignedRole || 'spectator',
        firstLogin: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        status: 'online',
      });
      await setDoc(docRef, payload, { merge: true });
    }
  } catch {
    // Offline fallback
    const payload = cleanForFirestore({
      ...session,
      assignedRole: session.assignedRole || 'spectator',
      lastActive: new Date().toISOString(),
      status: 'online',
    });
    await setDoc(docRef, payload, { merge: true }).catch(() => {});
  }
}

/**
 * Update a device's assigned role (Admin action)
 */
export async function updateDeviceRoleInFirestore(
  deviceId: string,
  role: UserRole
): Promise<void> {
  const docRef = doc(db, SESSIONS_COLLECTION, deviceId);
  await setDoc(docRef, { assignedRole: role }, { merge: true });
}

/**
 * Update a device's user/operator label
 */
export async function updateDeviceLabelInFirestore(
  deviceId: string,
  userLabel: string
): Promise<void> {
  const docRef = doc(db, SESSIONS_COLLECTION, deviceId);
  await setDoc(docRef, { userLabel: userLabel.trim() }, { merge: true });
}

/**
 * Delete a device session
 */
export async function deleteDeviceSessionFromFirestore(deviceId: string): Promise<void> {
  const docRef = doc(db, SESSIONS_COLLECTION, deviceId);
  await deleteDoc(docRef);
}

/**
 * Save or update a single SPK job to Firestore
 */
export async function saveJobToFirestore(job: JobSPK): Promise<void> {
  const docRef = doc(db, JOBS_COLLECTION, job.id);
  const payload = cleanForFirestore({
    ...normalizeJob(job),
    updatedAt: new Date().toISOString(),
  });
  await setDoc(docRef, payload, { merge: true });
}

/**
 * Delete SPK job from Firestore
 */
export async function deleteJobFromFirestore(jobId: string): Promise<void> {
  const docRef = doc(db, JOBS_COLLECTION, jobId);
  await deleteDoc(docRef);
}

/**
 * Save custom preset to Firestore
 */
export async function savePresetToFirestore(name: string, steps: any[]): Promise<void> {
  const docRef = doc(db, PRESETS_COLLECTION, name.replace(/[^a-zA-Z0-9_-]/g, '_'));
  const payload = cleanForFirestore({
    name,
    steps: steps.map((s) =>
      s.name && s.name.includes('Lem Mesin') ? { ...s, name: 'Finishing' } : s
    ),
    createdAt: new Date().toISOString(),
  });
  await setDoc(docRef, payload, { merge: true });
}

/**
 * Seed initial sample data to Firestore
 */
export async function seedInitialJobs() {
  try {
    for (const job of INITIAL_JOBS) {
      await saveJobToFirestore(job);
    }
  } catch (err) {
    console.error('Failed to seed initial jobs:', err);
  }
}

export async function seedInitialPresets() {
  try {
    for (const [name, steps] of Object.entries(DEFAULT_ROUTE_PRESETS)) {
      await savePresetToFirestore(name, steps);
    }
  } catch (err) {
    console.error('Failed to seed initial presets:', err);
  }
}

/**
 * Clear all data in Firestore
 */
export async function clearAllFirestoreData(jobIds: string[]) {
  try {
    for (const id of jobIds) {
      await deleteJobFromFirestore(id);
    }
  } catch (err) {
    console.error('Failed to clear Firestore data:', err);
  }
}

/**
 * Subscribe to security configuration (Internal Access PIN & Moderator PIN)
 */
export function subscribeToSecurityConfig(
  onUpdate: (config: SecurityConfig) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, SETTINGS_COLLECTION, SECURITY_DOC_ID);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<SecurityConfig>;
        onUpdate({
          ...DEFAULT_SECURITY_CONFIG,
          ...data,
        });
      } else {
        // Seed default security settings if not created yet
        saveSecurityConfigToFirestore(DEFAULT_SECURITY_CONFIG).catch(() => {});
        onUpdate(DEFAULT_SECURITY_CONFIG);
      }
    },
    (err) => {
      console.warn('Security config listener fallback:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save Security Configuration to Firestore
 */
export async function saveSecurityConfigToFirestore(config: SecurityConfig): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, SECURITY_DOC_ID);
  const payload = cleanForFirestore({
    ...config,
    updatedAt: new Date().toISOString(),
  });
  await setDoc(docRef, payload, { merge: true });
}

import { JobSPK, RoutePresetsMap, UserRole, SecurityConfig } from '../types';
import { INITIAL_JOBS, DEFAULT_ROUTE_PRESETS } from '../data/initialData';

const JOBS_KEY = 'workflow_produksi_jobs_v1';
const PRESETS_KEY = 'workflow_produksi_presets_v1';
const ROLE_KEY = 'workflow_produksi_user_role_v1';
const UNLOCKED_KEY = 'workflow_produksi_unlocked_v1';
const SECURITY_CONFIG_KEY = 'workflow_produksi_security_config_v1';

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  internalPin: '1234',
  moderatorPin: '8899',
  isLockEnabled: true,
  companyName: 'Percetakan & Packaging Internal',
};

function normalizeStoredJobs(jobs: JobSPK[]): JobSPK[] {
  return jobs.map((job) => ({
    ...job,
    steps: Array.isArray(job.steps)
      ? job.steps.map((s) =>
          s.name && s.name.includes('Lem Mesin') ? { ...s, name: 'Finishing' } : s
        )
      : [],
    batches: Array.isArray(job.batches)
      ? job.batches.map((b) => ({
          ...b,
          steps: Array.isArray(b.steps)
            ? b.steps.map((s) =>
                s.name && s.name.includes('Lem Mesin') ? { ...s, name: 'Finishing' } : s
              )
            : [],
        }))
      : [],
  }));
}

export function loadStoredJobs(): JobSPK[] {
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return normalizeStoredJobs(parsed);
      }
    }
  } catch (err) {
    console.error('Failed to load jobs from localStorage:', err);
  }
  return INITIAL_JOBS;
}

export function saveStoredJobs(jobs: JobSPK[]): void {
  try {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  } catch (err) {
    console.error('Failed to save jobs to localStorage:', err);
  }
}

export function loadStoredPresets(): RoutePresetsMap {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_ROUTE_PRESETS, ...parsed };
      }
    }
  } catch (err) {
    console.error('Failed to load presets from localStorage:', err);
  }
  return DEFAULT_ROUTE_PRESETS;
}

export function saveStoredPresets(presets: RoutePresetsMap): void {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch (err) {
    console.error('Failed to save presets to localStorage:', err);
  }
}

export function loadStoredRole(): UserRole {
  try {
    const raw = localStorage.getItem(ROLE_KEY);
    if (raw === 'spectator' || raw === 'moderator') {
      return raw;
    }
  } catch (err) {
    console.error('Failed to load user role:', err);
  }
  return 'spectator'; // Default to Spectator (Read-Only) for any new device / first login
}

export function saveStoredRole(role: UserRole): void {
  try {
    localStorage.setItem(ROLE_KEY, role);
  } catch (err) {
    console.error('Failed to save user role:', err);
  }
}

export function loadStoredSecurityConfig(): SecurityConfig {
  try {
    const raw = localStorage.getItem(SECURITY_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_SECURITY_CONFIG, ...parsed };
      }
    }
  } catch (err) {
    console.error('Failed to load security config:', err);
  }
  return DEFAULT_SECURITY_CONFIG;
}

export function saveStoredSecurityConfig(config: SecurityConfig): void {
  try {
    localStorage.setItem(SECURITY_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save security config:', err);
  }
}

export function isAppUnlocked(): boolean {
  try {
    return localStorage.getItem(UNLOCKED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAppUnlocked(unlocked: boolean): void {
  try {
    if (unlocked) {
      localStorage.setItem(UNLOCKED_KEY, 'true');
    } else {
      localStorage.removeItem(UNLOCKED_KEY);
    }
  } catch (err) {
    console.error('Failed to set unlocked status:', err);
  }
}

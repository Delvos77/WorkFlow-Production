import { DeviceSession, UserRole } from '../types';

const DEVICE_ID_KEY = 'workflow_device_session_id_v1';
const USER_LABEL_KEY = 'workflow_device_user_label_v1';

export function getOrCreateDeviceId(): string {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      const randomPart = Math.random().toString(36).substring(2, 10);
      const timePart = Date.now().toString(36);
      deviceId = `dev-${timePart}-${randomPart}`;
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return `dev-${Date.now()}`;
  }
}

export function getStoredUserLabel(): string {
  try {
    const label = localStorage.getItem(USER_LABEL_KEY);
    if (label && label.trim()) return label.trim();
  } catch {}
  return '';
}

export function saveStoredUserLabel(label: string): void {
  try {
    localStorage.setItem(USER_LABEL_KEY, label.trim());
  } catch {}
}

export function detectDeviceName(): { deviceName: string; platform: string } {
  if (typeof navigator === 'undefined') {
    return { deviceName: 'Web Browser', platform: 'Web' };
  }

  const ua = navigator.userAgent || '';
  let os = 'Unknown OS';
  let browser = 'Browser';
  let deviceType = 'Desktop';

  // Detect OS
  if (/Android/i.test(ua)) {
    os = 'Android';
    deviceType = 'Smartphone';
  } else if (/iPhone/i.test(ua)) {
    os = 'iOS (iPhone)';
    deviceType = 'iPhone';
  } else if (/iPad/i.test(ua)) {
    os = 'iOS (iPad)';
    deviceType = 'Tablet';
  } else if (/Windows NT/i.test(ua)) {
    os = 'Windows PC';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'MacOS (MacBook/iMac)';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  // Detect Browser
  if (/Edg\//i.test(ua)) {
    browser = 'Edge';
  } else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) {
    browser = 'Chrome';
  } else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) {
    browser = 'Safari';
  } else if (/Firefox\//i.test(ua)) {
    browser = 'Firefox';
  }

  const deviceName = `${deviceType} • ${os} (${browser})`;
  const platform = `${os} / ${browser}`;

  return { deviceName, platform };
}

export function createInitialDeviceSession(defaultRole: UserRole = 'spectator'): DeviceSession {
  const id = getOrCreateDeviceId();
  const { deviceName, platform } = detectDeviceName();
  const userLabel = getStoredUserLabel() || `Operator (${deviceName.split(' • ')[0]})`;
  const now = new Date().toISOString();

  return {
    id,
    deviceName,
    userLabel,
    assignedRole: defaultRole,
    lastActive: now,
    firstLogin: now,
    platform,
    status: 'online',
  };
}

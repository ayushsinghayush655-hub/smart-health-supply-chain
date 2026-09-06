import { LedgerExtractionItem } from '../types';

export interface QueuedAttendance {
  id: string;
  facilityId: string;
  facilityType: 'PHC' | 'HOSPITAL';
  timestamp: string;
  photoPreview?: string;
  coords?: { lat: number; lng: number };
}

const LEDGER_STORAGE_KEY = 'aarogyanet_offline_ledgers';
const ATTENDANCE_STORAGE_KEY = 'aarogyanet_offline_attendance';
const SIMULATED_OFFLINE_KEY = 'aarogyanet_simulated_offline';

export class OfflineSyncManager {
  private static isSimulatedOffline: boolean = false;

  public static init() {
    const saved = localStorage.getItem(SIMULATED_OFFLINE_KEY);
    if (saved !== null) {
      this.isSimulatedOffline = saved === 'true';
    }

    window.addEventListener('online', () => {
      if (!this.isSimulatedOffline) {
        this.triggerSync();
      }
    });
  }

  public static initAutoSync() {
    this.init();
  }

  public static isOnline(): boolean {
    if (this.isSimulatedOffline) return false;
    return navigator.onLine;
  }

  public static toggleSimulatedOffline(): boolean {
    this.isSimulatedOffline = !this.isSimulatedOffline;
    localStorage.setItem(SIMULATED_OFFLINE_KEY, String(this.isSimulatedOffline));
    window.dispatchEvent(new CustomEvent('connectivity-change', { detail: { isOnline: this.isOnline() } }));
    if (this.isOnline()) {
      this.triggerSync();
    }
    return this.isOnline();
  }

  // Queuing Ledgers
  public static queueLedger(item: Partial<LedgerExtractionItem>) {
    const queue = this.getQueuedLedgers();
    const queuedItem = {
      ...item,
      id: item.id || `OFFLINE-LED-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: item.timestamp || new Date().toISOString(),
      syncedOffline: true,
      status: 'pending' as const,
    };
    queue.unshift(queuedItem);
    localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('offline-queue-updated'));
    return queuedItem;
  }

  public static getQueuedLedgers(): any[] {
    try {
      const data = localStorage.getItem(LEDGER_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Queuing Attendance
  public static queueAttendance(attendance: QueuedAttendance) {
    const queue = this.getQueuedAttendances();
    queue.unshift(attendance);
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('offline-queue-updated'));
    return attendance;
  }

  public static getQueuedAttendances(): QueuedAttendance[] {
    try {
      const data = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static async triggerSync(): Promise<{ success: boolean; ledgersSynced: number; attendancesSynced: number; message: string }> {
    if (!this.isOnline()) {
      return { success: false, ledgersSynced: 0, attendancesSynced: 0, message: 'Device is currently offline' };
    }

    const ledgers = this.getQueuedLedgers();
    const attendances = this.getQueuedAttendances();

    if (ledgers.length === 0 && attendances.length === 0) {
      return { success: true, ledgersSynced: 0, attendancesSynced: 0, message: 'No offline items to sync' };
    }

    try {
      const res = await fetch('/api/sync/offline-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ledgerQueue: ledgers,
          attendanceQueue: attendances,
        }),
      });

      if (!res.ok) throw new Error('Sync endpoint failed');
      const data = await res.json();

      // Clear local queues on successful sync
      localStorage.removeItem(LEDGER_STORAGE_KEY);
      localStorage.removeItem(ATTENDANCE_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('offline-queue-synced', { detail: data }));
      window.dispatchEvent(new CustomEvent('offline-queue-updated'));

      return {
        success: true,
        ledgersSynced: data.ledgerSyncedCount,
        attendancesSynced: data.attendanceSyncedCount,
        message: data.message,
      };
    } catch (err: any) {
      console.error('Failed to sync offline items:', err);
      return { success: false, ledgersSynced: 0, attendancesSynced: 0, message: 'Sync failed: ' + err.message };
    }
  }
}

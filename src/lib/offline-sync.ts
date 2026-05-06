import { Student, Skill, StudentProgress } from '@/types/student';
import { fetchStudents } from './supabase-students';
import { fetchSkills, bulkUpdateProgress } from './supabase-skills';


const STORAGE_KEYS = {
  STUDENTS: 'ananse_students_cache',
  SKILLS: 'ananse_skills_cache',
  PROGRESS: 'ananse_progress_cache',
  PENDING_UPDATES: 'ananse_pending_updates',
  LAST_SYNC: 'ananse_last_sync',
  IS_ONLINE: 'ananse_is_online'
};

export interface PendingUpdate {
  id: string;
  studentId: string;
  skillId: string;
  mastered: boolean;
  timestamp: number;
}

class OfflineSyncManager {
  private syncListeners: Set<() => void> = new Set();
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.initializeOnlineListeners();
    this.checkAndSync();
  }

  private initializeOnlineListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      this.syncPendingUpdates();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  onSyncStatusChange(callback: () => void) {
    this.syncListeners.add(callback);
    return () => this.syncListeners.delete(callback);
  }

  private notifyListeners() {
    this.syncListeners.forEach(cb => cb());
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  async cacheStudents(students: Student[]) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }

  getCachedStudents(): Student[] {
    const cached = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return cached ? JSON.parse(cached) : [];
  }

  async cacheSkills(skills: Skill[]) {
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
  }

  getCachedSkills(): Skill[] {
    const cached = localStorage.getItem(STORAGE_KEYS.SKILLS);
    return cached ? JSON.parse(cached) : [];
  }

  async cacheProgress(progress: StudentProgress[]) {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  }

  getCachedProgress(): StudentProgress[] {
    const cached = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return cached ? JSON.parse(cached) : [];
  }

  addPendingUpdate(update: Omit<PendingUpdate, 'id' | 'timestamp'>) {
    const pending = this.getPendingUpdates();
    const newUpdate: PendingUpdate = {
      ...update,
      id: `${update.studentId}_${update.skillId}_${Date.now()}`,
      timestamp: Date.now()
    };
    pending.push(newUpdate);
    localStorage.setItem(STORAGE_KEYS.PENDING_UPDATES, JSON.stringify(pending));
    this.notifyListeners();
  }

  getPendingUpdates(): PendingUpdate[] {
    const cached = localStorage.getItem(STORAGE_KEYS.PENDING_UPDATES);
    return cached ? JSON.parse(cached) : [];
  }

  clearPendingUpdates() {
    localStorage.setItem(STORAGE_KEYS.PENDING_UPDATES, JSON.stringify([]));
    this.notifyListeners();
  }

  getLastSyncTime(): Date | null {
    const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return timestamp ? new Date(parseInt(timestamp)) : null;
  }

  private setLastSyncTime() {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
  }

  async syncPendingUpdates(): Promise<boolean> {
    if (!this.isOnline) return false;

    const pending = this.getPendingUpdates();
    if (pending.length === 0) return true;

    try {
      const updates = pending.map(p => ({
        studentId: p.studentId,
        skillId: p.skillId,
        mastered: p.mastered
      }));

      await bulkUpdateProgress(updates);
      this.clearPendingUpdates();
      this.setLastSyncTime();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  }

  async refreshCache(): Promise<void> {
    if (!this.isOnline) return;

    try {
      // Fetch all skills without filters
      const skills = await fetchSkills();
      await this.cacheSkills(skills);
      this.setLastSyncTime();
      this.notifyListeners();
    } catch (error) {
      console.error('Cache refresh failed:', error);
    }
  }


  private async checkAndSync() {
    if (this.isOnline) {
      await this.syncPendingUpdates();
      await this.refreshCache();
    }
  }
}

export const offlineSyncManager = new OfflineSyncManager();

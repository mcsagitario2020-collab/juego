import { PlayerProgress } from '../types/game';

const STORAGE_KEY = 'kubo_blocks_progress_v1';

const DEFAULT_PROGRESS: PlayerProgress = {
  highestUnlockedLevel: 1,
  completedLevels: [],
  classicBestScore: 0,
  dailyCompletedDates: [],
  dailyBestScores: {},
  soundEnabled: true,
  darkMode: false,
};

export function loadProgress(): PlayerProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    return {
      highestUnlockedLevel:
        typeof parsed.highestUnlockedLevel === 'number' && parsed.highestUnlockedLevel >= 1
          ? parsed.highestUnlockedLevel
          : 1,
      completedLevels: Array.isArray(parsed.completedLevels) ? parsed.completedLevels : [],
      classicBestScore: typeof parsed.classicBestScore === 'number' ? parsed.classicBestScore : 0,
      dailyCompletedDates: Array.isArray(parsed.dailyCompletedDates)
        ? parsed.dailyCompletedDates
        : [],
      dailyBestScores:
        parsed.dailyBestScores && typeof parsed.dailyBestScores === 'object'
          ? parsed.dailyBestScores
          : {},
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      darkMode: typeof parsed.darkMode === 'boolean' ? parsed.darkMode : false,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: PlayerProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota issues gracefully
  }
}

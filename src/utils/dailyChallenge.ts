import { BlockColorId, DailyChallengeConfig, PresetTile } from '../types/game';
import { PLAYABLE_COLORS } from '../data/pieces';

/**
 * Deterministic Mulberry32 PRNG so every player gets the exact same
 * Daily Challenge layout and piece sequence on a given calendar date.
 */
export function createSeededRng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getTodayDateKey(): string {
  const now = new Date();
  return formatDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function formatDateKey(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateKey.split('-').map(Number);
  return { year: y, month: m, day: d };
}

export function formatReadableDateEs(dateKey: string): string {
  const { year, month, day } = parseDateKey(dateKey);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatMonthTitleEs(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  const raw = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
  }).format(date);
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function hashDateKey(dateKey: string): number {
  let hash = 2166136261;
  for (let i = 0; i < dateKey.length; i++) {
    hash ^= dateKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const DAILY_TITLES = [
  'Simetría del alba',
  'Mosaico del mediodía',
  'Trazo equilibrado',
  'Pausa geométrica',
  'Orden en calma',
  'Cuadrante sereno',
  'Cadencia diaria',
  'Arquitectura limpia',
  'Pulso minimalista',
  'Eje cristalino',
  'Forma precisa',
  'Horizonte claro',
];

export function getDailyChallengeConfig(dateKey: string): DailyChallengeConfig {
  const seed = hashDateKey(`kubo-daily-${dateKey}`);
  const rng = createSeededRng(seed);

  const title = DAILY_TITLES[Math.floor(rng() * DAILY_TITLES.length)];
  const accentColor: BlockColorId = PLAYABLE_COLORS[Math.floor(rng() * PLAYABLE_COLORS.length)];
  const variant = Math.floor(rng() * 3); // 0 = gems + lines, 1 = gems + score, 2 = lines + score

  const presetTiles: PresetTile[] = [];
  const used = new Set<string>();

  // Create a clean, symmetric architectural starter pattern (2-4 normal/stone blocks + gems)
  const addSymmetric = (
    r: number,
    c: number,
    kind: 'normal' | 'gem' | 'stone',
    color: BlockColorId
  ) => {
    const coords = [
      [r, c],
      [7 - r, 7 - c],
    ];
    for (const [rr, cc] of coords) {
      const k = `${rr},${cc}`;
      if (!used.has(k)) {
        used.add(k);
        presetTiles.push({
          row: rr,
          col: cc,
          kind,
          color: kind === 'stone' ? 'stone' : color,
          hp: kind === 'stone' ? 2 : 1,
        });
      }
    }
  };

  // Add 1 or 2 symmetric stone anchors
  const stonePairs = rng() > 0.45 ? 1 : 2;
  for (let i = 0; i < stonePairs; i++) {
    const r = 1 + Math.floor(rng() * 3);
    const c = 1 + Math.floor(rng() * 3);
    addSymmetric(r, c, 'stone', 'stone');
  }

  // Add 3-4 symmetric decorative starter tiles
  const normalPairs = 2 + Math.floor(rng() * 2);
  for (let i = 0; i < normalPairs; i++) {
    const r = Math.floor(rng() * 4);
    const c = Math.floor(rng() * 8);
    addSymmetric(r, c, 'normal', accentColor);
  }

  // Add gems if challenge involves gems
  let gemCount = 0;
  if (variant === 0 || variant === 1) {
    const gemPairs = 3 + Math.floor(rng() * 2); // 6 or 8 gems
    let guard = 0;
    while (gemCount < gemPairs * 2 && guard < 80) {
      guard++;
      const r = Math.floor(rng() * 4);
      const c = Math.floor(rng() * 8);
      const k1 = `${r},${c}`;
      const k2 = `${7 - r},${7 - c}`;
      if (!used.has(k1) && !used.has(k2) && k1 !== k2) {
        addSymmetric(r, c, 'gem', 'ochre');
        gemCount += 2;
      }
    }
  }

  const objectives =
    variant === 0
      ? [
          { type: 'gems' as const, target: gemCount, label: 'gemas' },
          { type: 'lines' as const, target: 8, label: 'líneas' },
        ]
      : variant === 1
        ? [
            { type: 'gems' as const, target: gemCount, label: 'gemas' },
            { type: 'score' as const, target: 750, label: 'puntos' },
          ]
        : [
            { type: 'lines' as const, target: 10, label: 'líneas' },
            { type: 'score' as const, target: 900, label: 'puntos' },
          ];

  return {
    dateKey,
    seed: seed ^ 0x9e3779b9,
    title,
    objectives,
    maxTier: 3,
    presetTiles,
  };
}

export function calculateDailyStreaks(completedDates: string[]): {
  currentStreak: number;
  bestStreak: number;
  completedThisMonth: number;
  daysInCurrentMonth: number;
} {
  const uniqueSorted = Array.from(new Set(completedDates)).sort();
  const completedSet = new Set(uniqueSorted);

  const today = new Date();
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-`;
  const completedThisMonth = uniqueSorted.filter((d) => d.startsWith(monthPrefix)).length;

  // Current streak: count backwards from today (or yesterday if today not yet finished)
  let currentStreak = 0;
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!completedSet.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (true) {
    const key = formatDateKey(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
    if (completedSet.has(key)) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // Best streak across all recorded dates
  let bestStreak = 0;
  let running = 0;
  let prevTime: number | null = null;

  for (const key of uniqueSorted) {
    const { year, month, day } = parseDateKey(key);
    const time = Date.UTC(year, month - 1, day);
    if (prevTime !== null && time - prevTime === 86400000) {
      running++;
    } else {
      running = 1;
    }
    if (running > bestStreak) bestStreak = running;
    prevTime = time;
  }

  return {
    currentStreak,
    bestStreak,
    completedThisMonth,
    daysInCurrentMonth,
  };
}

export function getMonthCalendarCells(year: number, month: number): Array<{
  day: number | null;
  dateKey: string | null;
}> {
  const firstDay = new Date(year, month - 1, 1);
  // Monday-first European/Spanish week index (0 = Mon .. 6 = Sun)
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const totalDays = new Date(year, month, 0).getDate();

  const cells: Array<{ day: number | null; dateKey: string | null }> = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ day: null, dateKey: null });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, dateKey: formatDateKey(year, month, d) });
  }
  return cells;
}

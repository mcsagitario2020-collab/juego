export const BOARD_SIZE = 8;

export type BlockColorId =
  | 'cobalt'
  | 'sage'
  | 'ochre'
  | 'terracotta'
  | 'indigo'
  | 'teal'
  | 'stone';

export type CellKind = 'normal' | 'gem' | 'stone';

export interface BoardCell {
  color: BlockColorId;
  kind: CellKind;
  /** Reinforced stone tiles require 2 line clears to break (hp: 2 -> 1 -> cleared) */
  hp?: number;
  /** Timestamp or counter for subtle entrance animation */
  placedAt?: number;
}

export type BoardGrid = (BoardCell | null)[][];

export interface PieceShape {
  id: string;
  name: string;
  /** 2D binary matrix of 1s and 0s */
  matrix: number[][];
  /** Complexity tier: 1 = beginner/compact, 2 = medium, 3 = advanced/large */
  tier: 1 | 2 | 3;
  /** Default architectural color */
  color: BlockColorId;
}

export interface TrayPiece {
  instanceId: string;
  shape: PieceShape;
  color: BlockColorId;
  placed: boolean;
}

export type GameMode = 'levels' | 'daily' | 'classic';

export type GameStatus = 'PLAYING' | 'VICTORY' | 'GAME_OVER';

export type ObjectiveType = 'score' | 'lines' | 'gems';

export interface LevelObjective {
  type: ObjectiveType;
  target: number;
  label: string;
}

export interface PresetTile {
  row: number;
  col: number;
  kind: CellKind;
  color: BlockColorId;
  hp?: number;
}

export interface LevelConfig {
  id: number;
  chapter: string;
  title: string;
  subtitle: string;
  objectives: LevelObjective[];
  maxTier: 1 | 2 | 3;
  presetTiles: PresetTile[];
}

export interface DailyChallengeConfig {
  dateKey: string; // YYYY-MM-DD
  seed: number;
  title: string;
  objectives: LevelObjective[];
  maxTier: 1 | 2 | 3;
  presetTiles: PresetTile[];
}

export interface ClearingCell {
  row: number;
  col: number;
  cell: BoardCell;
  delayMs: number;
}

export interface FloatingPopup {
  id: number;
  text: string;
  subtext?: string;
  xPercent: number;
  yPercent: number;
}

export interface PlayerProgress {
  highestUnlockedLevel: number;
  completedLevels: number[];
  classicBestScore: number;
  dailyCompletedDates: string[]; // ['2026-11-17', ...]
  dailyBestScores: Record<string, number>;
  soundEnabled: boolean;
  darkMode: boolean;
}

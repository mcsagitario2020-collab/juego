import {
  BOARD_SIZE,
  BoardGrid,
  ClearingCell,
  PieceShape,
  PresetTile,
  TrayPiece,
} from '../types/game';
import { countMatrixCells, PIECE_CATALOG, PLAYABLE_COLORS } from '../data/pieces';

export function createEmptyBoard(): BoardGrid {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );
}

export function cloneBoard(board: BoardGrid): BoardGrid {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function applyPresetTiles(presetTiles: PresetTile[]): BoardGrid {
  const board = createEmptyBoard();
  for (const tile of presetTiles) {
    if (
      tile.row >= 0 &&
      tile.row < BOARD_SIZE &&
      tile.col >= 0 &&
      tile.col < BOARD_SIZE
    ) {
      board[tile.row][tile.col] = {
        color: tile.color,
        kind: tile.kind,
        hp: tile.kind === 'stone' ? (tile.hp ?? 2) : 1,
      };
    }
  }
  return board;
}

export function canPlacePiece(
  board: BoardGrid,
  matrix: number[][],
  startRow: number,
  startCol: number
): boolean {
  const rows = matrix.length;
  const cols = matrix[0].length;

  if (
    startRow < 0 ||
    startCol < 0 ||
    startRow + rows > BOARD_SIZE ||
    startCol + cols > BOARD_SIZE
  ) {
    return false;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] === 1 && board[startRow + r][startCol + c] !== null) {
        return false;
      }
    }
  }

  return true;
}

export function canPieceFitAnywhere(board: BoardGrid, matrix: number[][]): boolean {
  const rows = matrix.length;
  const cols = matrix[0].length;
  for (let r = 0; r <= BOARD_SIZE - rows; r++) {
    for (let c = 0; c <= BOARD_SIZE - cols; c++) {
      if (canPlacePiece(board, matrix, r, c)) {
        return true;
      }
    }
  }
  return false;
}

export function canAnyTrayPieceFit(board: BoardGrid, tray: TrayPiece[]): boolean {
  const remaining = tray.filter((p) => !p.placed);
  if (remaining.length === 0) return true;
  return remaining.some((p) => canPieceFitAnywhere(board, p.shape.matrix));
}

export function getPreviewClears(
  board: BoardGrid,
  matrix: number[][],
  startRow: number,
  startCol: number
): { rows: number[]; cols: number[] } {
  if (!canPlacePiece(board, matrix, startRow, startCol)) {
    return { rows: [], cols: [] };
  }

  const simulated = cloneBoard(board);
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] === 1) {
        simulated[startRow + r][startCol + c] = {
          color: 'cobalt',
          kind: 'normal',
        };
      }
    }
  }

  const fullRows: number[] = [];
  const fullCols: number[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    if (simulated[r].every((cell) => cell !== null)) {
      fullRows.push(r);
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (simulated[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) fullCols.push(c);
  }

  return { rows: fullRows, cols: fullCols };
}

export interface PlacementResult {
  nextBoard: BoardGrid;
  clearingCells: ClearingCell[];
  linesCleared: number;
  gemsCollected: number;
  pointsEarned: number;
  newCombo: number;
  isAllClear: boolean;
  calloutText: string | null;
  calloutSubtext: string | null;
}

export function executePlacement(
  board: BoardGrid,
  piece: TrayPiece,
  startRow: number,
  startCol: number,
  currentCombo: number,
  moveCounter: number
): PlacementResult {
  const nextBoard = cloneBoard(board);
  const matrix = piece.shape.matrix;
  const cellsPlaced = countMatrixCells(matrix);

  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] === 1) {
        nextBoard[startRow + r][startCol + c] = {
          color: piece.color,
          kind: 'normal',
          hp: 1,
          placedAt: moveCounter,
        };
      }
    }
  }

  const fullRows: number[] = [];
  const fullCols: number[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    if (nextBoard[r].every((cell) => cell !== null)) {
      fullRows.push(r);
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (nextBoard[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) fullCols.push(c);
  }

  const linesCleared = fullRows.length + fullCols.length;
  const clearingCells: ClearingCell[] = [];
  let gemsCollected = 0;

  if (linesCleared > 0) {
    const affected = new Map<string, { r: number; c: number; order: number }>();

    fullRows.forEach((r) => {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const key = `${r},${c}`;
        if (!affected.has(key)) {
          affected.set(key, { r, c, order: c });
        }
      }
    });

    fullCols.forEach((c) => {
      for (let r = 0; r < BOARD_SIZE; r++) {
        const key = `${r},${c}`;
        if (!affected.has(key)) {
          affected.set(key, { r, c, order: r });
        }
      }
    });

    affected.forEach(({ r, c, order }) => {
      const cell = nextBoard[r][c];
      if (!cell) return;

      if (cell.kind === 'stone' && (cell.hp ?? 1) > 1) {
        // Reinforced stone cracks down to 1 HP instead of clearing immediately
        nextBoard[r][c] = { ...cell, hp: (cell.hp ?? 2) - 1 };
      } else {
        if (cell.kind === 'gem') {
          gemsCollected++;
        }
        clearingCells.push({
          row: r,
          col: c,
          cell: { ...cell },
          delayMs: order * 24,
        });
        nextBoard[r][c] = null;
      }
    });
  }

  const newCombo = linesCleared > 0 ? currentCombo + 1 : 0;

  // Check if entire board is now clean
  let remainingCells = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (nextBoard[r][c] !== null) remainingCells++;
    }
  }
  const isAllClear = linesCleared > 0 && remainingCells === 0;

  // Scoring formula: tactile & rewarding for multi-line + combos
  let lineBonus = 0;
  if (linesCleared === 1) lineBonus = 20;
  else if (linesCleared === 2) lineBonus = 55;
  else if (linesCleared === 3) lineBonus = 110;
  else if (linesCleared >= 4) lineBonus = 180 + (linesCleared - 4) * 70;

  const comboBonus = linesCleared > 0 && newCombo > 1 ? (newCombo - 1) * 25 : 0;
  const gemBonus = gemsCollected * 15;
  const allClearBonus = isAllClear ? 250 : 0;
  const pointsEarned = cellsPlaced * 2 + lineBonus + comboBonus + gemBonus + allClearBonus;

  let calloutText: string | null = null;
  let calloutSubtext: string | null = null;

  if (isAllClear) {
    calloutText = 'Tablero limpio';
    calloutSubtext = `+${pointsEarned}`;
  } else if (linesCleared >= 2) {
    const names = ['', '', 'Doble', 'Triple', 'Cuádruple', 'Quíntuple'];
    calloutText = names[Math.min(linesCleared, 5)] || `${linesCleared} líneas`;
    calloutSubtext = newCombo > 1 ? `Combo ×${newCombo} · +${pointsEarned}` : `+${pointsEarned}`;
  } else if (linesCleared === 1 && newCombo > 1) {
    calloutText = `Combo ×${newCombo}`;
    calloutSubtext = `+${pointsEarned}`;
  } else if (linesCleared === 1) {
    calloutText = `+${pointsEarned}`;
  }

  return {
    nextBoard,
    clearingCells,
    linesCleared,
    gemsCollected,
    pointsEarned,
    newCombo,
    isAllClear,
    calloutText,
    calloutSubtext,
  };
}

let pieceUidCounter = 1;

export function generateSmartHand(
  board: BoardGrid,
  maxTier: 1 | 2 | 3,
  rng: () => number = Math.random
): TrayPiece[] {
  const pool = PIECE_CATALOG.filter((p) => p.tier <= maxTier);

  // Measure board fill ratio to balance piece weights naturally
  let filled = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) filled++;
    }
  }
  const fillRatio = filled / (BOARD_SIZE * BOARD_SIZE);

  // Build weighted pool
  const weighted: PieceShape[] = [];
  for (const shape of pool) {
    let weight = 3;
    if (shape.tier === 1) weight = fillRatio > 0.55 ? 6 : 4;
    if (shape.tier === 2) weight = fillRatio > 0.65 ? 2 : 3;
    if (shape.tier === 3) weight = fillRatio > 0.55 ? 1 : 2;
    for (let i = 0; i < weight; i++) {
      weighted.push(shape);
    }
  }

  const chosen: PieceShape[] = [];
  const chosenIds = new Set<string>();

  for (let i = 0; i < 3; i++) {
    let picked = weighted[Math.floor(rng() * weighted.length)];
    let attempts = 0;
    while (chosenIds.has(picked.id) && attempts < 14) {
      picked = weighted[Math.floor(rng() * weighted.length)];
      attempts++;
    }
    chosen.push(picked);
    chosenIds.add(picked.id);
  }

  // Fair play guarantee: if none of the 3 chosen shapes can fit on the current board,
  // swap slot 0 with a shape from the pool that DOES fit (if one exists)
  const anyFits = chosen.some((shape) => canPieceFitAnywhere(board, shape.matrix));
  if (!anyFits) {
    const fittingPool = pool.filter((shape) => canPieceFitAnywhere(board, shape.matrix));
    if (fittingPool.length > 0) {
      chosen[0] = fittingPool[Math.floor(rng() * fittingPool.length)];
    }
  }

  // Assign cohesive distinct colors across the 3 pieces in the tray
  const shuffledColors = [...PLAYABLE_COLORS].sort(() => rng() - 0.5);

  return chosen.map((shape, idx) => ({
    instanceId: `piece-${pieceUidCounter++}`,
    shape,
    color: idx < shuffledColors.length ? shuffledColors[idx] : shape.color,
    placed: false,
  }));
}

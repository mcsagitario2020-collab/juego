import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  Check,
  Grid2x2,
  Moon,
  RotateCcw,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  BOARD_SIZE,
  BoardGrid,
  ClearingCell,
  FloatingPopup,
  GameMode,
  GameStatus,
  LevelObjective,
  PlayerProgress,
  TrayPiece,
} from './types/game';
import { getLevelConfig, PROGRESSIVE_LEVELS } from './data/levels';
import {
  calculateDailyStreaks,
  createSeededRng,
  formatReadableDateEs,
  getDailyChallengeConfig,
  getTodayDateKey,
} from './utils/dailyChallenge';
import {
  applyPresetTiles,
  canAnyTrayPieceFit,
  canPieceFitAnywhere,
  canPlacePiece,
  createEmptyBoard,
  executePlacement,
  generateSmartHand,
  getPreviewClears,
} from './utils/engine';
import { soundEngine } from './utils/sound';
import { loadProgress, saveProgress } from './utils/storage';
import { BlockTile } from './components/BlockTile';
import { GameBoard } from './components/GameBoard';
import { PieceTray } from './components/PieceTray';
import { LevelSelectModal } from './components/LevelSelectModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { ResultModal } from './components/ResultModal';

interface ActiveDragState {
  piece: TrayPiece;
  pointerId: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isTouch: boolean;
  hasMoved: boolean;
}

export default function App() {
  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgress());

  // Mode & session configuration
  const [mode, setMode] = useState<GameMode>('levels');
  const [levelId, setLevelId] = useState<number>(() =>
    Math.max(1, loadProgress().highestUnlockedLevel)
  );
  const [dailyDateKey, setDailyDateKey] = useState<string>(() => getTodayDateKey());

  // Core game state machine
  const [status, setStatus] = useState<GameStatus>('PLAYING');
  const [board, setBoard] = useState<BoardGrid>(() => createEmptyBoard());
  const [tray, setTray] = useState<TrayPiece[]>([]);
  const [handKey, setHandKey] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [linesCleared, setLinesCleared] = useState<number>(0);
  const [gemsCollected, setGemsCollected] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [moveCount, setMoveCount] = useState<number>(0);

  // Transient animation state
  const [clearingCells, setClearingCells] = useState<ClearingCell[]>([]);
  const [popups, setPopups] = useState<FloatingPopup[]>([]);

  // Interaction state (drag + tap/click-to-place)
  const [dragState, setDragState] = useState<ActiveDragState | null>(null);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);

  // Modals
  const [levelsModalOpen, setLevelsModalOpen] = useState(false);
  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [howToOpen, setHowToOpen] = useState(false);

  // Refs
  const boardRef = useRef<HTMLDivElement | null>(null);
  const rngRef = useRef<() => number>(Math.random);
  const clearTimerRef = useRef<number | null>(null);
  const popupIdRef = useRef<number>(1);

  // Sync dark mode class on <html> and sound preference
  useEffect(() => {
    const root = document.documentElement;
    if (progress.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    soundEngine.setEnabled(progress.soundEnabled);
    saveProgress(progress);
  }, [progress]);

  // Active level or daily config
  const activeLevelConfig = useMemo(() => getLevelConfig(levelId), [levelId]);
  const activeDailyConfig = useMemo(
    () => getDailyChallengeConfig(dailyDateKey),
    [dailyDateKey]
  );

  const activeObjectives: LevelObjective[] = useMemo(() => {
    if (mode === 'levels') return activeLevelConfig.objectives;
    if (mode === 'daily') return activeDailyConfig.objectives;
    return [];
  }, [mode, activeLevelConfig, activeDailyConfig]);

  const activeMaxTier: 1 | 2 | 3 = useMemo(() => {
    if (mode === 'levels') return activeLevelConfig.maxTier;
    if (mode === 'daily') return activeDailyConfig.maxTier;
    // Classic mode gently scales piece complexity with score
    if (score < 260) return 1;
    if (score < 780) return 2;
    return 3;
  }, [mode, activeLevelConfig, activeDailyConfig, score]);

  const dailyStreaks = useMemo(
    () => calculateDailyStreaks(progress.dailyCompletedDates),
    [progress.dailyCompletedDates]
  );

  // Initialize or reset a session
  const startSession = useCallback(
    (targetMode: GameMode, targetLevelId?: number, targetDateKey?: string) => {
      if (clearTimerRef.current !== null) {
        window.clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }

      const nextLevel = targetLevelId ?? levelId;
      const nextDate = targetDateKey ?? dailyDateKey;

      let initialBoard: BoardGrid;
      let maxTier: 1 | 2 | 3 = 1;

      if (targetMode === 'levels') {
        const cfg = getLevelConfig(nextLevel);
        initialBoard = applyPresetTiles(cfg.presetTiles);
        maxTier = cfg.maxTier;
        rngRef.current = Math.random;
      } else if (targetMode === 'daily') {
        const cfg = getDailyChallengeConfig(nextDate);
        initialBoard = applyPresetTiles(cfg.presetTiles);
        maxTier = cfg.maxTier;
        rngRef.current = createSeededRng(cfg.seed);
      } else {
        initialBoard = createEmptyBoard();
        maxTier = 1;
        rngRef.current = Math.random;
      }

      const initialHand = generateSmartHand(initialBoard, maxTier, rngRef.current);

      setMode(targetMode);
      if (targetLevelId !== undefined) setLevelId(targetLevelId);
      if (targetDateKey !== undefined) setDailyDateKey(targetDateKey);

      setBoard(initialBoard);
      setTray(initialHand);
      setHandKey((k) => k + 1);
      setScore(0);
      setLinesCleared(0);
      setGemsCollected(0);
      setCombo(0);
      setMoveCount(0);
      setClearingCells([]);
      setPopups([]);
      setDragState(null);
      setSelectedPieceId(null);
      setHoverCell(null);
      setStatus('PLAYING');
    },
    [levelId, dailyDateKey]
  );

  // Boot initial level session once
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      startSession('levels', levelId);
    }
  }, [startSession, levelId]);

  // Fit availability map for each piece in tray
  const fitMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const piece of tray) {
      map[piece.instanceId] = piece.placed
        ? false
        : canPieceFitAnywhere(board, piece.shape.matrix);
    }
    return map;
  }, [board, tray]);

  // Measure board grid inner geometry for exact 1:1 drag snapping
  const getBoardGridMetrics = useCallback(() => {
    const el = boardRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const styles = window.getComputedStyle(el);
    const padLeft = parseFloat(styles.paddingLeft) || 12;
    const padTop = parseFloat(styles.paddingTop) || 12;
    const padRight = parseFloat(styles.paddingRight) || 12;
    const padBottom = parseFloat(styles.paddingBottom) || 12;

    const innerLeft = rect.left + padLeft;
    const innerTop = rect.top + padTop;
    const innerWidth = rect.width - padLeft - padRight;
    const innerHeight = rect.height - padTop - padBottom;

    return {
      innerLeft,
      innerTop,
      innerWidth,
      innerHeight,
      cellW: innerWidth / BOARD_SIZE,
      cellH: innerHeight / BOARD_SIZE,
    };
  }, []);

  // Compute snapped grid top-left coordinates from pointer position
  const getSnapPositionForDrag = useCallback(
    (drag: ActiveDragState): { row: number; col: number } | null => {
      if (!drag.hasMoved) return null;
      const metrics = getBoardGridMetrics();
      if (!metrics) return null;

      const matrix = drag.piece.shape.matrix;
      const rows = matrix.length;
      const cols = matrix[0].length;
      const liftY = drag.isTouch ? 78 : 16;

      const centerX = drag.currentX;
      const centerY = drag.currentY - liftY;

      const pieceWidth = cols * metrics.cellW;
      const pieceHeight = rows * metrics.cellH;

      const topLeftX = centerX - pieceWidth / 2;
      const topLeftY = centerY - pieceHeight / 2;

      const col = Math.round((topLeftX - metrics.innerLeft) / metrics.cellW);
      const row = Math.round((topLeftY - metrics.innerTop) / metrics.cellH);

      if (canPlacePiece(board, matrix, row, col)) {
        return { row, col };
      }
      return null;
    },
    [board, getBoardGridMetrics]
  );

  // Active ghost placement (either from drag or from click-selected piece hover)
  const activeGhost = useMemo(() => {
    if (status !== 'PLAYING') return null;

    if (dragState && dragState.hasMoved) {
      const snap = getSnapPositionForDrag(dragState);
      if (!snap) return null;
      return {
        row: snap.row,
        col: snap.col,
        matrix: dragState.piece.shape.matrix,
        color: dragState.piece.color,
      };
    }

    if (selectedPieceId && hoverCell) {
      const piece = tray.find((p) => p.instanceId === selectedPieceId && !p.placed);
      if (!piece) return null;
      const rows = piece.shape.matrix.length;
      const cols = piece.shape.matrix[0].length;
      // Anchor piece centered around hovered cell for ergonomic click placement
      const startRow = Math.max(
        0,
        Math.min(BOARD_SIZE - rows, hoverCell.row - Math.floor((rows - 1) / 2))
      );
      const startCol = Math.max(
        0,
        Math.min(BOARD_SIZE - cols, hoverCell.col - Math.floor((cols - 1) / 2))
      );
      if (canPlacePiece(board, piece.shape.matrix, startRow, startCol)) {
        return {
          row: startRow,
          col: startCol,
          matrix: piece.shape.matrix,
          color: piece.color,
        };
      }
    }

    return null;
  }, [status, dragState, getSnapPositionForDrag, selectedPieceId, hoverCell, tray, board]);

  // Preview rows & columns that will clear if activeGhost is dropped
  const previewClears = useMemo(() => {
    if (!activeGhost) return { rows: [], cols: [] };
    return getPreviewClears(board, activeGhost.matrix, activeGhost.row, activeGhost.col);
  }, [board, activeGhost]);

  // Objective progress helper
  const getObjectiveCurrent = useCallback(
    (
      objType: LevelObjective['type'],
      s: number,
      l: number,
      g: number
    ): number => {
      if (objType === 'score') return s;
      if (objType === 'lines') return l;
      return g;
    },
    []
  );

  // Commit a valid piece placement onto the board
  const commitPlacement = useCallback(
    (piece: TrayPiece, startRow: number, startCol: number) => {
      if (status !== 'PLAYING') return;
      if (!canPlacePiece(board, piece.shape.matrix, startRow, startCol)) return;

      const nextMoveId = moveCount + 1;
      const result = executePlacement(
        board,
        piece,
        startRow,
        startCol,
        combo,
        nextMoveId
      );

      const nextScore = score + result.pointsEarned;
      const nextLines = linesCleared + result.linesCleared;
      const nextGems = gemsCollected + result.gemsCollected;

      // Audio feedback
      if (result.linesCleared > 0) {
        soundEngine.playClear(result.linesCleared, result.newCombo);
      } else {
        soundEngine.playPlace();
      }

      // Trigger clearing animation cells
      if (result.clearingCells.length > 0) {
        setClearingCells(result.clearingCells);
        if (clearTimerRef.current !== null) {
          window.clearTimeout(clearTimerRef.current);
        }
        clearTimerRef.current = window.setTimeout(() => {
          setClearingCells([]);
          clearTimerRef.current = null;
        }, 440);
      }

      // Floating score/combo callout near placement center
      if (result.calloutText) {
        const rows = piece.shape.matrix.length;
        const cols = piece.shape.matrix[0].length;
        const centerCol = startCol + cols / 2;
        const centerRow = startRow + rows / 2;
        const xPercent = Math.min(82, Math.max(18, (centerCol / BOARD_SIZE) * 100));
        const yPercent = Math.min(82, Math.max(18, (centerRow / BOARD_SIZE) * 100));
        const newPopupId = popupIdRef.current++;

        setPopups((prev) => [
          ...prev,
          {
            id: newPopupId,
            text: result.calloutText!,
            subtext: result.calloutSubtext ?? undefined,
            xPercent,
            yPercent,
          },
        ]);

        window.setTimeout(() => {
          setPopups((prev) => prev.filter((p) => p.id !== newPopupId));
        }, 900);
      }

      // Update tray: mark piece as placed; if all 3 placed, deal next 3
      let nextTray = tray.map((p) =>
        p.instanceId === piece.instanceId ? { ...p, placed: true } : p
      );
      const allPlaced = nextTray.every((p) => p.placed);

      // Determine next piece tier (classic mode adapts to nextScore)
      let nextTier = activeMaxTier;
      if (mode === 'classic') {
        nextTier = nextScore < 260 ? 1 : nextScore < 780 ? 2 : 3;
      }

      if (allPlaced) {
        nextTray = generateSmartHand(result.nextBoard, nextTier, rngRef.current);
        setHandKey((k) => k + 1);
      }

      setBoard(result.nextBoard);
      setTray(nextTray);
      setScore(nextScore);
      setLinesCleared(nextLines);
      setGemsCollected(nextGems);
      setCombo(result.newCombo);
      setMoveCount(nextMoveId);
      setSelectedPieceId(null);
      setHoverCell(null);

      // Update classic best score immediately
      if (mode === 'classic' && nextScore > progress.classicBestScore) {
        setProgress((prev) => ({
          ...prev,
          classicBestScore: Math.max(prev.classicBestScore, nextScore),
        }));
      }

      // Check victory for Levels & Daily Challenge
      if (mode === 'levels' || mode === 'daily') {
        const allObjectivesMet =
          activeObjectives.length > 0 &&
          activeObjectives.every(
            (obj) => getObjectiveCurrent(obj.type, nextScore, nextLines, nextGems) >= obj.target
          );

        if (allObjectivesMet) {
          setStatus('VICTORY');
          soundEngine.playVictory();

          setProgress((prev) => {
            if (mode === 'levels') {
              const completed = prev.completedLevels.includes(levelId)
                ? prev.completedLevels
                : [...prev.completedLevels, levelId];
              return {
                ...prev,
                completedLevels: completed,
                highestUnlockedLevel: Math.max(prev.highestUnlockedLevel, levelId + 1),
              };
            } else {
              const dates = prev.dailyCompletedDates.includes(dailyDateKey)
                ? prev.dailyCompletedDates
                : [...prev.dailyCompletedDates, dailyDateKey];
              const prevBest = prev.dailyBestScores[dailyDateKey] ?? 0;
              return {
                ...prev,
                dailyCompletedDates: dates,
                dailyBestScores: {
                  ...prev.dailyBestScores,
                  [dailyDateKey]: Math.max(prevBest, nextScore),
                },
              };
            }
          });
          return;
        }
      }

      // Check Game Over (no remaining tray piece fits anywhere)
      if (!canAnyTrayPieceFit(result.nextBoard, nextTray)) {
        setStatus('GAME_OVER');
        soundEngine.playGameOver();
      }
    },
    [
      status,
      board,
      moveCount,
      combo,
      score,
      linesCleared,
      gemsCollected,
      tray,
      activeMaxTier,
      mode,
      progress.classicBestScore,
      activeObjectives,
      getObjectiveCurrent,
      levelId,
      dailyDateKey,
    ]
  );

  // Global pointer move & pointer up listeners while dragging a piece
  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerId !== dragState.pointerId) return;
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      const moved = dragState.hasMoved || Math.hypot(dx, dy) > 6;

      setDragState((prev) =>
        prev
          ? {
              ...prev,
              currentX: e.clientX,
              currentY: e.clientY,
              hasMoved: moved,
            }
          : null
      );
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId !== dragState.pointerId) return;

      if (dragState.hasMoved) {
        const snap = getSnapPositionForDrag({
          ...dragState,
          currentX: e.clientX,
          currentY: e.clientY,
        });
        if (snap) {
          commitPlacement(dragState.piece, snap.row, snap.col);
        }
      }
      setDragState(null);
    };

    const handlePointerCancel = () => {
      setDragState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [dragState, getSnapPositionForDrag, commitPlacement]);

  // Keyboard shortcuts: 1, 2, 3 to select pieces; Escape to deselect or close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (levelsModalOpen) setLevelsModalOpen(false);
        else if (dailyModalOpen) setDailyModalOpen(false);
        else if (howToOpen) setHowToOpen(false);
        else {
          setSelectedPieceId(null);
          setHoverCell(null);
        }
        return;
      }

      if (levelsModalOpen || dailyModalOpen || howToOpen || status !== 'PLAYING') return;

      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const idx = Number(e.key) - 1;
        const target = tray[idx];
        if (target && !target.placed && fitMap[target.instanceId]) {
          soundEngine.playPickup();
          setSelectedPieceId((prev) =>
            prev === target.instanceId ? null : target.instanceId
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [levelsModalOpen, dailyModalOpen, howToOpen, status, tray, fitMap]);

  // Tray drag start
  const handleStartDrag = (piece: TrayPiece, e: React.PointerEvent<HTMLDivElement>) => {
    if (status !== 'PLAYING') return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    soundEngine.playPickup();
    setSelectedPieceId(null);
    setDragState({
      piece,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      isTouch: e.pointerType === 'touch',
      hasMoved: false,
    });
  };

  // Click-to-select piece in tray
  const handleSelectPiece = (piece: TrayPiece) => {
    if (status !== 'PLAYING') return;
    setSelectedPieceId((prev) => {
      const next = prev === piece.instanceId ? null : piece.instanceId;
      if (next) soundEngine.playPickup();
      return next;
    });
  };

  // Click on board cell to place selected piece
  const handleBoardCellClick = (row: number, col: number) => {
    if (status !== 'PLAYING' || !selectedPieceId) return;
    const piece = tray.find((p) => p.instanceId === selectedPieceId && !p.placed);
    if (!piece) return;

    const rows = piece.shape.matrix.length;
    const cols = piece.shape.matrix[0].length;
    const startRow = Math.max(
      0,
      Math.min(BOARD_SIZE - rows, row - Math.floor((rows - 1) / 2))
    );
    const startCol = Math.max(
      0,
      Math.min(BOARD_SIZE - cols, col - Math.floor((cols - 1) / 2))
    );

    if (canPlacePiece(board, piece.shape.matrix, startRow, startCol)) {
      commitPlacement(piece, startRow, startCol);
    }
  };

  // Mode switching from Top Bar
  const handleSwitchMode = (targetMode: GameMode) => {
    if (targetMode === 'levels') {
      if (mode === 'levels') {
        setLevelsModalOpen(true);
      } else {
        startSession('levels', levelId);
      }
    } else if (targetMode === 'daily') {
      const today = getTodayDateKey();
      if (mode === 'daily') {
        setDailyModalOpen(true);
      } else {
        startSession('daily', undefined, today);
      }
    } else {
      startSession('classic');
    }
  };

  const toggleSound = () => {
    setProgress((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const toggleTheme = () => {
    setProgress((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  // Compute floating drag piece tile size matched 1:1 with live board
  const floatingDragMetrics = useMemo(() => {
    if (!dragState || !dragState.hasMoved) return null;
    const metrics = getBoardGridMetrics();
    const cellSize = metrics ? Math.max(30, Math.round(metrics.cellW - 6)) : 46;
    const liftY = dragState.isTouch ? 78 : 16;
    return {
      cellSize,
      x: dragState.currentX,
      y: dragState.currentY - liftY,
    };
  }, [dragState, getBoardGridMetrics]);

  // Mode display labels
  const modeKicker =
    mode === 'levels'
      ? `Nivel ${activeLevelConfig.id} · ${activeLevelConfig.chapter}`
      : mode === 'daily'
        ? `Desafío diario · ${formatReadableDateEs(dailyDateKey)}`
        : 'Modo clásico · Sin límite';

  const modeTitle =
    mode === 'levels'
      ? activeLevelConfig.title
      : mode === 'daily'
        ? activeDailyConfig.title
        : 'Partida infinita';

  const modeSubtitle =
    mode === 'levels'
      ? activeLevelConfig.subtitle
      : mode === 'daily'
        ? 'Tablero del día compartido. Completa los objetivos para sumar a tu racha.'
        : 'Mantén el tablero abierto y supera tu mejor puntuación personal.';

  const bestScoreForMode =
    mode === 'classic'
      ? Math.max(progress.classicBestScore, score)
      : mode === 'daily'
        ? Math.max(progress.dailyBestScores[dailyDateKey] ?? 0, score)
        : score;

  const isTodayCompleted = progress.dailyCompletedDates.includes(getTodayDateKey());

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F3] dark:bg-[#131416] text-[#1A1A18] dark:text-[#F2F2EE] transition-colors duration-200">
      {/* Strict 3-zone Top Navigation Bar */}
      <header className="w-full border-b border-[#E5E4DC] dark:border-[#24272F] bg-[#F6F6F3] dark:bg-[#131416]">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single wordmark */}
          <button
            type="button"
            onClick={() => startSession('levels', levelId)}
            className="font-display text-xl font-bold tracking-tight text-[#1A1A18] dark:text-[#F2F2EE] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3B6EA5] rounded"
          >
            Kubo
          </button>

          {/* Zone 2: Clean single-line text links */}
          <nav
            aria-label="Modos de juego"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            <button
              type="button"
              onClick={() => handleSwitchMode('levels')}
              className={[
                'py-1 border-b-2 transition-colors whitespace-nowrap shrink-0',
                mode === 'levels'
                  ? 'border-[#1A1A18] dark:border-[#F2F2EE] text-[#1A1A18] dark:text-[#F2F2EE]'
                  : 'border-transparent text-[#64635D] dark:text-[#969AA6] hover:text-[#1A1A18] dark:hover:text-[#F2F2EE]',
              ].join(' ')}
            >
              Niveles
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('daily')}
              className={[
                'py-1 border-b-2 transition-colors whitespace-nowrap shrink-0',
                mode === 'daily'
                  ? 'border-[#1A1A18] dark:border-[#F2F2EE] text-[#1A1A18] dark:text-[#F2F2EE]'
                  : 'border-transparent text-[#64635D] dark:text-[#969AA6] hover:text-[#1A1A18] dark:hover:text-[#F2F2EE]',
              ].join(' ')}
            >
              Desafío diario
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('classic')}
              className={[
                'py-1 border-b-2 transition-colors whitespace-nowrap shrink-0',
                mode === 'classic'
                  ? 'border-[#1A1A18] dark:border-[#F2F2EE] text-[#1A1A18] dark:text-[#F2F2EE]'
                  : 'border-transparent text-[#64635D] dark:text-[#969AA6] hover:text-[#1A1A18] dark:hover:text-[#F2F2EE]',
              ].join(' ')}
            >
              Clásico
            </button>
            <button
              type="button"
              onClick={() => setHowToOpen(true)}
              className="py-1 border-b-2 border-transparent text-[#64635D] dark:text-[#969AA6] hover:text-[#1A1A18] dark:hover:text-[#F2F2EE] transition-colors whitespace-nowrap shrink-0"
            >
              Cómo jugar
            </button>
          </nav>

          {/* Zone 3: Single primary utility action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => startSession(mode, levelId, dailyDateKey)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-[#1A1A18] dark:bg-[#F2F2EE] text-[#F6F6F3] dark:text-[#141517] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B6EA5]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>

        {/* Mobile single-line mode navigation strip (non-sticky so zero mobile viewport cap penalty) */}
        <div className="md:hidden border-t border-[#ECEBE4] dark:border-[#1E2027] px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => handleSwitchMode('levels')}
              className={`py-1 whitespace-nowrap shrink-0 ${
                mode === 'levels'
                  ? 'text-[#1A1A18] dark:text-white font-semibold underline underline-offset-4'
                  : 'text-[#6B6A64] dark:text-[#969AA6]'
              }`}
            >
              Niveles
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('daily')}
              className={`py-1 whitespace-nowrap shrink-0 ${
                mode === 'daily'
                  ? 'text-[#1A1A18] dark:text-white font-semibold underline underline-offset-4'
                  : 'text-[#6B6A64] dark:text-[#969AA6]'
              }`}
            >
              Desafío diario
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('classic')}
              className={`py-1 whitespace-nowrap shrink-0 ${
                mode === 'classic'
                  ? 'text-[#1A1A18] dark:text-white font-semibold underline underline-offset-4'
                  : 'text-[#6B6A64] dark:text-[#969AA6]'
              }`}
            >
              Clásico
            </button>
            <button
              type="button"
              onClick={() => setHowToOpen(true)}
              className="py-1 text-[#6B6A64] dark:text-[#969AA6] whitespace-nowrap shrink-0"
            >
              Reglas
            </button>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={toggleSound}
              aria-label={progress.soundEnabled ? 'Silenciar sonido' : 'Activar sonido'}
              className="p-2 rounded-md text-[#5C5B55] dark:text-[#9EA2AE]"
            >
              {progress.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={progress.darkMode ? 'Activar tema claro' : 'Activar tema oscuro'}
              className="p-2 rounded-md text-[#5C5B55] dark:text-[#9EA2AE]"
            >
              {progress.darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Centered Architectural Game Workspace */}
      <main className="flex-1 w-full max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_310px] gap-6 lg:gap-12 items-start">
          {/* Primary Column: Board + 3-Piece Tray */}
          <div className="flex flex-col items-center">
            {/* Compact Mobile HUD above the board */}
            <div className="w-full max-w-[488px] lg:hidden mb-4">
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-[#6B6A64] dark:text-[#969AA6] truncate">
                    {modeKicker}
                  </div>
                  <h1 className="font-display text-lg font-semibold tracking-tight text-[#1A1A18] dark:text-[#F2F2EE] truncate">
                    {modeTitle}
                  </h1>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-2xl font-semibold tabular-nums leading-none">
                    {score}
                  </div>
                  <div className="mt-1 text-[11px] font-mono tabular-nums text-[#6B6A64] dark:text-[#969AA6]">
                    {mode === 'classic'
                      ? `Mejor ${bestScoreForMode}`
                      : combo > 1
                        ? `Combo ×${combo}`
                        : `${linesCleared} líneas`}
                  </div>
                </div>
              </div>

              {/* Compact Mobile Objectives */}
              {activeObjectives.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#E6E5DE] dark:border-[#24272F] grid grid-cols-2 gap-3">
                  {activeObjectives.map((obj) => {
                    const current = getObjectiveCurrent(
                      obj.type,
                      score,
                      linesCleared,
                      gemsCollected
                    );
                    const pct = Math.min(100, Math.round((current / obj.target) * 100));
                    const done = current >= obj.target;
                    return (
                      <div key={obj.type}>
                        <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                          <span className="font-sans text-[#5C5B55] dark:text-[#A4A8B4] capitalize">
                            {obj.label}
                          </span>
                          <span
                            className={
                              done
                                ? 'text-[#3C7A5D] dark:text-[#74C29C] font-semibold'
                                : 'text-[#1A1A18] dark:text-[#F2F2EE]'
                            }
                          >
                            {Math.min(current, obj.target)}/{obj.target}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#E5E4DC] dark:bg-[#24272F] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              done
                                ? 'bg-[#4E8A6E] dark:bg-[#5BA080]'
                                : 'bg-[#3B6EA5] dark:bg-[#4982BF]'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Mobile quick modal trigger */}
              <div className="mt-3 flex items-center justify-between text-xs">
                {mode === 'levels' ? (
                  <button
                    type="button"
                    onClick={() => setLevelsModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-[#3B6EA5] dark:text-[#6CA2DC] font-medium"
                  >
                    <Grid2x2 className="w-3.5 h-3.5" />
                    <span>Ver todos los niveles</span>
                  </button>
                ) : mode === 'daily' ? (
                  <button
                    type="button"
                    onClick={() => setDailyModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-[#3B6EA5] dark:text-[#6CA2DC] font-medium"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Calendario · Racha {dailyStreaks.currentStreak}d
                    </span>
                  </button>
                ) : (
                  <span className="text-[#73726B] dark:text-[#8E929E]">
                    Sin anuncios · Juego libre
                  </span>
                )}
              </div>
            </div>

            {/* 8x8 Classic Board */}
            <GameBoard
              boardRef={boardRef}
              board={board}
              ghost={activeGhost}
              previewClearRows={previewClears.rows}
              previewClearCols={previewClears.cols}
              clearingCells={clearingCells}
              popups={popups}
              lastMoveId={moveCount}
              hasSelectedPiece={Boolean(selectedPieceId)}
              onCellHover={(r, c) => {
                if (selectedPieceId) setHoverCell({ row: r, col: c });
              }}
              onCellLeave={() => setHoverCell(null)}
              onCellClick={handleBoardCellClick}
            />

            {/* 3-Piece Tray */}
            <PieceTray
              tray={tray}
              fitMap={fitMap}
              activeDragId={dragState?.hasMoved ? dragState.piece.instanceId : null}
              selectedPieceId={selectedPieceId}
              handKey={handKey}
              disabled={status !== 'PLAYING'}
              onStartDrag={handleStartDrag}
              onSelectPiece={handleSelectPiece}
            />

            {/* Calm ephemeral first-move instruction */}
            <p
              className={`mt-4 text-xs text-center text-[#75746D] dark:text-[#888C98] transition-opacity duration-300 ${
                moveCount === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none select-none'
              }`}
            >
              Arrastra una de las 3 piezas al tablero para completar filas o columnas.
            </p>
          </div>

          {/* Quiet Architectural Desktop Side Rail */}
          <aside className="hidden lg:flex flex-col pt-1">
            {/* Section 1: Mode & Title */}
            <div className="pb-6 border-b border-[#E5E4DC] dark:border-[#24272F]">
              <div className="text-xs text-[#6B6A64] dark:text-[#969AA6]">{modeKicker}</div>
              <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-[#1A1A18] dark:text-[#F2F2EE] [text-wrap:balance]">
                {modeTitle}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#5C5B55] dark:text-[#A4A8B4]">
                {modeSubtitle}
              </p>
            </div>

            {/* Section 2: Score & Run Metrics */}
            <div className="py-6 border-b border-[#E5E4DC] dark:border-[#24272F]">
              <div className="text-xs text-[#6B6A64] dark:text-[#969AA6]">Puntuación</div>
              <div className="mt-1 font-mono text-4xl font-semibold tabular-nums tracking-tight text-[#1A1A18] dark:text-[#F2F2EE]">
                {score}
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono tabular-nums text-[#6B6A64] dark:text-[#969AA6]">
                <span>{linesCleared} líneas</span>
                <span aria-hidden="true">·</span>
                <span>{combo > 1 ? `Combo ×${combo}` : 'Sin combo'}</span>
                {mode === 'classic' && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Mejor {bestScoreForMode}</span>
                  </>
                )}
              </div>
            </div>

            {/* Section 3: Active Objectives (Levels / Daily) OR Progression Info (Classic) */}
            {activeObjectives.length > 0 ? (
              <div className="py-6 border-b border-[#E5E4DC] dark:border-[#24272F] space-y-4">
                <div className="text-xs font-medium text-[#6B6A64] dark:text-[#969AA6]">
                  Objetivos del tablero
                </div>
                {activeObjectives.map((obj) => {
                  const current = getObjectiveCurrent(
                    obj.type,
                    score,
                    linesCleared,
                    gemsCollected
                  );
                  const pct = Math.min(100, Math.round((current / obj.target) * 100));
                  const done = current >= obj.target;

                  return (
                    <div key={obj.type}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-[#2E2E2B] dark:text-[#E2E3DF]">
                          {done && (
                            <Check className="w-4 h-4 text-[#4E8A6E] dark:text-[#66B28F]" />
                          )}
                          <span className="capitalize">{obj.label}</span>
                        </span>
                        <span
                          className={`font-mono text-xs tabular-nums ${
                            done
                              ? 'text-[#3C7A5D] dark:text-[#74C29C] font-semibold'
                              : 'text-[#5C5B55] dark:text-[#A4A8B4]'
                          }`}
                        >
                          {Math.min(current, obj.target)} / {obj.target}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-[#E5E4DC] dark:bg-[#24272F] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            done
                              ? 'bg-[#4E8A6E] dark:bg-[#5BA080]'
                              : 'bg-[#3B6EA5] dark:bg-[#4982BF]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 border-b border-[#E5E4DC] dark:border-[#24272F]">
                <div className="text-xs font-medium text-[#6B6A64] dark:text-[#969AA6]">
                  Ritmo de piezas
                </div>
                <p className="mt-2 text-sm text-[#4A4944] dark:text-[#B4B8C4]">
                  {activeMaxTier === 1
                    ? 'Nivel inicial: bloques compactos para entrar en ritmo.'
                    : activeMaxTier === 2
                      ? 'Nivel medio: piezas en L, T y barras largas activas.'
                      : 'Nivel maestro: todas las formas del catálogo disponibles.'}
                </p>
              </div>
            )}

            {/* Section 4: Mode Navigation Actions & Daily Motivation */}
            <div className="py-6 border-b border-[#E5E4DC] dark:border-[#24272F] space-y-3">
              <button
                type="button"
                onClick={() => setLevelsModalOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-lg border border-[#E0DFD7] dark:border-[#2A2D35] bg-[#FFFFFF]/70 dark:bg-[#1A1D23] hover:border-[#C5C3B8] dark:hover:border-[#3A3F4B] transition-colors"
              >
                <span className="flex items-center gap-2.5 text-[#1A1A18] dark:text-[#F2F2EE]">
                  <Grid2x2 className="w-4 h-4 text-[#5C5B55] dark:text-[#969AA6]" />
                  <span>Mapa de niveles</span>
                </span>
                <span className="font-mono text-xs tabular-nums text-[#6B6A64] dark:text-[#969AA6]">
                  {progress.completedLevels.length}/{PROGRESSIVE_LEVELS.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDailyModalOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-lg border border-[#E0DFD7] dark:border-[#2A2D35] bg-[#FFFFFF]/70 dark:bg-[#1A1D23] hover:border-[#C5C3B8] dark:hover:border-[#3A3F4B] transition-colors"
              >
                <span className="flex items-center gap-2.5 text-[#1A1A18] dark:text-[#F2F2EE]">
                  <Calendar className="w-4 h-4 text-[#5C5B55] dark:text-[#969AA6]" />
                  <span>Desafío diario</span>
                </span>
                <span className="font-mono text-xs tabular-nums text-[#6B6A64] dark:text-[#969AA6]">
                  {isTodayCompleted
                    ? `Racha ${dailyStreaks.currentStreak}d`
                    : 'Pendiente hoy'}
                </span>
              </button>
            </div>

            {/* Section 5: Quiet Preferences */}
            <div className="pt-5 flex items-center justify-between text-xs text-[#64635D] dark:text-[#969AA6]">
              <button
                type="button"
                onClick={toggleSound}
                className="inline-flex items-center gap-2 py-1.5 px-2 -ml-2 rounded-md hover:text-[#1A1A18] dark:hover:text-white transition-colors"
              >
                {progress.soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                <span>{progress.soundEnabled ? 'Sonido activo' : 'Silenciado'}</span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 py-1.5 px-2 -mr-2 rounded-md hover:text-[#1A1A18] dark:hover:text-white transition-colors"
              >
                {progress.darkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                <span>{progress.darkMode ? 'Tema claro' : 'Tema oscuro'}</span>
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* Quiet minimal footer */}
      <footer className="w-full py-5 border-t border-[#ECEBE4] dark:border-[#1E2027] mt-auto">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-[#7D7C75] dark:text-[#787C88]">
          <span>Kubo · Juego de bloques sin anuncios</span>
          <span className="hidden sm:inline font-mono tabular-nums">
            Atajos: 1, 2, 3 para elegir · Esc cancelar
          </span>
        </div>
      </footer>

      {/* Floating 1:1 Dragged Piece Overlay */}
      {dragState && dragState.hasMoved && floatingDragMetrics && (
        <div
          aria-hidden="true"
          style={{
            transform: `translate3d(${floatingDragMetrics.x}px, ${floatingDragMetrics.y}px, 0) translate(-50%, -50%)`,
          }}
          className="pointer-events-none fixed top-0 left-0 z-50 drop-shadow-[0_12px_20px_rgba(0,0,0,0.2)]"
        >
          <div
            className="grid gap-[6px]"
            style={{
              gridTemplateColumns: `repeat(${dragState.piece.shape.matrix[0].length}, ${floatingDragMetrics.cellSize}px)`,
              gridTemplateRows: `repeat(${dragState.piece.shape.matrix.length}, ${floatingDragMetrics.cellSize}px)`,
            }}
          >
            {dragState.piece.shape.matrix.map((rowArr, r) =>
              rowArr.map((val, c) => (
                <div key={`${r}-${c}`} className="w-full h-full">
                  {val === 1 ? (
                    <BlockTile color={dragState.piece.color} size="drag" />
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <LevelSelectModal
        open={levelsModalOpen}
        currentLevelId={levelId}
        progress={progress}
        onSelectLevel={(id) => startSession('levels', id)}
        onClose={() => setLevelsModalOpen(false)}
      />

      <DailyChallengeModal
        open={dailyModalOpen}
        activeDateKey={dailyDateKey}
        progress={progress}
        onPlayDate={(dateKey) => startSession('daily', undefined, dateKey)}
        onClose={() => setDailyModalOpen(false)}
      />

      <HowToPlayModal open={howToOpen} onClose={() => setHowToOpen(false)} />

      <ResultModal
        status={status}
        mode={mode}
        levelNumber={levelId}
        dailyDateLabel={formatReadableDateEs(dailyDateKey)}
        score={score}
        linesCleared={linesCleared}
        bestScore={bestScoreForMode}
        currentStreak={dailyStreaks.currentStreak}
        onRetry={() => startSession(mode, levelId, dailyDateKey)}
        onNextLevel={() => {
          if (mode === 'levels') {
            startSession('levels', levelId + 1);
          } else {
            startSession('levels', progress.highestUnlockedLevel);
          }
        }}
        onOpenCalendar={() => {
          setStatus('PLAYING');
          setDailyModalOpen(true);
        }}
      />
    </div>
  );
}

import React from 'react';
import {
  BOARD_SIZE,
  BlockColorId,
  BoardGrid,
  ClearingCell,
  FloatingPopup,
} from '../types/game';
import { BlockTile } from './BlockTile';

interface GhostPlacement {
  row: number;
  col: number;
  matrix: number[][];
  color: BlockColorId;
}

interface GameBoardProps {
  boardRef: React.RefObject<HTMLDivElement | null>;
  board: BoardGrid;
  ghost: GhostPlacement | null;
  previewClearRows: number[];
  previewClearCols: number[];
  clearingCells: ClearingCell[];
  popups: FloatingPopup[];
  lastMoveId: number;
  hasSelectedPiece: boolean;
  onCellHover?: (row: number, col: number) => void;
  onCellLeave?: () => void;
  onCellClick?: (row: number, col: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  boardRef,
  board,
  ghost,
  previewClearRows,
  previewClearCols,
  clearingCells,
  popups,
  lastMoveId,
  hasSelectedPiece,
  onCellHover,
  onCellLeave,
  onCellClick,
}) => {
  const ghostSet = new Set<string>();
  if (ghost) {
    for (let r = 0; r < ghost.matrix.length; r++) {
      for (let c = 0; c < ghost.matrix[r].length; c++) {
        if (ghost.matrix[r][c] === 1) {
          ghostSet.add(`${ghost.row + r},${ghost.col + c}`);
        }
      }
    }
  }

  const clearRowSet = new Set(previewClearRows);
  const clearColSet = new Set(previewClearCols);

  const clearingMap = new Map<string, ClearingCell>();
  for (const cc of clearingCells) {
    clearingMap.set(`${cc.row},${cc.col}`, cc);
  }

  return (
    <div className="relative w-full max-w-[488px] mx-auto select-none">
      <div
        ref={boardRef}
        onMouseLeave={onCellLeave}
        role="grid"
        aria-label="Tablero de bloques 8 por 8"
        className="relative aspect-square w-full p-2.5 sm:p-3 rounded-[16px] bg-[#E8E7E1] dark:bg-[#1B1D22] border border-[#DBD9D0] dark:border-[#2A2D35] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]"
      >
        {/* Subtle 4x4 quadrant crosshair guides for effortless spatial counting */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-3 top-1/2 h-px bg-[#D2D0C6]/75 dark:bg-[#323640]/80 -translate-y-1/2 z-0"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-3 left-1/2 w-px bg-[#D2D0C6]/75 dark:bg-[#323640]/80 -translate-x-1/2 z-0"
        />

        <div className="relative z-10 grid grid-cols-8 grid-rows-8 gap-1.5 w-full h-full">
          {board.map((rowArr, r) =>
            rowArr.map((cell, c) => {
              const key = `${r},${c}`;
              const isGhostHere = ghostSet.has(key);
              const willClearHere = clearRowSet.has(r) || clearColSet.has(c);
              const clearingCell = clearingMap.get(key);

              // Subtle subtle quadrant tinting (2 subtle checkerboard tones across 4x4 quadrants)
              const isAltQuadrant = (Math.floor(r / 4) + Math.floor(c / 4)) % 2 === 1;

              return (
                <div
                  key={key}
                  role="gridcell"
                  onMouseEnter={() => onCellHover?.(r, c)}
                  onClick={() => onCellClick?.(r, c)}
                  className={[
                    'relative w-full h-full rounded-[6px] transition-colors duration-100',
                    isAltQuadrant
                      ? 'bg-[#F0EFEA] dark:bg-[#22252C]'
                      : 'bg-[#F6F5F1] dark:bg-[#262931]',
                    hasSelectedPiece ? 'cursor-pointer' : '',
                  ].join(' ')}
                >
                  {/* Highlight band when a whole row/col is about to clear */}
                  {willClearHere && !cell && !isGhostHere && (
                    <div className="pointer-events-none absolute inset-0 rounded-[6px] bg-[#3B6EA5]/12 dark:bg-[#4982BF]/18" />
                  )}

                  {/* Existing placed block */}
                  {cell && (
                    <BlockTile
                      color={cell.color}
                      kind={cell.kind}
                      hp={cell.hp}
                      size="board"
                      isWillClear={willClearHere}
                      isNewlyPlaced={cell.placedAt === lastMoveId && lastMoveId > 0}
                    />
                  )}

                  {/* Ghost placement preview */}
                  {!cell && isGhostHere && ghost && (
                    <BlockTile
                      color={ghost.color}
                      size="board"
                      isGhost
                      isWillClear={willClearHere}
                    />
                  )}

                  {/* Clearing dissolve animation overlay */}
                  {!cell && clearingCell && (
                    <div className="pointer-events-none absolute inset-0 z-20">
                      <BlockTile
                        color={clearingCell.cell.color}
                        kind={clearingCell.cell.kind}
                        hp={clearingCell.cell.hp}
                        size="board"
                        isClearing
                        clearDelayMs={clearingCell.delayMs}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Floating combo / score callouts */}
        <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-[16px]">
          {popups.map((popup) => (
            <div
              key={popup.id}
              style={{ left: `${popup.xPercent}%`, top: `${popup.yPercent}%` }}
              className="absolute animate-float-score text-center whitespace-nowrap"
            >
              <div className="px-3 py-1 rounded-md bg-[#1A1A18]/90 dark:bg-[#F2F2EE]/95 text-[#F6F6F3] dark:text-[#141517] shadow-sm">
                <div className="font-display text-sm font-semibold tracking-tight leading-tight">
                  {popup.text}
                </div>
                {popup.subtext && (
                  <div className="font-mono text-[11px] tabular-nums opacity-85 leading-tight mt-0.5">
                    {popup.subtext}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

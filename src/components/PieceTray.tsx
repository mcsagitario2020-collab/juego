import React from 'react';
import { TrayPiece } from '../types/game';
import { BlockTile } from './BlockTile';

interface PieceTrayProps {
  tray: TrayPiece[];
  fitMap: Record<string, boolean>;
  activeDragId: string | null;
  selectedPieceId: string | null;
  handKey: number;
  disabled: boolean;
  onStartDrag: (piece: TrayPiece, event: React.PointerEvent<HTMLDivElement>) => void;
  onSelectPiece: (piece: TrayPiece) => void;
}

export const PieceTray: React.FC<PieceTrayProps> = ({
  tray,
  fitMap,
  activeDragId,
  selectedPieceId,
  handKey,
  disabled,
  onStartDrag,
  onSelectPiece,
}) => {
  return (
    <div
      aria-label="Bandeja de 3 piezas disponibles"
      className="w-full max-w-[488px] mx-auto mt-4"
    >
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {tray.map((piece, index) => {
          const isPlaced = piece.placed;
          const isDragging = activeDragId === piece.instanceId;
          const isSelected = selectedPieceId === piece.instanceId;
          const canFit = fitMap[piece.instanceId] ?? true;

          const rows = piece.shape.matrix.length;
          const cols = piece.shape.matrix[0].length;
          const maxDim = Math.max(rows, cols);
          // Proportional tile size so 1x1 up to 5x1 and 3x3 all look harmonious inside the slot
          const cellPx = maxDim >= 5 ? 16 : maxDim === 4 ? 19 : maxDim === 3 ? 22 : 25;

          return (
            <div
              key={`${handKey}-${piece.instanceId}`}
              style={{ animationDelay: `${index * 45}ms` }}
              onPointerDown={(e) => {
                if (disabled || isPlaced || !canFit) return;
                onStartDrag(piece, e);
              }}
              onClick={() => {
                if (disabled || isPlaced || !canFit) return;
                onSelectPiece(piece);
              }}
              role="button"
              tabIndex={isPlaced || !canFit || disabled ? -1 : 0}
              aria-label={
                isPlaced
                  ? `Espacio ${index + 1} vacío`
                  : `Pieza ${index + 1}: ${piece.shape.name}${!canFit ? ' (sin espacio disponible)' : ''}`
              }
              aria-pressed={isSelected}
              onKeyDown={(e) => {
                if (disabled || isPlaced || !canFit) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectPiece(piece);
                }
              }}
              className={[
                'relative flex items-center justify-center h-[108px] sm:h-[118px] rounded-[12px] border transition-all duration-150 select-none touch-none animate-piece-deal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B6EA5]',
                isPlaced
                  ? 'border-dashed border-[#DFDDD5] dark:border-[#262930] bg-transparent cursor-default'
                  : isSelected
                    ? 'border-[#3B6EA5] dark:border-[#5D97D4] bg-[#FFFFFF] dark:bg-[#21242B] shadow-sm cursor-grab active:cursor-grabbing'
                    : canFit
                      ? 'border-[#E2E0D8] dark:border-[#292C34] bg-[#FFFFFF]/80 dark:bg-[#1B1E24] hover:border-[#C9C6BA] dark:hover:border-[#3A3F4B] hover:bg-[#FFFFFF] dark:hover:bg-[#20232B] cursor-grab active:cursor-grabbing'
                      : 'border-[#E6E4DD] dark:border-[#252830] bg-[#EFEFE9]/60 dark:bg-[#181A1F]/60 opacity-45 cursor-not-allowed',
              ].join(' ')}
            >
              {/* Subtle keyboard shortcut number */}
              {!isPlaced && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-2 left-2.5 font-mono text-[11px] tabular-nums text-[#8A8982] dark:text-[#6D717D]"
                >
                  {index + 1}
                </span>
              )}

              {!isPlaced && (
                <div
                  className={[
                    'grid gap-[3px] transition-transform duration-150',
                    isDragging ? 'opacity-20 scale-90' : 'opacity-100 scale-100',
                  ].join(' ')}
                  style={{
                    gridTemplateColumns: `repeat(${cols}, ${cellPx}px)`,
                    gridTemplateRows: `repeat(${rows}, ${cellPx}px)`,
                  }}
                >
                  {piece.shape.matrix.map((rowArr, r) =>
                    rowArr.map((val, c) => (
                      <div key={`${r}-${c}`} className="w-full h-full">
                        {val === 1 ? <BlockTile color={piece.color} size="tray" /> : null}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

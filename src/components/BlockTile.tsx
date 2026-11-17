import React from 'react';
import { BlockColorId, CellKind } from '../types/game';
import { BLOCK_THEMES } from '../data/pieces';

interface BlockTileProps {
  color: BlockColorId;
  kind?: CellKind;
  hp?: number;
  size?: 'board' | 'tray' | 'drag';
  isGhost?: boolean;
  isWillClear?: boolean;
  isNewlyPlaced?: boolean;
  isClearing?: boolean;
  clearDelayMs?: number;
  className?: string;
}

export const BlockTile: React.FC<BlockTileProps> = ({
  color,
  kind = 'normal',
  hp = 1,
  size = 'board',
  isGhost = false,
  isWillClear = false,
  isNewlyPlaced = false,
  isClearing = false,
  clearDelayMs = 0,
  className = '',
}) => {
  const theme = BLOCK_THEMES[color];
  const radiusClass = size === 'tray' ? 'rounded-[4px]' : 'rounded-[6px]';

  if (isGhost) {
    return (
      <div
        className={`w-full h-full ${radiusClass} border-[1.5px] border-dashed ${theme.ghostBg} ${theme.ghostBorder} transition-opacity duration-100 ${className}`}
      />
    );
  }

  return (
    <div
      style={isClearing ? { animationDelay: `${clearDelayMs}ms` } : undefined}
      className={[
        'relative w-full h-full overflow-hidden border select-none',
        radiusClass,
        theme.bg,
        theme.border,
        isWillClear
          ? 'ring-2 ring-[#F6F6F3] dark:ring-white brightness-110 animate-clear-preview z-10'
          : '',
        isNewlyPlaced ? 'animate-tile-place' : '',
        isClearing ? 'animate-tile-clear' : '',
        className,
      ].join(' ')}
    >
      {/* Subtle architectural bevel highlight & depth */}
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-[18%] ${theme.highlight}`} />
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-[14%] ${theme.shadow}`} />

      {/* Gem inlay (distinct geometric shape for non-hue-only clarity) */}
      {kind === 'gem' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="w-[56%] h-[56%] text-[#FFFDF7] drop-shadow-[0_1px_1px_rgba(0,0,0,0.28)]"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 3.2L20.8 12L12 20.8L3.2 12L12 3.2Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="currentColor"
              fillOpacity="0.22"
            />
            <path d="M12 7.5L16.5 12L12 16.5L7.5 12L12 7.5Z" fill="currentColor" />
          </svg>
        </div>
      )}

      {/* Reinforced stone texture & crack state */}
      {kind === 'stone' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {hp >= 2 ? (
            <svg
              viewBox="0 0 24 24"
              className="w-[58%] h-[58%] text-white/65"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="5"
                y="5"
                width="14"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <line x1="9" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="9" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="w-[68%] h-[68%] text-white/75"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 18L10.5 12.5L9 9.5L14.5 6L18.5 4.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.5 12.5L15.5 14.5L18.5 18"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.7"
              />
            </svg>
          )}
        </div>
      )}
    </div>
  );
};

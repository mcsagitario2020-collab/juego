import React from 'react';
import { GameMode, GameStatus } from '../types/game';

interface ResultModalProps {
  status: GameStatus;
  mode: GameMode;
  levelNumber: number;
  dailyDateLabel: string;
  score: number;
  linesCleared: number;
  bestScore: number;
  currentStreak: number;
  onRetry: () => void;
  onNextLevel: () => void;
  onOpenCalendar: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  status,
  mode,
  levelNumber,
  dailyDateLabel,
  score,
  linesCleared,
  bestScore,
  currentStreak,
  onRetry,
  onNextLevel,
  onOpenCalendar,
}) => {
  if (status === 'PLAYING') return null;

  const isVictory = status === 'VICTORY';

  const heading = isVictory
    ? mode === 'daily'
      ? 'Desafío diario completado'
      : `Nivel ${levelNumber} completado`
    : 'Sin movimientos disponibles';

  const subtitle = isVictory
    ? mode === 'daily'
      ? `${dailyDateLabel} · Racha activa de ${currentStreak} ${currentStreak === 1 ? 'día' : 'días'}.`
      : 'Todos los objetivos del nivel han sido alcanzados con precisión.'
    : 'Ninguna de las piezas restantes encaja en el tablero actual.';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A18]/45 dark:bg-black/65 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-modal-title"
    >
      <div className="w-full max-w-[420px] rounded-[16px] bg-[#F8F8F5] dark:bg-[#191B20] border border-[#E0DFD8] dark:border-[#2B2E36] shadow-xl p-6">
        <div className="text-xs font-mono uppercase tracking-wider text-[#6B6A64] dark:text-[#969AA6]">
          {isVictory ? 'Objetivo cumplido' : 'Fin de partida'}
        </div>
        <h2
          id="result-modal-title"
          className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-[#1A1A18] dark:text-[#F2F2EE]"
        >
          {heading}
        </h2>
        <p className="mt-1.5 text-sm text-[#5C5B55] dark:text-[#A4A8B4]">{subtitle}</p>

        {/* Clean tabular metrics */}
        <div className="mt-6 grid grid-cols-3 gap-4 py-4 border-y border-[#E6E5DE] dark:border-[#262931]">
          <div>
            <div className="text-xs text-[#6B6A64] dark:text-[#969AA6]">Puntos</div>
            <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-[#1A1A18] dark:text-[#F2F2EE]">
              {score}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#6B6A64] dark:text-[#969AA6]">Líneas</div>
            <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-[#1A1A18] dark:text-[#F2F2EE]">
              {linesCleared}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#6B6A64] dark:text-[#969AA6]">
              {mode === 'daily' ? 'Racha' : 'Mejor'}
            </div>
            <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-[#1A1A18] dark:text-[#F2F2EE]">
              {mode === 'daily' ? `${currentStreak}d` : bestScore}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {isVictory && mode === 'levels' && (
            <>
              <button
                type="button"
                onClick={onRetry}
                className="px-4 py-2.5 text-sm font-medium rounded-lg border border-[#D8D6CD] dark:border-[#30343E] text-[#2C2C29] dark:text-[#E2E3DF] hover:bg-[#ECEBE4] dark:hover:bg-[#23262F] transition-colors whitespace-nowrap"
              >
                Repetir
              </button>
              <button
                type="button"
                onClick={onNextLevel}
                className="px-5 py-2.5 text-sm font-medium rounded-lg bg-[#1A1A18] dark:bg-[#F2F2EE] text-[#F6F6F3] dark:text-[#141517] hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Siguiente nivel
              </button>
            </>
          )}

          {isVictory && mode === 'daily' && (
            <>
              <button
                type="button"
                onClick={onOpenCalendar}
                className="px-4 py-2.5 text-sm font-medium rounded-lg border border-[#D8D6CD] dark:border-[#30343E] text-[#2C2C29] dark:text-[#E2E3DF] hover:bg-[#ECEBE4] dark:hover:bg-[#23262F] transition-colors whitespace-nowrap"
              >
                Ver calendario
              </button>
              <button
                type="button"
                onClick={onNextLevel}
                className="px-5 py-2.5 text-sm font-medium rounded-lg bg-[#1A1A18] dark:bg-[#F2F2EE] text-[#F6F6F3] dark:text-[#141517] hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Ir a niveles
              </button>
            </>
          )}

          {!isVictory && (
            <>
              {mode === 'daily' && (
                <button
                  type="button"
                  onClick={onOpenCalendar}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg border border-[#D8D6CD] dark:border-[#30343E] text-[#2C2C29] dark:text-[#E2E3DF] hover:bg-[#ECEBE4] dark:hover:bg-[#23262F] transition-colors whitespace-nowrap"
                >
                  Calendario
                </button>
              )}
              <button
                type="button"
                onClick={onRetry}
                className="px-5 py-2.5 text-sm font-medium rounded-lg bg-[#1A1A18] dark:bg-[#F2F2EE] text-[#F6F6F3] dark:text-[#141517] hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Jugar de nuevo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

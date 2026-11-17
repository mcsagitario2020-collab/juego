import React, { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  calculateDailyStreaks,
  formatMonthTitleEs,
  formatReadableDateEs,
  getDailyChallengeConfig,
  getMonthCalendarCells,
  getTodayDateKey,
  parseDateKey,
} from '../utils/dailyChallenge';
import { PlayerProgress } from '../types/game';

interface DailyChallengeModalProps {
  open: boolean;
  activeDateKey: string;
  progress: PlayerProgress;
  onPlayDate: (dateKey: string) => void;
  onClose: () => void;
}

const WEEKDAYS_ES = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  open,
  activeDateKey,
  progress,
  onPlayDate,
  onClose,
}) => {
  const todayKey = getTodayDateKey();
  const todayParts = parseDateKey(todayKey);

  const [viewYear, setViewYear] = useState(todayParts.year);
  const [viewMonth, setViewMonth] = useState(todayParts.month);
  const [selectedDateKey, setSelectedDateKey] = useState(activeDateKey || todayKey);

  const completedSet = useMemo(
    () => new Set(progress.dailyCompletedDates),
    [progress.dailyCompletedDates]
  );

  const streaks = useMemo(
    () => calculateDailyStreaks(progress.dailyCompletedDates),
    [progress.dailyCompletedDates]
  );

  const calendarCells = useMemo(
    () => getMonthCalendarCells(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const selectedConfig = useMemo(
    () => getDailyChallengeConfig(selectedDateKey),
    [selectedDateKey]
  );

  if (!open) return null;

  const isViewingCurrentMonth =
    viewYear === todayParts.year && viewMonth === todayParts.month;

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (isViewingCurrentMonth) return;
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isSelectedCompleted = completedSet.has(selectedDateKey);
  const selectedBest = progress.dailyBestScores[selectedDateKey];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A18]/40 dark:bg-black/60 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] max-h-[90vh] flex flex-col rounded-[16px] bg-[#F8F8F5] dark:bg-[#191B20] border border-[#E0DFD8] dark:border-[#2B2E36] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-[#E6E5DE] dark:border-[#262931]">
          <div>
            <h2
              id="daily-modal-title"
              className="font-display text-xl font-semibold tracking-tight text-[#1A1A18] dark:text-[#F2F2EE]"
            >
              Desafío diario
            </h2>
            <p className="mt-0.5 text-xs text-[#6B6A64] dark:text-[#969AA6]">
              Un tablero único cada día para mantener tu racha activa.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar calendario diario"
            className="flex items-center justify-center w-10 h-10 rounded-lg text-[#5C5B55] dark:text-[#9EA2AE] hover:bg-[#ECEBE4] dark:hover:bg-[#252830] hover:text-[#1A1A18] dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-6">
          {/* Clean unboxed tabular stats strip */}
          <div className="grid grid-cols-3 gap-4 pb-5 border-b border-[#E6E5DE] dark:border-[#262931]">
            <div>
              <div className="text-xs text-[#6B6A64] dark:text-[#969AA6]">Racha actual</div>
              <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#1A1A18] dark:text-[#F2F2EE]">
                {streaks.currentStreak}
                <span className="ml-1 text-xs font-sans font-normal text-[#73726B] dark:text-[#8E929E]">
                  {streaks.currentStreak === 1 ? 'día' : 'días'}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B6A64] dark:text-[#969AA6]">Mejor racha</div>
              <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#1A1A18] dark:text-[#F2F2EE]">
                {streaks.bestStreak}
                <span className="ml-1 text-xs font-sans font-normal text-[#73726B] dark:text-[#8E929E]">
                  {streaks.bestStreak === 1 ? 'día' : 'días'}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B6A64] dark:text-[#969AA6]">Este mes</div>
              <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#1A1A18] dark:text-[#F2F2EE]">
                {streaks.completedThisMonth}
                <span className="text-sm font-normal text-[#73726B] dark:text-[#8E929E]">
                  /{streaks.daysInCurrentMonth}
                </span>
              </div>
            </div>
          </div>

          {/* Calendar navigation & grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-semibold text-[#1A1A18] dark:text-[#F2F2EE]">
                {formatMonthTitleEs(viewYear, viewMonth)}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Mes anterior"
                  className="flex items-center justify-center w-9 h-9 rounded-lg text-[#5C5B55] dark:text-[#9EA2AE] hover:bg-[#ECEBE4] dark:hover:bg-[#252830] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  disabled={isViewingCurrentMonth}
                  aria-label="Mes siguiente"
                  className="flex items-center justify-center w-9 h-9 rounded-lg text-[#5C5B55] dark:text-[#9EA2AE] hover:bg-[#ECEBE4] dark:hover:bg-[#252830] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {WEEKDAYS_ES.map((day) => (
                <div
                  key={day}
                  className="text-center text-[11px] font-medium text-[#7A7972] dark:text-[#848894] py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells.map((cell, idx) => {
                if (!cell.day || !cell.dateKey) {
                  return <div key={`empty-${idx}`} className="h-10" />;
                }

                const isFuture = cell.dateKey > todayKey;
                const isToday = cell.dateKey === todayKey;
                const isCompleted = completedSet.has(cell.dateKey);
                const isSelected = cell.dateKey === selectedDateKey;

                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    disabled={isFuture}
                    onClick={() => setSelectedDateKey(cell.dateKey!)}
                    className={[
                      'relative flex flex-col items-center justify-center h-10 rounded-lg font-mono text-xs tabular-nums border transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3B6EA5]',
                      isFuture
                        ? 'border-transparent text-[#B4B2A9] dark:text-[#484C56] cursor-not-allowed'
                        : isSelected
                          ? 'border-[#3B6EA5] dark:border-[#5D97D4] bg-[#3B6EA5] dark:bg-[#4982BF] text-white font-semibold'
                          : isCompleted
                            ? 'border-[#C9DDD3] dark:border-[#2E4D3E] bg-[#EDF5F0] dark:bg-[#1E2E26] text-[#26543E] dark:text-[#86CAA8] hover:border-[#4E8A6E]'
                            : isToday
                              ? 'border-[#1A1A18] dark:border-[#F2F2EE] bg-white dark:bg-[#22252D] text-[#1A1A18] dark:text-white font-semibold'
                              : 'border-transparent bg-white/70 dark:bg-[#1E2128] text-[#2C2C29] dark:text-[#D5D6D1] hover:border-[#D0CEC5] dark:hover:border-[#383C47]',
                    ].join(' ')}
                  >
                    <span>{cell.day}</span>
                    {isCompleted && (
                      <Check
                        className={`w-2.5 h-2.5 mt-0.5 ${
                          isSelected ? 'text-white' : 'text-[#4E8A6E] dark:text-[#74C29C]'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected date details + CTA */}
          <div className="pt-5 border-t border-[#E6E5DE] dark:border-[#262931] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs text-[#6B6A64] dark:text-[#969AA6]">
                {formatReadableDateEs(selectedDateKey)}
                {selectedDateKey === todayKey ? ' · Hoy' : ''}
              </div>
              <div className="mt-0.5 font-display text-base font-semibold text-[#1A1A18] dark:text-[#F2F2EE]">
                {selectedConfig.title}
              </div>
              <div className="mt-1 text-xs text-[#5E5D57] dark:text-[#A4A8B4] font-mono tabular-nums">
                {selectedConfig.objectives
                  .map((o) => `${o.target} ${o.label}`)
                  .join(' · ')}
                {selectedBest ? ` · Mejor: ${selectedBest} pts` : ''}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onPlayDate(selectedDateKey);
                onClose();
              }}
              className="px-5 py-2.5 text-sm font-medium rounded-lg bg-[#1A1A18] dark:bg-[#F2F2EE] text-[#F6F6F3] dark:text-[#141517] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
            >
              {isSelectedCompleted ? 'Volver a jugar' : 'Jugar desafío'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

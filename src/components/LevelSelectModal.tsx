import React from 'react';
import { Check, Lock, X } from 'lucide-react';
import { PROGRESSIVE_LEVELS } from '../data/levels';
import { PlayerProgress } from '../types/game';

interface LevelSelectModalProps {
  open: boolean;
  currentLevelId: number;
  progress: PlayerProgress;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

const CHAPTERS = [
  { index: '01', name: 'Fundamentos', range: 'Niveles 1–6' },
  { index: '02', name: 'Equilibrio', range: 'Niveles 7–12' },
  { index: '03', name: 'Geometría', range: 'Niveles 13–18' },
  { index: '04', name: 'Maestría', range: 'Niveles 19–24' },
];

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  open,
  currentLevelId,
  progress,
  onSelectLevel,
  onClose,
}) => {
  if (!open) return null;

  const completedSet = new Set(progress.completedLevels);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A18]/40 dark:bg-black/60 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="levels-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[680px] max-h-[86vh] flex flex-col rounded-[16px] bg-[#F8F8F5] dark:bg-[#191B20] border border-[#E0DFD8] dark:border-[#2B2E36] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-[#E6E5DE] dark:border-[#262931]">
          <div>
            <h2
              id="levels-modal-title"
              className="font-display text-xl font-semibold tracking-tight text-[#1A1A18] dark:text-[#F2F2EE]"
            >
              Niveles progresivos
            </h2>
            <p className="mt-0.5 text-xs text-[#6B6A64] dark:text-[#969AA6] font-mono tabular-nums">
              {progress.completedLevels.length} de {PROGRESSIVE_LEVELS.length} completados · Nivel desbloqueado {progress.highestUnlockedLevel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar selector de niveles"
            className="flex items-center justify-center w-10 h-10 rounded-lg text-[#5C5B55] dark:text-[#9EA2AE] hover:bg-[#ECEBE4] dark:hover:bg-[#252830] hover:text-[#1A1A18] dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-7">
          {CHAPTERS.map((chapter) => {
            const chapterLevels = PROGRESSIVE_LEVELS.filter(
              (lvl) => lvl.chapter === chapter.name
            );
            return (
              <section key={chapter.name}>
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="font-display text-sm font-semibold text-[#1A1A18] dark:text-[#ECECE8]">
                    {chapter.index}. {chapter.name}
                  </h3>
                  <span className="text-xs text-[#73726B] dark:text-[#8E929E] font-mono tabular-nums">
                    {chapter.range}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {chapterLevels.map((lvl) => {
                    const isUnlocked = lvl.id <= progress.highestUnlockedLevel;
                    const isCompleted = completedSet.has(lvl.id);
                    const isCurrent = lvl.id === currentLevelId;

                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => {
                          onSelectLevel(lvl.id);
                          onClose();
                        }}
                        className={[
                          'relative flex flex-col items-center justify-center min-h-[68px] p-2 rounded-[10px] border text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B6EA5]',
                          !isUnlocked
                            ? 'border-[#E6E5DE] dark:border-[#24272F] bg-[#EFEFE9]/60 dark:bg-[#15171B] text-[#A2A098] dark:text-[#555964] cursor-not-allowed'
                            : isCurrent
                              ? 'border-[#3B6EA5] dark:border-[#5D97D4] bg-[#3B6EA5] dark:bg-[#4982BF] text-white'
                              : isCompleted
                                ? 'border-[#D5DFDA] dark:border-[#2D4539] bg-[#FFFFFF] dark:bg-[#1F2329] text-[#1A1A18] dark:text-[#F2F2EE] hover:border-[#4E8A6E]'
                                : 'border-[#DCDAD1] dark:border-[#2D313A] bg-[#FFFFFF] dark:bg-[#1F2229] text-[#1A1A18] dark:text-[#F2F2EE] hover:border-[#3B6EA5]',
                        ].join(' ')}
                      >
                        <span className="font-mono text-base font-semibold tabular-nums leading-none">
                          {lvl.id}
                        </span>
                        <span
                          className={[
                            'mt-1.5 text-[11px] leading-none truncate max-w-full px-1',
                            isCurrent
                              ? 'text-white/85'
                              : !isUnlocked
                                ? 'text-[#A2A098] dark:text-[#555964]'
                                : 'text-[#6B6A64] dark:text-[#969AA6]',
                          ].join(' ')}
                        >
                          {!isUnlocked ? (
                            <Lock className="w-3 h-3 mx-auto" />
                          ) : isCompleted ? (
                            <Check
                              className={`w-3.5 h-3.5 mx-auto ${
                                isCurrent ? 'text-white' : 'text-[#4E8A6E] dark:text-[#66B28F]'
                              }`}
                            />
                          ) : (
                            'Actual'
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {progress.highestUnlockedLevel > PROGRESSIVE_LEVELS.length && (
            <section className="pt-4 border-t border-[#E6E5DE] dark:border-[#262931]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-sm font-semibold text-[#1A1A18] dark:text-[#ECECE8]">
                    05. Horizonte infinito
                  </h3>
                  <p className="text-xs text-[#6B6A64] dark:text-[#969AA6] mt-0.5">
                    Has completado los 24 niveles principales. Continúa en el nivel {progress.highestUnlockedLevel}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectLevel(progress.highestUnlockedLevel);
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-[#1A1A18] dark:bg-[#F2F2EE] text-[#F6F6F3] dark:text-[#141517] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
                >
                  Jugar nivel {progress.highestUnlockedLevel}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

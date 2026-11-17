import React from 'react';
import { X } from 'lucide-react';
import { BlockTile } from './BlockTile';

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A18]/40 dark:bg-black/60 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="howto-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] rounded-[16px] bg-[#F8F8F5] dark:bg-[#191B20] border border-[#E0DFD8] dark:border-[#2B2E36] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-[#E6E5DE] dark:border-[#262931]">
          <h2
            id="howto-modal-title"
            className="font-display text-xl font-semibold tracking-tight text-[#1A1A18] dark:text-[#F2F2EE]"
          >
            Cómo jugar
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar instrucciones"
            className="flex items-center justify-center w-10 h-10 rounded-lg text-[#5C5B55] dark:text-[#9EA2AE] hover:bg-[#ECEBE4] dark:hover:bg-[#252830] hover:text-[#1A1A18] dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 text-sm leading-relaxed text-[#474641] dark:text-[#B8BCC7]">
          <div className="space-y-3">
            <div>
              <h3 className="font-display text-sm font-semibold text-[#1A1A18] dark:text-[#F2F2EE]">
                01. Coloca las 3 piezas
              </h3>
              <p className="mt-1 text-xs sm:text-sm">
                Arrastra cualquiera de las 3 piezas de la bandeja al tablero de 8×8, o pulsa una pieza (o las teclas 1, 2, 3) y haz clic en la casilla donde quieres ubicarla. Cuando coloques las 3 piezas recibirás una nueva mano.
              </p>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold text-[#1A1A18] dark:text-[#F2F2EE]">
                02. Completa filas y columnas
              </h3>
              <p className="mt-1 text-xs sm:text-sm">
                Llena cualquier fila horizontal o columna vertical completa para despejarla y sumar puntos. Despejar varias líneas a la vez o en turnos consecutivos multiplica tu puntuación con combos.
              </p>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold text-[#1A1A18] dark:text-[#F2F2EE]">
                03. Bloques especiales en niveles y desafíos
              </h3>
              <div className="mt-2.5 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 shrink-0">
                    <BlockTile color="ochre" kind="gem" size="board" />
                  </div>
                  <p className="text-xs sm:text-sm">
                    <strong className="font-medium text-[#1A1A18] dark:text-[#F2F2EE]">Gema:</strong> completa la fila o columna que la atraviesa para recogerla.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 shrink-0">
                    <BlockTile color="stone" kind="stone" hp={2} size="board" />
                  </div>
                  <p className="text-xs sm:text-sm">
                    <strong className="font-medium text-[#1A1A18] dark:text-[#F2F2EE]">Piedra reforzada:</strong> resiste dos despejes de línea; el primero la agrieta y el segundo la elimina.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6E5DE] dark:border-[#262931] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium rounded-lg bg-[#1A1A18] dark:bg-[#F2F2EE] text-[#F6F6F3] dark:text-[#141517] hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { BlockColorId, PieceShape } from '../types/game';

export interface BlockTheme {
  bg: string;
  border: string;
  highlight: string;
  shadow: string;
  ghostBg: string;
  ghostBorder: string;
  label: string;
}

export const BLOCK_THEMES: Record<BlockColorId, BlockTheme> = {
  cobalt: {
    bg: 'bg-[#3B6EA5] dark:bg-[#4982BF]',
    border: 'border-[#2D5887] dark:border-[#376699]',
    highlight: 'bg-white/25',
    shadow: 'bg-black/15',
    ghostBg: 'bg-[#3B6EA5]/30 dark:bg-[#4982BF]/35',
    ghostBorder: 'border-[#3B6EA5]/70 dark:border-[#4982BF]/80',
    label: 'Azul cobalto',
  },
  sage: {
    bg: 'bg-[#4E8A6E] dark:bg-[#5BA080]',
    border: 'border-[#3C6F57] dark:border-[#468265]',
    highlight: 'bg-white/25',
    shadow: 'bg-black/15',
    ghostBg: 'bg-[#4E8A6E]/30 dark:bg-[#5BA080]/35',
    ghostBorder: 'border-[#4E8A6E]/70 dark:border-[#5BA080]/80',
    label: 'Verde salvia',
  },
  ochre: {
    bg: 'bg-[#D29034] dark:bg-[#DF9E42]',
    border: 'border-[#B07524] dark:border-[#BA802C]',
    highlight: 'bg-white/30',
    shadow: 'bg-black/15',
    ghostBg: 'bg-[#D29034]/30 dark:bg-[#DF9E42]/35',
    ghostBorder: 'border-[#D29034]/75 dark:border-[#DF9E42]/80',
    label: 'Ocre ámbar',
  },
  terracotta: {
    bg: 'bg-[#C75D4B] dark:bg-[#D76F5D]',
    border: 'border-[#A24738] dark:border-[#B45646]',
    highlight: 'bg-white/25',
    shadow: 'bg-black/15',
    ghostBg: 'bg-[#C75D4B]/30 dark:bg-[#D76F5D]/35',
    ghostBorder: 'border-[#C75D4B]/70 dark:border-[#D76F5D]/80',
    label: 'Terracota',
  },
  indigo: {
    bg: 'bg-[#6D5D96] dark:bg-[#8270B0]',
    border: 'border-[#544678] dark:border-[#685791]',
    highlight: 'bg-white/25',
    shadow: 'bg-black/15',
    ghostBg: 'bg-[#6D5D96]/30 dark:bg-[#8270B0]/35',
    ghostBorder: 'border-[#6D5D96]/70 dark:border-[#8270B0]/80',
    label: 'Índigo suave',
  },
  teal: {
    bg: 'bg-[#2E8696] dark:bg-[#3A9CAD]',
    border: 'border-[#216976] dark:border-[#2C7B8A]',
    highlight: 'bg-white/25',
    shadow: 'bg-black/15',
    ghostBg: 'bg-[#2E8696]/30 dark:bg-[#3A9CAD]/35',
    ghostBorder: 'border-[#2E8696]/70 dark:border-[#3A9CAD]/80',
    label: 'Verde mineral',
  },
  stone: {
    bg: 'bg-[#5A6068] dark:bg-[#4B515B]',
    border: 'border-[#43484F] dark:border-[#363B43]',
    highlight: 'bg-white/15',
    shadow: 'bg-black/25',
    ghostBg: 'bg-[#5A6068]/30',
    ghostBorder: 'border-[#5A6068]/70',
    label: 'Piedra',
  },
};

export const PLAYABLE_COLORS: BlockColorId[] = [
  'cobalt',
  'sage',
  'ochre',
  'terracotta',
  'indigo',
  'teal',
];

export const PIECE_CATALOG: PieceShape[] = [
  // Tier 1: Classic compact pieces
  {
    id: 'dot-1',
    name: 'Punto',
    matrix: [[1]],
    tier: 1,
    color: 'ochre',
  },
  {
    id: 'bar-2-h',
    name: 'Barra 2H',
    matrix: [[1, 1]],
    tier: 1,
    color: 'cobalt',
  },
  {
    id: 'bar-2-v',
    name: 'Barra 2V',
    matrix: [[1], [1]],
    tier: 1,
    color: 'cobalt',
  },
  {
    id: 'bar-3-h',
    name: 'Barra 3H',
    matrix: [[1, 1, 1]],
    tier: 1,
    color: 'teal',
  },
  {
    id: 'bar-3-v',
    name: 'Barra 3V',
    matrix: [[1], [1], [1]],
    tier: 1,
    color: 'teal',
  },
  {
    id: 'square-2',
    name: 'Cuadro 2x2',
    matrix: [
      [1, 1],
      [1, 1],
    ],
    tier: 1,
    color: 'sage',
  },
  {
    id: 'corner-2-tl',
    name: 'Esquina',
    matrix: [
      [1, 1],
      [1, 0],
    ],
    tier: 1,
    color: 'terracotta',
  },
  {
    id: 'corner-2-tr',
    name: 'Esquina',
    matrix: [
      [1, 1],
      [0, 1],
    ],
    tier: 1,
    color: 'terracotta',
  },
  {
    id: 'corner-2-bl',
    name: 'Esquina',
    matrix: [
      [1, 0],
      [1, 1],
    ],
    tier: 1,
    color: 'indigo',
  },
  {
    id: 'corner-2-br',
    name: 'Esquina',
    matrix: [
      [0, 1],
      [1, 1],
    ],
    tier: 1,
    color: 'indigo',
  },

  // Tier 2: Intermediate polyominoes
  {
    id: 'bar-4-h',
    name: 'Barra 4H',
    matrix: [[1, 1, 1, 1]],
    tier: 2,
    color: 'cobalt',
  },
  {
    id: 'bar-4-v',
    name: 'Barra 4V',
    matrix: [[1], [1], [1], [1]],
    tier: 2,
    color: 'cobalt',
  },
  {
    id: 'l-med-1',
    name: 'Ele',
    matrix: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    tier: 2,
    color: 'ochre',
  },
  {
    id: 'l-med-2',
    name: 'Ele',
    matrix: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    tier: 2,
    color: 'ochre',
  },
  {
    id: 'l-med-3',
    name: 'Ele',
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
    ],
    tier: 2,
    color: 'terracotta',
  },
  {
    id: 'l-med-4',
    name: 'Ele',
    matrix: [
      [1, 1, 1],
      [0, 0, 1],
    ],
    tier: 2,
    color: 'terracotta',
  },
  {
    id: 't-up',
    name: 'Te',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    tier: 2,
    color: 'indigo',
  },
  {
    id: 't-down',
    name: 'Te',
    matrix: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    tier: 2,
    color: 'indigo',
  },
  {
    id: 't-left',
    name: 'Te',
    matrix: [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
    tier: 2,
    color: 'teal',
  },
  {
    id: 't-right',
    name: 'Te',
    matrix: [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    tier: 2,
    color: 'teal',
  },
  {
    id: 'z-h',
    name: 'Zeta',
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    tier: 2,
    color: 'sage',
  },
  {
    id: 's-h',
    name: 'Ese',
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    tier: 2,
    color: 'sage',
  },
  {
    id: 'rect-2x3',
    name: 'Bloque 2x3',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
    ],
    tier: 2,
    color: 'cobalt',
  },
  {
    id: 'rect-3x2',
    name: 'Bloque 3x2',
    matrix: [
      [1, 1],
      [1, 1],
      [1, 1],
    ],
    tier: 2,
    color: 'cobalt',
  },

  // Tier 3: Master & large shapes
  {
    id: 'bar-5-h',
    name: 'Barra 5H',
    matrix: [[1, 1, 1, 1, 1]],
    tier: 3,
    color: 'terracotta',
  },
  {
    id: 'bar-5-v',
    name: 'Barra 5V',
    matrix: [[1], [1], [1], [1], [1]],
    tier: 3,
    color: 'terracotta',
  },
  {
    id: 'square-3',
    name: 'Cuadro 3x3',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    tier: 3,
    color: 'ochre',
  },
  {
    id: 'big-l-1',
    name: 'Escuadra',
    matrix: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
    tier: 3,
    color: 'indigo',
  },
  {
    id: 'big-l-2',
    name: 'Escuadra',
    matrix: [
      [0, 0, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    tier: 3,
    color: 'indigo',
  },
  {
    id: 'big-l-3',
    name: 'Escuadra',
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ],
    tier: 3,
    color: 'teal',
  },
  {
    id: 'big-l-4',
    name: 'Escuadra',
    matrix: [
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
    tier: 3,
    color: 'teal',
  },
  {
    id: 'diag-2',
    name: 'Diagonal',
    matrix: [
      [1, 0],
      [0, 1],
    ],
    tier: 3,
    color: 'sage',
  },
];

export function countMatrixCells(matrix: number[][]): number {
  let count = 0;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] === 1) count++;
    }
  }
  return count;
}
